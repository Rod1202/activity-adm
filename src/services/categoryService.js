// src/services/categoryService.js
import { supabase } from './supabaseClient';

/**
 * Obtiene todas las categorías de la base de datos.
 * @returns {Promise<Array>} - Una lista de objetos de categoría, cada uno con id_categoria y nombre.
 */
export const getAllCategories = async () => {
  const { data, error } = await supabase
    .from('categoria')
    .select('id_categoria, nombre')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener las categorías:', error.message);
    throw error;
  }

  return data || [];
};

/**
 * Obtiene las subcategorías para una categoría específica.
 * @param {number} categoryId - El ID de la categoría para la que se obtienen las subcategorías.
 * @returns {Promise<Array>} - Una lista de objetos de subcategoría.
 */
export const getSubcategoriesByCategoryId = async (categoryId) => {
  if (!categoryId) return [];

  const { data, error } = await supabase
    .from('subcategoria')
    .select('id_subcategoria, nombre')
    .eq('id_categoria', categoryId)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener las subcategorías:', error.message);
    throw error;
  }

  return data || [];
};
