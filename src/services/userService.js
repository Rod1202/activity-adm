// src/services/userService.js
import { supabase } from './supabaseClient';

/**
 * Obtiene los datos del usuario actual con su rol
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Object>} - Datos del usuario con su rol
 */
export const getUserWithRole = async (userId) => {
    if (!userId) return null;
    
    const { data, error } = await supabase
        .from('usuarios')
        .select(`
            *,
            roles(nombre_rol)
        `)
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string} userId - ID del usuario autenticado
 * @param {Array<string>} roleNames - Nombres de roles a verificar
 * @returns {Promise<boolean>} - True si el usuario tiene alguno de los roles especificados
 */
export const hasRole = async (userId, roleNames) => {
    if (!userId || !roleNames.length) return false;
    
    const user = await getUserWithRole(userId);
    if (!user || !user.roles) return false;
    
    return roleNames.includes(user.roles.nombre_rol);
};

/**
 * Verifica si el usuario es un jefe (roles 4, 5, 6, 7)
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<boolean>} - True si el usuario es un jefe
 */
export const isUserJefe = async (userId) => {
    if (!userId) return false;
    
    const user = await getUserWithRole(userId);
    if (!user) return false;
    
    // IDs de roles de jefe según la base de datos
    const jefeRoleIds = [4, 5, 6, 7]; // Rodrigo, Jefe Postventa, Jefe Operaciones, Mesa de Servicio
    return jefeRoleIds.includes(user.rol_id);
};

/**
 * Obtiene los clientes asociados al usuario
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Array>} - Lista de clientes
 */
export const getUserClients = async (userId) => {
    if (!userId) return [];
    
    const { data, error } = await supabase
        .from('clientes')
        .select('cliente_id, nombre_cliente, estado_cliente')
        .eq('usuario_creador_id', userId);
    
    if (error) throw error;
    return data || [];
};

/**
 * Obtiene todos los usuarios de la base de datos
 * @returns {Promise<Array>} - Lista de todos los usuarios
 */
export const getAllUsers = async () => {
    const { data, error } = await supabase
        .rpc('get_all_users_safe');
    
    if (error) throw error;
    return data || [];
};


/**
 * Obtiene las actividades asignadas al usuario
 * @param {string} userId - ID del usuario autenticado
 * @param {Object} filters - Filtros opcionales (estado, fecha, etc.)
 * @returns {Promise<Array>} - Lista de actividades
 */
export const getUserActivities = async (userId, filters = {}) => {
    if (!userId || !filters.fecha) return [];

    const { data, error } = await supabase
        .rpc('get_activities_for_card', {
            p_user_id: userId,
            p_fecha: filters.fecha
        });

    if (error) throw error;
    return data || [];
};
