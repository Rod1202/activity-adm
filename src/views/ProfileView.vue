<template>
  <div class="phone-mockup profile-view">
    <header class="profile-header">
      <h1 class="header-title">Mi Perfil</h1>
    </header>
    
    <main class="profile-content">
      <div class="profile-card">
        <div class="profile-avatar">
          <i class="fi fi-rr-user-alien"></i>
        </div>
        <h2 class="profile-name">{{ userData?.nombre_usuario || 'Usuario' }}</h2>
        <p class="profile-email">{{ userEmail || 'usuario@ejemplo.com' }}</p>
        <p class="profile-role">{{ userRoleName || 'Sin rol asignado' }}</p>
        <p class="profile-phone" v-if="userData?.telefono">{{ userData.telefono }}</p>
      </div>
      
      <div class="profile-options">

        <div class="option-item logout" @click="handleLogout">
          <i class="fi fi-rr-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
          <i class="fi fi-rr-angle-right"></i>
        </div>
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { signOut, getCurrentUserData } from '../services/authService';
import BottomNavigation from '../components/BottomNavigation.vue';
import { supabase } from '../services/supabaseClient';

const userData = ref(null);
const userEmail = ref('');
const userRoleName = ref('');

const router = useRouter();

const fetchUserData = async () => {
  try {
    // Obtener la sesión actual
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    // Guardar el email del usuario
    userEmail.value = session.user.email;
    
    // Obtener datos del usuario y su rol
    // CAMBIO CLAVE AQUÍ: Usa un nombre de variable diferente (e.g., fetchedUserData)
    const fetchedUserData = await getCurrentUserData();
    if (fetchedUserData) {
      // Asignar datos del usuario a la variable reactiva userData
      userData.value = fetchedUserData; // <--- Asignación correcta
      
      // Obtener el nombre del rol
      const { data: rolData } = await supabase
        .from('roles')
        .select('nombre_rol')
        .eq('id', fetchedUserData.rol_id) // Usa fetchedUserData aquí también
        .single();
      
      if (rolData) {
        userRoleName.value = rolData.nombre_rol;
      }
    }
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
  }
};

onMounted(() => {
  fetchUserData();
});

const handleLogout = async () => {
  try {
    await signOut();
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
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

.profile-view {
    padding: 0;
}

.profile-header {
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

.profile-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 30px 30px 100px;
    overflow-y: auto;
}

.profile-card {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 15px;
}

.profile-avatar {
    width: 80px;
    height: 80px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
}

.profile-avatar i {
    font-size: 40px;
    color: white;
}

.profile-name {
    font-size: 24px;
    font-weight: 700;
    color: var(--accent-darkblue);
    margin: 0 0 5px 0;
}

.profile-email {
    color: var(--text-color-light);
    font-size: 16px;
    margin: 0 0 5px 0;
}

.profile-role {
    color: var(--primary-color);
    font-size: 16px;
    font-weight: 600;
    margin: 5px 0;
    padding: 3px 10px;
    background-color: rgba(var(--primary-color-rgb), 0.1);
    border-radius: 12px;
    display: inline-block;
}

.profile-phone {
    color: var(--text-color-light);
    font-size: 14px;
    margin: 5px 0 0 0;
}

.profile-options {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.option-item {
    display: flex;
    align-items: center;
    padding: 18px 20px;
    background: #f8f9fa;
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-bottom: 8px;
}

.option-item:hover {
    background: #e9ecef;
}

.option-item.logout {
    color: #dc3545;
}

.option-item.logout:hover {
    background: #f8d7da;
}

.option-item i:first-child {
    font-size: 20px;
    margin-right: 15px;
    width: 24px;
    text-align: center;
}

.option-item span {
    flex-grow: 1;
    font-size: 16px;
    font-weight: 500;
}

.option-item i:last-child {
    font-size: 16px;
    color: var(--text-color-light);
}

@media (max-width: 768px) {
    .phone-mockup {
        max-width: none;
        border-radius: 0;
        height: 100vh;
        box-shadow: none;
        margin: 0;
    }

    .profile-header {
        padding: 20px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .header-title {
        font-size: 22px;
    }

    .profile-content {
        padding: 20px;
    }
}
</style>
