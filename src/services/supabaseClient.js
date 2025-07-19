// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Accede a las variables de entorno inyectadas por Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Asegúrate de que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Supabase URL o Anon Key no están definidos en las variables de entorno.');
    // Puedes lanzar un error o manejarlo de otra manera, por ejemplo, redirigir a una página de error
    throw new Error('Supabase environment variables are missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);