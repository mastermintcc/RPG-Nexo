import { createClient } from '@supabase/supabase-js';

let supabaseInstance: unknown = null;

export function getSupabase() {
  if (!supabaseInstance) {
    const isBrowser = typeof window !== 'undefined';
    
    // Use the global constants defined via --define or angular.json
    const url = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '';
    const key = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : '';

    const supabaseUrl = isBrowser ? url : 'http://localhost:54321';
    const supabaseAnonKey = isBrowser ? key : 'placeholder';

    if (isBrowser && (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL'))) {
      console.warn('Supabase URL is missing. Please configure it in the Settings menu.');
      // Return a proxy or a dummy client to avoid crashing immediately, 
      // but real calls will fail until configured.
      return {
        auth: { 
          getUser: async () => ({ data: { user: null } }), 
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { /* no-op */ } } } }) 
        },
        from: () => ({ 
          select: () => ({ 
            eq: () => ({ single: async () => ({ data: null }) }), 
            order: async () => ({ data: [] }) 
          }), 
          insert: async () => ({ error: new Error('Supabase not configured') }) 
        })
      } as unknown;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabaseInstance as any;
}

export const supabase = getSupabase();
