// Historial Module - Gestión y visualización de registros históricos
class HistorialModule {
    constructor() {
        this.datosFiltrados = [];
        this.tabla = null;
    }

    async init() {
        try {
            console.log('🚀 Inicializando módulo de historial...');
            
            this.setupEventListeners();
            await this.cargarHistorial();
            
            console.log('✅ Módulo de historial inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar módulo de historial:', error);
        }
    }

    waitForElement(selector) {
        return new Promise((resolve) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    setupEventListeners() {
        // Filtros de fecha
        const filtroDesde = document.getElementById('filtroFechaDesde');
        const filtroHasta = document.getElementById('filtroFechaHasta');
        
        if (filtroDesde) {
            filtroDesde.addEventListener('change', () => this.filtrarHistorial());
        }
        
        if (filtroHasta) {
            filtroHasta.addEventListener('change', () => this.filtrarHistorial());
        }

        // Botones de acción
        const btnFiltrar = document.querySelector('button[onclick*="filtrarHistorial"]');
        const btnExportar = document.querySelector('button[onclick*="exportarDatos"]');
        
        if (btnFiltrar) {
            btnFiltrar.addEventListener('click', () => this.filtrarHistorial());
        }
        
        if (btnExportar) {
            btnExportar.addEventListener('click', () => this.exportarCSV());
        }
    }

    async cargarHistorial() {
        try {
            const datos = StorageUtils.getDatos();
            this.datosFiltrados = datos;
            
            this.renderizarTabla(datos);
            
            // Establecer fechas de filtro por defecto (últimos 30 días)
            this.setFechasPorDefecto();
            
        } catch (error) {
            console.error('❌ Error al cargar historial:', error);
            this.mostrarError('Error al cargar los datos del historial');
        }
    }

    setFechasPorDefecto() {
        const fechaHasta = new Date();
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 30);
        
        const filtroDesde = document.getElementById('filtroFechaDesde');
        const filtroHasta = document.getElementById('filtroFechaHasta');
        
        if (filtroDesde && !filtroDesde.value) {
            filtroDesde.value = fechaDesde.toISOString().split('T')[0];
        }
        
        if (filtroHasta && !filtroHasta.value) {
            filtroHasta.value = fechaHasta.toISOString().split('T')[0];
        }
    }

    renderizarTabla(datos) {
        const tbody = document.getElementById('tablaHistorialBody');
        if (!tbody) return;

        if (datos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <p>No hay registros que mostrar</p>
                            <small>Comienza cargando datos en la sección de Carga de Datos</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Ordenar datos por fecha (más reciente primero)
        const datosOrdenados = [...datos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        tbody.innerHTML = datosOrdenados.map(dato => this.crearFilaTabla(dato)).join('');

        // Agregar event listeners a los botones de acción
        this.setupAccionesTabla();
    }

    crearFilaTabla(dato) {
        const fecha = new Date(dato.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        return `
            <tr data-id="${dato.id}">
                <td class="fundo-cell">
                    <strong>${dato.fundo || 'Sin nombre'}</strong>
                </td>
                <td class="fecha-cell">${fechaFormateada}</td>
                <td class="dia-cell">${dato.dia || '-'}</td>
                <td class="vacas-cell">${dato.vacas?.totalOrdeña || 0}</td>
                <td class="leche-cell">${dato.leche?.totalDiaria || 0} L</td>
                <td class="promedio-cell">${dato.leche?.promedioPorVaca || 0} L</td>
                <td class="forrajes-cell">${dato.forrajes?.totalDia || 0} kg</td>
                <td class="acciones-cell">
                    <div class="acciones-buttons">
                        <button class="btn btn-sm btn-info" onclick="plataforma.modules.historial.verDetalles(${dato.id})" title="Ver detalles">
                            👁️
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="plataforma.modules.historial.editarDato(${dato.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="plataforma.modules.historial.eliminarDato(${dato.id})" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    setupAccionesTabla() {
        // Los event listeners se agregan directamente en el HTML con onclick
        // Esto evita problemas con la dinámica de la tabla
    }

    filtrarHistorial() {
        try {
            const datos = StorageUtils.getDatos();
            const filtroDesde = document.getElementById('filtroFechaDesde').value;
            const filtroHasta = document.getElementById('filtroFechaHasta').value;

            let datosFiltrados = datos;

            // Aplicar filtro de fecha desde
            if (filtroDesde) {
                const fechaDesde = new Date(filtroDesde);
                datosFiltrados = datosFiltrados.filter(dato => {
                    const fechaDato = new Date(dato.fecha);
                    return fechaDato >= fechaDesde;
                });
            }

            // Aplicar filtro de fecha hasta
            if (filtroHasta) {
                const fechaHasta = new Date(filtroHasta);
                datosFiltrados = datosFiltrados.filter(dato => {
                    const fechaDato = new Date(dato.fecha);
                    return fechaDato <= fechaHasta;
                });
            }

            this.datosFiltrados = datosFiltrados;
            this.renderizarTabla(datosFiltrados);

            // Mostrar resumen del filtro
            this.mostrarResumenFiltro(datos.length, datosFiltrados.length);

        } catch (error) {
            console.error('❌ Error al filtrar historial:', error);
            window.plataforma.mostrarNotificacion('❌ Error al aplicar filtros', 'error');
        }
    }

    mostrarResumenFiltro(total, filtrados) {
        if (total !== filtrados) {
            window.plataforma.mostrarNotificacion(
                `📊 Mostrando ${filtrados} de ${total} registros`,
                'info'
            );
        }
    }

    async verDetalles(id) {
        try {
            const dato = StorageUtils.getDatos().find(d => d.id === id);
            if (!dato) {
                throw new Error('Registro no encontrado');
            }

            this.mostrarModalDetalles(dato);

        } catch (error) {
            console.error('❌ Error al ver detalles:', error);
            window.plataforma.mostrarNotificacion('❌ Error al cargar detalles', 'error');
        }
    }

    mostrarModalDetalles(dato) {
        const modal = document.getElementById('modalDetalles');
        const contenido = document.getElementById('detallesContenido');

        if (!modal || !contenido) return;

        const fecha = new Date(dato.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        contenido.innerHTML = `
            <div class="detalles-grid">
                <div class="detalles-header">
                    <h3>${dato.fundo || 'Sin nombre'}</h3>
                    <p class="detalles-fecha">${fechaFormateada}</p>
                </div>

                <div class="detalles-section">
                    <h4>🐄 Información del Rebaño</h4>
                    <div class="detalles-row">
                        <div class="detalle-item">
                            <label>Vacas en Estanque:</label>
                            <span>${dato.vacas?.estanque || 0}</span>
                        </div>
                        <div class="detalle-item">
                            <label>Descarte:</label>
                            <span>${dato.vacas?.descarte || 0}</span>
                        </div>
                        <div class="detalle-item">
                            <label>Ingreso Vacas:</label>
                            <span>${dato.vacas?.ingreso || 0}</span>
                        </div>
                        <div class="detalle-item">
                            <label>Salida Vacas:</label>
                            <span>${dato.vacas?.salida || 0}</span>
                        </div>
                        <div class="detalle-item">
                            <label>Total Ordeña:</label>
                            <span><strong>${dato.vacas?.totalOrdeña || 0}</strong></span>
                        </div>
                    </div>
                </div>

                <div class="detalles-section">
                    <h4>🥛 Producción de Leche</h4>
                    <div class="detalles-row">
                        <div class="detalle-item">
                            <label>Leche AM:</label>
                            <span>${dato.leche?.am || 0} L</span>
                        </div>
                        <div class="detalle-item">
                            <label>Leche PM:</label>
                            <span>${dato.leche?.pm || 0} L</span>
                        </div>
                        <div class="detalle-item">
                            <label>Leche Total:</label>
                            <span><strong>${dato.leche?.total || 0} L</strong></span>
                        </div>
                        <div class="detalle-item">
                            <label>Leche Terneros:</label>
                            <span>${dato.leche?.terneros || 0} L</span>
                        </div>
                        <div class="detalle-item">
                            <label>Descarte Personal:</label>
                            <span>${dato.leche?.descartePersonal || 0} L</span>
                        </div>
                        <div class="detalle-item">
                            <label>Total Diario:</label>
                            <span><strong>${dato.leche?.totalDiaria || 0} L</strong></span>
                        </div>
                        <div class="detalle-item">
                            <label>Leche Planta:</label>
                            <span>${dato.leche?.planta || 0} L</span>
                        </div>
                        <div class="detalle-item">
                            <label>Promedio/Vaca:</label>
                            <span><strong>${dato.leche?.promedioPorVaca || 0} L</strong></span>
                        </div>
                    </div>
                </div>

                <div class="detalles-section">
                    <h4>🌾 Pastoreo</h4>
                    <div class="detalles-row">
                        <div class="detalle-item">
                            <label>Materia Seca/Vaca/Día:</label>
                            <span>${dato.pastoreo?.kilosMateriaSeca || 0} kg</span>
                        </div>
                        <div class="detalle-item">
                            <label>Potrero AM:</label>
                            <span>${dato.pastoreo?.potreroAM || '-'}</span>
                        </div>
                        <div class="detalle-item">
                            <label>Potrero PM:</label>
                            <span>${dato.pastoreo?.potreroPM || '-'}</span>
                        </div>
                        <div class="detalle-item">
                            <label>Potrero Noche:</label>
                            <span>${dato.pastoreo?.potreroNoche || '-'}</span>
                        </div>
                    </div>
                </div>

                <div class="detalles-section">
                    <h4>🥄 Suplementos</h4>
                    <div class="detalles-row">
                        <div class="detalle-item">
                            <label>Energía:</label>
                            <span>${dato.suplementos?.energia || 0} kg</span>
                        </div>
                        <div class="detalle-item">
                            <label>Proteína:</label>
                            <span>${dato.suplementos?.proteina || 0} kg</span>
                        </div>
                        <div class="detalle-item">
                            <label>Aditivos:</label>
                            <span>${dato.suplementos?.aditivos || 0} kg</span>
                        </div>
                        <div class="detalle-item">
                            <label>Sales y Otros:</label>
                            <span>${dato.suplementos?.salesOtros || 0} kg</span>
                        </div>
                    </div>
                </div>

                <div class="detalles-section">
                    <h4>🌿 Forrajes Suplementarios</h4>
                    <div class="detalles-row">
                        <div class="detalle-item">
                            <label>Ensilaje:</label>
                            <span>${dato.forrajes?.ensilaje || 0} kg</span>
                        </div>
                        <div class="detalle-item">
                            <label>Heno:</label>
                            <span>${dato.forrajes?.heno || 0} kg</span>
                        </div>
                        <div class="detalle-item">
                            <label>Otros Forrajes:</label>
                            <span>${dato.forrajes?.otrosForrajes || 0} kg</span>
                        </div>
                        <div class="detalle-item">
                            <label>Ración:</label>
                            <span>${dato.forrajes?.racion || 0} kg</span>
                        </div>
                        <div class="detalle-item">
                            <label>Total Día:</label>
                            <span><strong>${dato.forrajes?.totalDia || 0} kg</strong></span>
                        </div>
                    </div>
                </div>

                ${dato.observaciones ? `
                    <div class="detalles-section">
                        <h4>📝 Observaciones</h4>
                        <div class="observaciones-texto">
                            <p>${dato.observaciones}</p>
                        </div>
                    </div>
                ` : ''}

                <div class="detalles-footer">
                    <small class="timestamp">
                        Registrado el ${new Date(dato.timestamp || dato.fecha).toLocaleString('es-ES')}
                    </small>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    async editarDato(id) {
        try {
            // Cambiar a la sección de carga
            await window.plataforma.switchSection('carga');
            
            // Esperar a que el módulo de carga esté listo
            setTimeout(() => {
                // Precargar los datos en el formulario
                if (window.plataforma.modules.carga) {
                    window.plataforma.modules.carga.precargarDatos(id);
                }
            }, 500);

        } catch (error) {
            console.error('❌ Error al editar dato:', error);
            window.plataforma.mostrarNotificacion('❌ Error al editar registro', 'error');
        }
    }

    async eliminarDato(id) {
        try {
            if (!confirm('¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.')) {
                return;
            }

            const eliminado = StorageUtils.deleteDato(id);
            
            if (eliminado) {
                window.plataforma.mostrarNotificacion('✅ Registro eliminado correctamente', 'success');
                await this.cargarHistorial(); // Recargar la tabla
            } else {
                throw new Error('No se pudo eliminar el registro');
            }

        } catch (error) {
            console.error('❌ Error al eliminar dato:', error);
            window.plataforma.mostrarNotificacion('❌ Error al eliminar registro', 'error');
        }
    }

    async exportarCSV() {
        try {
            const datos = this.datosFiltrados.length > 0 ? this.datosFiltrados : StorageUtils.getDatos();
            
            if (datos.length === 0) {
                window.plataforma.mostrarNotificacion('⚠️ No hay datos para exportar', 'warning');
                return;
            }

            const csv = this.generarCSV(datos);
            this.descargarCSV(csv, `historial_ganadero_${new Date().toISOString().split('T')[0]}.csv`);
            
            window.plataforma.mostrarNotificacion('✅ Datos exportados correctamente', 'success');

        } catch (error) {
            console.error('❌ Error al exportar CSV:', error);
            window.plataforma.mostrarNotificacion('❌ Error al exportar datos', 'error');
        }
    }

    generarCSV(datos) {
        // Encabezados del CSV
        const headers = [
            'Fundo',
            'Fecha',
            'Día',
            'Vacas Estanque',
            'Vacas Descarte',
            'Ingreso Vacas',
            'Salida Vacas',
            'Total Ordeña',
            'Leche AM',
            'Leche PM',
            'Leche Total',
            'Leche Terneros',
            'Descarte Personal',
            'Total Leche Diaria',
            'Leche Planta',
            'Promedio por Vaca',
            'Materia Seca',
            'Potrero AM',
            'Potrero PM',
            'Potrero Noche',
            'Energía',
            'Proteína',
            'Aditivos',
            'Sales y Otros',
            'Ensilaje',
            'Heno',
            'Otros Forrajes',
            'Ración',
            'Total Forrajes',
            'Observaciones'
        ];

        // Convertir datos a filas CSV
        const filas = datos.map(dato => [
            dato.fundo || '',
            dato.fecha || '',
            dato.dia || '',
            dato.vacas?.estanque || 0,
            dato.vacas?.descarte || 0,
            dato.vacas?.ingreso || 0,
            dato.vacas?.salida || 0,
            dato.vacas?.totalOrdeña || 0,
            dato.leche?.am || 0,
            dato.leche?.pm || 0,
            dato.leche?.total || 0,
            dato.leche?.terneros || 0,
            dato.leche?.descartePersonal || 0,
            dato.leche?.totalDiaria || 0,
            dato.leche?.planta || 0,
            dato.leche?.promedioPorVaca || 0,
            dato.pastoreo?.kilosMateriaSeca || 0,
            dato.pastoreo?.potreroAM || '',
            dato.pastoreo?.potreroPM || '',
            dato.pastoreo?.potreroNoche || '',
            dato.suplementos?.energia || 0,
            dato.suplementos?.proteina || 0,
            dato.suplementos?.aditivos || 0,
            dato.suplementos?.salesOtros || 0,
            dato.forrajes?.ensilaje || 0,
            dato.forrajes?.heno || 0,
            dato.forrajes?.otrosForrajes || 0,
            dato.forrajes?.racion || 0,
            dato.forrajes?.totalDia || 0,
            `"${(dato.observaciones || '').replace(/"/g, '""')}"` // Escapar comillas
        ]);

        // Combinar headers y filas
        const csvContent = [headers, ...filas]
            .map(fila => fila.join(','))
            .join('\n');

        return csvContent;
    }

    descargarCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    mostrarError(mensaje) {
        const tbody = document.getElementById('tablaHistorialBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="error-state">
                            <p>❌ ${mensaje}</p>
                            <small>Por favor, recarga la página e intenta nuevamente</small>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    // Limpiar módulo
    destroy() {
        this.datosFiltrados = [];
        this.tabla = null;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.HistorialModule = HistorialModule;
}
