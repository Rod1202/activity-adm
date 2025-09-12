<template>
  <div class="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden">
    <div class="flex flex-col flex-1">
<header class="flex items-center bg-white p-4 shadow-sm sticky top-0 z-10">
        <button @click="goBack" class="text-[var(--text-primary)]">
          <span class="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 class="text-[var(--text-primary)] text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-6">Selección de Categoría</h1>
      </header>
      <main class="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <button @click="goToSelectSubCategory" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors duration-200">
          <div class="bg-[var(--primary-color)] p-5 rounded-full mb-5">
            <span class="material-symbols-outlined text-white text-5xl">build</span>
          </div>
          <h2 class="text-[var(--text-primary)] text-2xl font-bold leading-tight">Mantenimiento</h2>
        </button>
        <button @click="goToSelectSubCategory" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors duration-200">
          <div class="bg-[var(--primary-color)] p-5 rounded-full mb-5">
            <span class="material-symbols-outlined text-white text-5xl">construction</span>
          </div>
          <h2 class="text-[var(--text-primary)] text-2xl font-bold leading-tight">Reparación</h2>
        </button>
        <button @click="goToSelectSubCategory" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors duration-200">
          <div class="bg-[var(--primary-color)] p-5 rounded-full mb-5">
            <span class="material-symbols-outlined text-white text-5xl">school</span>
          </div>
          <h2 class="text-[var(--text-primary)] text-2xl font-bold leading-tight">Inducción</h2>
        </button>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToSelectSubCategory = () => {
  router.push('/select-subcategory');
};

const goBack = () => {
  router.go(-1);
};
</script>
