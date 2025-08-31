<template>
  <div class="phone-mockup dashboard-mockup">
    <header class="dashboard-header">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <i class="fi fi-sr-undo"></i>
        </button>
        <h1 class="header-title">Editar Actividad</h1>
      </div>
    </header>

    <main class="main-content-scrollable">
      <div v-if="isLoadingActivity" class="loading-message">Cargando actividad...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

      <form @submit.prevent="saveChanges" v-if="activity && !isLoadingActivity" class="edit-activity-form">
        <div class="form-group">
          <label>Cliente:</label>
          <input type="text" :value="activity.clientes_nombre_cliente || 'N/A'" disabled class="styled-input" />
        </div>

        <div class="form-group">
          <label>Medio:</label>
          <input type="text" :value="activity.medios_descripcion || 'Sin medio'" disabled class="styled-input" />
        </div>

        <div class="form-group">
          <label for="description">Descripción:</label>
          <textarea id="description" v-model="activity.descripcion" class="styled-input"></textarea>
        </div>

        <div class="form-group">
          <label for="startTime">Hora de Inicio:</label>
          <input type="time" id="startTime" :value="activity.hora_inicio.substring(0, 5)" disabled class="styled-input" />
        </div>

        <div class="form-group" v-if="activity.estado_actividad_nombre === 'Pendiente' || activity.estado_actividad_nombre === 'En Progreso'">
          <label for="endTime">Hora de Fin:</label>
          <input type="time" id="endTime" v-model="manualEndTime" required class="styled-input" />
          <p class="hint">Establece la hora en que finalizó la actividad.</p>
        </div>

        <div class="button-group">
          <button type="submit" class="styled-button primary-button" :disabled="isSaving">
            {{ isSaving ? 'Guardando...' : 'Completar Actividad' }}
          </button>
          <button type="button" @click="cancelActivity" class="styled-button danger-button" :disabled="isSaving">
            Cancelar Actividad
          </button>
        </div>
      </form>
      <div v-else-if="!activity && !isLoadingActivity" class="no-activity-message">
        <p>No se pudo cargar la actividad o no existe.</p>
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/services/supabaseClient';
import { getCurrentUser } from '@/services/authService';
import BottomNavigation from '../components/BottomNavigation.vue';

const route = useRoute();
const router = useRouter();

const activity = ref(null);
const manualEndTime = ref('');
const isLoadingActivity = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const fetchActivity = async () => {
  isLoadingActivity.value = true;
  errorMessage.value = '';
  const activityId = route.params.id;

  if (!activityId) {
    errorMessage.value = 'ID de actividad no proporcionado.';
    isLoadingActivity.value = false;
    return;
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      errorMessage.value = 'Usuario no autenticado.';
      router.push('/login');
      return;
    }

    // Aquí ajustamos la llamada a la función rpc para traer el medio
    const { data, error } = await supabase
      .rpc('get_activity_by_id', { p_activity_id: activityId, p_user_id: user.id });

    if (error) throw error;

    if (data && data.length > 0) {
      activity.value = data[0];
      if (activity.value.hora_fin) {
        manualEndTime.value = activity.value.hora_fin.substring(0, 5);
      } else {
        const now = new Date();
        manualEndTime.value = now.toTimeString().split(' ')[0].substring(0, 5);
      }
    } else {
      errorMessage.value = 'Actividad no encontrada o no tienes permiso para verla.';
    }
  } catch (err) {
    console.error('Error fetching activity:', err.message);
    errorMessage.value = 'Error al cargar la actividad: ' + err.message;
  } finally {
    isLoadingActivity.value = false;
  }
};

const saveChanges = async () => {
  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  if (!activity.value) {
    errorMessage.value = 'No hay actividad para guardar.';
    isSaving.value = false;
    return;
  }

  if (!manualEndTime.value) {
    errorMessage.value = 'Por favor, ingresa una hora de fin.';
    isSaving.value = false;
    return;
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      errorMessage.value = 'Usuario no autenticado.';
      router.push('/login');
      return;
    }

    const startDateTime = new Date(`${activity.value.fecha_actividad}T${activity.value.hora_inicio}`);
    const endDateTime = new Date(`${activity.value.fecha_actividad}T${manualEndTime.value}`);

    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const finalDurationSeconds = Math.floor(durationMs / 1000);

    if (finalDurationSeconds <= 0) {
      errorMessage.value = 'La hora de fin debe ser posterior a la hora de inicio para completar la actividad.';
      isSaving.value = false;
      return;
    }

    const { data: estadoCompletadoData, error: estadoError } = await supabase
      .from('estados_actividad')
      .select('id')
      .eq('nombre_estado', 'Completado')
      .single();

    if (estadoError) throw estadoError;
    const estadoCompletadoId = estadoCompletadoData?.id;

    if (!estadoCompletadoId) {
      errorMessage.value = 'No se encontró el estado "Completado".';
      isSaving.value = false;
      return;
    }

    const { error } = await supabase
      .from('actividades')
      .update({
        hora_fin: manualEndTime.value,
        duracion_segundos: finalDurationSeconds,
        estado_actividad_id: estadoCompletadoId,
        descripcion: activity.value.descripcion
      })
      .eq('actividad_id', activity.value.actividad_id)
      .eq('usuario_asignado_id', user.id);

    if (error) {
        if (error.code === '42501') {
            errorMessage.value = 'Permiso denegado. No tienes autorización para actualizar esta actividad (RLS).';
        } else {
            errorMessage.value = error.message || 'Error desconocido al actualizar la actividad.';
        }
        throw error;
    }

    successMessage.value = 'Actividad completada exitosamente!';
    setTimeout(() => {
      router.push('/');
    }, 1500);

  } catch (err) {
    errorMessage.value = err.message || 'Error desconocido al completar la actividad.';
  } finally {
    isSaving.value = false;
    setTimeout(() => { successMessage.value = ''; errorMessage.value = ''; }, 5000);
  }
};

const cancelActivity = async () => {
  if (!confirm('¿Estás seguro de que quieres cancelar esta actividad?')) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const user = await getCurrentUser();
    if (!user) {
      errorMessage.value = 'Usuario no autenticado.';
      router.push('/login');
      return;
    }

    const { data: estadoCanceladoData, error: estadoError } = await supabase
      .from('estados_actividad')
      .select('id')
      .eq('nombre_estado', 'Cancelado')
      .single();

    if (estadoError) throw estadoError;
    const estadoCanceladoId = estadoCanceladoData?.id;

    if (!estadoCanceladoId) {
      errorMessage.value = 'No se encontró el estado "Cancelado".';
      isSaving.value = false;
      return;
    }

    const { error } = await supabase
      .from('actividades')
      .update({
        estado_actividad_id: estadoCanceladoId,
        hora_fin: null,
        duracion_segundos: 0
      })
      .eq('actividad_id', activity.value.actividad_id)
      .eq('usuario_asignado_id', user.id);

    if (error) {
        if (error.code === '42501') {
            errorMessage.value = 'Permiso denegado. No tienes autorización para cancelar esta actividad (RLS).';
        } else {
            errorMessage.value = error.message || 'Error desconocido al cancelar la actividad.';
        }
        throw error;
    }

    successMessage.value = 'Actividad cancelada exitosamente!';
    setTimeout(() => {
      router.push('/');
    }, 1500);

  } catch (err) {
    errorMessage.value = err.message || 'Error desconocido al cancelar la actividad.';
  } finally {
    isSaving.value = false;
    setTimeout(() => { successMessage.value = ''; errorMessage.value = ''; }, 5000);
  }
};

const deleteActivity = async () => {
  if (!confirm('¿Estás SEGURO de que quieres ELIMINAR PERMANENTEMENTE esta actividad? Esta acción no se puede deshacer.')) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const user = await getCurrentUser();
    if (!user) {
      errorMessage.value = 'Usuario no autenticado.';
      router.push('/login');
      return;
    }

    const { error } = await supabase
      .from('actividades')
      .delete()
      .eq('actividad_id', activity.value.actividad_id)
      .eq('usuario_asignado_id', user.id);

    if (error) {
      if (error.code === '42501') {
        errorMessage.value = 'Permiso denegado. No tienes autorización para eliminar esta actividad (RLS).';
      } else {
        errorMessage.value = error.message || 'Error desconocido al eliminar la actividad.';
      }
      throw error;
    }

    successMessage.value = 'Actividad eliminada permanentemente.';
    setTimeout(() => {
      router.push('/');
    }, 1500);

  } catch (err) {
    errorMessage.value = err.message || 'Error desconocido al eliminar la actividad.';
  } finally {
    isSaving.value = false;
    setTimeout(() => { successMessage.value = ''; errorMessage.value = ''; }, 5000);
  }
};

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  fetchActivity();
});
</script>

<style scoped>
/* Estilos generales del mockup (se mantienen o adaptan) */
.phone-mockup {
  width: 100%;
  max-width: 1000px; /* Asegura que no se estire demasiado en pantallas grandes */
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 800px; /* Altura fija para el mockup, si prefieres 100vh en móviles, usa media queries */
  overflow: hidden; /* Importante para el scroll interno y bordes redondeados */
  position: relative;
  margin: 20px auto;
}

/* Dashboard-specific styles for the header and main content */
.dashboard-header {
  background-color: var(--primary-color); /* Color azul */
  color: #fff;
  padding: 25px 30px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  flex-shrink: 0; /* Evita que el header se encoja */
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center; /* Centra el título */
  position: relative; /* Para posicionar el botón de retroceso */
}

.back-button {
  background: none;
  border: none;
  font-size: 24px; /* Tamaño del icono */
  color: #fff;
  cursor: pointer;
  position: absolute; /* Posiciona el botón a la izquierda */
  left: 0;
  padding: 0;
  line-height: 1; /* Asegura que el icono esté bien alineado */
}

.header-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  color: #fff;
  flex-grow: 1; /* Permite que el título ocupe espacio y centre */
  text-align: center;
}

.main-content-scrollable {
  flex-grow: 1;
  overflow-y: auto; /* Permite scroll solo en el contenido principal */
  padding: 20px; /* Padding para el contenido */
  background-color: #f8f9fa; /* Fondo suave para el área de contenido */
}

.card {
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  margin-bottom: 20px; /* Espacio antes del BottomNavigation */
}

/* Estilos de los grupos de formulario */
.form-group {
  margin-bottom: 20px; /* Mayor espacio entre grupos */
}

.form-group label {
  display: block;
  margin-bottom: 8px; /* Espacio entre label y input */
  font-weight: 600; /* Más audaz */
  color: var(--accent-darkblue); /* Color consistente con tus otros textos */
  font-size: 1.05em;
}

.styled-input,
.styled-textarea {
  width: 100%; /* Ocupa todo el ancho disponible */
  padding: 12px 15px; /* Más padding para mejor tacto */
  border: 1px solid #e0e0e0; /* Borde más sutil */
  border-radius: 10px; /* Bordes más redondeados */
  font-size: 1em;
  background-color: #f2f4f6; /* Fondo ligero para inputs */
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box; /* Incluye padding y border en el ancho total */
}

.styled-input:focus,
.styled-textarea:focus {
  border-color: var(--primary-color); /* Borde azul al enfocar */
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
  outline: none;
  background-color: #fff; /* Fondo blanco al enfocar */
}

.styled-input:disabled {
  background-color: #e9ecef; /* Color para campos deshabilitados */
  color: #6c757d; /* Texto más gris para deshabilitados */
  cursor: not-allowed;
}

.styled-textarea {
  min-height: 100px; /* Altura mínima para el área de texto */
  resize: vertical; /* Permite redimensionar verticalmente */
  background-color: #fff; /* La descripción debe ser siempre editable y clara */
}

.hint {
  font-size: 0.85em;
  color: #888;
  margin-top: 5px;
  line-height: 1.4;
}

/* Estilos de los botones */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 15px; /* Más espacio entre botones */
  margin-top: 30px; /* Más espacio sobre los botones */
}

.styled-button {
  padding: 15px 20px; /* Mayor padding */
  border: none;
  border-radius: 10px; /* Bordes más redondeados */
  font-size: 1.05em;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Sombra sutil */
}

.styled-button:hover {
  transform: translateY(-2px); /* Efecto ligero al pasar el mouse */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.styled-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none; /* Sin transformación cuando deshabilitado */
  box-shadow: none;
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
}

.primary-button:hover {
  background-color: #004cb3; /* Un azul más oscuro que el primary-color */
}

.warning-button {
  background-color: var(--accent-orange); /* Tu naranja actual */
  color: white; /* Texto blanco para el naranja */
}

.warning-button:hover {
  background-color: #cc6d00; /* Un naranja más oscuro */
}

.danger-button {
  background-color: #dc3545; /* Rojo fuerte para peligro/cancelar */
  color: white;
}

.danger-button:hover {
  background-color: #c82333; /* Un rojo más oscuro */
}

/* Mensajes de estado */
.loading-message,
.error-message,
.success-message,
.no-activity-message {
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}

.loading-message {
  background-color: #e3f2fd; /* Azul claro */
  color: #1976d2; /* Azul más oscuro */
}

.error-message {
  background-color: #ffebee; /* Rojo claro */
  color: #d32f2f; /* Rojo más oscuro */
  border: 1px solid #ef9a9a;
}

.success-message {
  background-color: #e8f5e9; /* Verde claro */
  color: #388e3c; /* Verde más oscuro */
  border: 1px solid #a5d6a7;
}

.no-activity-message {
    color: #6c757d;
    font-style: italic;
    padding-top: 30px;
}


/* Media Queries para pantallas más pequeñas (móviles) */
@media (max-width: 768px) {
  .phone-mockup {
    max-width: none;
    border-radius: 0;
    height: 100vh; /* Ocupa toda la altura de la vista en móviles */
    box-shadow: none;
    margin: 0;
  }

  .dashboard-header {
    padding: 20px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .header-title {
    font-size: 22px;
  }

  .back-button {
      font-size: 20px;
  }

  .main-content-scrollable {
    padding: 15px; /* Menos padding en móviles */
  }

  .card {
    border-radius: 10px;
    padding: 20px;
  }

  .styled-button {
    padding: 12px 15px; /* Padding reducido para botones */
    font-size: 1em;
  }
}
</style>
