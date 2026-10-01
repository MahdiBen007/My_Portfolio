import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

const db = supabase as unknown as SupabaseClient;

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'not_interested';

export interface DemoLead {
  id: string;
  full_name: string;
  phone: string;
  business_type: string;
  downloads_count: number;
  last_download_at: string;
  created_at: string;
  status: LeadStatus;
  notes?: string | null;
  ip?: string | null;
}

const LOCAL_STORAGE_KEY = 'portfolio_demo_leads_data_v3';

// Clean initial demo leads
const INITIAL_DEMO_LEADS: DemoLead[] = [];

function sanitizeStatus(status?: string | null): LeadStatus {
  if (status === 'converted' || status === 'contacted' || status === 'not_interested') {
    return status;
  }
  return 'new';
}

export async function fetchDemoLeads(): Promise<DemoLead[]> {
  // 1. Try to fetch from Supabase cloud database
  try {
    const { data: supaData, error } = await db
      .from('demo_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(supaData)) {
      const leads: DemoLead[] = supaData.map((l: any) => ({
        id: String(l.id),
        full_name: l.full_name || '',
        phone: l.phone || '',
        business_type: l.business_type || '',
        downloads_count: Number(l.downloads_count) || 1,
        last_download_at: l.last_download_at || l.created_at || new Date().toISOString(),
        created_at: l.created_at || new Date().toISOString(),
        status: sanitizeStatus(l.status),
        notes: l.notes || null,
        ip: l.ip || null,
      }));

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
      return leads;
    }
  } catch (err) {
    console.warn('Could not query Supabase demo_leads:', err);
  }

  // 2. Try to fetch live leads from Landing Page local API if available
  try {
    const res = await fetch('http://localhost:3000/api/leads', {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.leads)) {
        const landingLeads: DemoLead[] = data.leads.map((l: any) => ({
          id: l.id || `landing-${l.phone}`,
          full_name: l.full_name || '',
          phone: l.phone || '',
          business_type: l.business_type || '',
          downloads_count: Number(l.downloads_count) || 1,
          last_download_at: l.last_download_at || new Date().toISOString(),
          created_at: l.created_at || new Date().toISOString(),
          status: sanitizeStatus(l.status),
          notes: l.notes || null,
        }));

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(landingLeads));
        return landingLeads;
      }
    }
  } catch {}

  // 3. Fallback to localStorage
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed.map((l: any) => ({
          ...l,
          status: sanitizeStatus(l.status),
        }));
      }
    } catch {}
  }

  return INITIAL_DEMO_LEADS;
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  // 1. Update in Supabase if online
  try {
    await db.from('demo_leads').update({ status }).eq('id', id);
  } catch (err) {
    console.warn('Supabase status update error:', err);
  }

  // 2. Update in localStorage
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const leads: DemoLead[] = JSON.parse(cached);
      const updated = leads.map((l) => (l.id === id ? { ...l, status } : l));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
}

export async function updateLeadNotes(id: string, notes: string): Promise<void> {
  try {
    await db.from('demo_leads').update({ notes }).eq('id', id);
  } catch (err) {
    console.warn('Supabase notes update error:', err);
  }

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const leads: DemoLead[] = JSON.parse(cached);
      const updated = leads.map((l) => (l.id === id ? { ...l, notes } : l));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
}

export async function deleteLead(id: string): Promise<void> {
  try {
    await db.from('demo_leads').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete error:', err);
  }

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const leads: DemoLead[] = JSON.parse(cached);
      const updated = leads.filter((l) => l.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
}

export async function addDemoLead(
  lead: Omit<DemoLead, 'id' | 'created_at' | 'status'>
): Promise<DemoLead> {
  const insertPayload = {
    full_name: lead.full_name,
    phone: lead.phone,
    business_type: lead.business_type,
    downloads_count: lead.downloads_count || 1,
    status: 'new',
    notes: lead.notes || null,
    ip: lead.ip || null,
  };

  let assignedId = 'lead-' + Date.now();
  let createdAt = new Date().toISOString();

  try {
    const { data, error } = await db
      .from('demo_leads')
      .insert(insertPayload)
      .select('id, created_at')
      .single();

    if (!error && data) {
      assignedId = String(data.id);
      if (data.created_at) createdAt = data.created_at;
    }
  } catch (err) {
    console.warn('Supabase insert lead error:', err);
  }

  const createdLead: DemoLead = {
    ...insertPayload,
    id: assignedId,
    created_at: createdAt,
    last_download_at: createdAt,
    status: 'new',
  };

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  const existing: DemoLead[] = cached ? JSON.parse(cached) : INITIAL_DEMO_LEADS;
  const updated = [createdLead, ...existing];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  return createdLead;
}
