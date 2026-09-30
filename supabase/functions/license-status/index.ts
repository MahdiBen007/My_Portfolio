// ============================================================================
// license-status  (Supabase Edge Function)
// ----------------------------------------------------------------------------
// OPPORTUNISTIC revocation check. The desktop app calls this ONLY when it
// happens to have internet — never on a blocking path, never required for
// offline startup. If it returns { valid: false }, the app wipes its local
// activation and locks (per PART 24: disable-on-connect).
//
// Input : { license_key, device_fingerprint }
// Output: { valid, license_status, device_status, code }
// ============================================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ valid: false, code: "METHOD" }, 405);

  try {
    const { license_key, device_fingerprint, candidate_fingerprints } = await req.json();
    if (typeof license_key !== "string" || typeof device_fingerprint !== "string") {
      return json({ valid: false, code: "BAD_INPUT" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const key = license_key.trim().toUpperCase();
    const fp = device_fingerprint.trim();

    const { data: license, error: licErr } = await supabase
      .from("licenses")
      .select("id, status")
      .eq("license_key", key)
      .maybeSingle();
    if (licErr) throw licErr;

    if (!license) return json({ valid: false, license_status: "missing", code: "INVALID_SERIAL" });
    if (license.status !== "active") return json({ valid: false, license_status: "disabled", code: "LICENSE_DISABLED" });

    const { data: binding, error: bindErr } = await supabase
      .from("license_devices")
      .select("device_fingerprint, status")
      .eq("license_id", license.id)
      .maybeSingle();
    if (bindErr) throw bindErr;

    if (!binding) return json({ valid: false, license_status: "active", device_status: "missing", code: "DEVICE_MISSING" });
    if (binding.status !== "active") return json({ valid: false, license_status: "active", device_status: "disabled", code: "DEVICE_DISABLED" });
    
    if (binding.device_fingerprint !== fp) {
      const candidates = Array.isArray(candidate_fingerprints) ? candidate_fingerprints : [];
      if (!candidates.includes(binding.device_fingerprint)) {
        return json({ valid: false, license_status: "active", device_status: "active", code: "DEVICE_MISMATCH" });
      }
    }

    return json({ valid: true, license_status: "active", device_status: "active", code: "OK" });
  } catch (err) {
    console.error("license-status error:", err);
    // On server error, report "unknown" — the app treats this as inconclusive
    // and does NOT lock (fail-open for offline-lifetime guarantee).
    return json({ valid: true, code: "UNKNOWN_ERROR" }, 200);
  }
});
