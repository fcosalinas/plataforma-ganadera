/**
 * Dashboard Module - Gestión del dashboard principal
 */
class DashboardModule {
    constructor() {
        this.datosOriginales = [];
        this.fundoSeleccionado = 'todos';
        this.fechaInicio = null;
        this.fechaFin = null;
        this.init();
    }

    /**
     * Inicialización del módulo
     */
    init() {
        console.log('📊 Dashboard Module inicializado');
        
        // Establecer rango por defecto: últimos 30 días
        this.setRangoFechas('30dias');
        
        this.cargarDatos();
        this.configurarEventos();
    }

    /**
     * Cargar datos desde la API
     */
    async cargarDatos() {
        try {
            console.log('🔄 Cargando datos del dashboard...');
            
            // Cargar datos de producción desde MongoDB
            const response = await fetch('http://localhost:3000/api/registros');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Validar que los datos sean válidos
            if (!result.success || !Array.isArray(result.data)) {
                throw new Error('La API no devolvió datos válidos');
            }
            
            const datos = result.data;
            this.datosOriginales = datos;
            console.log(`✅ Datos reales de MongoDB cargados: ${datos.length} registros`);
            console.log('📋 Muestra de datos reales:', datos.slice(0, 1)[0]);
            
            // Actualizar dashboard con datos reales
            this.actualizarDashboard(datos);
            
        } catch (error) {
            console.error('❌ Error cargando datos de MongoDB:', error.message);
            // No cargar datos de prueba - mostrar error real
            this.mostrarErrorConexion(error.message);
        }
    }

    /**
     * Mostrar error de conexión a MongoDB
     */
    mostrarErrorConexion(error) {
        console.error('❌ Error de conexión a MongoDB:', error);
        
        // Mostrar mensaje de error en el dashboard
        const dashboardContainer = document.querySelector('.dashboard-grid');
        if (dashboardContainer) {
            dashboardContainer.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">🔴</div>
                    <h3>Error de Conexión a MongoDB</h3>
                    <p>No se pudieron cargar los datos reales de la base de datos.</p>
                    <div class="error-details">
                        <strong>Error:</strong> ${error}
                    </div>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="location.reload()">
                            🔄 Reintentar Conexión
                        </button>
                        <button class="btn btn-secondary" onclick="window.open('/api', '_blank')">
                            🔍 Ver Estado API
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Deshabilitar botones de datos de prueba
        const botonPrueba = document.querySelector('button[onclick="cargarDatosPrueba()"]');
        if (botonPrueba) {
            botonPrueba.disabled = true;
            botonPrueba.textContent = '🚫 Datos de Prueba Desactivados';
            botonPrueba.title = 'Para usar datos de prueba, configura manualmente el sistema';
        }
    }

    /**
     * Cargar datos de prueba - DESACTIVADO
     */
    cargarDatosPrueba() {
        console.warn('🚫 Datos de prueba desactivados. Solo se permiten datos reales de MongoDB.');
        this.mostrarErrorConexion('Los datos de prueba están desactivados. Configure la conexión a MongoDB.');
    }

    /**
     * Cargar datos fallback - DESACTIVADO
     */
    cargarDatosFallback() {
        console.warn('🚫 Datos fallback desactivados. Solo se permiten datos reales de MongoDB.');
        this.mostrarErrorConexion('Los datos fallback están desactivados. Configure la conexión a MongoDB.');
    }

    /**
     * Generar datos de prueba - DESACTIVADO
     */
    generarDatosPrueba() {
        console.warn('🚫 Generación de datos de prueba desactivada.');
        return [];
    }

    /**
     * Configurar eventos del dashboard
     */
    configurarEventos() {
        // Selector de fundos
        const selectorFundos = document.getElementById('fundoDashboard');
        if (selectorFundos) {
            selectorFundos.addEventListener('change', (e) => {
                this.fundoSeleccionado = e.target.value;
                this.actualizarDashboard(this.datosOriginales);
            });
        }

        // Selector de fechas
        const selectorFechas = document.getElementById('fechaDashboard');
        if (selectorFechas) {
            selectorFechas.addEventListener('change', (e) => {
                const rango = e.target.value;
                this.setRangoFechas(rango);
                this.actualizarDashboard(this.datosOriginales);
            });
        }
    }

    /**
     * Establecer rango de fechas
     */
    setRangoFechas(rango) {
        console.log(`📅 Configurando rango de fechas: ${rango}`);
        const hoy = new Date();
        this.fechaFin = hoy;
        
        switch (rango) {
            case '7dias':
                this.fechaInicio = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30dias':
                this.fechaInicio = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90dias':
                this.fechaInicio = new Date(hoy.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'ultimoMes':
                this.fechaInicio = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'ultimos3Meses':
                this.fechaInicio = new Date(hoy.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'ultimos12Meses':
                this.fechaInicio = new Date(hoy.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            case 'ultimos24Meses':
                this.fechaInicio = new Date(hoy.getTime() - 730 * 24 * 60 * 60 * 1000);
                break;
            case 'todos':
                this.fechaInicio = null;
                this.fechaFin = null;
                break;
            default:
                this.fechaInicio = null;
                this.fechaFin = null;
        }
        
        console.log(`📆 Rango configurado:`, {
            inicio: this.fechaInicio ? this.fechaInicio.toLocaleDateString() : 'sin límite',
            fin: this.fechaFin ? this.fechaFin.toLocaleDateString() : 'sin límite'
        });
        
        // Actualizar inputs de fecha
        this.actualizarInputsFecha();
        
        // Actualizar dashboard con el nuevo filtro
        if (this.datosOriginales && this.datosOriginales.length > 0) {
            this.actualizarDashboard(this.datosOriginales);
        }
    }

    /**
     * Actualizar inputs de fecha según el rango seleccionado
     */
    actualizarInputsFecha() {
        const inputInicio = document.getElementById('fechaInicio');
        const inputFin = document.getElementById('fechaFin');
        
        if (inputInicio && this.fechaInicio) {
            // Formatear fecha como YYYY-MM-DD
            const fechaInicioStr = this.fechaInicio.toISOString().split('T')[0];
            inputInicio.value = fechaInicioStr;
            console.log(`📅 Input "Desde" actualizado: ${fechaInicioStr}`);
        }
        
        if (inputFin && this.fechaFin) {
            const fechaFinStr = this.fechaFin.toISOString().split('T')[0];
            inputFin.value = fechaFinStr;
            console.log(`📅 Input "Hasta" actualizado: ${fechaFinStr}`);
        }
    }

    /**
     * Filtrar por fechas desde inputs manuales
     */
    filtrarPorFechas() {
        const inputInicio = document.getElementById('fechaInicio');
        const inputFin = document.getElementById('fechaFin');
        
        if (inputInicio && inputInicio.value) {
            this.fechaInicio = new Date(inputInicio.value + 'T00:00:00');
        } else {
            this.fechaInicio = null;
        }
        
        if (inputFin && inputFin.value) {
            this.fechaFin = new Date(inputFin.value + 'T23:59:59');
        } else {
            this.fechaFin = new Date();
        }
        
        console.log(`📅 Fechas manuales configuradas:`, {
            inicio: this.fechaInicio ? this.fechaInicio.toLocaleDateString() : 'sin límite',
            fin: this.fechaFin ? this.fechaFin.toLocaleDateString() : 'sin límite'
        });
        
        // Actualizar dashboard
        if (this.datosOriginales && this.datosOriginales.length > 0) {
            this.actualizarDashboard(this.datosOriginales);
        }
    }

    /**
     * Resetear fechas
     */
    resetearFechas() {
        this.fechaInicio = null;
        this.fechaFin = null;
        
        const inputInicio = document.getElementById('fechaInicio');
        const inputFin = document.getElementById('fechaFin');
        
        if (inputInicio) inputInicio.value = '';
        if (inputFin) inputFin.value = '';
        
        console.log('🔄 Fechas reseteadas');
        
        // Actualizar dashboard
        if (this.datosOriginales && this.datosOriginales.length > 0) {
            this.actualizarDashboard(this.datosOriginales);
        }
    }

    /**
     * Actualizar dashboard completo
     */
    actualizarDashboard(datos) {
        console.log('🔄 Actualizando dashboard...');
        
        // Filtrar datos
        const datosFiltrados = this.filtrarDatos(datos);
        
        // Actualizar selector de fundos
        this.actualizarSelectorFundos(datos);
        
        // Actualizar KPIs
        this.actualizarKPIs(datosFiltrados);
        
        // Actualizar gráficos
        this.actualizarGraficos(datosFiltrados);
        
        console.log(`✅ Dashboard actualizado con ${datosFiltrados.length} registros`);
    }

    /**
     * Filtrar datos según fundo y fechas
     */
    filtrarDatos(datos) {
        console.log(`🔍 Filtrando ${datos.length} registros originales`);
        
        // Validar que datos sea un array válido
        if (!datos || !Array.isArray(datos)) {
            console.warn('⚠️ Datos inválidos en filtrarDatos, usando array vacío');
            return [];
        }
        
        let datosFiltrados = [...datos];
        
        // Filtrar por fundo
        if (this.fundoSeleccionado !== 'todos') {
            datosFiltrados = datosFiltrados.filter(d => {
                const nombreFundo = d.fundo?.nombre || d.fundo || '';
                return nombreFundo === this.fundoSeleccionado;
            });
            console.log(`🏭 Filtrado por fundo "${this.fundoSeleccionado}": ${datosFiltrados.length} registros`);
        }
        
        // Filtrar por fechas
        if (this.fechaInicio && this.fechaFin) {
            datosFiltrados = datosFiltrados.filter(d => {
                const fecha = new Date(d.fecha);
                return fecha >= this.fechaInicio && fecha <= this.fechaFin;
            });
            console.log(`📅 Filtrado por rango de fechas: ${datosFiltrados.length} registros`);
        }
        
        console.log(`✅ Filtrado completado: ${datosFiltrados.length} registros finales`);
        return datosFiltrados;
    }

    /**
     * Actualizar selector de fundos
     */
    actualizarSelectorFundos(datos) {
        const selector = document.getElementById('fundoDashboard');
        if (!selector) return;
        
        // Extraer fundos únicos
        const fundosUnicos = [...new Set(
            datos.map(d => d.fundo?.nombre).filter(f => f)
        )];
        
        // Guardar selección actual
        const seleccionActual = selector.value;
        
        // Actualizar opciones
        selector.innerHTML = '<option value="todos">Todos los Fundos</option>';
        fundosUnicos.forEach(fundo => {
            const option = document.createElement('option');
            option.value = fundo;
            option.textContent = fundo;
            selector.appendChild(option);
        });
        
        // Restaurar selección
        selector.value = seleccionActual;
    }

    /**
     * Actualizar KPIs principales
     */
    actualizarKPIs(datos) {
        console.log(`📊 Actualizando KPIs con ${datos.length} registros`);
        
        if (datos.length === 0) {
            console.warn('⚠️ Sin datos para actualizar KPIs');
            return;
        }
        
        // Calcular totales
        const totales = datos.reduce((acc, d) => {
            acc.lecheDiaria += d.produccion?.litros || 0;
            acc.vacasOrdeña += d.vacas?.enOrdeña || d.vacas?.estanque || 0;
            acc.proteina += d.produccion?.proteina || 0;
            acc.grasa += d.produccion?.grasa || 0;
            acc.concentrado += d.alimentacion?.concentrado || 0;
            
            // Intentar múltiples campos para costo de dieta
            const costoDieta = d.economia?.costoDieta || 
                             d.economia?.costo_alimentacion || 
                             d.economia?.costoDietaDiario ||
                             d.costoDieta ||
                             0;
            acc.costoDieta += costoDieta;
            
            // Ingresos estimados (precio leche * litros)
            const precioLeche = d.economia?.precioLeche || d.precioLeche || 850; // $850/L por defecto
            acc.ingresos += (d.produccion?.litros || 0) * precioLeche;
            
            return acc;
        }, {
            lecheDiaria: 0,
            vacasOrdeña: 0,
            proteina: 0,
            grasa: 0,
            concentrado: 0,
            costoDieta: 0,
            ingresos: 0
        });
        
        console.log('📊 Datos brutos para cálculo:', {
            muestraDatos: datos.slice(0, 2),
            totales: totales
        });
        
        // Calcular promedios
        const dias = datos.length;
        const lecheDiaria = totales.lecheDiaria / dias;
        const vacasOrdeña = totales.vacasOrdeña / dias;
        const proteinaPromedio = totales.proteina / dias;
        const grasaPromedio = totales.grasa / dias;
        const concentradoDiario = totales.concentrado / dias;
        const costoDietaDiario = totales.costoDieta / dias;
        const ingresosDiarios = totales.ingresos / dias;
        
        // Calcular KPIs derivados
        const litrosVacaDia = vacasOrdeña > 0 ? lecheDiaria / vacasOrdeña : 0;
        const costoPorLitro = lecheDiaria > 0 ? costoDietaDiario / lecheDiaria : 0;
        const costoPorVaca = vacasOrdeña > 0 ? costoDietaDiario / vacasOrdeña : 0;
        const calidadGeneral = (proteinaPromedio + grasaPromedio) / 2;
        const margenEstimado = ingresosDiarios - costoDietaDiario;
        
        console.log(`📈 KPIs calculados:`, {
            lecheDiaria: lecheDiaria.toFixed(0),
            vacasOrdeña: vacasOrdeña.toFixed(0),
            proteina: proteinaPromedio.toFixed(2),
            grasa: grasaPromedio.toFixed(2),
            concentradoDiario: concentradoDiario.toFixed(0),
            costoDietaDiario: costoDietaDiario.toFixed(0),
            ingresosDiarios: ingresosDiarios.toFixed(0),
            litrosVacaDia: litrosVacaDia.toFixed(1),
            costoPorLitro: costoPorLitro.toFixed(2),
            costoPorVaca: costoPorVaca.toFixed(2),
            calidadGeneral: calidadGeneral.toFixed(2),
            margenEstimado: margenEstimado.toFixed(0)
        });
        
        // Actualizar KPIs principales
        this.actualizarKPIDom('lecheDiaria', lecheDiaria.toFixed(0), 'L');
        this.actualizarKPIDom('vacasOrdeña', vacasOrdeña.toFixed(0), 'vacas');
        this.actualizarKPIDom('proteina', proteinaPromedio.toFixed(2), '%');
        this.actualizarKPIDom('grasa', grasaPromedio.toFixed(2), '%');
        
        // Actualizar KPIs adicionales
        this.actualizarKPIDom('litrosVacaDia', litrosVacaDia.toFixed(1), 'L/vaca');
        this.actualizarKPIDom('costoPorLitro', costoPorLitro.toFixed(2), '$/L');
        this.actualizarKPIDom('costoPorVaca', costoPorVaca.toFixed(2), '$/vaca');
        this.actualizarKPIDom('concentradoDiario', concentradoDiario.toFixed(0), 'kg');
        this.actualizarKPIDom('costoDietaDiario', costoDietaDiario.toFixed(0), '$');
        this.actualizarKPIDom('ingresosDiarios', ingresosDiarios.toFixed(0), '$');
        this.actualizarKPIDom('margenEstimado', margenEstimado.toFixed(0), '$');
        this.actualizarKPIDom('calidadGeneral', calidadGeneral.toFixed(2), '%');
    }

    /**
     * Formatear valores en miles
     */
    formatearMiles(valor) {
        if (valor >= 1000000) {
            return `${(valor / 1000000).toFixed(1)}M`;
        } else if (valor >= 1000) {
            return `${(valor / 1000).toFixed(0)}K`;
        }
        return valor.toFixed(0);
    }

    /**
     * Actualizar KPI individual en el DOM
     */
    actualizarKPIDom(id, valor, unidad) {
        // Mapeo de IDs internos a IDs del HTML
        const idMap = {
            'lecheDiaria': 'kpiLecheDiaria',
            'vacasOrdeña': 'kpiVacasOrdeña',
            'proteina': 'kpiProteina',
            'grasa': 'kpiGrasa',
            'litrosVacaDia': 'kpiLitrosVacaDia',
            'costoPorLitro': 'kpiCostoDietaLitro',
            'costoPorVaca': 'kpiCostoDietaVaca',
            'concentradoDiario': 'kpiCostoAlimentacion',
            'costoDietaDiario': 'kpiCostoTotalDiario',
            'ingresosDiarios': 'kpiIngresoEstimado',
            'margenEstimado': 'kpiMargenEstimado',
            'calidadGeneral': 'kpiCalidadLeche'
        };
        
        const elementoId = idMap[id] || id;
        const elemento = document.getElementById(elementoId);
        
        if (elemento) {
            // Formatear valores monetarios en miles (excepto valores por unidad)
            let valorFormateado = valor;
            if (unidad === '$' && parseFloat(valor) > 1000) {
                valorFormateado = this.formatearMiles(parseFloat(valor));
                unidad = '$';
            }
            
            elemento.textContent = `${valorFormateado} ${unidad}`;
            console.log(`✅ KPI actualizado: ${elementoId} = ${valorFormateado} ${unidad}`);
        } else {
            console.warn(`⚠️ Elemento KPI no encontrado: ${elementoId}`);
        }
    }

    /**
     * Actualizar todos los gráficos
     */
    actualizarGraficos(datos) {
        console.log('📈 Actualizando gráficos...');
        
        // Configurar gráficos evolutivos - IDs correctos con prefijo "chart"
        this.configurarGrafico('chartProduccionDiaria', datos);
        this.configurarGrafico('chartLitrosVacaDiaEvol', datos);
        this.configurarGrafico('chartVacasOrdeñaEvol', datos);
        this.configurarGrafico('chartConcentradoDiario', datos);
        this.configurarGrafico('chartCostoDieta', datos);
        this.configurarGrafico('chartCalidadEvol', datos);
    }

    /**
     * Configurar gráfico específico
     */
    configurarGrafico(kpiId, datos) {
        console.log(`🔧 Configurando gráfico: ${kpiId}`);
        
        const canvas = document.getElementById(kpiId);
        if (!canvas) {
            console.error(`❌ Canvas no encontrado: ${kpiId}`);
            return;
        }
        
        console.log(`✅ Canvas encontrado: ${kpiId}`);
        console.log(`📏 Canvas dimensions: ${canvas.width}x${canvas.height}`);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error(`❌ Contexto 2D no encontrado: ${kpiId}`);
            return;
        }
        
        console.log(`✅ Contexto 2D obtenido: ${kpiId}`);
        
        // Generar datos según KPI
        const { valores, etiquetas } = this.generarDatosGrafico(kpiId, datos);
        
        console.log(`📈 Datos generados para ${kpiId}:`, valores.length, 'valores');
        
        // Dibujar gráfico simple
        this.dibujarGraficoLineas(ctx, canvas, valores, etiquetas, kpiId);
        
        console.log(`✅ Gráfico ${kpiId} procesado`);
    }

    /**
     * Generar datos para gráfico
     */
    generarDatosGrafico(kpiId, datos) {
        console.log(`🔍 Generando datos para ${kpiId} con ${datos.length} registros`);
        
        let valores = [];
        let etiquetas = [];
        
        switch (kpiId) {
            case 'chartProduccionDiaria':
                valores = datos.map(d => d.produccion?.litros || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'chartLitrosVacaDiaEvol':
                valores = datos.map(d => {
                    const litros = d.produccion?.litros || 0;
                    const vacas = d.vacas?.enOrdeña || d.vacas?.estanque || 1;
                    return vacas > 0 ? litros / vacas : 0;
                });
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'chartVacasOrdeñaEvol':
                valores = datos.map(d => d.vacas?.enOrdeña || d.vacas?.estanque || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'chartConcentradoDiario':
                valores = datos.map(d => d.alimentacion?.concentrado || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'chartCostoDieta':
                valores = datos.map(d => d.economia?.costoDieta || d.economia?.costo_alimentacion || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'chartCalidadEvol':
                valores = datos.map(d => {
                    const grasa = d.produccion?.grasa || 0;
                    const proteina = d.produccion?.proteina || 0;
                    return (grasa + proteina) / 2;
                });
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
        }
        
        // Limitar a últimos 30 puntos para mejor visualización
        if (valores.length > 30) {
            valores = valores.slice(-30);
            etiquetas = etiquetas.slice(-30);
        }
        
        console.log(`📊 ${kpiId}: ${valores.length} valores, ejemplo:`, valores.slice(0, 3));
        
        return { valores, etiquetas };
    }

    /**
     * Dibujar gráfico con Chart.js
     */
    dibujarGraficoLineas(ctx, canvas, valores, etiquetas, kpiId) {
        if (!valores || valores.length === 0) {
            console.warn(`⚠️ Sin datos para gráfico ${kpiId}`);
            return;
        }
        
        console.log(`🎨 Dibujando gráfico ${kpiId} con Chart.js:`, valores.length, 'puntos');
        
        // Destruir gráfico anterior si existe
        if (canvas.chart) {
            canvas.chart.destroy();
        }
        
        // Configuración de colores según KPI
        const colores = {
            'chartProduccionDiaria': {
                border: '#3b82f6',
                background: 'rgba(59, 130, 246, 0.3)'
            },
            'chartLitrosVacaDiaEvol': {
                border: '#10b981',
                background: 'rgba(16, 185, 129, 0.3)'
            },
            'chartVacasOrdeñaEvol': {
                border: '#06b6d4',
                background: 'rgba(6, 182, 212, 0.3)'
            },
            'chartConcentradoDiario': {
                border: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.3)'
            },
            'chartCostoDieta': {
                border: '#ef4444',
                background: 'rgba(239, 68, 68, 0.3)'
            },
            'chartCalidadEvol': {
                border: '#8b5cf6',
                background: 'rgba(139, 92, 246, 0.3)'
            }
        };
        
        const color = colores[kpiId] || colores['chartProduccionDiaria'];
        
        // Crear gráfico con Chart.js
        canvas.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: this.getChartTitle(kpiId),
                    data: valores,
                    borderColor: color.border,
                    backgroundColor: color.background,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: color.border,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: color.border,
                        borderWidth: 2,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return this.getChartTitle(kpiId);
                            }.bind(this),
                            label: function(context) {
                                const value = context.parsed.y;
                                const unit = this.getChartUnit(kpiId);
                                const formattedValue = this.formatChartValue(value, kpiId);
                                return `Valor: ${formattedValue}`;
                            }.bind(this)
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#e0e0e0',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#e0e0e0',
                            callback: function(value) {
                                return this.formatChartValue(value, kpiId, true);
                            }.bind(this)
                        }
                    }
                }
            }
        });
        
        console.log(`✅ Gráfico ${kpiId} creado con Chart.js`);
    }
    
    getChartTitle(kpiId) {
        const titles = {
            'chartProduccionDiaria': 'Producción Diaria',
            'chartLitrosVacaDiaEvol': 'Litros/Vaca/Día',
            'chartVacasOrdeñaEvol': 'Vacas en Ordeña',
            'chartConcentradoDiario': 'Concentrado Diario',
            'chartCostoDieta': 'Costo Dieta',
            'chartCalidadEvol': 'Calidad Leche'
        };
        return titles[kpiId] || 'Gráfico';
    }
    
    getChartUnit(kpiId) {
        const units = {
            'chartProduccionDiaria': 'L',
            'chartLitrosVacaDiaEvol': 'L/vaca',
            'chartVacasOrdeñaEvol': 'vacas',
            'chartConcentradoDiario': 'kg',
            'chartCostoDieta': '$',
            'chartCalidadEvol': '%'
        };
        return units[kpiId] || '';
    }
    
    formatChartValue(value, kpiId, forAxis = false) {
        const unit = this.getChartUnit(kpiId);
        
        if (forAxis) {
            // Para ejes, formato más compacto
            if (kpiId === 'chartCostoDieta') {
                return '$' + Math.round(value);
            } else if (kpiId === 'chartCalidadEvol' || kpiId === 'chartLitrosVacaDiaEvol') {
                return value.toFixed(1);
            } else {
                return Math.round(value).toString();
            }
        } else {
            // Para tooltips, formato completo
            if (kpiId === 'chartCostoDieta') {
                return '$' + value.toFixed(0);
            } else if (kpiId === 'chartCalidadEvol' || kpiId === 'chartLitrosVacaDiaEvol') {
                return value.toFixed(2) + ' ' + unit;
            } else {
                return Math.round(value).toLocaleString() + ' ' + unit;
            }
        }
    }
}

// Exportar para uso global
window.DashboardModule = DashboardModule;
