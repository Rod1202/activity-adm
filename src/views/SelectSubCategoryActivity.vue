<template>
  <div class="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root">
    <div class="flex flex-col">
<header class="flex items-center justify-between p-4 pb-2 bg-white sticky top-0 z-10 border-b border-gray-200">
        <button @click="goBack" class="flex items-center justify-center p-2 text-gray-800">
          <span class="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div class="flex-1 flex justify-center">
          <div class="flex items-center space-x-1 rounded-full bg-gray-100 p-1">
            </div>
        </div>
        <div class="w-10"></div>
      </header>
      <div class="px-4 py-3">
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="material-symbols-outlined text-gray-500">search</span>
          </div>
          <input class="block w-full rounded-full border-0 bg-gray-100 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-500)] sm:text-sm sm:leading-6" placeholder="Buscar actividad" type="text"/>
        </div>
      </div>
      <div class="flex flex-col pb-20">
        <a @click="goToRegisterActivityTecnical" class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
          <div class="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <span class="material-symbols-outlined">engineering</span>
          </div>
          <p class="flex-1 truncate text-base font-medium text-gray-800">Despiece de Impresora</p>
          <span class="material-symbols-outlined text-gray-400">chevron_right</span>
        </a>
        <a @click="goToRegisterActivityTecnical" class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-t border-gray-100">
          <div class="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <span class="material-symbols-outlined">oil_barrel</span>
          </div>
          <p class="flex-1 truncate text-base font-medium text-gray-800">Limpieza de ADF</p>
          <span class="material-symbols-outlined text-gray-400">chevron_right</span>
        </a>
        <a @click="goToRegisterActivityTecnical" class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-t border-gray-100">
          <div class="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <span class="material-symbols-outlined">tire_repair</span>
          </div>
          <p class="flex-1 truncate text-base font-medium text-gray-800">Limpieza de Laser</p>
          <span class="material-symbols-outlined text-gray-400">chevron_right</span>
        </a>
        <a @click="goToRegisterActivityTecnical" class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-t border-gray-100">
          <div class="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <span class="material-symbols-outlined">tire_repair</span>
          </div>
          <p class="flex-1 truncate text-base font-medium text-gray-800">Limpieza de Tapas</p>
          <span class="material-symbols-outlined text-gray-400">chevron_right</span>
        </a>
        <a @click="goToRegisterActivityTecnical" class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-t border-gray-100">
          <div class="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <span class="material-symbols-outlined">battery_charging_full</span>
          </div>
          <p class="flex-1 truncate text-base font-medium text-gray-800">Revision de placas</p>
          <span class="material-symbols-outlined text-gray-400">chevron_right</span>
        </a>
        <a @click="goToRegisterActivityTecnical" class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-t border-gray-100">
          <div class="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <span class="material-symbols-outlined">ac_unit</span>
          </div>
          <p class="flex-1 truncate text-base font-medium text-gray-800">Actualización de Software</p>
          <span class="material-symbols-outlined text-gray-400">chevron_right</span>
        </a>
        <a @click="goToRegisterActivityTecnical" class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-t border-gray-100">
          <div class="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <span class="material-symbols-outlined">light</span>
          </div>
          <p class="flex-1 truncate text-base font-medium text-gray-800">Pruebas de estres</p>
          <span class="material-symbols-outlined text-gray-400">chevron_right</span>
        </a>
        <a @click="goToRegisterActivityTecnical" class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-t border-gray-100">
          <div class="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <span class="material-symbols-outlined">water_drop</span>
          </div>
          <p class="flex-1 truncate text-base font-medium text-gray-800">Embalaje de impresora</p>
          <span class="material-symbols-outlined text-gray-400">chevron_right</span>
        </a>
      </div>
    </div>
    <div class="fixed bottom-0 left-0 right-0">
      <div class="flex justify-around border-t border-gray-200 bg-white pb-2 pt-1">
        <a  class="flex flex-1 flex-col items-center justify-end gap-1 rounded-full py-2 text-[var(--primary-600)]" href="#">
          <span class="material-symbols-outlined">home</span>
          <p class="text-xs font-medium tracking-wide">Inicio</p>
        </a>
        <a class="flex flex-1 flex-col items-center justify-end gap-1 py-2 text-gray-500" href="#">
          <span class="material-symbols-outlined">history</span>
          <p class="text-xs font-medium tracking-wide">Historial</p>
        </a>
        <a class="flex flex-1 flex-col items-center justify-end gap-1 py-2 text-gray-500" href="#">
          <span class="material-symbols-outlined">bar_chart</span>
          <p class="text-xs font-medium tracking-wide">Reportes</p>
        </a>
        <a class="flex flex-1 flex-col items-center justify-end gap-1 py-2 text-gray-500" href="#">
          <span class="material-symbols-outlined">settings</span>
          <p class="text-xs font-medium tracking-wide">Ajustes</p>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToRegisterActivityTecnical = () => {
  router.push('/register-activity-tecnical');
};

const goBack = () => {
  router.go(-1);
};
</script>

<style>
:root {
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
}
body {
  min-height: max(884px, 100dvh);
  font-family: Inter, "Noto Sans", sans-serif;
}
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
