<template>
  <div class="phone-mockup notifications-view">
    <header class="notifications-header">
      <h1 class="header-title">Notificaciones</h1>
    </header>
    
    <main class="notifications-content">
      <div v-if="notifications.length === 0" class="empty-state">
        <i class="fi fi-rr-bell-slash"></i>
        <h3>No hay notificaciones</h3>
        <p>Cuando tengas nuevas notificaciones aparecerán aquí</p>
      </div>
      
      <div v-else class="notifications-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['notification-item', { 'unread': !notification.read }]"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-message">{{ notification.message }}</p>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>
          <div v-if="!notification.read" class="unread-indicator"></div>
        </div>
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BottomNavigation from '@/components/BottomNavigation.vue';

// Datos de ejemplo para las notificaciones
const notifications = ref([
  
  {
    id: 2,
    type: 'reminder',
    title: 'Recordatorio',
    message: 'No olvides completar tu reporte diario',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    read: true
  },
  {
    id: 3,
    type: 'system',
    title: 'Actualización del sistema',
    message: 'El sistema se actualizará esta noche a las 2:00 AM',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
    read: true
  }
]);

const getNotificationIcon = (type) => {
  const icons = {
    activity: 'fi fi-rr-calendar-check',
    reminder: 'fi fi-rr-bell',
    system: 'fi fi-rr-settings',
    default: 'fi fi-rr-info'
  };
  return icons[type] || icons.default;
};

const markAsRead = (notificationId) => {
  const notification = notifications.value.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

const formatTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `Hace ${minutes} minutos`;
  } else if (hours < 24) {
    return `Hace ${hours} horas`;
  } else {
    return `Hace ${days} días`;
  }
};
</script>

<style scoped>
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

.notifications-view {
    padding: 0;
}

.notifications-header {
    background-color: var(--primary-color);
    color: #fff;
    padding: 25px 30px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-top-left-radius: 30px;
    border-top-right-radius: 30px;
    flex-shrink: 0;
}

.header-title {
    font-size: 26px;
    font-weight: 700;
    margin: 0;
    color: #fff;
}

.notifications-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.empty-state {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
}

.empty-state i {
    font-size: 64px;
    color: var(--text-color-light);
    margin-bottom: 20px;
}

.empty-state h3 {
    font-size: 24px;
    color: var(--accent-darkblue);
    margin: 0 0 10px 0;
}

.empty-state p {
    color: var(--text-color-light);
    font-size: 16px;
    margin: 0;
}

.notifications-list {
    padding: 20px;
}

.notification-item {
    display: flex;
    align-items: flex-start;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 15px;
    margin-bottom: 15px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    position: relative;
}

.notification-item:hover {
    background: #e9ecef;
}

.notification-item.unread {
    background: #e3f2fd;
    border-left: 4px solid var(--primary-color);
}

.notification-icon {
    width: 40px;
    height: 40px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    flex-shrink: 0;
}

.notification-icon i {
    font-size: 18px;
    color: white;
}

.notification-content {
    flex-grow: 1;
}

.notification-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--accent-darkblue);
    margin: 0 0 5px 0;
}

.notification-message {
    font-size: 14px;
    color: var(--text-color-dark);
    margin: 0 0 8px 0;
    line-height: 1.4;
}

.notification-time {
    font-size: 12px;
    color: var(--text-color-light);
}

.unread-indicator {
    width: 8px;
    height: 8px;
    background: var(--primary-color);
    border-radius: 50%;
    position: absolute;
    top: 20px;
    right: 20px;
}

@media (max-width: 768px) {
    .phone-mockup {
        max-width: none;
        border-radius: 0;
        height: 100vh;
        box-shadow: none;
        margin: 0;
    }

    .notifications-header {
        padding: 20px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .header-title {
        font-size: 22px;
    }

    .notifications-list {
        padding: 15px;
    }

    .notification-item {
        padding: 15px;
    }
}
</style>
