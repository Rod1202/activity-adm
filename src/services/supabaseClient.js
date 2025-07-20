// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Configuración directa para pruebas (reemplaza con tus valores reales)
const supabaseUrl = 'https://oxvlaquamhesbrhamaoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dmxhcXVhbWhlc2JyaGFtYW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDUxODQsImV4cCI6MjA2ODUyMTE4NH0.CbC2kAbyfQdghdy_uUFJGfl3B3olpHznWKAaFCGWqXI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


