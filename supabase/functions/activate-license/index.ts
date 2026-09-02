// ============================================================================
// activate-license  (Supabase Edge Function)
// ----------------------------------------------------------------------------
// Called by the InventoryPro desktop app (anon key). Validates the serial,
// binds the device (1 license = 1 device), then signs the activation payload
// with the Ed25519 PRIVATE KEY so the app can verify it OFFLINE forever.
//
// Secrets used:
//   LICENSE_SIGNING_PRIVATE_KEY : base64 of the 32-byte Ed25519 seed (you set)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY : injected automatically
//
// Business outcomes return HTTP 200 with { ok: false, code, message } so the
// client can branch cleanly. Malformed input = 400, server faults = 500.
// ============================================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as ed from "https://esm.sh/@noble/ed25519@2";

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

const b64ToBytes = (b64: string) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const bytesToB64 = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes));

// Canonical message that the desktop app re-builds byte-for-byte to verify.
const buildMessage = (
  licenseKey: string,
  fingerprint: string,
  activatedAt: string,
  licenseId: string,
) => `${licenseKey}|${fingerprint}|${activatedAt}|${licenseId}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, code: "METHOD" }, 405);

  try {
    const { license_key, device_fingerprint, device_name, os } = await req.json();

    if (
      typeof license_key !== "string" || license_key.trim().length < 8 ||
      typeof device_fingerprint !== "string" || device_fingerprint.trim().length < 16
    ) {
      return json({ ok: false, code: "BAD_INPUT", message: "Missing serial or device fingerprint." }, 400);
    }

    const privB64 = Deno.env.get("LICENSE_SIGNING_PRIVATE_KEY");
    if (!privB64) return json({ ok: false, code: "SERVER", message: "Signing key not configured." }, 500);
    const privKey = b64ToBytes(privB64.trim());
    if (privKey.length !== 32) return json({ ok: false, code: "SERVER", message: "Invalid signing key." }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const key = license_key.trim().toUpperCase();
    const fp = device_fingerprint.trim();

    // 1. License must exist
    const { data: license, error: licErr } = await supabase
      .from("licenses")
      .select("id, status")
      .eq("license_key", key)
      .maybeSingle();
    if (licErr) throw licErr;
    if (!license) return json({ ok: false, code: "INVALID_SERIAL", message: "Invalid serial number." });

    // 2. License must be active
    if (license.status !== "active") {
      return json({ ok: false, code: "LICENSE_DISABLED", message: "This license has been disabled. Please contact the administrator." });
    }

    // 3. Device binding
    const { data: binding, error: bindErr } = await supabase
      .from("license_devices")
      .select("id, device_fingerprint, status, activated_at")
      .eq("license_id", license.id)
      .maybeSingle();
    if (bindErr) throw bindErr;

    let activatedAt: string;

    if (!binding) {
      // First activation → bind this device.
      const { data: inserted, error: insErr } = await supabase
        .from("license_devices")
        .insert({
          license_id: license.id,
          device_fingerprint: fp,
          device_name: typeof device_name === "string" ? device_name.slice(0, 200) : null,
          os: typeof os === "string" ? os.slice(0, 200) : null,
        })
        .select("activated_at")
        .single();
      if (insErr) {
        // Possible race: another request bound it first. Re-read and fall through.
        const { data: reread } = await supabase
          .from("license_devices")
          .select("device_fingerprint, status, activated_at")
          .eq("license_id", license.id)
          .maybeSingle();
        if (!reread) throw insErr;
        if (reread.status !== "active") return json({ ok: false, code: "DEVICE_DISABLED", message: "This device binding is disabled. Please contact the administrator." });
        if (reread.device_fingerprint !== fp) return json({ ok: false, code: "DEVICE_MISMATCH", message: "This license is already activated on another device. Please contact the administrator." });
        activatedAt = reread.activated_at;
      } else {
        activatedAt = inserted.activated_at;
      }
    } else if (binding.status !== "active") {
      return json({ ok: false, code: "DEVICE_DISABLED", message: "This device binding is disabled. Please contact the administrator." });
    } else if (binding.device_fingerprint === fp) {
      // Same device → re-activation allowed (reinstall / restored activation).
      activatedAt = binding.activated_at;
    } else {
      // Different device → reject.
      return json({ ok: false, code: "DEVICE_MISMATCH", message: "This license is already activated on another device. Please contact the administrator." });
    }

    // 4. Sign the activation payload (Ed25519).
    const message = new TextEncoder().encode(buildMessage(key, fp, activatedAt, license.id));
    const signature = await ed.signAsync(message, privKey);

    return json({
      ok: true,
      license_key: key,
      license_id: license.id,
      device_fingerprint: fp,
      activated_at: activatedAt,
      signature: bytesToB64(signature),
    });
  } catch (err) {
    console.error("activate-license error:", err);
    return json({ ok: false, code: "SERVER", message: "Internal server error." }, 500);
  }
});
