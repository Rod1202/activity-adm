// src/services/authService.js
import { supabase } from './supabaseClient';

export const signInWithEmailAndPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const getUserSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return session;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return user;
};

// Ejemplo de obtención de datos del admin:
export async function getCurrentAdmin(userId) {
  return await supabase
    .from('admins')
    .select('*')
    .eq('id', userId)
    .single();
}