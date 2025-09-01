<template>
  <div class="phone-mockup register-activity-mockup">
    <header class="register-activity-header">
      <button class="back-button" @click="goBack">
        <i class="fi fi-sr-undo"></i>
      </button>
      <h1 class="title">Registrar Actividad</h1>
    </header>

    <main class="register-activity-content">
      <form @submit.prevent="saveActivity" autocomplete="off">
        <!-- Campo para Cliente -->
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
              @blur="hideOptions(showClientOptions)"
              autocomplete="off"
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

        <!-- Campo para Medio -->
        <div class="form-group">
          <label for="medio-search" class="form-label">Medio</label>
          <div class="search-select-container">
            <input
              type="text"
              id="medio-search"
              v-model="medioSearch"
              class="form-input"
              placeholder="Buscar medio..."
              @focus="showMedioOptions = true"
              @blur="hideOptions(showMedioOptions)"
              autocomplete="off"
            />
            <ul v-if="showMedioOptions && filteredMedios.length" class="options-list">
              <li
                v-for="medio in filteredMedios"
                :key="medio.id_medio"
                @mousedown="selectMedio(medio)"
              >
                {{ medio.descripcion }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Campo para Destino -->
        <div class="form-group">
          <label for="destino-search" class="form-label">Destino</label>
          <div class="search-select-container">
            <input
              type="text"
              id="destino-search"
              v-model="destinoSearch"
              class="form-input"
              placeholder="Buscar destino..."
              @focus="showDestinoOptions = true"
              @blur="hideOptions(showDestinoOptions)"
              autocomplete="off"
            />
            <ul v-if="showDestinoOptions && filteredDestinos.length" class="options-list">
              <li
                v-for="destino in filteredDestinos"
                :key="destino.id_destino"
                @mousedown="selectDestino(destino)"
              >
                {{ destino.descripcion }}
              </li>
            </ul>
          </div>
        </div>

        <div class="two-columns-group">
          <div class="form-group">
            <label for="date" class="form-label">Fecha</label>
            <input type="date" id="date" v-model="activityDate" class="form-input" required autocomplete="off">
          </div>
          <div class="form-group">
            <label for="start-time" class="form-label">Hora de Inicio</label>
            <input type="time" id="start-time" v-model="startTime" class="form-input" required autocomplete="off">
          </div>
        </div>

        <div class="two-columns-group">
          <div class="form-group">
            <label for="end-time-manual" class="form-label">Hora de Fin (Manual)</label>
            <input type="time" id="end-time-manual" v-model="endTime" class="form-input" autocomplete="off">
          </div>
          <div class="form-group">
            <label for="duration" class="form-label">Duración (HH:MM:SS)</label>
            <input 
              type="text" 
              id="duration" 
              :value="formattedDuration" 
              class="form-input" 
              readonly
              autocomplete="off"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="priority" class="form-label">Prioridad</label>
          <select id="priority" v-model="priority" class="form-input" autocomplete="off">
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">Descripción </label>
          <input 
            id="description" 
            v-model="description" 
            class="form-input" 
            type="text" 
            placeholder="Describe los detalles de la actividad..." 
            maxlength="255" 
            autocomplete="off"
          />
        </div>

        <div class="action-buttons">
          <button type="submit" class="register-button" :disabled="isLoading">
            {{ isLoading ? 'Registrando...' : 'Registrar' }}
          </button>
        </div>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
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
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/services/supabaseClient';
import { getCurrentUser } from '@/services/authService';
import { isUserJefe } from '@/services/userService';
import BottomNavigation from '@/components/BottomNavigation.vue';

const router = useRouter();

const allClients = ref([]);
const allMedios = ref([]); 
const allDestinos = ref([]); 

const selectedClient = ref(null);
const selectedMedio = ref(null); 
const selectedDestino = ref(null); 

const clientSearch = ref('');
const medioSearch = ref(''); 
const destinoSearch = ref(''); 

const showClientOptions = ref(false);
const showMedioOptions = ref(false); 
const showDestinoOptions = ref(false); 

const description = ref('');

// Helper function to get the current date in 'YYYY-MM-DD' local format
const getLocalTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initialize activityDate using the helper function to get the local date
const activityDate = ref(getLocalTodayString());

const startTime = ref('');
const endTime = ref('');
const priority = ref('Media');

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Refactored function to hide options for all search inputs
const hideOptions = (stateRef) => {
  setTimeout(() => {
    stateRef.value = false;
  }, 200);
};

// Functions to handle the logic for the Medio and Destino fields
const selectMedio = (medio) => {
  selectedMedio.value = medio;
  medioSearch.value = medio.descripcion;
  showMedioOptions.value = false;
};

const selectDestino = (destino) => {
  selectedDestino.value = destino;
  destinoSearch.value = destino.descripcion;
  showDestinoOptions.value = false;
};

// Function to fetch data from 'medio' and 'destino' tables
const fetchMediosAndDestinos = async () => {
  try {
    const { data: mediosData, error: mediosError } = await supabase
      .from('medio')
      .select('*');
    if (mediosError) throw mediosError;
    allMedios.value = mediosData || [];

    const { data: destinosData, error: destinosError } = await supabase
      .from('destino')
      .select('*');
    if (destinosError) throw destinosError;
    allDestinos.value = destinosData || [];
  } catch (error) {
    console.error('Error fetching medios or destinos:', error.message);
    errorMessage.value = 'Error al cargar medios o destinos.';
  }
};


// Computed properties for Medio and Destino
const filteredMedios = computed(() => {
  if (!medioSearch.value) {
    return allMedios.value;
  }
  return allMedios.value.filter(medio =>
    medio.descripcion.toLowerCase().includes(medioSearch.value.toLowerCase())
  );
});

const filteredDestinos = computed(() => {
  if (!destinoSearch.value) {
    return allDestinos.value;
  }
  return allDestinos.value.filter(destino =>
    destino.descripcion.toLowerCase().includes(destinoSearch.value.toLowerCase())
  );
});


const filteredClients = computed(() => {
  if (!clientSearch.value) {
    return allClients.value;
  }
  return allClients.value.filter(client =>
    client.nombre_cliente.toLowerCase().includes(clientSearch.value.toLowerCase())
  );
});

// Helper function to format duration in HH:MM:SS
const formatDuration = (totalSeconds) => {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// Computed property to calculate duration from start and end times
const calculatedDurationSeconds = computed(() => {
  if (startTime.value && endTime.value) {
    const startDateTime = new Date(`${activityDate.value}T${startTime.value}`);
    let endDateTime = new Date(`${activityDate.value}T${endTime.value}`);

    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    return Math.floor(durationMs / 1000);
  }
  return 0;
});

const formattedDuration = computed(() => formatDuration(calculatedDurationSeconds.value));


// --- Form and Supabase functions ---
const fetchClients = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      errorMessage.value = 'Usuario no autenticado. Por favor, inicia sesión.';
      router.push('/login');
      return;
    }

    const { data: clientsData, error: clientsError } = await supabase
      .rpc('get_active_clients_for_user', { user_id_param: user.id });

    if (clientsError) throw clientsError;
    allClients.value = clientsData || [];

  } catch (error) {
    console.error('Error fetching clients:', error.message);
    errorMessage.value = 'Error al cargar clientes.';
  }
};

const selectClient = (client) => {
  selectedClient.value = client;
  clientSearch.value = client.nombre_cliente;
  showClientOptions.value = false;
};


const saveActivity = async () => {
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const user = await getCurrentUser();
    if (!user) {
      errorMessage.value = 'Usuario no autenticado. Por favor, inicia sesión.';
      router.push('/login');
      return;
    }

    // Validation of mandatory fields
    if (!selectedClient.value || !activityDate.value || !startTime.value) {
      errorMessage.value = 'Por favor, completa los campos obligatorios: Cliente, Fecha y Hora de Inicio.';
      return;
    }
    
    // Determine the activity status based on whether an end time is provided.
    let finalDurationSeconds = null;
    let estadoActividadId = 1; // Default to "Pendiente" (id=1)

    if (endTime.value) {
      finalDurationSeconds = calculatedDurationSeconds.value;
      estadoActividadId = 3; // Change to "Completado" (id=3)
    }

    const esJefe = await isUserJefe(user.id);

    const { error } = await supabase
        .from('actividades')
        .insert({
          cliente_id: selectedClient.value.cliente_id,
          descripcion: description.value || null,
          fecha_actividad: activityDate.value,
          hora_inicio: startTime.value,
          hora_fin: endTime.value || null,
          duracion_segundos: finalDurationSeconds,
          prioridad: priority.value,
          user_id: user.id,
          usuario_asignado_id: user.id,
          estado_actividad_id: estadoActividadId,
          usado_cronometro: false,
          creada_por_jefe: esJefe,
          // NEW FIELDS:
          id_medio: selectedMedio.value ? selectedMedio.value.id_medio : null,
          id_destino: selectedDestino.value ? selectedDestino.value.id_destino : null,
          // Se elimina el campo categoria_id porque ya no existe en la tabla
        });

    if (error) {
      throw error;
    }

    successMessage.value = 'Actividad registrada exitosamente!';
    resetForm();
    router.push('/');
  } catch (err) {
    console.error('Error al registrar actividad:', err.message);
    errorMessage.value = err.message || 'Error desconocido al registrar la actividad.';
    if (errorMessage.value && typeof errorMessage.value !== 'string') {
        errorMessage.value = String(errorMessage.value);
    }
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
    selectedClient.value = null;
    selectedMedio.value = null; 
    selectedDestino.value = null; 
    clientSearch.value = '';
    medioSearch.value = ''; 
    destinoSearch.value = ''; 
    description.value = '';
    activityDate.value = getLocalTodayString();
    startTime.value = ''; // Limpiamos la hora de inicio
    endTime.value = '';
    priority.value = 'Media';
};

const goBack = () => {
    router.push('/');
};

onMounted(() => {
    // Al montar el componente, establecemos la hora actual
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    startTime.value = `${hours}:${minutes}`;

    fetchClients();
    fetchMediosAndDestinos();
});
</script>

<style scoped>
/* Main container and general structure */
/* This container will now adapt to the screen width */
.phone-mockup {
  width: 100%;
  max-width: 1000px; /* Wide width for desktop */
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 800px; /* Height adjusted to 900px to avoid scrollbar */
  overflow: hidden;
  position: relative;
  margin: 20px auto; /* Centers the container */
}

.register-activity-mockup {
  padding: 0;
}

/* Header */
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
  flex-shrink: 0; /* Prevents the header from shrinking */
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

/* Main form content */
.register-activity-content {
  flex-grow: 1;
  padding: 20px 30px;
  overflow-y: auto;
  min-height: 0; /* Allows content to shrink if needed */
  position: relative; /* For absolute positioning of the error icon */
}

/* Form groups */
.form-group {
  margin-bottom: 20px;
  flex-shrink: 0; /* Prevents groups from shrinking */
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

/* Specific styles for select */
select.form-input {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%234A55A2'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 1em;
  padding-right: 30px;
}


/* Two-column layout for some groups */
.two-columns-group {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.two-columns-group .form-group {
  flex: 1;
  margin-bottom: 0;
}

/* Input with button (for start time) */
.input-with-button {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-with-button .form-input {
  flex-grow: 1;
}

/* Style for the "Edit" button */
.btn-edit {
  background-color: #FFFFFF;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 10px;
  padding: 12px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 48px;
}

.btn-edit i {
    font-size: 1.2em;
    color: inherit;
}

.btn-edit:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.btn-edit:hover i {
    color: white;
}

.btn-edit:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

/* Action buttons at the bottom of the form */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  flex-shrink: 0; /* Prevents buttons from shrinking */
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

/* Success and error messages */
.success-message {
  color: var(--success-color);
  text-align: center;
  margin-top: 20px;
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0; /* Prevents messages from shrinking */
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

/* Media queries for responsiveness */
@media (max-width: 768px) { /* This breakpoint is for tablets and mobile phones */
  .phone-mockup {
    width: 100%; /* Takes up the entire width on smaller screens */
    max-width: none; /* Removes the maximum width limit */
    border-radius: 0; /* No rounded borders at the ends to take up the entire screen */
    height: 100vh; /* Takes up the entire viewport height */
    margin: 0; /* Removes the margin to stick to the edges */
    box-shadow: none; /* Removes the shadow for a native "app" appearance */
  }

  

  .register-activity-header {
    border-top-left-radius: 0; /* Removes the rounded borders of the header */
    border-top-right-radius: 0;
  }

  .register-activity-content {
    padding: 15px 20px;
    padding-bottom: 90px; /* Adjusts the padding for mobile */
  }

  .form-input, select.form-input {
    padding: 10px 12px;
    font-size: 15px;
  }

  .two-columns-group {
    flex-direction: column; /* Stack columns on small screens */
    gap: 15px;
  }
  .chronometer-display {
    font-size: 3em;
  }
  .chronometer-controls button {
    padding: 12px 20px;
    font-size: 1em;
  }
  .action-buttons button {
    padding: 14px;
    font-size: 16px;
    max-width: 100%; /* Ensures it takes up 100% on mobile */
  }
  .btn-edit {
    width: 45px;
    height: 45px;
    padding: 0;
  }
}

/* Floating error icon */
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

/* Styles for the new search component */
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
