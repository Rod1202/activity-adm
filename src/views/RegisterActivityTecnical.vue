<template>
  <div class="flex size-full flex-col h-screen justify-between">
<header class="flex items-center justify-between px-4 py-3 bg-[var(--background-color)] shadow-md">
<button @click="goBack" class="p-2 rounded-full hover:bg-gray-100">
<span class="material-symbols-outlined text-[var(--text-primary)]">arrow_back_ios_new</span>
</button>
<h1 class="text-xl font-medium text-[var(--text-primary)]">Detalle de Tarea</h1>
      <div class="w-10"></div>
    </header>
    <main class="flex-1 overflow-y-auto px-6 py-8">
      <h2 class="text-2xl font-medium text-[var(--text-primary)]">Limpieza de Compresor</h2>
      <div class="mt-8">
        <label class="block text-sm font-medium text-[var(--text-secondary)]" for="assigned-time">Tiempo Asignado</label>
        <div class="mt-2 relative">
          
          <input class="form-input w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 bg-[var(--secondary-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" id="assigned-time" readonly="" type="text" value="00:00:00"/>
        </div>
      </div>
      <div class="mt-10 text-center">
        <p class="text-sm font-medium text-[var(--text-secondary)]">Tiempo Transcurrido</p>
        <div class="text-6xl font-bold text-[var(--text-primary)] tracking-tight mt-2">
          <span>00</span><span class="text-[var(--primary-color)]">:</span><span>00</span><span class="text-[var(--primary-color)]">:</span><span>00</span>
        </div>
      </div>
      <div class="mt-8 grid grid-cols-3 gap-4">
        <button class="flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg bg-[var(--primary-color)] text-white shadow-sm hover:bg-blue-700 transition-colors">
          <span class="material-symbols-outlined">play_arrow</span>
          <span class="text-sm font-medium">Iniciar</span>
        </button>
        <button class="flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg bg-[var(--secondary-color)] text-[var(--text-primary)] hover:bg-gray-200 transition-colors">
          <span class="material-symbols-outlined">pause</span>
          <span class="text-sm font-medium">Pausar</span>
        </button>
        <button class="flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg bg-[var(--secondary-color)] text-[var(--text-primary)] hover:bg-gray-200 transition-colors">
          <span class="material-symbols-outlined">stop</span>
          <span class="text-sm font-medium">Detener</span>
        </button>
      </div>
      <div class="mt-10">
        <label class="block text-sm font-medium text-[var(--text-secondary)]" for="notes">Notas del Técnico</label>
        <textarea class="form-textarea mt-2 block w-full h-32 rounded-lg border-gray-300 bg-[var(--secondary-color)] p-4 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" id="notes" placeholder="Añade notas sobre la tarea..."></textarea>
      </div>
    </main>
    <footer class="bg-[var(--background-color)] px-6 py-4 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
      <button class="w-full rounded-full bg-[var(--primary-color)] py-3.5 text-base font-medium text-white shadow-md hover:bg-blue-700 transition-colors">Finalizar Tarea</button>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};
</script>

<style>
:root {
  --primary-color: #0052FF;
  --secondary-color: #F0F2F5;
  --text-primary: #1F1F1F;
  --text-secondary: #6B7280;
  --background-color: #FFFFFF;
}
body {
  min-height: max(884px, 100dvh);
  font-family: 'Roboto', sans-serif;
}
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
