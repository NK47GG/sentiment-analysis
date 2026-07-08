import { createClient } from '@supabase/supabase-js';

// Ganti dengan URL dan Anon Key Supabase Anda
const supabaseUrl = 'https://kbhsyqnbowwkbsroktgj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiaHN5cW5ib3d3a2Jzcm9rdGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NjcyNzMsImV4cCI6MjA5OTA0MzI3M30.dE6Eem1CM_pn5CfcGGhHDemvUd8fj-UtI76o0gW6hLI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);