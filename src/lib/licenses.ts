// ============================================================================
// License data layer for the Admin Dashboard.
// - Cryptographically-secure serial generation (WebCrypto, never Math.random).
// - Thin Supabase helpers for the licenses / license_devices tables.
//
// These tables are new and intentionally NOT in the generated Supabase types,
// so we use a loosely-typed client handle here and expose typed shapes below.
// ============================================================================
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Untyped handle for the new tables (avoids editing generated types.ts).
const db = supabase as unknown as SupabaseClient;

// 32-char alphabet, no ambiguous glyphs (removed I, O, 0, 1).
// Exactly 32 symbols => 5 bits map uniformly with zero modulo bias.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export type LicenseStatus = 'active' | 'disabled';
export type DeviceStatus = 'active' | 'disabled';

export interface LicenseDevice {
  id: string;
  license_id: string;
  device_fingerprint: string;
  device_name: string | null;
  os: string | null;
  activated_at: string;
  status: DeviceStatus;
}

export interface License {
  id: string;
  license_key: string;
  customer_name: string;
  customer_phone: string | null;
  notes: string | null;
  status: LicenseStatus;
  created_at: string;
}

export interface LicenseWithDevice extends License {
  license_devices: LicenseDevice[];
}

/**
 * Generate a serial like `INVPRO-7K4P-X92M-Q8TZ`.
 * 12 symbols x 5 bits = 60 bits of entropy, uniform over the 32-char alphabet.
 */
export function generateSerial(): string {
  const groups = 3;
  const groupLen = 4;
  const total = groups * groupLen;
  const bytes = new Uint8Array(total);
  crypto.getRandomValues(bytes);

  let chars = '';
  for (let i = 0; i < total; i++) {
    chars += ALPHABET[bytes[i] & 31]; // low 5 bits -> 0..31, uniform
  }
  const parts: string[] = [];
  for (let i = 0; i < groups; i++) {
    parts.push(chars.slice(i * groupLen, (i + 1) * groupLen));
  }
  return `INVPRO-${parts.join('-')}`;
}

/** Fetch all licenses with their (0 or 1) bound device, newest first. */
export async function fetchLicenses(): Promise<LicenseWithDevice[]> {
  const { data, error } = await db
    .from('licenses')
    .select('*, license_devices(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LicenseWithDevice[];
}

export interface CreateLicenseInput {
  customer_name: string;
  customer_phone?: string | null;
  notes?: string | null;
}

/**
 * Insert a new Lifetime license, generating a unique serial.
 * Retries on the (extremely unlikely) unique-key collision (PG code 23505).
 */
export async function createLicense(input: CreateLicenseInput): Promise<License> {
  const MAX_TRIES = 6;
  let lastErr: unknown = null;

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const license_key = generateSerial();
    const { data, error } = await db
      .from('licenses')
      .insert({
        license_key,
        customer_name: input.customer_name.trim(),
        customer_phone: input.customer_phone?.trim() || null,
        notes: input.notes?.trim() || null,
        status: 'active',
      })
      .select('*')
      .single();

    if (!error) return data as License;
    lastErr = error;
    // 23505 = unique_violation -> regenerate and retry; otherwise bail.
    if ((error as { code?: string }).code !== '23505') break;
  }
  throw lastErr;
}

/** Enable/disable a license (opportunistic revocation is driven off this). */
export async function setLicenseStatus(id: string, status: LicenseStatus): Promise<void> {
  const { error } = await db.from('licenses').update({ status }).eq('id', id);
  if (error) throw error;
}

/** Remove the device binding so the serial can activate a different device. */
export async function resetDevice(licenseId: string): Promise<void> {
  const { error } = await db.from('license_devices').delete().eq('license_id', licenseId);
  if (error) throw error;
}
