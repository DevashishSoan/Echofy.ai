import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtsgoxatwunvnzopmwro.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0c2dveGF0d3Vudm56b3Btd3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzIzMTYsImV4cCI6MjA2NDQ0ODMxNn0.4bUce4mfB9E1XggbRUZqH75zQHf686DATNVASqh9r7c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);