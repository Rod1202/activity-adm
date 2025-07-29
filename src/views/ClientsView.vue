<template>
  <div class="phone-mockup clients-view">
    <header class="clients-header">
      <button class="back-button" @click="goBack">&lt;</button>
      <h1 class="title">Gestión de Clientes</h1>
    </header>

    <main class="clients-content">
      <!-- Formulario para agregar/editar cliente -->
      <div class="client-form-container">
        <h2 class="section-title">{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
        <form @submit.prevent="saveClient" class="client-form">
          <div class="form-group">
            <label for="clientName" class="form-label">Nombre del Cliente</label>
            <input 
              type="text" 
              id="clientName" 
              v-model="clientForm.nombre_cliente" 
              class="form-input" 
              required
              placeholder="Nombre del cliente"
            >
          </div>
          
          <div class="form-group">
            <label for="clientStatus" class="form-label">Estado</label>
            <select id="clientStatus" v-model="clientForm.estado_cliente" class="form-input">
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="resetForm">Cancelar</button>
            <button type="submit" class="save-btn" :disabled="isLoading">
              {{ isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de clientes -->
      <div class="clients-list-container">
        <div class="list-header">
          <h2 class="section-title">Mis Clientes</h2>
          <div class="filter-container">
            <select v-model="statusFilter" class="filter-select" @change="applyFilters">
              <option value="">Todos</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>
            <input 
              type="text" 
              v-model="searchQuery" 
              class="search-input" 
              placeholder="Buscar cliente..."
              @input="applyFilters"
            >
          </div>
        </div>
        
        <div v-if="isLoadingClients" class="loading-message">
          <p>Cargando clientes...</p>
        </div>
        
        <div v-else-if="filteredClients.length === 0" class="empty-message">
          <p>No se encontraron clientes.</p>
        </div>
        
        <ul v-else class="clients-list">
          <li v-for="client in filteredClients" :key="client.cliente_id" class="client-item">
            <div class="client-info">
              <h3 class="client-name">{{ client.nombre_cliente }}</h3>
              <span class="client-status" :class="getStatusClass(client.estado_cliente)">
                {{ client.estado_cliente }}
              </span>
            </div>
            <div class="client-actions">
              <button class="edit-btn" @click="editClient(client)">
                <i class="fi fi-rr-edit"></i>
              </button>
              <button class="delete-btn" @click="confirmDeleteClient(client)">
                <i class="fi fi-rr-trash"></i>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </main>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container">
        <h3 class="modal-title">Confirmar eliminación</h3>
        <p class="modal-message">¿Estás seguro de que deseas eliminar el cliente "{{ clientToDelete?.nombre_cliente }}"?</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancelar</button>
          <button class="delete-btn" @click="deleteClient" :disabled="isDeleting">
            {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getUserClients, createClient, updateClient, deleteClient as deleteClientService, clientHasActivities } from '../services/clientService';
import BottomNavigation from '../components/BottomNavigation.vue';

const router = useRouter();

// Estado para el formulario
const clientForm = ref({
  nombre_cliente: '',
  estado_cliente: 'Activo'
});

// Estado para la lista de clientes
const clients = ref([]);
const isLoadingClients = ref(true);
const isLoading = ref(false);
const isEditing = ref(false);
const currentClientId = ref(null);

// Estado para filtros y búsqueda
const statusFilter = ref('');
const searchQuery = ref('');

// Estado para modal de eliminación
const showDeleteModal = ref(false);
const clientToDelete = ref(null);
const isDeleting = ref(false);

// Clientes filtrados
const filteredClients = computed(() => {
  let result = [...clients.value];
  
  // Filtrar por estado
  if (statusFilter.value) {
    result = result.filter(client => client.estado_cliente === statusFilter.value);
  }
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(client => 
      client.nombre_cliente.toLowerCase().includes(query)
    );
  }
  
  return result;
});

// Métodos
const fetchClients = async () => {
  isLoadingClients.value = true;
  try {
    const filters = {};
    if (statusFilter.value) {
      filters.estado = statusFilter.value;
    }
    
    clients.value = await getUserClients(filters);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
  } finally {
    isLoadingClients.value = false;
  }
};

const saveClient = async () => {
  isLoading.value = true;
  try {
    if (isEditing.value) {
      // Actualizar cliente existente
      await updateClient(currentClientId.value, {
        nombre_cliente: clientForm.value.nombre_cliente,
        estado_cliente: clientForm.value.estado_cliente
      });
    } else {
      // Crear nuevo cliente
      await createClient({
        nombre_cliente: clientForm.value.nombre_cliente,
        estado_cliente: clientForm.value.estado_cliente
      });
    }
    
    // Recargar la lista y resetear el formulario
    await fetchClients();
    resetForm();
  } catch (error) {
    console.error('Error al guardar cliente:', error);
    alert(`Error: ${error.message || 'No se pudo guardar el cliente'}`); 
  } finally {
    isLoading.value = false;
  }
};

const editClient = (client) => {
  clientForm.value.nombre_cliente = client.nombre_cliente;
  clientForm.value.estado_cliente = client.estado_cliente;
  currentClientId.value = client.cliente_id;
  isEditing.value = true;
};

const confirmDeleteClient = (client) => {
  clientToDelete.value = client;
  showDeleteModal.value = true;
};

const deleteClient = async () => {
  if (!clientToDelete.value) return;
  
  isDeleting.value = true;
  try {
    // Usar el servicio para eliminar el cliente
    await deleteClientService(clientToDelete.value.cliente_id);
    
    // Recargar la lista
    await fetchClients();
    showDeleteModal.value = false;
    clientToDelete.value = null;
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    alert(`Error: ${error.message || 'No se pudo eliminar el cliente'}`);
  } finally {
    isDeleting.value = false;
  }
};

const resetForm = () => {
  clientForm.value = {
    nombre_cliente: '',
    estado_cliente: 'Activo'
  };
  currentClientId.value = null;
  isEditing.value = false;
};

const applyFilters = () => {
  // Esta función se llama cuando cambian los filtros
  // No necesita hacer nada porque usamos computed properties
};

const getStatusClass = (status) => {
  return status === 'Activo' ? 'status-active' : 'status-inactive';
};

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  fetchClients();
});
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

.clients-view {
  padding: 0;
}

.clients-header {
  background-color: var(--primary-color);
  color: #fff;
  padding: 25px 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  position: relative;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
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

.clients-content {
  flex-grow: 1;
  padding: 20px 30px 100px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--accent-darkblue);
  margin: 0 0 15px 0;
}

/* Estilos del formulario */
.client-form-container {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.client-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-medium);
}

.form-input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}

.save-btn {
  background-color: var(--primary-color);
  color: white;
}

.save-btn:hover {
  background-color: var(--accent-darkblue);
}

.cancel-btn {
  background-color: #e9ecef;
  color: var(--text-color-medium);
}

.cancel-btn:hover {
  background-color: #dee2e6;
}

/* Estilos de la lista */
.clients-list-container {
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-select, .search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.clients-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.client-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.client-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.client-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color-dark);
}

.client-status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
  display: inline-block;
  width: fit-content;
}

.status-active {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.status-inactive {
  background-color: rgba(158, 158, 158, 0.1);
  color: #9e9e9e;
}

.client-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.edit-btn {
  color: var(--primary-color);
}

.delete-btn {
  color: #f44336;
}

.edit-btn:hover, .delete-btn:hover {
  background-color: rgba(0,0,0,0.05);
}

/* Estilos para mensajes */
.loading-message, .empty-message {
  text-align: center;
  padding: 20px;
  color: var(--text-color-light);
}

/* Estilos para el modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  padding: 25px;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: var(--accent-darkblue);
}

.modal-message {
  margin-bottom: 20px;
  color: var(--text-color-medium);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .phone-mockup {
    max-width: none;
    border-radius: 0;
    height: 100vh;
    box-shadow: none;
    margin: 0;
  }

  .clients-header {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .clients-content {
    padding: 15px 15px 100px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-container {
    width: 100%;
  }

  .filter-select, .search-input {
    flex: 1;
  }
}
</style>