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
              .select('role')
              .eq('user_id', user.id)
              .single();
            
            userRole = profile?.role || 'student';
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
      }
    } catch (error) {
      console.error('Error processing message:', error);
      socket.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return response;
});