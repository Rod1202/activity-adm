<template>
  <div class="phone-mockup equipment-registration-mockup">
    <header class="equipment-registration-header">
      <button class="back-button" @click="goBack">
        <i class="fi fi-sr-undo"></i>
      </button>
      <h1 class="title">Registro de Equipo</h1>
    </header>

    <main class="equipment-registration-content">
      <form @submit.prevent="handleSubmit" autocomplete="off">
        <!-- Campo para Serie del Equipo -->
        <div class="form-group">
          <label for="equipment-series" class="form-label">Serie del Equipo</label>
          <input
            type="text"
            id="equipment-series"
            v-model="equipmentSeries"
            class="form-input"
            placeholder="Introduce la serie del equipo"
            autocomplete="off"
          />
        </div>

        <!-- Botón de Acción -->
        <div class="action-buttons">
          <button type="submit" class="register-button" :disabled="isLoading">
            {{ isLoading ? 'Procesando...' : 'Siguiente' }}
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BottomNavigation from '@/components/BottomNavigation.vue';

const router = useRouter();
const equipmentSeries = ref('');
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handleSubmit = () => {
  if (!equipmentSeries.value) {
    errorMessage.value = 'Por favor, introduce la serie del equipo.';
    return;
  }
  
  isLoading.value = true;
  
  // Guardar la serie en localStorage
  localStorage.setItem('tecnicoActividadSerie', equipmentSeries.value);

  // Simular un pequeño retraso y luego navegar
  setTimeout(() => {
    router.push('/select-category');
  }, 500);
};

const goBack = () => {
  router.push('/');
};
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

.equipment-registration-mockup {
  padding: 0;
}

/* Header */
.equipment-registration-header {
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

.equipment-registration-header .title {
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
.equipment-registration-content {
  flex-grow: 1;
  padding: 40px 30px;
  overflow-y: auto;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Form groups */
.form-group {
  margin-bottom: 30px;
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

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 20px;
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

/* Material Symbols - removed as no longer needed */

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

  .equipment-registration-header {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .equipment-registration-content {
    padding: 20px 20px;
    padding-bottom: 90px;
  }

  .form-input {
    padding: 10px 12px;
    font-size: 15px;
  }

  .action-buttons button {
    padding: 14px;
    font-size: 16px;
    max-width: 100%;
  }
}
</style>
