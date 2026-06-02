import { createClient } from '@supabase/supabase-js';
const URL = 'https://omvjvooxqcgjtcznmqxp.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdmp2b294cWNnanRjem5tcXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzY3NTksImV4cCI6MjA5NjAxMjc1OX0.LEvZ-DHGHogAzkUq8bpxVpEgsKWrQ5bBv0Onk773ecQ';
export const supabase = createClient(URL, KEY);
