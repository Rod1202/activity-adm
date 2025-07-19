<template>
  <div class="phone-mockup">
    <div class="login-header">
      <h1 class="login-title">Login</h1>
    </div>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email" class="form-label">correo electrónico</label>
        <input type="email" id="email" v-model="email" class="form-input" placeholder="tu@correo.com" required>
      </div>

      <div class="form-group">
        <label for="password" class="form-label">contraseña</label>
        <input type="password" id="password" v-model="password" class="form-input" placeholder="tu contraseña" required>
      </div>

      <button type="submit" class="login-button" :disabled="isLoading">
        {{ isLoading ? 'Iniciando...' : 'Iniciar sesión' }}
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>
    </form>

    <div class="forgot-password-link">
      <a href="#" @click.prevent="showForgotPasswordAlert">¿Olvidaste la contraseña?</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword } from '@/services/authService';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref(null);
const router = useRouter();

const handleLogin = async () => {
  isLoading.value = true;
  error.value = null; // Limpiar errores anteriores
  try {
    await signInWithEmailAndPassword(email.value, password.value);
    // Si el login es exitoso, el guardia de navegación en router/index.js redirigirá
    // automáticamente al dashboard (ruta '/').
  } catch (err) {
    console.error('Error al iniciar sesión:', err.message);
    error.value = err.message || 'Error desconocido al iniciar sesión.';
  } finally {
    isLoading.value = false;
  }
};

const showForgotPasswordAlert = () => {
  alert('Esta funcionalidad aún no está implementada. Por favor, contacta al administrador.');
};
</script>

<style scoped>
/* Estilos específicos para LoginView, puedes moverlos a un archivo CSS separado si prefieres */
.phone-mockup {
    width: 100%;
    max-width: 400px;
    background: #fff;
    border-radius: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    padding: 40px 30px;
    display: flex;
    flex-direction: column;
    gap: 25px;
    min-height: 600px;
    justify-content: center;
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-color-dark);
}

.login-button {
    width: 100%;
    padding: 16px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 10px;
}

.login-button:hover:not(:disabled) {
    background-color: #3a458f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.login-button:disabled {
  background-color: #a0a8d3;
  cursor: not-allowed;
}

.forgot-password-link {
    text-align: center;
    margin-top: 25px;
}

.forgot-password-link a {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    transition: color 0.2s ease;
}

.forgot-password-link a:hover {
    color: #3a458f;
    text-decoration: underline;
}

@media (max-width: 420px) {
    .phone-mockup {
        padding: 30px 20px;
        border-radius: 20px;
        min-height: 500px;
    }
    .login-title {
        font-size: 28px;
    }
    .form-input {
        padding: 12px 15px;
        font-size: 15px;
    }
    .login-button {
        padding: 14px;
        font-size: 16px;
    }
    .forgot-password-link {
        margin-top: 20px;
    }
}
</style>