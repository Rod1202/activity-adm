<template>
  <div class="flex size-full flex-col min-h-screen bg-[var(--light-background)]">
    <header class="bg-[var(--white)] shadow-sm">
      <div class="flex items-center p-4">
        <button class="text-[var(--dark-text)]">
          <span class="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 class="text-xl font-bold text-[var(--dark-text)] flex-grow text-center">Registro de Equipo</h1>
        <div class="w-8"></div> 
      </div>
    </header>

    <main class="flex-grow p-6 flex flex-col justify-between">
      <div class="space-y-6">
        <div class="flex flex-col">
          <label class="mb-2 text-[var(--dark-text)] font-medium" for="equipment-series">Serie del Equipo</label>
          <input 
            class="w-full rounded-lg border border-[var(--border-light)] bg-[var(--white)] p-4 text-[var(--dark-text)] 
                   focus:border-[var(--primary-blue)] focus:ring-[var(--primary-blue)] 
                   transition duration-150 ease-in-out placeholder:text-[var(--placeholder-text)]" 
            id="equipment-series" 
            placeholder="Introduce la serie del equipo" 
            type="text"
            v-model="equipmentSeries"
          />
        </div>
        
        <div class="relative flex py-5 items-center">
          <div class="flex-grow border-t border-[var(--border-light)]"></div>
          <span class="flex-shrink mx-4 text-[var(--text-muted)]">O</span>
          <div class="flex-grow border-t border-[var(--border-light)]"></div>
        </div>
        
        <button 
          @click="toggleScanner"
          class="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[var(--primary-blue)] text-[var(--white)] font-bold rounded-lg shadow-md 
                 hover:bg-[var(--primary-blue-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 
                 focus:ring-[var(--primary-blue)] transition duration-150 ease-in-out"
        >
          <span class="material-symbols-outlined">qr_code_scanner</span>
          <span>Escanear QR</span>
        </button>
      </div>

      <div v-if="isScanning" class="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center">
        <h2 class="text-white text-xl mb-4">Apunta la cámara al código QR</h2>
        <qrcode-stream @decode="onDecode" @init="onInit" />
        <button @click="isScanning = false" class="mt-4 text-white text-lg">Cerrar</button>
      </div>
      
    </main>

    <div class="sticky bottom-0 left-0 right-0 p-4 bg-[var(--light-background)] border-t border-[var(--border-light)]">
      <button 
        @click="goToSelectCategory" 
        class="w-full rounded-lg bg-[var(--primary-blue)] py-3.5 text-base font-medium text-white shadow-md 
               hover:bg-[var(--primary-blue-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
               focus:ring-[var(--primary-blue)]"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importa el componente del escáner
import { QrcodeStream } from 'vue-qrcode-reader';

const router = useRouter();
const isScanning = ref(false);
const equipmentSeries = ref('');

// Función para activar/desactivar el escáner
const toggleScanner = () => {
  isScanning.value = !isScanning.value;
};

// Función que se ejecuta cuando se detecta un código QR
const onDecode = (result) => {
  if (result) {
    equipmentSeries.value = result;
    isScanning.value = false; // Cierra el escáner al escanear
  }
};

// Función para manejar el inicio del escáner (permisos de cámara)
const onInit = async (promise) => {
  try {
    await promise;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      alert('Necesitas dar permiso a la cámara para escanear.');
    } else if (error.name === 'NotFoundError') {
      alert('No se encontró una cámara en tu dispositivo.');
    } else {
      alert('Error al iniciar la cámara.');
    }
    isScanning.value = false;
  }
};

const goToSelectCategory = () => {
  router.push('/select-category');
};
</script>

<style>
/* Aquí puedes definir tus variables CSS para los colores */
:root {
  --primary-blue: #3B82F6; 
  --primary-blue-hover: #2563EB; 
  --dark-text: #1F2937; 
  --medium-gray: #4B5563; 
  --light-background: #F3F4F6; 
  --white: #FFFFFF; 
  --border-light: #D1D5DB; 
  --placeholder-text: #9CA3AF; 
  --text-muted: #6B7280; 
}

/* El resto de tus estilos globales */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>