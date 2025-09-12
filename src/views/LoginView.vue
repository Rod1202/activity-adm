<template>
  <div class="login-container">
    <div class="login-card single-card">
      <img src="@/assets/logo.png" alt="Logo de la empresa" class="login-logo" />
      <div class="login-form-center-group">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" v-model="email" class="form-input" placeholder="Email" required>
          </div>
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input type="password" id="password" v-model="password" class="form-input" placeholder="Contraseña" required>
            <div class="forgot-link-row left-align">
              <a class="forgot-link" href="https://wa.me/+51908809073" target="_blank">¿Olvidaste la contraseña?</a>
            </div>
          </div>
          <button type="submit" class="login-button" :disabled="isLoading">
            {{ isLoading ? 'Iniciando...' : 'Iniciar sesión' }}
          </button>
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </div>
      <div class="login-footer">
        Power by Rodrigo Carbonel®
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword, getCurrentUserData } from '@/services/authService';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref(null);
const router = useRouter();

const handleLogin = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Autentica al usuario
    await signInWithEmailAndPassword(email.value, password.value);

    // Obtiene los datos del perfil para verificar el rol
    const userData = await getCurrentUserData();

    // Redirige al usuario según su rol
    if (userData && userData.rol_id === 3) {
      router.push('/device-register');
    } else {
      router.push('/');
    }
  } catch (err) {
    console.error('Error al iniciar sesión:', err.message);
    error.value = err.message || 'Error desconocido al iniciar sesión.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f7f7;
  margin: 0;
  padding: 0;
}

.login-card.single-card {
  width: 520px;
  height: 800px;
  max-width: 98vw;
  background: #fff;
  border-radius: 60px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 40px;
  margin: 0;
  position: relative;
  justify-content: flex-start;
}

.login-logo {
  max-width: 220px;
  width: 60%;
  height: auto;
  opacity: 0.98;
  object-fit: contain;
  margin: 130px auto 24px auto;
  display: block;
}

.login-form-center-group {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.form-group {
  margin-bottom: 18px;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--accent-darkblue);
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 2px solid #000;
  border-radius: 10px;
  font-size: 1.1rem;
  background: #fff;
  transition: border 0.2s;
  color: var(--accent-darkblue);
  margin: 0;
}
.form-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.forgot-link-row.left-align {
  display: flex;
  justify-content: flex-start;
  margin-top: 6px;
}
.forgot-link {
  font-size: 0.98em;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  white-space: nowrap;
}
.forgot-link:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 13px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.login-button:hover:not(:disabled) {
  background: var(--accent-darkblue);
}
.login-button:disabled {
  background: #bbb;
  cursor: not-allowed;
}

.error-message {
  color: var(--error-color);
  text-align: center;
  margin-top: 18px;
  font-size: 1em;
  font-weight: 500;
}

.login-footer {
  width: 100%;
  text-align: center;
  font-size: 0.95em;
  color: var(--accent-darkblue);
  opacity: 0.7;
  position: absolute;
  bottom: 18px;
  left: 0;
}

@media (max-width: 700px) {
  .login-card.single-card {
    width: 100vw;
    height: 100vh;
    min-height: 100vh;
    border-radius: 0;
    padding: 0 5vw;
    box-shadow: none;
    justify-content: flex-start;
  }
  .login-logo {
    max-width: 250px;
    width: 140vw;
    margin: 120px auto 18px auto;
  }
  .login-form-center-group {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    min-height: 0;
    height: calc(100vh - 180px); /* Ajusta según el tamaño del logo y footer */
  }
  .login-footer {
    font-size: 0.85em;
    bottom: 12px;
    left: 0;
    right: 0;
    position: absolute;
  }
}
</style>