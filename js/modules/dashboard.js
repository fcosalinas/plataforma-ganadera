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
            const apiURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:3000/api/registros'
                : 'https://name-plataforma-ganadera-backend.onrender.com/api/registros';
            
            const response = await fetch(apiURL);
            
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
        
        // Ordenar datos por fecha
        datos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        // Obtener último y penúltimo día con datos
        const fechasUnicas = [...new Set(datos.map(d => d.fecha))].sort();
        const ultimaFecha = fechasUnicas[fechasUnicas.length - 1];
        const penultimaFecha = fechasUnicas.length > 1 ? fechasUnicas[fechasUnicas.length - 2] : null;
        
        const datosUltimoDia = datos.filter(d => d.fecha === ultimaFecha);
        const datosPenultimoDia = penultimaFecha ? datos.filter(d => d.fecha === penultimaFecha) : [];
        
        console.log(`📅 Última fecha: ${ultimaFecha}, Penúltima: ${penultimaFecha || 'N/A'}`);
        console.log(`📊 Registros último día: ${datosUltimoDia.length}, penúltimo: ${datosPenultimoDia.length}`);
        
        // Calcular agregados para el último día
        const totalesUltimo = this.calcularTotales(datosUltimoDia);
        const totalesPenultimo = this.calcularTotales(datosPenultimoDia);
        
        // Calcular KPIs del último día
        const lecheDiaria = totalesUltimo.leche;
        const vacasOrdeña = totalesUltimo.vacas;
        const proteinaPromedio = totalesUltimo.proteina;
        const grasaPromedio = totalesUltimo.grasa;
        const concentradoDiario = totalesUltimo.concentrado;
        
        // Calcular KPIs del penúltimo día para tendencias
        const lecheDiariaAnterior = totalesPenultimo.leche;
        const vacasOrdeñaAnterior = totalesPenultimo.vacas;
        const proteinaPromedioAnterior = totalesPenultimo.proteina;
        const grasaPromedioAnterior = totalesPenultimo.grasa;
        const concentradoDiarioAnterior = totalesPenultimo.concentrado;
        
        // Calcular KPIs derivados
        const dias = 1; // Último día
        const costoDietaDiario = totalesUltimo.costoDieta / dias;
        const ingresosDiarios = totalesUltimo.ingresos / dias;
        
        const litrosVacaDia = vacasOrdeña > 0 ? lecheDiaria / vacasOrdeña : 0;
        const costoPorLitro = lecheDiaria > 0 ? costoDietaDiario / lecheDiaria : 0;
        const costoPorVaca = vacasOrdeña > 0 ? costoDietaDiario / vacasOrdeña : 0;
        const calidadGeneral = (proteinaPromedio + grasaPromedio) / 2;
        const margenEstimado = ingresosDiarios - costoDietaDiario;
        
        // Calcular KPIs anteriores para tendencias
        const costoDietaDiarioAnterior = totalesPenultimo.costoDieta;
        const ingresosDiariosAnterior = totalesPenultimo.ingresos;
        const litrosVacaDiaAnterior = vacasOrdeñaAnterior > 0 ? lecheDiariaAnterior / vacasOrdeñaAnterior : 0;
        const costoPorLitroAnterior = lecheDiariaAnterior > 0 ? costoDietaDiarioAnterior / lecheDiariaAnterior : 0;
        const costoPorVacaAnterior = vacasOrdeñaAnterior > 0 ? costoDietaDiarioAnterior / vacasOrdeñaAnterior : 0;
        const calidadGeneralAnterior = (proteinaPromedioAnterior + grasaPromedioAnterior) / 2;
        const margenEstimadoAnterior = ingresosDiariosAnterior - costoDietaDiarioAnterior;
        
        console.log(`📈 KPIs calculados:`, {
            lecheDiaria: lecheDiaria.toFixed(0),
            vacasOrdeña: vacasOrdeña.toFixed(0),
            proteina: proteinaPromedio.toFixed(2),
            grasa: grasaPromedio.toFixed(2),
            litrosVacaDia: litrosVacaDia.toFixed(1),
            costoPorLitro: costoPorLitro.toFixed(2),
            margenEstimado: margenEstimado.toFixed(0)
        });
        
        // Actualizar KPIs principales
        this.actualizarKPIDom('lecheDiaria', lecheDiaria.toFixed(0), 'L');
        this.actualizarKPIDom('vacasOrdeña', vacasOrdeña.toFixed(0), 'vacas');
        this.actualizarKPIDom('proteina', proteinaPromedio.toFixed(2), '%');
        this.actualizarKPIDom('grasa', grasaPromedio.toFixed(2), '%');
        this.actualizarKPIDom('litrosVacaDia', litrosVacaDia.toFixed(1), 'L/vaca');
        this.actualizarKPIDom('costoPorLitro', costoPorLitro.toFixed(2), '$/L');
        this.actualizarKPIDom('costoPorVaca', costoPorVaca.toFixed(2), '$/vaca');
        this.actualizarKPIDom('concentradoDiario', concentradoDiario.toFixed(0), 'kg');
        this.actualizarKPIDom('costoDietaDiario', costoDietaDiario.toFixed(0), '$');
        this.actualizarKPIDom('ingresosDiarios', ingresosDiarios.toFixed(0), '$');
        this.actualizarKPIDom('margenEstimado', margenEstimado.toFixed(0), '$');
        this.actualizarKPIDom('calidadGeneral', calidadGeneral.toFixed(2), '%');
        
        // Actualizar tendencias si hay datos anteriores
        if (penultimaFecha && datosPenultimoDia.length > 0) {
            console.log('📈 Actualizando tendencias...');
            
            this.actualizarTrend('trendLecheDiaria', lecheDiaria, lecheDiariaAnterior);
            this.actualizarTrend('trendVacasOrdeña', vacasOrdeña, vacasOrdeñaAnterior);
            this.actualizarTrend('trendProteina', proteinaPromedio, proteinaPromedioAnterior);
            this.actualizarTrend('trendGrasa', grasaPromedio, grasaPromedioAnterior);
            this.actualizarTrend('trendLitrosVacaDia', litrosVacaDia, litrosVacaDiaAnterior);
            this.actualizarTrend('trendCostoPorLitro', costoPorLitro, costoPorLitroAnterior);
            this.actualizarTrend('trendCostoDietaVaca', costoPorVaca, costoPorVacaAnterior);
            this.actualizarTrend('trendCostoTotalDiario', costoDietaDiario, costoDietaDiarioAnterior);
            this.actualizarTrend('trendIngresoEstimado', ingresosDiarios, ingresosDiariosAnterior);
            this.actualizarTrend('trendMargenEstimado', margenEstimado, margenEstimadoAnterior);
            this.actualizarTrend('trendCalidadLeche', calidadGeneral, calidadGeneralAnterior);
        } else {
            console.log('⚠️ Sin datos anteriores para calcular tendencias');
            
            // Establecer tendencias en 0 si no hay datos anteriores
            const trendElements = ['trendLecheDiaria', 'trendVacasOrdeña', 'trendProteina', 'trendGrasa', 
                                  'trendLitrosVacaDia', 'trendCostoPorLitro', 'trendCostoDietaVaca', 
                                  'trendCostoTotalDiario', 'trendIngresoEstimado', 'trendMargenEstimado', 'trendCalidadLeche'];
            
            trendElements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.textContent = '➡️ 0%';
                    element.className = 'kpi-trend neutral';
                }
            });
        }
    }

    /**
     * Calcular totales para un conjunto de datos
     */
    calcularTotales(datos) {
        const totales = {
            leche: 0,
            vacas: 0,
            proteina: 0,
            grasa: 0,
            concentrado: 0,
            costoDieta: 0,
            ingresos: 0
        };
        
        if (datos.length === 0) return totales;
        
        datos.forEach(d => {
            const produccion = d.produccion || {};
            const alimentacion = d.alimentacion || {};
            const economia = d.economia || {};
            const vacas = d.vacas || {};
            
            totales.leche += produccion.litros || 0;
            totales.vacas += vacas.estanque || 0;
            totales.proteina += produccion.proteina || 0;
            totales.grasa += produccion.grasa || 0;
            totales.concentrado += alimentacion.concentrado || 0;
            totales.costoDieta += economia.costo_alimentacion || 0;
            totales.ingresos += economia.ingreso_total || 0;
        });
        
        // Calcular promedios
        totales.proteina = datos.length > 0 ? totales.proteina / datos.length : 0;
        totales.grasa = datos.length > 0 ? totales.grasa / datos.length : 0;
        
        return totales;
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
     * Actualizar tendencia de un KPI
     */
    actualizarTrend(elementId, valorActual, valorAnterior) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (valorActual === null || valorActual === undefined || valorAnterior === null || valorAnterior === undefined || valorAnterior === 0) {
            element.textContent = '➡️ 0%';
            element.className = 'kpi-trend neutral';
            return;
        }
        
        const cambio = ((valorActual - valorAnterior) / valorAnterior) * 100;
        const perspectiva = this.getPerspectivaKPI(elementId);
        
        // Determinar si el cambio es bueno o malo según la perspectiva
        const esBueno = this.evaluarCambioPerspectiva(cambio, perspectiva);
        
        if (esBueno) {
            element.textContent = `📈 ${cambio.toFixed(1)}%`;
            element.className = 'kpi-trend positive';
        } else if (cambio < 0) {
            element.textContent = `📉 ${cambio.toFixed(1)}%`;
            element.className = 'kpi-trend negative';
        } else {
            element.textContent = `➡️ ${cambio.toFixed(1)}%`;
            element.className = 'kpi-trend neutral';
        }
    }

    /**
     * Obtener perspectiva del KPI (más es mejor o menos es mejor)
     */
    getPerspectivaKPI(elementId) {
        const perspectivas = {
            // Más es mejor 📈
            'trendLecheDiaria': 'mas-es-mejor',
            'trendLitrosVacaDia': 'mas-es-mejor',
            'trendVacasOrdeña': 'mas-es-mejor',
            'trendProteina': 'mas-es-mejor',
            'trendGrasa': 'mas-es-mejor',
            'trendCalidadLeche': 'mas-es-mejor',
            'trendIngresoEstimado': 'mas-es-mejor',
            'trendMargenEstimado': 'mas-es-mejor',
            
            // Menos es mejor 📉
            'trendCostoDietaLitro': 'menos-es-mejor',
            'trendCostoDietaVaca': 'menos-es-mejor',
            'trendCostoTotalDiario': 'menos-es-mejor',
            'trendCostoPorLitro': 'menos-es-mejor',
            'trendCostoAlimentacion': 'menos-es-mejor',
            
            // Depende del contexto 📊
            'trendUrea': 'depende-contexto',
            'trendRecuento': 'depende-contexto',
            'trendRCT': 'depende-contexto',
            'trendCrioscopia': 'depende-contexto'
        };
        
        return perspectivas[elementId] || 'mas-es-mejor';
    }

    /**
     * Evaluar si el cambio es bueno según la perspectiva
     */
    evaluarCambioPerspectiva(cambio, perspectiva) {
        switch (perspectiva) {
            case 'mas-es-mejor':
                return cambio > 0;
            case 'menos-es-mejor':
                return cambio < 0;
            case 'depende-contexto':
                // Para valores que dependen del contexto, usar umbral
                return Math.abs(cambio) < 5; // Cambio menor al 5% es neutral
            default:
                return cambio > 0;
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
