<template>
  <div class="phone-mockup admin-reports-mockup">
    <header class="admin-reports-header">
      <h1 class="title">Reportes Admin</h1>
      <button class="back-button" @click="goBack">&lt;</button>
    </header>

    <main class="admin-reports-content">
      <div class="report-filters">
        <div class="filter-group">
          <label for="dateRange">Rango de fechas:</label>
          <div class="date-range-selector">
            <input type="date" id="startDate" v-model="startDate" class="date-input" />
            <span>a</span>
            <input type="date" id="endDate" v-model="endDate" class="date-input" />
          </div>
        </div>
        
        <div class="filter-group">
          <label for="userFilter">Usuario:</label>
          <select id="userFilter" v-model="selectedUser" class="filter-select">
            <option value="">Todos los usuarios</option>
            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.nombre_usuario }}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="clientFilter">Cliente:</label>
          <select id="clientFilter" v-model="selectedClient" class="filter-select">
            <option value="">Todos los clientes</option>
            <option v-for="client in clients" :key="client.cliente_id" :value="client.cliente_id">{{ client.nombre_cliente }}</option>
          </select>
        </div>
        
        <button class="generate-report-btn" @click="generateReport">Generar Reporte</button>
      </div>
      
      <div class="report-results" v-if="activities.length > 0">
        <div class="report-summary">
          <div class="summary-card">
            <h3>Total Actividades</h3>
            <p class="summary-value">{{ activities.length }}</p>
          </div>
          <div class="summary-card">
            <h3>Horas Totales</h3>
            <p class="summary-value">{{ totalHours }}</p>
          </div>
          <div class="summary-card">
            <h3>Completadas</h3>
            <p class="summary-value">{{ completedActivities.length }}</p>
          </div>
          <div class="summary-card">
            <h3>Pendientes</h3>
            <p class="summary-value">{{ pendingActivities.length }}</p>
          </div>
        </div>
        
        <div class="activities-table-container">
          <table class="activities-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Categoría</th>
                <th>Usuario</th>
                <th>Duración</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in activities" :key="activity.actividad_id">
                <td>{{ formatDate(activity.fecha_actividad) }}</td>
                <td>{{ activity.clientes?.nombre_cliente }}</td>
                <td>{{ activity.categoriasactividad?.nombre_categoria }}</td>
                <td>{{ getUserName(activity.user_id) }}</td>
                <td>{{ formatDuration(activity.duracion_segundos) }}</td>
                <td :class="getStatusClass(activity.estado_actividad_id)">{{ getStatusName(activity.estado_actividad_id) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="export-options">
          <button class="export-btn" @click="exportToCSV">Exportar a CSV</button>
        </div>
      </div>
      
      <div class="no-data-message" v-else-if="reportGenerated">
        <p>No se encontraron actividades con los filtros seleccionados.</p>
      </div>
      
      <div class="initial-message" v-else>
        <p>Selecciona los filtros y haz clic en "Generar Reporte" para ver los datos.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../services/supabaseClient';

const router = useRouter();

// Estado para filtros
const startDate = ref(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);
const selectedUser = ref('');
const selectedClient = ref('');

// Estado para datos
const users = ref([]);
const clients = ref([]);
const activities = ref([]);
const reportGenerated = ref(false);

// Datos calculados
const completedActivities = computed(() => {
  return activities.value.filter(activity => activity.estado_actividad_id === 3);
});

const pendingActivities = computed(() => {
  return activities.value.filter(activity => activity.estado_actividad_id === 1);
});

const totalHours = computed(() => {
  const totalSeconds = activities.value.reduce((total, activity) => {
    return total + (activity.duracion_segundos || 0);
  }, 0);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return `${hours}h ${minutes}m`;
});

// Métodos
const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre_usuario, rol_id')
      .order('nombre_usuario');
      
    if (error) throw error;
    users.value = data || [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
  }
};

const fetchClients = async () => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('cliente_id, nombre_cliente')
      .eq('estado_cliente', 'Activo')
      .order('nombre_cliente');
      
    if (error) throw error;
    clients.value = data || [];
  } catch (error) {
    console.error('Error al obtener clientes:', error);
  }
};

const generateReport = async () => {
  try {
    let query = supabase
      .from('actividades')
      .select(`
        actividad_id,
        cliente_id,
        categoria_id,
        fecha_actividad,
        hora_inicio,
        hora_fin,
        duracion_segundos,
        descripcion,
        user_id,
        estado_actividad_id,
        usuario_asignado_id,
        clientes(nombre_cliente),
        categoriasactividad(nombre_categoria)
      `)
      .gte('fecha_actividad', startDate.value)
      .lte('fecha_actividad', endDate.value);
    
    if (selectedUser.value) {
      query = query.eq('user_id', selectedUser.value);
    }
    
    if (selectedClient.value) {
      query = query.eq('cliente_id', selectedClient.value);
    }
    
    const { data, error } = await query.order('fecha_actividad', { ascending: false });
    
    if (error) throw error;
    activities.value = data || [];
    reportGenerated.value = true;
  } catch (error) {
    console.error('Error al generar reporte:', error);
  }
};

const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId);
  return user ? user.nombre_usuario : 'Usuario desconocido';
};

const getStatusName = (statusId) => {
  switch (statusId) {
    case 1: return 'Pendiente';
    case 3: return 'Completado';
    case 4: return 'Cancelado';
    default: return 'Desconocido';
  }
};

const getStatusClass = (statusId) => {
  switch (statusId) {
    case 1: return 'status-pending';
    case 3: return 'status-completed';
    case 4: return 'status-canceled';
    default: return '';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

const formatDuration = (seconds) => {
  if (!seconds) return '0h 0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const exportToCSV = () => {
  // Preparar los datos para CSV
  const csvData = activities.value.map(activity => ({
    Fecha: formatDate(activity.fecha_actividad),
    Cliente: activity.clientes?.nombre_cliente || '',
    Categoria: activity.categoriasactividad?.nombre_categoria || '',
    Usuario: getUserName(activity.user_id),
    Duracion: formatDuration(activity.duracion_segundos),
    Estado: getStatusName(activity.estado_actividad_id),
    Descripcion: activity.descripcion || ''
  }));
  
  // Convertir a CSV
  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n');
  
  // Crear y descargar el archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `reporte_actividades_${startDate.value}_${endDate.value}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const goBack = () => {
  router.push('/'); // Regresar al dashboard
};

onMounted(() => {
  fetchUsers();
  fetchClients();
});
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
  color: #fff;
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

.report-title {
  color: var(--accent-darkblue);
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
  color: var(--text-color-medium);
}

.report-filters {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.filter-group {
  margin-bottom: 15px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--accent-darkblue);
}

.date-range-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
}

.generate-report-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
  transition: background-color 0.2s;
}

.generate-report-btn:hover {
  background-color: var(--accent-darkblue);
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.summary-card h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: var(--text-color-medium);
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--accent-darkblue);
}

.activities-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.activities-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.activities-table th, .activities-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.activities-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: var(--accent-darkblue);
}

.activities-table tr:hover {
  background-color: #f8f9fa;
}

.status-pending {
  color: #ff9800;
  font-weight: 600;
}

.status-completed {
  color: #4caf50;
  font-weight: 600;
}

.status-canceled {
  color: #f44336;
  font-weight: 600;
}

.export-options {
  text-align: right;
}

.export-btn {
  background-color: var(--accent-darkblue);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background-color: var(--primary-color);
}

.no-data-message, .initial-message {
  text-align: center;
  padding: 30px;
  color: var(--text-color-light);
  font-size: 16px;
}
</style>