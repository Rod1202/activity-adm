<template>
  <div class="phone-mockup admin-reports-mockup">
    <header class="admin-reports-header">
      <h1 class="title">Reportes Admin</h1>
      <button class="back-button" @click="goBack">&lt;</button>
    </header>

    <main class="admin-reports-content">
      <p>Contenido de la vista de reportes de administrador.</p>
      <p>Aquí se generarán y mostrarán los informes.</p>
      </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.push('/'); // Regresar al dashboard
};
</script>

<style scoped>
/* Estilos básicos para la vista de reportes */
.phone-mockup {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  min-height: 700px;
  overflow: hidden;
  position: relative;
}

.admin-reports-mockup {
  padding: 0;
}

.admin-reports-header {
  background-color: var(--primary-color);
  color: white;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  position: relative;
}

.admin-reports-header .title {
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
  color: white;
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
  background-color: rgba(255, 255, 255, 0.1);
}

.admin-reports-content {
  flex-grow: 1;
  padding: 20px 30px;
  overflow-y: auto;
  text-align: center;
  color: var(--text-color-medium);
}
</style>