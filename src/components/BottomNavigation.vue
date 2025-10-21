<template>
  <nav class="bottom-navigation">
    <button :class="{ 'nav-item': true, 'active': $route.name === 'dashboard' }" @click="goTo('dashboard')">
      <i class="fi fi-ss-house-blank"></i>
    </button>
    <button :class="{ 'nav-item': true, 'active': $route.name === 'calendar' }" @click="goTo('calendar')">
      <i class="fi fi-sr-calendar-clock"></i>
    </button>
    <button class="nav-item add-button" @click="goTo('register-activity')">
      <i class="fi fi-sr-plus"></i>
    </button>
    <button :class="{ 'nav-item': true, 'active': $route.name === 'notifications' }" @click="goTo('notifications')">
      <i class="fi fi-ss-bell-notification-social-media"></i>
    </button>
    <button :class="{ 'nav-item': true, 'active': $route.name === 'profile' }" @click="goTo('profile')">
      <i class="fi fi-ss-user"></i>
    </button>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { getCurrentUser, getCurrentUserData } from '@/services/authService';
import { isUserJefe } from '@/services/userService';

const router = useRouter();

const goTo = async (routeName) => {
  if (routeName === 'register-activity') {
    const user = await getCurrentUser();
    if (user) {
      const userData = await getCurrentUserData(user.id);
      
      if (userData && userData.rol_id === 3) {
        // Si es técnico, redirigir a la vista de registro de dispositivo
        router.push('/device-register');
      } else if (userData && [4, 5, 6, 7].includes(userData.rol_id)) {
        // Si es jefe, redirigir a la vista de asignación
        router.push('/assign-activity');
      } else {
        // Para otros roles, redirigir a la vista de registro de actividad general
        router.push('/register-activity');
      }
    } else {
      router.push('/login'); // Si no hay usuario, redirigir a login
    }
  } else {
    router.push({ name: routeName });
  }
};
</script>

<style scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 20px 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  opacity: 0.7;
  min-width: 60px;
  position: relative;
}

.nav-item:hover {
  opacity: 1;
}

.nav-item.active {
  opacity: 1;
}

.bottom-navigation .nav-item i {
  color: var(--primary-color) !important;
  font-size: 24px;
  transition: all 0.3s ease;
}

.nav-item.active i {
  transform: scale(1.1);
}

.add-button {
  background-color: var(--primary-color);
  color: #fff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 102, 246, 0.4);
  margin-top: -30px; /* Eleva el botón */
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 102, 246, 0.5);
}

.nav-item.add-button i {
  color: #fff !important; /* Asegura que el icono de añadir sea siempre blanco */
  font-size: 28px;
  margin: 0;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .bottom-navigation {
    position: fixed;
    bottom: 0;
    left: 0;
    transform: none;
    width: 100%;
    max-width: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    padding: 10px 15px 15px;
    box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.1);
  }

  .nav-item {
    padding: 6px 8px;
    min-width: 50px;
  }

.nav-item i {
    font-size: 22px;
  }

  .nav-item.active::before {
    width: 25px;
    height: 2px;
  }
}

/* Para pantallas muy pequeñas */
@media (max-width: 480px) {
  .nav-item i {
    font-size: 20px;
  }
}
</style>
