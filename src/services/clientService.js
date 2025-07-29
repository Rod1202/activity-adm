// src/services/clientService.js
import { supabase } from '@/services/supabaseClient';
import { getCurrentUser } from '@/services/authService';

/**
 * Obtiene todos los clientes del usuario actual
 * @param {Object} filters - Filtros opcionales (estado, búsqueda)
 * @returns {Promise<Array>} - Lista de clientes
 */
export const getUserClients = async (filters = {}) => {
  const user = await getCurrentUser();
  if (!user) return [];
  
  let query = supabase
    .from('clientes')
    .select('*')
    .eq('usuario_creador_id', user.id);
  
  // Aplicar filtro por estado si existe
  if (filters.estado) {
    query = query.eq('estado_cliente', filters.estado);
  }
  
  // Ordenar por nombre
  query = query.order('nombre_cliente', { ascending: true });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

/**
 * Crea un nuevo cliente
 * @param {Object} clientData - Datos del cliente a crear
 * @returns {Promise<Object>} - Cliente creado
 */
export const createClient = async (clientData) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');
  
  const { data, error } = await supabase
    .from('clientes')
    .insert({
      ...clientData,
      usuario_creador_id: user.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Actualiza un cliente existente
 * @param {number} clientId - ID del cliente a actualizar
 * @param {Object} clientData - Nuevos datos del cliente
 * @returns {Promise<Object>} - Cliente actualizado
 */
export const updateClient = async (clientId, clientData) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');
  
  // Verificar que el cliente pertenezca al usuario
  const { data: clientCheck, error: checkError } = await supabase
    .from('clientes')
    .select('cliente_id')
    .eq('cliente_id', clientId)
    .eq('usuario_creador_id', user.id)
    .single();
  
  if (checkError || !clientCheck) {
    throw new Error('No tienes permiso para editar este cliente');
  }
  
  const { data, error } = await supabase
    .from('clientes')
    .update(clientData)
    .eq('cliente_id', clientId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Elimina un cliente
 * @param {number} clientId - ID del cliente a eliminar
 * @returns {Promise<void>}
 */
export const deleteClient = async (clientId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');
  
  // Verificar que el cliente pertenezca al usuario
  const { data: clientCheck, error: checkError } = await supabase
    .from('clientes')
    .select('cliente_id')
    .eq('cliente_id', clientId)
    .eq('usuario_creador_id', user.id)
    .single();
  
  if (checkError || !clientCheck) {
    throw new Error('No tienes permiso para eliminar este cliente');
  }
  
  // Verificar si el cliente tiene actividades asociadas
  const { data: actividades, error: actividadesError } = await supabase
    .from('actividades')
    .select('actividad_id')
    .eq('cliente_id', clientId)
    .limit(1);
  
  if (actividadesError) throw actividadesError;
  
  if (actividades && actividades.length > 0) {
    // Si tiene actividades, solo cambiar el estado a Inactivo
    const { error } = await supabase
      .from('clientes')
      .update({ estado_cliente: 'Inactivo' })
      .eq('cliente_id', clientId);
    
    if (error) throw error;
  } else {
    // Si no tiene actividades, eliminar el cliente
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('cliente_id', clientId);
    
    if (error) throw error;
  }
};

/**
 * Verifica si un cliente tiene actividades asociadas
 * @param {number} clientId - ID del cliente a verificar
 * @returns {Promise<boolean>} - True si tiene actividades
 */
export const clientHasActivities = async (clientId) => {
  const { data, error } = await supabase
    .from('actividades')
    .select('actividad_id')
    .eq('cliente_id', clientId)
    .limit(1);
  
  if (error) throw error;
  return data && data.length > 0;
};