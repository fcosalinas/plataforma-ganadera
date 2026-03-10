// Main Orchestrator - Plataforma Ganadera Digital
class PlataformaGanadera {
    constructor() {
        this.currentSection = 'dashboard'; // Cambiado a 'dashboard' para que coincida con el HTML
        this.modules = {};
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Iniciando Plataforma Ganadera...');
            
            // Inicializar módulos
            await this.initModules();
            console.log('📦 Módulos inicializados');
            
            // Configurar navegación
            this.setupNavigation();
            console.log('🧭 Navegación configurada');
            
            // Cargar datos de ejemplo si no existen
            if (!StorageUtils.hasData()) {
                console.log('📂 Cargando datos de ejemplo...');
                StorageUtils.loadExampleData();
                console.log('✅ Datos de ejemplo cargados');
            } else {
                console.log('📂 Datos ya existen en localStorage');
            }
            
            // Inicializar dashboard automáticamente al cargar
            console.log('📊 Inicializando dashboard automáticamente...');
            if (this.modules.dashboard) {
                console.log('📊 Módulo dashboard encontrado, iniciando...');
                await this.modules.dashboard.init();
                console.log('✅ Dashboard inicializado');
            } else {
                console.error('❌ Módulo dashboard no encontrado');
            }
            
            // Actualizar botón de navegación activo
            this.updateActiveNavButton();
            console.log('🔄 Botón de navegación actualizado');
            
            console.log('✅ Plataforma Ganadera inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar la plataforma:', error);
        }
    }

    async initModules() {
        console.log('📦 initModules(): Iniciando inicialización de módulos...');
        try {
            // Inicializar cada módulo con manejo de errores
            console.log('📦 Creando CargaModule...');
            this.modules.carga = new CargaModule();
            console.log('📦 CargaModule creado');
            
            console.log('📦 Creando DashboardModule...');
            this.modules.dashboard = new DashboardModule();
            console.log('📦 DashboardModule creado');
            
            console.log('📦 Creando TablaModule...');
            this.modules.tabla = new TablaModule();
            console.log('📦 TablaModule creado');
            
            // Inicializar módulos opcionales con try-catch individual
            try {
                console.log('📦 Creando BenchmarkModule...');
                this.modules.benchmark = new BenchmarkModule();
                console.log('📦 BenchmarkModule creado');
            } catch (error) {
                console.warn('⚠️ BenchmarkModule no disponible:', error.message);
            }
            
            try {
                console.log('📦 Creando InventarioModule...');
                this.modules.inventario = new InventarioModule();
                console.log('📦 InventarioModule creado');
            } catch (error) {
                console.warn('⚠️ InventarioModule no disponible:', error.message);
            }
            
            try {
                console.log('📦 Creando HistorialModule...');
                this.modules.historial = new HistorialModule();
                console.log('📦 HistorialModule creado');
            } catch (error) {
                console.warn('⚠️ HistorialModule no disponible:', error.message);
            }
            
            console.log('📦 Todos los módulos creados exitosamente');
        } catch (error) {
            console.error('❌ Error en initModules():', error);
            console.error('❌ Stack trace:', error.stack);
            throw error;
        }
    }

    updateActiveNavButton() {
        // Actualizar botón activo basado en currentSection
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === this.currentSection) {
                btn.classList.add('active');
            }
        });
    }

    setupNavigation() {
        // Configurar botones de navegación rápida
        const quickNavButtons = document.querySelectorAll('.quick-nav-btn');
        quickNavButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.quick-nav-btn').dataset.target;
                this.quickNavigate(target);
            });
        });
    }

    quickNavigate(target) {
        console.log(`🚀 Navegación rápida a: ${target}`);
        
        // Cambiar a la sección
        this.switchSection(target);
        
        // Hacer scroll suave al inicio de la sección
        const targetSection = document.getElementById(target);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // Actualizar botón activo de navegación rápida
        this.updateQuickNavActive(target);
    }

    updateQuickNavActive(target) {
        // Quitar clase active de todos los botones de navegación rápida
        document.querySelectorAll('.quick-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Agregar clase active al botón correspondiente
        const activeBtn = document.querySelector(`.quick-nav-btn[data-target="${target}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    async switchSection(section) {
        try {
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
                if (section === 'inventario') {
                    // Para inventario, usar reinit para asegurar que los gráficos se inicialicen correctamente
                    await this.modules[section].reinit();
                } else {
                    await this.modules[section].init();
                }
            }

            // Actualizar botones de navegación rápida
            this.updateQuickNavActive(section);

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
