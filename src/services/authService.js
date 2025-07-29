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

/**
 * Obtiene los datos completos del usuario actual desde la tabla 'usuarios'
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Object>} - Datos del usuario
 */
export const getCurrentUserData = async (userId) => {
  if (!userId) {
    const authUser = await getCurrentUser();
    userId = authUser?.id;
  }
  
  if (!userId) return null;
  
  const { data, error } = await supabase
    .rpc('get_user_data_with_role', { user_id_param: userId })
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Verifica si el usuario actual tiene un rol específico
 * @param {Array<number>} roleIds - IDs de roles a verificar
 * @returns {Promise<boolean>} - True si el usuario tiene alguno de los roles especificados
 */
export const hasRole = async (roleIds) => {
  const userData = await getCurrentUserData();
  if (!userData) return false;
  
  return roleIds.includes(userData.rol_id);
};
