import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

export function getSupabase() {
  const isBrowser = typeof window !== 'undefined';
  
  // Use the global constants defined via --define or angular.json
  const url = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '';
  const key = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : '';

  const supabaseUrl = isBrowser ? url : 'http://localhost:54321';
  const supabaseAnonKey = isBrowser ? key : 'placeholder';

  // If keys are missing or are placeholders, return a dummy client
  if (isBrowser && (!supabaseUrl || supabaseUrl === '' || supabaseUrl.includes('YOUR_SUPABASE_URL'))) {
    console.warn('Supabase configuration is missing or invalid.');
    return {
      auth: { 
        getUser: async () => ({ data: { user: null } }), 
        signInWithPassword: async () => { 
          alert('Erro: Supabase não configurado. Adicione a URL e a Chave Anon no menu Settings e RECARREGUE a página.');
          return { error: new Error('Supabase not configured') }; 
        },
        signUp: async () => { 
          alert('Erro: Supabase não configurado. Adicione a URL e a Chave Anon no menu Settings e RECARREGUE a página.');
          return { data: { user: null }, error: new Error('Supabase not configured') }; 
        },
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { /* no-op */ } } } }) 
      },
      from: () => ({ 
        select: () => ({ 
          eq: () => ({ single: async () => ({ data: null }) }), 
          order: async () => ({ data: [] }) 
        }), 
        insert: async () => ({ error: new Error('Supabase not configured') }),
        update: () => ({ eq: async () => ({ error: new Error('Supabase not configured') }) }),
        delete: () => ({ eq: async () => ({ error: new Error('Supabase not configured') }) })
      })
    } as any;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export const supabase = getSupabase();
