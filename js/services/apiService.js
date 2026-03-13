// API Service - Conexión con backend MongoDB Atlas
class ApiService {
    constructor() {
        // Configurar URL base del API
        this.baseURL = this.getBaseURL();
        this.isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    getBaseURL() {
        // En desarrollo usar localhost, en producción usar la URL del backend
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        } else {
            // En producción, la URL del backend de Render
            return 'https://plataforma-gestion-lechera.onrender.com/api';
        }
    }

    // Método genérico para hacer peticiones HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            console.log(`🌐 ${config.method || 'GET'} ${url}`);
            
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`✅ Respuesta de ${url}:`, data);
            return data;
        } catch (error) {
            console.error(`❌ Error en ${url}:`, error);
            throw error;
        }
    }

    // Métodos HTTP convenience
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ===== MÉTODOS DE FUNDOS =====
    async getFundos() {
        return this.get('/fundos');
    }

    async getFundoById(id) {
        return this.get(`/fundos/${id}`);
    }

    async createFundo(fundo) {
        return this.post('/fundos', fundo);
    }

    async updateFundo(id, fundo) {
        return this.put(`/fundos/${id}`, fundo);
    }

    async deleteFundo(id) {
        return this.delete(`/fundos/${id}`);
    }

    // ===== MÉTODOS DE REGISTROS =====
    async getRegistros(filtros = {}) {
        const params = new URLSearchParams(filtros).toString();
        const endpoint = params ? `/registros?${params}` : '/registros';
        return this.get(endpoint);
    }

    async getRegistrosByFundo(fundoId, filtros = {}) {
        const params = new URLSearchParams(filtros).toString();
        const endpoint = params ? `/registros/fundo/${fundoId}?${params}` : `/registros/fundo/${fundoId}`;
        return this.get(endpoint);
    }

    async getDashboardData(filtros = {}) {
        const params = new URLSearchParams(filtros).toString();
        const endpoint = params ? `/registros/dashboard?${params}` : '/registros/dashboard';
        return this.get(endpoint);
    }

    async getBenchmarkData(filtros = {}) {
        const params = new URLSearchParams(filtros).toString();
        const endpoint = params ? `/registros/benchmark?${params}` : '/registros/benchmark';
        return this.get(endpoint);
    }

    async createRegistro(registro) {
        return this.post('/registros', registro);
    }

    async updateRegistro(id, registro) {
        return this.put(`/registros/${id}`, registro);
    }

    async deleteRegistro(id) {
        return this.delete(`/registros/${id}`);
    }

    // ===== MÉTODOS DE INVENTARIO =====
    async getInventario(filtros = {}) {
        const params = new URLSearchParams(filtros).toString();
        const endpoint = params ? `/inventario?${params}` : '/inventario';
        return this.get(endpoint);
    }

    async getInventarioByFundo(fundoId) {
        return this.get(`/inventario/fundo/${fundoId}`);
    }

    async getAlertasStock(fundoId = null) {
        const params = fundoId ? `?fundo=${fundoId}` : '';
        return this.get(`/inventario/alertas${params}`);
    }

    async getResumenInventario(fundoId = null) {
        const params = fundoId ? `?fundo=${fundoId}` : '';
        return this.get(`/inventario/resumen${params}`);
    }

    async createInventario(item) {
        return this.post('/inventario', item);
    }

    async updateInventario(id, item) {
        return this.put(`/inventario/${id}`, item);
    }

    async deleteInventario(id) {
        return this.delete(`/inventario/${id}`);
    }

    // ===== MÉTODOS DE UTILIDAD =====
    async testConnection() {
        try {
            const response = await this.get('/');
            return {
                success: true,
                message: '✅ Conexión exitosa con el backend',
                data: response
            };
        } catch (error) {
            return {
                success: false,
                message: '❌ Error de conexión con el backend',
                error: error.message
            };
        }
    }

    // Verificar si el backend está disponible
    async isBackendAvailable() {
        try {
            await this.get('/');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Obtener estado del backend
    async getBackendStatus() {
        try {
            const response = await this.get('/');
            return {
                available: true,
                version: response.version,
                environment: response.environment,
                endpoints: response.endpoints
            };
        } catch (error) {
            return {
                available: false,
                error: error.message
            };
        }
    }
}

// Crear instancia global
const apiService = new ApiService();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiService;
}

// Hacer disponible globalmente para el frontend
window.apiService = apiService;
