import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    // HTTP fallback for presence read
    const url = new URL(req.url);
    if (url.searchParams.get('type') === 'list_teachers') {
      // deno-lint-ignore no-explicit-any
      const presence = (globalThis as any).teacherPresence as Map<string, { full_name: string; department?: string | null; last_seen: number }> | undefined;
      const entries = presence ? [...presence.entries()] : [];
      const teachers = entries.map(([id, meta]) => ({
        user_id: id,
        full_name: meta.full_name,
        department: meta.department || null,
        last_seen: meta.last_seen
      }));
      return new Response(JSON.stringify({ type: 'teachers_online', teachers }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let userId: string | null = null;
  let userRole: string | null = null;
  // In-memory presence (per function instance). Good enough for demo purposes.
  // Map user_id -> { role, full_name, department }
  // deno-lint-ignore no-explicit-any
  type PresenceMeta = { full_name: string; department?: string | null; last_seen: number };
  const presence = (globalThis as any).teacherPresence || new Map<string, PresenceMeta>();
  // deno-lint-ignore no-explicit-any
  (globalThis as any).teacherPresence = presence;

  socket.onopen = () => {
    console.log("WebSocket connection opened");
    socket.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected' }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.type === 'authenticate') {
        // Authenticate user
        const token = data.token;
        if (token) {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (user && !error) {
            userId = user.id;
            // Get user role
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, full_name, department')
              .eq('user_id', user.id)
              .single();
            
            userRole = profile?.role || 'student';
            if (userRole === 'teacher') {
              // Upsert presence for this teacher
              presence.set(userId, {
                full_name: (profile as any)?.full_name || 'Teacher',
                department: (profile as any)?.department || null,
                last_seen: Date.now()
              });
            }
            socket.send(JSON.stringify({ 
              type: 'authenticated', 
              userId, 
              role: userRole 
            }));
            console.log(`User authenticated: ${userId} with role: ${userRole}`);
          } else {
            socket.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
          }
        }
      } else if (data.type === 'subscribe_achievements' && userId) {
        // Subscribe to achievement updates
        const channel = supabase
          .channel('achievements_changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'achievements'
            },
            (payload) => {
              console.log('New achievement:', payload);
              if (userRole === 'teacher') {
                // Notify teachers of new submissions
                socket.send(JSON.stringify({
                  type: 'new_submission',
                  data: payload.new
                }));
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'achievements'
            },
            (payload) => {
              console.log('Achievement updated:', payload);
              // Notify relevant users of status changes
              if (payload.new.student_id === userId || userRole === 'teacher') {
                socket.send(JSON.stringify({
                  type: 'achievement_updated',
                  data: payload.new
                }));
              }
            }
          )
          .subscribe();

        socket.send(JSON.stringify({ type: 'subscribed', channel: 'achievements' }));
      } else if (data.type === 'list_teachers') {
        // Return currently online teachers
        const entries = [...presence.entries()] as [string, PresenceMeta][];
        const teachers = entries.map(([id, meta]) => ({
          user_id: id,
          full_name: meta.full_name,
          department: meta.department || null,
          last_seen: meta.last_seen
        }));
        socket.send(JSON.stringify({ type: 'teachers_online', teachers }));
      } else if (data.type === 'ping' && userId && userRole === 'teacher') {
        const meta = presence.get(userId);
        if (meta) {
          meta.last_seen = Date.now();
          presence.set(userId, meta);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      socket.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
    if (userId && userRole === 'teacher') {
      presence.delete(userId);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return response;
});