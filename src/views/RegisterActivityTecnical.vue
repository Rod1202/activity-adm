<template>
  <div class="phone-mockup register-activity-technical-mockup">
    <header class="register-activity-technical-header">
      <button class="back-button" @click="goBack">
        <i class="fi fi-sr-undo"></i>
      </button>
      <h1 class="title">Detalle de Tarea</h1>
    </header>

    <main class="register-activity-technical-content">
      <!-- Título de la tarea -->
<div class="task-title-section">
        <h2 class="task-title">{{ subcategoryName }}</h2>
        <p class="series-number">Serie: {{ seriesNumber }}</p>
      </div>

      <!-- Hora de Inicio -->
      <div class="form-group">
        <label for="start-time" class="form-label">Hora de Inicio</label>
        <input
          type="text"
          id="start-time"
          v-model="startTime"
          class="form-input"
          readonly
        />
      </div>

      <!-- Cronómetro -->
      <div class="chronometer-section">
        <p class="chronometer-label">Tiempo Transcurrido</p>
        <div class="chronometer-display">
          <span>{{ formatTime(elapsedTime).hours }}</span>
          <span class="separator">:</span>
          <span>{{ formatTime(elapsedTime).minutes }}</span>
          <span class="separator">:</span>
          <span>{{ formatTime(elapsedTime).seconds }}</span>
        </div>
      </div>

      <!-- Controles del cronómetro -->
      <div class="chronometer-controls">
        <button 
          @click="startTimer" 
          :disabled="isRunning"
          class="control-button start-button"
          :class="{ 'disabled': isRunning }"
        >
          <span class="material-symbols-outlined">play_arrow</span>
          <span class="button-text">Iniciar</span>
        </button>
        <button 
          @click="pauseTimer" 
          :disabled="!isRunning"
          class="control-button pause-button"
          :class="{ 'disabled': !isRunning }"
        >
          <span class="material-symbols-outlined">pause</span>
          <span class="button-text">Pausar</span>
        </button>
        <button 
          @click="stopTimer"
          class="control-button stop-button"
        >
          <span class="material-symbols-outlined">replay</span>
          <span class="button-text">Reiniciar</span>
        </button>
      </div>

      <!-- Notas del Técnico -->
      <div class="form-group">
        <label for="notes" class="form-label">Notas del Técnico</label>
        <textarea
          id="notes"
          v-model="notes"
          class="form-textarea"
          placeholder="Añade notas sobre la tarea..."
          rows="5"
        ></textarea>
      </div>

      <!-- Botón Finalizar -->
      <div class="action-buttons">
        <button @click="finishTask" class="register-button" :disabled="isLoading">
          {{ isLoading ? 'Finalizando...' : 'Finalizar Tarea' }}
        </button>
      </div>

      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      <div v-if="errorMessage" class="floating-error-icon" :title="errorMessage">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#fff"/>
          <path d="M8 8L16 16M16 8L8 16" stroke="#d32f2f" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
    </main>
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { createTecnicoActivity } from '@/services/activityService';
import { getCurrentUser } from '@/services/authService';

const router = useRouter();
const route = useRoute();

const subcategoryName = ref(route.query.subcategoryName || 'Tarea Técnica');
const seriesNumber = ref('');
const startTime = ref('');
const elapsedTime = ref(0);
const isRunning = ref(false);
const notes = ref('');
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

let timerInterval = null;

// Formatear tiempo en HH:MM:SS
const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
};

// Iniciar cronómetro
const startTimer = () => {
  if (isRunning.value) return;

  // Registrar hora de inicio al presionar iniciar
  startTime.value = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  isRunning.value = true;
  timerInterval = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

// Pausar cronómetro
const pauseTimer = () => {
  if (!isRunning.value) return;
  
  isRunning.value = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// Reiniciar cronómetro (antes se llamaba detener)
const stopTimer = () => {
  // Detiene si está corriendo
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Reinicia valores
  elapsedTime.value = 0;
  isRunning.value = false;

  // Actualiza hora de inicio a la hora actual
  startTime.value = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Finalizar tarea
const finishTask = async () => {
  if (elapsedTime.value === 0) {
    errorMessage.value = 'Debes iniciar el cronómetro antes de finalizar la tarea.';
    return;
  }

  pauseTimer();
  isLoading.value = true;

  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado.');

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + elapsedTime.value * 1000);

    const activityData = {
      serie: seriesNumber.value,
      id_categoria: Number(route.query.categoryId),
      id_subcategoria: Number(route.query.subcategoryId),
      hora_inicio: startTime.value,
      hora_fin: endDate.toTimeString().split(' ')[0],
      observacion: notes.value,
      fecha_actividad: startDate.toISOString().split('T')[0],
      duracion_segundos: elapsedTime.value,
      user_id: user.id,
      estado_actividad_id: 3, // Completado
    };

    await createTecnicoActivity(activityData);

    localStorage.removeItem('tecnicoActividadSerie');
    successMessage.value = 'Tarea finalizada exitosamente!';
    setTimeout(() => {
      router.push('/');
    }, 1500);

  } catch (error) {
    errorMessage.value = 'Error al registrar la actividad.';
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  if (isRunning.value) {
    if (confirm('El cronómetro está en marcha. ¿Deseas salir de todas formas?')) {
      pauseTimer();
      router.go(-1);
    }
  } else {
    router.go(-1);
  }
};

// Limpiar intervalo al desmontar el componente
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

onMounted(() => {
  seriesNumber.value = localStorage.getItem('tecnicoActividadSerie') || 'N/A';
  // El cronómetro ya no inicia automáticamente, solo se muestra la hora actual
  startTime.value = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
});
</script>


<style scoped>
/* Main container and general structure */
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

.register-activity-technical-mockup {
  padding: 0;
}

/* Header */
.register-activity-technical-header {
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

.register-activity-technical-header .title {
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

/* Main content */
.register-activity-technical-content {
  flex-grow: 1;
  padding: 30px 30px;
  overflow-y: auto;
  min-height: 0;
  position: relative;
  padding-bottom: 90px;
}

/* Task Title Section */
.task-title-section {
  margin-bottom: 30px;
}

.task-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--accent-darkblue);
  margin: 0;
}

/* Form groups */
.form-group {
  margin-bottom: 25px;
  flex-shrink: 0;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #6B7280;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  background-color: #F0F2F5;
  outline: none;
  box-sizing: border-box;
  color: var(--accent-darkblue);
}

.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  background-color: #F0F2F5;
  outline: none;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  color: var(--accent-darkblue);
  transition: all 0.2s ease;
}

.form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 102, 246, 0.15);
  background-color: #fff;
}

/* Chronometer Section */
.chronometer-section {
  text-align: center;
  margin: 40px 0;
  padding: 30px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chronometer-label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 15px;
}

.chronometer-display {
  font-size: 64px;
  font-weight: 700;
  color: var(--accent-darkblue);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.chronometer-display .separator {
  color: var(--primary-color);
  margin: 0 4px;
}

/* Chronometer Controls */
.chronometer-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 30px;
}

.control-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 10px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.control-button .material-symbols-outlined {
  font-size: 28px;
}

.control-button.start-button {
  background-color: var(--primary-color);
  color: #fff;
}

.control-button.start-button:hover:not(.disabled) {
  background-color: var(--accent-darkblue);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 102, 246, 0.2);
}

.control-button.pause-button,
.control-button.stop-button {
  background-color: #F0F2F5;
  color: var(--accent-darkblue);
}

.control-button.pause-button:hover:not(.disabled),
.control-button.stop-button:hover {
  background-color: #E5E7EB;
  transform: translateY(-2px);
}

.control-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.button-text {
  font-size: 13px;
}

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  flex-shrink: 0;
}

.action-buttons button {
  width: 100%;
  max-width: 300px;
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
  flex-shrink: 0;
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

/* Material Symbols */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Media queries for responsiveness */
@media (max-width: 768px) {
  .phone-mockup {
    width: 100%;
    max-width: none;
    border-radius: 0;
    height: 100vh;
    margin: 0;
    box-shadow: none;
  }

  .register-activity-technical-header {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    padding: 20px 15px;
  }

  .register-activity-technical-header .title {
    font-size: 20px;
  }

  .register-activity-technical-content {
    padding: 20px 20px;
    padding-bottom: 90px;
  }

  .task-title {
    font-size: 24px;
  }

  .chronometer-display {
    font-size: 48px;
  }

  .chronometer-controls {
    gap: 10px;
  }

  .control-button {
    padding: 14px 8px;
  }

  .control-button .material-symbols-outlined {
    font-size: 24px;
  }

  .button-text {
    font-size: 12px;
  }

  .action-buttons button {
    padding: 14px;
    font-size: 16px;
    max-width: 100%;
  }
}
</style>
