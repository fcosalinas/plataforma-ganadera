// Main Orchestrator - Plataforma Ganadera Digital
class PlataformaGanadera {
    constructor() {
        this.currentSection = 'carga';
        this.modules = {};
        this.init();
    }

    async init() {
        try {
            // Inicializar módulos
            await this.initModules();
            
            // Configurar navegación
            this.setupNavigation();
            
            // Cargar datos de ejemplo si no existen
            if (!StorageUtils.hasData()) {
                StorageUtils.loadExampleData();
            }
            
            // Inicializar módulo de carga por defecto
            if (this.modules.carga) {
                await this.modules.carga.init();
            }
            
            // Inicializar módulo de tabla
            if (this.modules.tabla) {
                await this.modules.tabla.init();
            }
            
            console.log('✅ Plataforma Ganadera inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar la plataforma:', error);
        }
    }

    async initModules() {
        // Inicializar cada módulo
        this.modules.carga = new CargaModule();
        this.modules.dashboard = new DashboardModule();
        this.modules.tabla = new TablaModule();
        this.modules.benchmark = new BenchmarkModule();
        this.modules.historial = new HistorialModule();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });
    }

    async switchSection(section) {
        try {
            // Actualizar botones de navegación
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-section="${section}"]`).classList.add('active');

            // Ocultar todas las secciones
            document.querySelectorAll('.section').forEach(sec => {
                sec.classList.remove('active');
            });

            // Mostrar sección seleccionada
            const targetSection = document.getElementById(section);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Inicializar módulo específico
            if (this.modules[section]) {
                await this.modules[section].init();
            }

            this.currentSection = section;
        } catch (error) {
            console.error(`Error al cambiar a sección ${section}:`, error);
        }
    }

    // Eliminamos loadView ya que no es necesario con el HTML integrado

    // Métodos globales accesibles desde cualquier módulo
    cerrarModal() {
        document.getElementById('modalDetalles').style.display = 'none';
    }

    async exportarDatos() {
        return this.modules.historial.exportarCSV();
    }

    async actualizarBenchmark() {
        return this.modules.benchmark.actualizarDatos();
    }

    // Método para mostrar notificaciones globales
    mostrarNotificacion(mensaje, tipo = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.textContent = mensaje;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar la plataforma cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.plataforma = new PlataformaGanadera();
    // Hacer disponible el módulo de carga globalmente
    window.cargaModule = window.plataforma.modules.carga;
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlataformaGanadera;
}
