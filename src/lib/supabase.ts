import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in the browser.
 * Uses environment variables for URL and anon key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
