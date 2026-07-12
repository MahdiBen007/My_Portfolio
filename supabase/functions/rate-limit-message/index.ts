import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, phone, message } = await req.json();

    if (!name || !phone || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be 2-100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phoneRegex = /^0[567]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Phone must start with 05, 06, or 07 and be 10 digits" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.length < 10 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message must be 10-5000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: allowed, error: rateError } = await supabase
      .rpc("check_message_rate_limit", { p_identifier: phone });

    if (rateError) {
      console.error("Rate limit check failed:", rateError);
    }

    if (allowed === false) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Max 1 message per phone per day." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: insertError } = await supabase.from("messages").insert({
      name: name.trim(),
      email: '',
      phone: phone.trim(),
      subject: null,
      message: message.trim(),
    });

    if (insertError) {
      console.error("Insert failed:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to send message" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
