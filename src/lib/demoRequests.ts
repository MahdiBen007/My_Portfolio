import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

const db = supabase as unknown as SupabaseClient;

export type LeadStatus = 'converted' | 'not_interested';

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

const LOCAL_STORAGE_KEY = 'portfolio_demo_leads_data_v2';

// Clean initial demo leads
const INITIAL_DEMO_LEADS: DemoLead[] = [];

export async function fetchDemoLeads(): Promise<DemoLead[]> {
  // 1. Try to fetch from Supabase cloud database
  try {
    const { data: supaData, error } = await db
      .from('demo_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(supaData) && supaData.length > 0) {
      const leads: DemoLead[] = supaData.map((l: any) => ({
        id: String(l.id),
        full_name: l.full_name,
        phone: l.phone,
        business_type: l.business_type,
        downloads_count: l.downloads_count || 1,
        last_download_at: l.last_download_at || l.created_at || new Date().toISOString(),
        created_at: l.created_at || new Date().toISOString(),
        status: l.status === 'converted' ? 'converted' : 'not_interested',
        notes: l.notes || null,
        ip: l.ip || null,
      }));

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
      return leads;
    }
  } catch {}

  // 2. Try to fetch live leads directly from Landing Page local API
  try {
    const res = await fetch('http://localhost:3000/api/leads', {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.leads) && data.leads.length > 0) {
        const landingLeads: DemoLead[] = data.leads.map((l: any) => ({
          id: l.id || `landing-${l.phone}`,
          full_name: l.full_name,
          phone: l.phone,
          business_type: l.business_type,
          downloads_count: l.downloads_count || 1,
          last_download_at: l.last_download_at || new Date().toISOString(),
          created_at: l.created_at || new Date().toISOString(),
          status: l.status === 'converted' ? 'converted' : 'not_interested',
          notes: l.notes || null,
        }));

        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        let baseLeads = INITIAL_DEMO_LEADS;
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) baseLeads = parsed;
          } catch {}
        }

        const phoneMap = new Set(landingLeads.map((l) => l.phone));
        const merged = [...landingLeads, ...baseLeads.filter((l) => !phoneMap.has(l.phone))];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch {}

  // 3. Fallback to localStorage
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((l: any) => ({
          ...l,
          status: l.status === 'converted' ? 'converted' : 'not_interested',
        }));
      }
    } catch {}
  }

  // 4. Default empty state
  return INITIAL_DEMO_LEADS;
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  // 1. Update in Supabase if online
  try {
    await db.from('demo_leads').update({ status }).eq('id', id);
  } catch {}

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
  } catch {}

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
  } catch {}

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const leads: DemoLead[] = JSON.parse(cached);
      const updated = leads.filter((l) => l.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
}

export async function addDemoLead(lead: Omit<DemoLead, 'id' | 'created_at' | 'status'>): Promise<DemoLead> {
  const newLead: DemoLead = {
    ...lead,
    id: 'lead-' + Date.now(),
    created_at: new Date().toISOString(),
    status: 'not_interested',
  };

  try {
    await db.from('demo_leads').insert(newLead);
  } catch {}

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  const existing: DemoLead[] = cached ? JSON.parse(cached) : INITIAL_DEMO_LEADS;
  const updated = [newLead, ...existing];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  return newLead;
}
