<template>
  <div class="phone-mockup select-subcategory-mockup">
    <header class="select-subcategory-header">
      <button class="back-button" @click="goBack">
        <i class="fi fi-sr-undo"></i>
      </button>
      <h1 class="title">Seleccionar Actividad</h1>
    </header>

    <main class="select-subcategory-content">
      <!-- Barra de búsqueda -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <i class="fi fi-rr-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery"
            class="search-input" 
            placeholder="Buscar actividad"
          />
        </div>
      </div>

      <!-- Lista de actividades -->
<div class="activity-list">
        <div v-if="isLoading" class="loading-message">Cargando...</div>
        <button 
          v-for="subcategory in filteredSubcategories" 
          :key="subcategory.id_subcategoria"
          @click="selectSubcategory(subcategory)"
          class="activity-item"
        >
          <div class="activity-icon-container">
            <span class="material-symbols-outlined">build</span>
          </div>
          <p class="activity-name">{{ subcategory.nombre }}</p>
          <span class="material-symbols-outlined chevron-icon">chevron_right</span>
        </button>

        <div v-if="!isLoading && filteredSubcategories.length === 0" class="no-results">
          No se encontraron subcategorías.
        </div>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { getSubcategoriesByCategoryId } from '@/services/categoryService';

const props = defineProps({
  categoryId: {
    type: [String, Number],
    required: true,
  },
});

const router = useRouter();
const route = useRoute();
const searchQuery = ref('');
const subcategories = ref([]);
const isLoading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');

onMounted(async () => {
  try {
    const categoryId = route.params.categoryId;
    const categoryIdNumber = Number(categoryId);
    if (isNaN(categoryIdNumber)) {
      throw new Error('El ID de la categoría no es válido.');
    }
    subcategories.value = await getSubcategoriesByCategoryId(categoryIdNumber);
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar las subcategorías.';
  } finally {
    isLoading.value = false;
  }
});

const filteredSubcategories = computed(() => {
  if (!searchQuery.value) {
    return subcategories.value;
  }
  return subcategories.value.filter(sub =>
    sub.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectSubcategory = (subcategory) => {
  router.push({
    name: 'register-activity-tecnical',
    query: { 
      categoryId: route.params.categoryId,
      subcategoryId: subcategory.id_subcategoria,
      subcategoryName: subcategory.nombre 
    }
  });
};

const goBack = () => {
  router.go(-1);
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

.select-subcategory-mockup {
  padding: 0;
}

/* Header */
.select-subcategory-header {
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

.select-subcategory-header .title {
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
.select-subcategory-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: 0;
  position: relative;
}

/* Search Container */
.search-container {
  padding: 20px 30px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 15px;
  background-color: #F9FAFB;
  transition: all 0.2s ease;
  outline: none;
}

.search-input:focus {
  border-color: var(--primary-color);
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(0, 102, 246, 0.1);
}

/* Activity List */
.activity-list {
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: 90px;
}

/* Activity Item */
.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 30px;
  background: #fff;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background-color: #F9FAFB;
}

.activity-item:active {
  background-color: #F3F4F6;
}

/* Activity Icon Container */
.activity-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.activity-item:hover .activity-icon-container {
  background-color: #E5E7EB;
}

.activity-icon-container .material-symbols-outlined {
  font-size: 24px;
  color: #6B7280;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Activity Name */
.activity-name {
  flex-grow: 1;
  font-size: 16px;
  font-weight: 500;
  color: var(--accent-darkblue);
  margin: 0;
}

/* Chevron Icon */
.chevron-icon {
  font-size: 20px;
  color: #9CA3AF;
  flex-shrink: 0;
}

/* No Results */
.no-results {
  padding: 40px 30px;
  text-align: center;
  color: #9CA3AF;
  font-size: 15px;
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

  .select-subcategory-header {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    padding: 20px 15px;
  }

  .select-subcategory-header .title {
    font-size: 20px;
  }

  .search-container {
    padding: 15px 20px;
  }

  .search-input {
    padding: 12px 14px 12px 44px;
    font-size: 14px;
  }

  .activity-item {
    padding: 14px 20px;
  }

  .activity-icon-container {
    width: 44px;
    height: 44px;
  }

  .activity-icon-container .material-symbols-outlined {
    font-size: 22px;
  }

  .activity-name {
    font-size: 15px;
  }
}
</style>
