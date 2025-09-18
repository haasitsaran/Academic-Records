import os
import time
import json
from typing import Dict, Optional, List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv

# Load environment from backend/.env if present
load_dotenv()

# Environment variables
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL:
    print("[backend] Warning: SUPABASE_URL is not set. Set it in your environment before running.")

app = FastAPI(title="Academic Hub Presence Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to specific domain(s) for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory presence storage (single process)
# Replace with Redis for multi-instance deployments.
# user_id -> { full_name, department, last_seen }
presence: Dict[str, Dict[str, Optional[str]]] = {}
# In-memory connection registry: user_id -> set of WebSocket connections
connections: Dict[str, set] = {}


async def verify_user(token: str):
    """Verify Supabase user session token and return user payload or None."""
    if not SUPABASE_URL or not (SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY):
        return None
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY,
    }
    url = f"{SUPABASE_URL}/auth/v1/user"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, headers=headers)
        if r.status_code != 200:
            return None
        return r.json()


async def get_profiles_batch(user_ids: List[str]):
    """Fetch multiple profiles by user_id to enrich presence data."""
    if not user_ids:
        return {}
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        # Service role strongly recommended for server-side fetching
        return {}

    # Build OR filter for PostgREST
    # user_id.in.("id1","id2") requires url-encoding of quotes
    ids_escaped = ",".join([f"\"{uid}\"" for uid in user_ids])
    query = f"user_id=in.({ids_escaped})&select=user_id,full_name,department,role,teachers(designation)"
    url = f"{SUPABASE_URL}/rest/v1/profiles?{query}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url, headers=headers)
        if r.status_code != 200:
            print("[backend] profiles batch fetch failed:", r.status_code, r.text)
            return {}
        data = r.json() or []
        by_id = {}
        for row in data:
            teachers_rel = row.get("teachers")
            designation = None
            if isinstance(teachers_rel, list) and len(teachers_rel) > 0:
                first = teachers_rel[0]
                if isinstance(first, dict):
                    designation = first.get("designation")
            elif isinstance(teachers_rel, dict):
                designation = teachers_rel.get("designation")

            by_id[row.get("user_id")] = {
                "full_name": row.get("full_name") or "Teacher",
                "department": row.get("department"),
                "designation": designation,
                "role": row.get("role"),
            }
        return by_id


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    user_id = None
    user_role = "student"
    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)
            safe_msg = dict(msg)
            if safe_msg.get("type") == "authenticate" and safe_msg.get("token"):
                safe_msg["token"] = "<redacted>"
            print("[backend] WS message:", safe_msg)

            if msg.get("type") == "authenticate":
                token = msg.get("token")
                user = await verify_user(token) if token else None
                if not user:
                    print("[backend] auth failed: invalid token")
                    await ws.send_text(json.dumps({"type": "error", "message": "Invalid token"}))
                    continue
                user_id = user.get("id")
                # Enrich with profile
                profs = await get_profiles_batch([user_id])
                prof = profs.get(user_id, {})
                user_role = prof.get("role") or "student"
                if user_role == "teacher":
                    presence[user_id] = {
                        "full_name": prof.get("full_name") or "Teacher",
                        "department": prof.get("department"),
                        "designation": prof.get("designation"),
                        "last_seen": int(time.time() * 1000),
                    }
                    print(f"[backend] teacher online: {user_id} -> {presence[user_id]}")
                # track connection for this user
                if user_id:
                    connections.setdefault(user_id, set()).add(ws)
                else:
                    print(f"[backend] authenticated non-teacher: {user_id}")
                await ws.send_text(json.dumps({"type": "authenticated", "userId": user_id, "role": user_role}))

            elif msg.get("type") == "list_teachers":
                print("[backend] list_teachers requested")
                teachers = []
                # Enrich presence with latest profiles (optional)
                ids = list(presence.keys())
                details = await get_profiles_batch(ids)
                for uid in ids:
                    meta = presence.get(uid, {}).copy()
                    d = details.get(uid, {})
                    # Prefer latest details when available
                    meta["full_name"] = d.get("full_name") or meta.get("full_name")
                    meta["department"] = d.get("department") or meta.get("department")
                    meta["designation"] = d.get("designation") or meta.get("designation")
                    teachers.append({"user_id": uid, **meta})
                await ws.send_text(json.dumps({"type": "teachers_online", "teachers": teachers}))

            elif msg.get("type") == "ping":
                if user_id and user_role == "teacher" and user_id in presence:
                    presence[user_id]["last_seen"] = int(time.time() * 1000)
                    print(f"[backend] ping from {user_id}, last_seen updated")

            elif msg.get("type") == "subscribe_achievements":
                # Optional: add DB listeners here if you want
                pass

    except WebSocketDisconnect:
        if user_id and user_role == "teacher":
            presence.pop(user_id, None)
            print(f"[backend] teacher offline: {user_id}")
        # remove connection
        if user_id and user_id in connections and ws in connections[user_id]:
            try:
                connections[user_id].remove(ws)
                if not connections[user_id]:
                    connections.pop(user_id, None)
            except Exception:
                pass


@app.get("/ws")
async def list_teachers_http(request: Request, type: Optional[str] = None):
    if type == "list_teachers":
        ids = list(presence.keys())
        details = await get_profiles_batch(ids)
        teachers = []
        for uid in ids:
            meta = presence.get(uid, {}).copy()
            d = details.get(uid, {})
            meta["full_name"] = d.get("full_name") or meta.get("full_name")
            meta["department"] = d.get("department") or meta.get("department")
            meta["designation"] = d.get("designation") or meta.get("designation")
            teachers.append({"user_id": uid, **meta})
        return {"type": "teachers_online", "teachers": teachers}
    return {"type": "error", "message": "Invalid request"}, 400

@app.post("/notify")
async def notify_teacher(payload: dict):
    """HTTP endpoint to push a message to a specific teacher if online.
    Expected payload: { "teacher_id": str, "data": { ... } }
    Sends WS message: { type: "new_submission", data }
    """
    teacher_id = payload.get("teacher_id")
    data = payload.get("data")
    if not teacher_id or data is None:
        return {"ok": False, "error": "teacher_id and data are required"}, 400
    sent = 0
    conns = connections.get(teacher_id) or set()
    for sock in list(conns):
        try:
            await sock.send_text(json.dumps({"type": "new_submission", "data": data}))
            sent += 1
        except Exception:
            # drop dead sockets
            try:
                conns.remove(sock)
            except Exception:
                pass
    return {"ok": True, "delivered": sent}


@app.get("/")
async def health():
    return {"status": "ok", "service": "presence-backend"}


if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
