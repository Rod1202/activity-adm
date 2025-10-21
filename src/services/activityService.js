// src/services/activityService.js
import { supabase } from './supabaseClient';

/**
 * Crea una nueva actividad para un técnico.
 * @param {Object} activityData - Los datos de la actividad a registrar.
 * @returns {Promise<Object>} - El objeto de la actividad creada.
 */
export const createTecnicoActivity = async (activityData) => {
  const { data, error } = await supabase
    .from('actividades_tecnico')
    .insert([activityData])
    .select()
    .single();

  if (error) {
    console.error('Error al crear la actividad del técnico:', error.message);
    throw error;
  }

  return data;
};
