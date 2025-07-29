<template>
  <div class="phone-mockup register-activity-mockup">
    <header class="register-activity-header">
      <button class="back-button" @click="goBack">
        <i class="fi fi-sr-undo"></i>
      </button>
      <h1 class="title">Asignar Actividad</h1>
    </header>

    <main class="register-activity-content">
      <form @submit.prevent="saveActivity">
        <div class="form-group">
          <label for="assign-user" class="form-label">Asignar a Usuario</label>
          <select id="assign-user" v-model="assignedUserId" class="form-input" required>
            <option value="">Seleccionar usuario</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.nombre_usuario || user.email }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="client-search" class="form-label">Cliente</label>
          <div class="search-select-container">
            <input
              type="text"
              id="client-search"
              v-model="clientSearch"
              class="form-input"
              placeholder="Buscar cliente..."
              @focus="showClientOptions = true"
              @blur="hideClientOptions"
            />
            <ul v-if="showClientOptions && filteredClients.length" class="options-list">
              <li
                v-for="client in filteredClients"
                :key="client.cliente_id"
                @mousedown="selectClient(client)"
              >
                {{ client.nombre_cliente }}
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="category-search" class="form-label">Categoría</label>
          <div class="search-select-container">
            <input
              type="text"
              id="category-search"
              v-model="categorySearch"
              class="form-input"
              placeholder="Buscar categoría..."
              @focus="showCategoryOptions = true"
              @blur="hideCategoryOptions"
            />
            <ul v-if="showCategoryOptions && filteredCategories.length" class="options-list">
              <li
                v-for="category in filteredCategories"
                :key="category.categoria_id"
                @mousedown="selectCategory(category)"
              >
                {{ category.nombre_categoria }}
              </li>
            </ul>
          </div>
        </div>

        <div class="two-columns-group">
          <div class="form-group">
            <label for="date" class="form-label">Fecha</label>
            <input type="date" id="date" v-model="activityDate" class="form-input" required>
          </div>

          <div class="form-group">
            <label for="start-time" class="form-label">Hora de Inicio</label>
            <div class="input-with-button">
              <input type="time" id="start-time" v-model="startTime" class="form-input" required>
          </div>
        </div>



          <div class="form-group">
            <label for="priority" class="form-label">Prioridad</label>
            <select id="priority" v-model="priority" class="form-input">
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>


        <div class="form-group">
          <label for="description" class="form-label">Descripción (opcional)</label>
          <input id="description" v-model="description" class="form-input" type="text" placeholder="Describe los detalles de la actividad..." maxlength="255" />
        </div>

        <div class="action-buttons">
          <button type="submit" class="register-button" :disabled="isLoading">
            {{ isLoading ? 'Asignando...' : 'Asignar Actividad' }}
          </button>
    
        </div>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <!-- Reemplazar el mensaje de error por un icono flotante -->
        <div v-if="errorMessage" class="floating-error-icon" :title="errorMessage">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#fff"/>
            <path d="M8 8L16 16M16 8L8 16" stroke="#d32f2f" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
      </form>
    </main>
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/services/supabaseClient';
import { getCurrentUser } from '@/services/authService';
import { isUserJefe, getAllUsers } from '@/services/userService'; // Importar getAllUsers
import BottomNavigation from '@/components/BottomNavigation.vue';
console.log('AssignActivityView: Script setup loaded.');

const router = useRouter();

const users = ref([]);
const assignedUserId = ref('');
const allClients = ref([]);
const allCategories = ref([]);
const selectedClient = ref(null);
const selectedCategory = ref(null);

// Nuevas referencias para la búsqueda
const clientSearch = ref('');
const categorySearch = ref('');
const showClientOptions = ref(false);
const showCategoryOptions = ref(false);

const filteredClients = computed(() => {
  if (!clientSearch.value) {
    return allClients.value;
  }
  return allClients.value.filter(client =>
    client.nombre_cliente.toLowerCase().includes(clientSearch.value.toLowerCase())
  );
});

const filteredCategories = computed(() => {
  if (!categorySearch.value) {
    return allCategories.value;
  }
  return allCategories.value.filter(category =>
    category.nombre_categoria.toLowerCase().includes(categorySearch.value.toLowerCase())
  );
});
const description = ref('');
const activityDate = ref(new Date().toISOString().split('T')[0]);
const startTime = ref('');
const manualEndTime = ref('');
const showEditEndTime = ref(false);
const priority = ref('Media');

const manualDurationSeconds = ref(0);
const chronometerSeconds = ref(0);
const isChronometerRunning = ref(false);
let chronometerInterval = null;

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const startChronometer = () => {
  if (!isChronometerRunning.value) {
    isChronometerRunning.value = true;
    chronometerInterval = setInterval(() => {
      chronometerSeconds.value++;
    }, 1000);
  }
};

const stopChronometer = () => {
  if (isChronometerRunning.value) {
    isChronometerRunning.value = false;
    clearInterval(chronometerInterval);
    manualDurationSeconds.value = chronometerSeconds.value; // Captura la duración final del cronómetro
  }
};

const resetChronometer = () => {
  stopChronometer();
  chronometerSeconds.value = 0;
  manualDurationSeconds.value = 0; // Asegura que la duración manual también se resetee
};

const formatDuration = (totalSeconds) => {
  if (typeof totalSeconds !== 'number' || totalSeconds < 0) {
    return '00:00:00'; // Asegurarse de devolver un formato válido para visualización
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const fetchInitialData = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      errorMessage.value = 'Usuario no autenticado.';
      router.push('/login');
      return;
    }

    // Obtener todos los usuarios para el dropdown
    // Asumimos que getAllUsers ya filtra lo necesario o la RLS se encarga
    users.value = await getAllUsers();
    
    // Obtener clientes usando la nueva función RPC
    const { data: clientsData, error: clientsError } = await supabase
      .rpc('get_clients_for_assignment');


    if (clientsError) throw clientsError;
    allClients.value = clientsData || [];

    // Obtener categorías usando la nueva función RPC
    const { data: categoriesData, error: categoriesError } = await supabase
      .rpc('get_all_categories');
    
    if (categoriesError) throw categoriesError;
    allCategories.value = categoriesData || [];
  } catch (error) {
    console.error('Error fetching initial data:', error.message);
    errorMessage.value = 'Error al cargar datos iniciales: ' + error.message;
  }
};

const selectClient = (client) => {
  selectedClient.value = client;
  clientSearch.value = client.nombre_cliente;
  showClientOptions.value = false;
};

const selectCategory = (category) => {
  selectedCategory.value = category;
  categorySearch.value = category.nombre_categoria;
  showCategoryOptions.value = false;
};

const hideClientOptions = () => {
  setTimeout(() => {
    showClientOptions.value = false;
  }, 200); // Pequeño retardo para permitir el clic en la opción
};

const hideCategoryOptions = () => {
  setTimeout(() => {
    showCategoryOptions.value = false;
  }, 200); // Pequeño retardo para permitir el clic en la opción
};

const toggleEditEndTime = () => {
  showEditEndTime.value = !showEditEndTime.value;
  if (!showEditEndTime.value) {
    // Si se desactiva la edición manual, limpiar la hora manual y resetear cronómetro
    manualEndTime.value = '';
    resetChronometer(); // Resetear también el cronómetro si volvemos a ese modo
  } else {
    // Si se activa la edición manual, detener cronómetro y sugerir hora de fin
    stopChronometer();
    manualEndTime.value = calculateApproximateEndTime();
  }
};

const calculateApproximateEndTime = () => {
  if (!startTime.value) return '';
  const startDateTime = new Date(`${activityDate.value}T${startTime.value}`);
  // Si no hay cronómetro corriendo, usa la duración manual capturada. Si sí, asume 0 por ahora.
  const durationToAdd = isChronometerRunning.value ? 0 : manualDurationSeconds.value;
  const endDateTime = new Date(startDateTime.getTime() + durationToAdd * 1000);
  return endDateTime.toTimeString().split(' ')[0].substring(0, 5);
};


const saveActivity = async () => {
  console.log('saveActivity called!');
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const creatorUser = await getCurrentUser();
    if (!creatorUser) {
      errorMessage.value = 'Usuario no autenticado.';
      router.push('/login');
      return;
    }
     // AÑADE ESTOS CONSOLE.LOGS
    console.log('Validating fields for assignment:');
    console.log('assignedUserId:', assignedUserId.value);
    console.log('selectedClient:', selectedClient.value);
    console.log('selectedCategory:', selectedCategory.value);
    console.log('activityDate:', activityDate.value);
    console.log('startTime:', startTime.value);

    if (!assignedUserId.value || !selectedClient.value || !selectedCategory.value || !activityDate.value || !startTime.value) {
      errorMessage.value = 'Por favor, completa todos los campos obligatorios.';
      return;
    }

    let finalDurationSeconds = 0;
    let finalEndTime = null; // Important: set to null for pending activities
    let usedChronometerFlag = false;
    let initialActivityStateId;

    // Fetch IDs for activity states ONCE to avoid multiple lookups
    const { data: estadoPendienteData } = await supabase
        .from('estados_actividad')
        .select('id')
        .eq('nombre_estado', 'Pendiente')
        .single();
    const estadoPendienteId = estadoPendienteData?.id || 1;

    const { data: estadoCompletadoData } = await supabase
        .from('estados_actividad')
        .select('id')
        .eq('nombre_estado', 'Completado')
        .single();
    const estadoCompletadoId = estadoCompletadoData?.id || 3;

    // Lógica para determinar hora_fin y duración
    if (showEditEndTime.value) {
        // Caso: Usuario ingresó hora de fin manual
        if (!manualEndTime.value) {
            errorMessage.value = 'Por favor, ingresa la Hora de Fin manual.';
            return;
        }
        finalEndTime = manualEndTime.value;
        const startDateTime = new Date(`${activityDate.value}T${startTime.value}`);
        const endDateTime = new Date(`${activityDate.value}T${manualEndTime.value}`);
        if (endDateTime < startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1); // Cruza la medianoche
        }
        const durationMs = endDateTime.getTime() - startDateTime.getTime();
        finalDurationSeconds = Math.floor(durationMs / 1000);

        if (finalDurationSeconds <= 0) {
            errorMessage.value = 'La hora de fin debe ser posterior a la hora de inicio.';
            return;
        }
        usedChronometerFlag = false;
        initialActivityStateId = estadoCompletadoId; // Completada si tiene hora de fin manual

    } else { // No se está editando la hora de fin manualmente
        if (chronometerSeconds.value > 0) {
            // Caso: Se usó el cronómetro y hay duración
            finalDurationSeconds = chronometerSeconds.value;
            const startDateTime = new Date(`${activityDate.value}T${startTime.value}`);
            const endDateTime = new Date(startDateTime.getTime() + finalDurationSeconds * 1000);
            finalEndTime = endDateTime.toTimeString().split(' ')[0].substring(0, 5);
            usedChronometerFlag = true;
            initialActivityStateId = estadoCompletadoId; // Completada si tiene duración de cronómetro
        } else {
            // Caso: Ni hora de fin manual, ni cronómetro con duración -> Asignar como Pendiente
            // Esto es lo más común al asignar una actividad por un jefe.
            finalDurationSeconds = 0;
            finalEndTime = null;      // Hora de fin es NULL en la DB
            usedChronometerFlag = false;
            initialActivityStateId = estadoPendienteId;
        }
    }

    // Validación si la actividad es de estado 'Completado' y la duración es <= 0
    if (initialActivityStateId === estadoCompletadoId && finalDurationSeconds <= 0) {
        errorMessage.value = 'Una actividad completada debe tener una duración mayor a cero.';
        return;
    }

    const esJefe = await isUserJefe(creatorUser.id);
    
    const { error } = await supabase
      .from('actividades')
      .insert({
        cliente_id: selectedClient.value.cliente_id,
        categoria_id: selectedCategory.value.categoria_id,
        descripcion: description.value || null,
        fecha_actividad: activityDate.value,
        hora_inicio: startTime.value,
        hora_fin: finalEndTime, // Será null si es pendiente
        duracion_segundos: finalDurationSeconds, // Será 0 si es pendiente
        prioridad: priority.value,
        user_id: creatorUser.id, // El creador es el usuario actual
        usuario_asignado_id: assignedUserId.value, // El usuario asignado es el seleccionado
        estado_actividad_id: initialActivityStateId, // Usar el estado determinado
        usado_cronometro: usedChronometerFlag,
        creada_por_jefe: esJefe
      });

    if (error) throw error;

    successMessage.value = 'Actividad asignada exitosamente!';
    resetForm();
    router.push('/'); 
  } catch (err) {
    console.error('Error al asignar actividad:', err.message);
    errorMessage.value = err.message || 'Error desconocido al asignar la actividad.';
  } finally {
    isLoading.value = false;
    // Opcional: limpiar mensajes después de un tiempo
    if (successMessage.value) {
      setTimeout(() => successMessage.value = '', 5000);
    }
    if (errorMessage.value) {
      setTimeout(() => errorMessage.value = '', 7000);
    }
  }
};

const resetForm = () => {
  assignedUserId.value = '';
  selectedClient.value = null;
  selectedCategory.value = null;
  clientSearch.value = '';
  categorySearch.value = '';
  description.value = '';
  activityDate.value = new Date().toISOString().split('T')[0];
  startTime.value = '';
  manualEndTime.value = '';
  showEditEndTime.value = false;
  priority.value = 'Media';
  resetChronometer(); // Asegúrate de que el cronómetro se reinicie
};

const goBack = () => {
  router.push('/');
};

onMounted(async () => {
  await fetchInitialData();
  const now = new Date();
  startTime.value = now.toTimeString().split(' ')[0].substring(0, 5);
});

onUnmounted(() => {
  if (chronometerInterval) {
    clearInterval(chronometerInterval);
  }
});
</script>

<style scoped>
/* Estilos copiados de RegisterActivityView.vue */
.phone-mockup {
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 800px;
  overflow: hidden;
  position: relative;
  margin: 20px auto;
}

.register-activity-mockup {
  padding: 0;
}

.register-activity-header {
  background-color: var(--primary-color);
  color: #fff;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  position: relative;
  flex-shrink: 0;
}

.register-activity-header .title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  flex-grow: 1;
  text-align: center;
}

.back-button {
  background: none;
  border: none;
  font-size: 28px;
  color: #fff;
  cursor: pointer;
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  padding: 5px 10px;
  border-radius: 10px;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: var(--accent-purple);
}

.register-activity-content {
  flex-grow: 1;
  padding: 20px 30px;
  overflow-y: auto;
  min-height: 0;
  position: relative;
  padding-bottom: 100px;
}

.form-group {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--accent-darkblue);
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.2s ease;
  background-color: #fff;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 102, 246, 0.15);
}

select.form-input {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%234A55A2'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 1em;
  padding-right: 30px;
}

.two-columns-group {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.two-columns-group .form-group {
  flex: 1;
  margin-bottom: 0;
}

.input-with-button {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-with-button .form-input {
  flex-grow: 1;
}



.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  flex-shrink: 0;
}

.action-buttons button {
  width: 100%;
  max-width: 250px;
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-button {
  background-color: var(--primary-color);
  color: #fff;
}

.register-button:hover:not(:disabled) {
  background-color: var(--accent-darkblue);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.18);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.register-button:disabled {
  background-color: #a0a8d3;
  cursor: not-allowed;
  box-shadow: none;
}

.success-message {
  color: var(--success-color);
  text-align: center;
  margin-top: 20px;
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0;
}

.error-message {
  color: var(--error-color);
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  margin: 0 auto;
  background: transparent;
  z-index: 2;
}

@media (max-width: 768px) {
  .phone-mockup {
    width: 100%;
    max-width: none;
    border-radius: 0;
    height: 100vh;
    margin: 0;
    box-shadow: none;
  }

  .register-activity-header {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .register-activity-content {
    padding: 15px 20px;
    padding-bottom: 90px;
  }

  .form-input, select.form-input {
    padding: 10px 12px;
    font-size: 15px;
  }

  .two-columns-group {
    flex-direction: column;
    gap: 15px;
  }

  .action-buttons button {
    padding: 14px;
    font-size: 16px;
    max-width: 100%;
  }

}

.floating-error-icon {
  position: fixed;
  left: 40px;
  bottom: 40px;
  z-index: 1000;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  padding: 4px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.floating-error-icon:hover {
  box-shadow: 0 4px 16px rgba(211,47,47,0.18);
}
.floating-error-icon svg {
  display: block;
}

/* Estilos para el nuevo componente de búsqueda */
.search-select-container {
  position: relative;
}

.options-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 10px 10px;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.options-list li {
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.options-list li:hover {
  background-color: #f0f0f0;
}
</style>
