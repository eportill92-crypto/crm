import { createClient } from '@supabase/supabase-js';
const URL = 'https://pbdzfisqosqrevttgmyv.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZHpmaXNxb3NxcmV2dHRnbXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDgwOTcsImV4cCI6MjA5NTk4NDA5N30.44clnfwRL_OnXJACgnrx7wYaDR4__0KlIMQ8dwir0bo';
export const supabase = createClient(URL, KEY);
