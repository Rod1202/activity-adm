<template>
  <div class="phone-mockup select-category-mockup">
    <header class="select-category-header">
      <button class="back-button" @click="goBack">
        <i class="fi fi-sr-undo"></i>
      </button>
      <h1 class="title">Selección de Categoría</h1>
    </header>

<main class="select-category-content">
      <div v-if="isLoading" class="loading-message">Cargando categorías...</div>
      <div v-else class="category-grid">
        <button
          v-for="category in categories"
          :key="category.id_categoria"
          @click="selectCategory(category.id_categoria)"
          class="category-card"
        >
          <div class="category-icon-container">
            <span class="material-symbols-outlined">engineering</span>
          </div>
          <h2 class="category-title">{{ category.nombre }}</h2>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { getAllCategories } from '@/services/categoryService';

const router = useRouter();
const categories = ref([]);
const isLoading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');

onMounted(async () => {
  try {
    categories.value = await getAllCategories();
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar las categorías.';
  } finally {
    isLoading.value = false;
  }
});

const selectCategory = (categoryId) => {
  router.push({
    name: 'select-subcategory',
    params: { categoryId: categoryId }
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

.select-category-mockup {
  padding: 0;
}

/* Header */
.select-category-header {
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

.select-category-header .title {
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
.select-category-content {
  flex-grow: 1;
  padding: 40px 30px;
  overflow-y: auto;
  min-height: 0;
  position: relative;
}

/* Category Grid */
.category-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 600px;
  margin: 0 auto;
}

/* Category Card */
.category-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-color);
}

.category-card:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Category Icon Container */
.category-icon-container {
  background-color: var(--primary-color);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.category-card:hover .category-icon-container {
  background-color: var(--accent-darkblue);
  transform: scale(1.05);
}

.category-icon-container .material-symbols-outlined {
  font-size: 50px;
  color: #fff;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
}

/* Category Title */
.category-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-darkblue);
  margin: 0;
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

  .select-category-header {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    padding: 20px 15px;
  }

  .select-category-header .title {
    font-size: 20px;
  }

  .select-category-content {
    padding: 20px 20px;
    padding-bottom: 90px;
  }

  .category-grid {
    gap: 20px;
  }

  .category-card {
    padding: 30px 20px;
  }

  .category-icon-container {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
  }

  .category-icon-container .material-symbols-outlined {
    font-size: 40px;
  }

  .category-title {
    font-size: 20px;
  }
}
</style>
