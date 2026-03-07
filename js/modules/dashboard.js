/**
 * Dashboard Module - Módulo principal del dashboard
 * Maneja la visualización de KPIs, gráficos y métricas
 */

console.log('📊 Dashboard.js: Archivo cargado');

class DashboardModule {
    constructor() {
        console.log('📊 DashboardModule: Constructor llamado');
        this.datos = [];
        this.datosOriginales = []; // Guardar datos originales sin filtrar
        this.fundoSeleccionado = 'todos';
        this.fechaInicio = null;
        this.fechaFin = null;
        this.alertas = [];
        console.log('📊 DashboardModule: Constructor completado');
    }

    /**
     * Inicializar módulo dashboard
     */
    init() {
        console.log('📊 Dashboard Module init() llamado');
        try {
            this.cargarDatos();
            this.inicializarEventos();
            console.log('📊 Dashboard Module inicializado completamente');
        } catch (error) {
            console.error('❌ Error en Dashboard Module init():', error);
        }
    }

    /**
     * Cargar datos desde localStorage
     */
    cargarDatos() {
        try {
            console.log('📊 Dashboard: Cargando datos desde localStorage...');
            const datosGuardados = localStorage.getItem('plataformaGanaderaDatos');
            console.log('📊 Dashboard: datosGuardados =', datosGuardados ? 'EXISTE' : 'NULL');
            
            if (datosGuardados) {
                this.datosOriginales = JSON.parse(datosGuardados);
                this.datos = [...this.datosOriginales]; // Copia de los datos originales
                console.log(`📊 Dashboard: Cargados ${this.datos.length} registros`);
                console.log('📊 Dashboard: Primer registro:', this.datos[0]);
                this.inicializarSelectorFechas();
                this.actualizarDashboard();
            } else {
                console.log('📊 Dashboard: No hay datos guardados');
                this.mostrarEstadoVacio();
            }
        } catch (error) {
            console.error('❌ Error al cargar datos en dashboard:', error);
            this.mostrarError('Error al cargar los datos');
        }
    }

    /**
     * Inicializar eventos del dashboard
     */
    inicializarEventos() {
        // Selector de fundos
        const selector = document.getElementById('fundoDashboard');
        if (selector) {
            selector.addEventListener('change', (e) => {
                this.filtrarPorFundo(e.target.value);
            });
        }
    }

    /**
     * Actualizar selector de fundos
     */
    actualizarSelectorFundos(datos) {
        const selector = document.getElementById('fundoDashboard');
        if (!selector) return;

        // Obtener fundos únicos
        const fundos = [...new Set(datos.map(d => d.fundo).filter(f => f))];
        
        // Guardar selección actual
        const seleccionActual = selector.value;
        
        // Limpiar y actualizar opciones
        selector.innerHTML = '<option value="todos">Todos los Fundos</option>';
        fundos.forEach(fundo => {
            const option = document.createElement('option');
            option.value = fundo;
            option.textContent = fundo;
            selector.appendChild(option);
        });
        
        // Restaurar selección
        selector.value = seleccionActual;
    }

    /**
     * Filtrar datos por fundo
     */
    filtrarPorFundo(fundo) {
        this.fundoSeleccionado = fundo;
        this.actualizarDashboard();
    }

    /**
     * Filtrar datos según el fundo seleccionado
     */
    filtrarDatosPorFundo(datos) {
        if (this.fundoSeleccionado === 'todos') {
            return datos;
        }
        return datos.filter(d => d.fundo === this.fundoSeleccionado);
    }

    /**
     * Actualizar dashboard completo
     */
    actualizarDashboard() {
        if (!this.datosOriginales || this.datosOriginales.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        // Aplicar filtros (fundo y fechas)
        let datosFiltrados = this.aplicarFiltros(this.datosOriginales);
        
        // Actualizar selector de fundos
        this.actualizarSelectorFundos(this.datosOriginales);
        
        // Generar alertas basadas en los datos filtrados
        this.generarAlertas(datosFiltrados);
        
        // Actualizar KPIs
        this.actualizarKPIs(datosFiltrados);
        
        // Actualizar gráficos
        this.actualizarGraficos(datosFiltrados);
        
        // Mostrar alertas
        this.mostrarAlertas();
        
        console.log(`📊 Dashboard actualizado con ${datosFiltrados.length} registros filtrados`);
    }

    /**
     * Actualizar KPIs del dashboard
     */
    actualizarKPIs(datos) {
        if (this.fundoSeleccionado === 'todos') {
            this.actualizarKPIsTodosFundos(datos);
        } else {
            this.actualizarKPIsFundoEspecifico(datos, this.fundoSeleccionado);
        }
    }

    /**
     * Actualizar KPIs para todos los fundos
     */
    actualizarKPIsTodosFundos(datos) {
        // Agrupar datos por fundo y obtener el más reciente de cada uno
        const datosPorFundo = {};
        datos.forEach(d => {
            if (!datosPorFundo[d.fundo] || new Date(d.fecha) > new Date(datosPorFundo[d.fundo].fecha)) {
                datosPorFundo[d.fundo] = d;
            }
        });

        const datosRecientesPorFundo = Object.values(datosPorFundo);
        
        if (datosRecientesPorFundo.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        // A) Producción
        const lecheDiaria = datosRecientesPorFundo.reduce((sum, d) => sum + (d.lecheDiaria || 0), 0);
        const litrosVacaDia = datosRecientesPorFundo.reduce((sum, d) => sum + (d.litrosVacaDia || 0), 0) / datosRecientesPorFundo.length;
        const vacasOrdeña = datosRecientesPorFundo.reduce((sum, d) => sum + (d.vacasOrdeña || 0), 0);
        
        this.actualizarKPI('kpiLecheDiaria', `${lecheDiaria.toFixed(1)} L`);
        this.actualizarKPI('kpiLitrosVacaDia', `${litrosVacaDia.toFixed(2)} L`);
        this.actualizarKPI('kpiVacasOrdeña', vacasOrdeña.toString());

        // B) Calidad
        const proteina = datosRecientesPorFundo.reduce((sum, d) => sum + (d.proteina || 0), 0) / datosRecientesPorFundo.length;
        const grasa = datosRecientesPorFundo.reduce((sum, d) => sum + (d.grasa || 0), 0) / datosRecientesPorFundo.length;
        
        // C) Alimentación
        const concentradoDiario = datosRecientesPorFundo.reduce((sum, d) => sum + (d.concentradoDiario || 0), 0);
        
        // D) Economía
        const costoDietaLitro = datosRecientesPorFundo.reduce((sum, d) => sum + (d.costoDietaLitro || 0), 0) / datosRecientesPorFundo.length;
        const costoAlimentacion = datosRecientesPorFundo.reduce((sum, d) => sum + (d.costoAlimentacion || 0), 0);
        const ingresoEstimado = datosRecientesPorFundo.reduce((sum, d) => sum + (d.ingresoEstimado || 0), 0);
        const margenEstimado = datosRecientesPorFundo.reduce((sum, d) => sum + (d.margenEstimado || 0), 0);
        const stockDiario = datosRecientesPorFundo.reduce((sum, d) => sum + (d.stockDiario || 0), 0);
        
        this.actualizarKPI('kpiCostoDietaLitro', `$${costoDietaLitro.toFixed(3)}`);
        this.actualizarKPI('kpiCostoAlimentacion', `$${costoAlimentacion.toFixed(0)}`);
        this.actualizarKPI('kpiIngresoEstimado', `$${ingresoEstimado.toFixed(0)}`);
        this.actualizarKPI('kpiMargenEstimado', `$${margenEstimado.toFixed(0)}`);
        this.actualizarKPI('kpiStockDiario', `${stockDiario.toFixed(0)} kg`);

        // Calcular tendencias para todas las tarjetas de valor
        this.calcularTendenciasValor(datosRecientesPorFundo);
        
        // Calcular tendencias para tarjetas de producción (vs promedio 7 días)
        this.calcularTendenciasProduccion(datos);

        // Actualizar stock del último día
        const registroMasReciente = this.obtenerRegistroMasReciente(datos);
        if (registroMasReciente) {
            this.actualizarKPI('kpiStockUltimoDia', `${(registroMasReciente.stockDiario || 0).toFixed(0)} kg`);
            
            // Calcular tendencia comparando con el día anterior
            const stockActual = registroMasReciente.stockDiario || 0;
            const stockAnterior = this.obtenerStockDiaAnterior(datos, registroMasReciente.fecha);
            if (stockAnterior !== null) {
                const tendencia = ((stockActual - stockAnterior) / stockAnterior * 100);
                this.actualizarTendencia('trendStockUltimoDia', tendencia);
            }
        }

        // Actualizar valores actuales para gráficos
        this.actualizarKPI('kpiProduccionDiaria', `${lecheDiaria.toFixed(1)} L`);
        this.actualizarKPI('kpiVacasOrdeñaEvol', vacasOrdeña.toString());
    }

    /**
     * Actualizar KPIs para un fundo específico
     */
    actualizarKPIsFundoEspecifico(datos, fundo) {
        // Obtener el dato más reciente del fundo
        const datoFundo = datos
            .filter(d => d.fundo === fundo)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];

        if (!datoFundo) {
            this.mostrarEstadoVacio();
            return;
        }

        // Actualizar todos los KPIs con el dato más reciente
        this.actualizarKPI('kpiLecheDiaria', `${(datoFundo.lecheDiaria || 0).toFixed(1)} L`);
        this.actualizarKPI('kpiLitrosVacaDia', `${(datoFundo.litrosVacaDia || 0).toFixed(2)} L`);
        this.actualizarKPI('kpiVacasOrdeña', (datoFundo.vacasOrdeña || 0).toString());
        this.actualizarKPI('kpiCostoDietaLitro', `$${(datoFundo.costoDietaLitro || 0).toFixed(3)}`);
        this.actualizarKPI('kpiCostoDieta', `$${(datoFundo.costoDieta || 0).toFixed(0)}`);
        this.actualizarKPI('kpiCostoAlimentacion', `$${(datoFundo.costoAlimentacion || 0).toFixed(0)}`);
        this.actualizarKPI('kpiIngresoEstimado', `$${(datoFundo.ingresoEstimado || 0).toFixed(0)}`);
        this.actualizarKPI('kpiMargenEstimado', `$${(datoFundo.margenEstimado || 0).toFixed(0)}`);
        this.actualizarKPI('kpiStockDiario', `${(datoFundo.stockDiario || 0).toFixed(0)} kg`);
        this.actualizarKPI('kpiStockUltimoDia', `${(datoFundo.stockDiario || 0).toFixed(0)} kg`);

        // Calcular tendencia para fundo específico
        this.calcularTendenciasValor([datoFundo]);
        this.calcularTendenciasProduccion(datos);

        // Calcular tendencia para fundo específico
        const stockActual = datoFundo.stockDiario || 0;
        const stockAnterior = this.obtenerStockDiaAnterior(datos, datoFundo.fecha);
        if (stockAnterior !== null) {
            const tendencia = ((stockActual - stockAnterior) / stockAnterior * 100);
            this.actualizarTendencia('trendStockUltimoDia', tendencia);
        }

        // Calcular tendencias para producción (vs promedio 7 días)
        this.calcularTendenciasProduccion(datos);

        // Actualizar valores actuales para gráficos
        this.actualizarKPI('kpiProduccionDiaria', `${(datoFundo.lecheDiaria || 0).toFixed(1)} L`);
        this.actualizarKPI('kpiVacasOrdeñaEvol', (datoFundo.vacasOrdeña || 0).toString());
    }

    /**
     * Actualizar un KPI específico
     */
    actualizarKPI(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    /**
     * Calcular tendencias para tarjetas de producción (vs promedio 7 días)
     */
    calcularTendenciasProduccion(datos) {
        // Obtener promedio de los últimos 7 días (excluyendo el día actual)
        const datosUltimos7Dias = this.obtenerUltimos7Dias(datos);
        
        if (!datosUltimos7Dias || datosUltimos7Dias.length < 2) {
            // Si no hay suficientes datos, establecer tendencia neutra
            this.actualizarTendencia('trendLecheDiaria', 0);
            this.actualizarTendencia('trendLitrosVacaDia', 0);
            this.actualizarTendencia('trendVacasOrdeña', 0);
            this.actualizarTendencia('trendCostoDietaLitro', 0);
            return;
        }
        
        // Obtener el día más reciente
        const datosFiltrados = this.filtrarDatosPorFundo(datos);
        const registroMasReciente = this.obtenerRegistroMasReciente(datos);
        
        if (!registroMasReciente) {
            this.actualizarTendencia('trendLecheDiaria', 0);
            this.actualizarTendencia('trendLitrosVacaDia', 0);
            this.actualizarTendencia('trendVacasOrdeña', 0);
            this.actualizarTendencia('trendCostoDietaLitro', 0);
            return;
        }
        
        // Calcular promedios de los últimos 7 días (excluyendo el día actual)
        const ultimos7DiasSinHoy = datosUltimos7Dias.slice(0, -1); // Excluir el día actual
        
        if (ultimos7DiasSinHoy.length === 0) {
            this.actualizarTendencia('trendLecheDiaria', 0);
            this.actualizarTendencia('trendLitrosVacaDia', 0);
            this.actualizarTendencia('trendVacasOrdeña', 0);
            this.actualizarTendencia('trendCostoDietaLitro', 0);
            return;
        }
        
        // Calcular promedios
        const promedioLeche = ultimos7DiasSinHoy.reduce((sum, d) => sum + (d.lecheDiaria || 0), 0) / ultimos7DiasSinHoy.length;
        const promedioLitrosVaca = ultimos7DiasSinHoy.reduce((sum, d) => sum + (d.litrosVacaDia || 0), 0) / ultimos7DiasSinHoy.length;
        const promedioVacas = ultimos7DiasSinHoy.reduce((sum, d) => sum + (d.vacasOrdeña || 0), 0) / ultimos7DiasSinHoy.length;
        const promedioCostoDietaLitro = ultimos7DiasSinHoy.reduce((sum, d) => sum + (d.costoDietaLitro || 0), 0) / ultimos7DiasSinHoy.length;
        
        // Obtener valores actuales (del día más reciente)
        const actualLeche = registroMasReciente.lecheDiaria || 0;
        const actualLitrosVaca = registroMasReciente.litrosVacaDia || 0;
        const actualVacas = registroMasReciente.vacasOrdeña || 0;
        const actualCostoDietaLitro = registroMasReciente.costoDietaLitro || 0;
        
        // Calcular tendencias
        if (promedioLeche > 0) {
            const tendenciaLeche = ((actualLeche - promedioLeche) / promedioLeche * 100);
            this.actualizarTendencia('trendLecheDiaria', tendenciaLeche);
        } else {
            this.actualizarTendencia('trendLecheDiaria', 0);
        }
        
        if (promedioLitrosVaca > 0) {
            const tendenciaLitrosVaca = ((actualLitrosVaca - promedioLitrosVaca) / promedioLitrosVaca * 100);
            this.actualizarTendencia('trendLitrosVacaDia', tendenciaLitrosVaca);
        } else {
            this.actualizarTendencia('trendLitrosVacaDia', 0);
        }
        
        if (promedioVacas > 0) {
            const tendenciaVacas = ((actualVacas - promedioVacas) / promedioVacas * 100);
            this.actualizarTendencia('trendVacasOrdeña', tendenciaVacas);
        } else {
            this.actualizarTendencia('trendVacasOrdeña', 0);
        }
        
        if (promedioCostoDietaLitro > 0) {
            const tendenciaCostoDietaLitro = ((actualCostoDietaLitro - promedioCostoDietaLitro) / promedioCostoDietaLitro * 100);
            this.actualizarTendencia('trendCostoDietaLitro', tendenciaCostoDietaLitro);
        } else {
            this.actualizarTendencia('trendCostoDietaLitro', 0);
        }
    }

    /**
     * Obtener últimos 7 días de datos
     */
    obtenerUltimos7Dias(datos) {
        if (!datos || datos.length === 0) return [];
        
        // Filtrar datos según el fundo seleccionado
        const datosFiltrados = this.filtrarDatosPorFundo(datos);
        
        // Ordenar por fecha
        const datosOrdenados = datosFiltrados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        // Obtener últimos 7 días
        return datosOrdenados.slice(-7);
    }

    /**
     * Calcular tendencias para tarjetas de valor
     */
    calcularTendenciasValor(datosActuales) {
        // Obtener datos del día anterior para comparar
        const datosAnteriores = this.obtenerDatosDiaAnterior(datosActuales);
        
        if (!datosAnteriores || datosAnteriores.length === 0) {
            // Si no hay datos anteriores, establecer tendencia neutra
            this.actualizarTendencia('trendIngresoEstimado', 0);
            this.actualizarTendencia('trendCostoAlimentacion', 0);
            this.actualizarTendencia('trendMargenEstimado', 0);
            return;
        }
        
        // Calcular valores actuales y anteriores
        const actualIngreso = datosActuales.reduce((sum, d) => sum + (d.ingresoEstimado || 0), 0);
        const actualCosto = datosActuales.reduce((sum, d) => sum + (d.costoAlimentacion || 0), 0);
        const actualMargen = datosActuales.reduce((sum, d) => sum + (d.margenEstimado || 0), 0);
        
        const anteriorIngreso = datosAnteriores.reduce((sum, d) => sum + (d.ingresoEstimado || 0), 0);
        const anteriorCosto = datosAnteriores.reduce((sum, d) => sum + (d.costoAlimentacion || 0), 0);
        const anteriorMargen = datosAnteriores.reduce((sum, d) => sum + (d.margenEstimado || 0), 0);
        
        // Calcular y actualizar tendencias
        if (anteriorIngreso > 0) {
            const tendenciaIngreso = ((actualIngreso - anteriorIngreso) / anteriorIngreso * 100);
            this.actualizarTendencia('trendIngresoEstimado', tendenciaIngreso);
        } else {
            this.actualizarTendencia('trendIngresoEstimado', 0);
        }
        
        if (anteriorCosto > 0) {
            const tendenciaCosto = ((actualCosto - anteriorCosto) / anteriorCosto * 100);
            this.actualizarTendencia('trendCostoAlimentacion', tendenciaCosto);
        } else {
            this.actualizarTendencia('trendCostoAlimentacion', 0);
        }
        
        if (anteriorMargen > 0) {
            const tendenciaMargen = ((actualMargen - anteriorMargen) / anteriorMargen * 100);
            this.actualizarTendencia('trendMargenEstimado', tendenciaMargen);
        } else {
            this.actualizarTendencia('trendMargenEstimado', 0);
        }
    }

    /**
     * Obtener datos del día anterior
     */
    obtenerDatosDiaAnterior(datosActuales) {
        if (!datosActuales || datosActuales.length === 0) return [];
        
        // Obtener la fecha más reciente
        const fechaMasReciente = new Date(Math.max(...datosActuales.map(d => new Date(d.fecha))));
        const fechaAnterior = new Date(fechaMasReciente);
        fechaAnterior.setDate(fechaAnterior.getDate() - 1);
        
        const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];
        
        // Obtener todos los datos y filtrar por fecha y fundo
        const todosDatos = this.datos || [];
        const datosFiltrados = this.filtrarDatosPorFundo(todosDatos);
        
        // Si estamos en "todos", devolver todos los del día anterior
        if (this.fundoSeleccionado === 'todos') {
            return datosFiltrados.filter(d => d.fecha === fechaAnteriorStr);
        } else {
            // Si estamos en un fundo específico, devolver solo ese fundo
            return datosFiltrados.filter(d => d.fecha === fechaAnteriorStr && d.fundo === this.fundoSeleccionado);
        }
    }

    /**
     * Actualizar tendencia
     */
    actualizarTendencia(id, tendencia) {
        const elemento = document.getElementById(id);
        if (elemento) {
            const simbolo = tendencia > 0 ? '⬆️' : tendencia < 0 ? '⬇️' : '➡️';
            elemento.textContent = `${simbolo} ${Math.abs(tendencia).toFixed(1)}%`;
            
            // Agregar clases de tendencia a la tarjeta KPI correspondiente
            this.actualizarClasesTendenciaTarjeta(id, tendencia);
        }
    }

    /**
     * Actualizar clases de tendencia en la tarjeta KPI
     */
    actualizarClasesTendenciaTarjeta(trendElementId, tendencia) {
        // Mapear ID del elemento de tendencia al ID de la tarjeta KPI
        const tarjetaKpiId = this.obtenerTarjetaKpiIdDesdeTrend(trendElementId);
        
        if (!tarjetaKpiId) return;
        
        const tarjetaElement = document.querySelector(`[data-kpi="${tarjetaKpiId}"]`);
        if (!tarjetaElement) return;
        
        // Remover todas las clases de tendencia
        tarjetaElement.classList.remove('trend-positive', 'trend-negative', 'trend-neutral');
        
        // Agregar la clase correspondiente según la tendencia
        if (tendencia > 0) {
            tarjetaElement.classList.add('trend-positive');
        } else if (tendencia < 0) {
            tarjetaElement.classList.add('trend-negative');
        } else {
            tarjetaElement.classList.add('trend-neutral');
        }
    }

    /**
     * Obtener ID de tarjeta KPI desde ID de elemento de tendencia
     */
    obtenerTarjetaKpiIdDesdeTrend(trendElementId) {
        const mapeo = {
            'trendLecheDiaria': 'lecheDiaria',
            'trendLitrosVacaDia': 'litrosVacaDia',
            'trendVacasOrdeña': 'vacasOrdeña', // Corregido: era vacasOrdeñaEvol
            'trendCostoDietaLitro': 'costoDietaLitro', // Corregido: era costoDieta
            'trendIngresoEstimado': 'ingresoEstimado',
            'trendCostoAlimentacion': 'costoAlimentacion',
            'trendMargenEstimado': 'margenEstimado',
            'trendStockUltimoDia': 'stockUltimoDia'
        };
        
        return mapeo[trendElementId] || null;
    }

    /**
     * Actualizar gráficos del dashboard
     */
    actualizarGraficos(datos) {
        // Usar todos los datos del rango de fechas seleccionado (ya filtrados)
        // En lugar de limitar a últimos 14 días
        
        // Actualizar cada gráfico evolutivo con todos los datos disponibles
        this.actualizarGraficoKPI('produccionDiaria', datos);
        this.actualizarGraficoKPI('concentradoDiario', datos);
        this.actualizarGraficoKPI('calidadLeche', datos);
        this.actualizarGraficoKPI('vacasOrdeñaEvol', datos);
        this.actualizarGraficoKPI('costoDieta', datos);
        this.actualizarGraficoKPI('stockDiario', datos);
        
        console.log(`📈 Gráficos actualizados con ${datos.length} puntos de datos`);
    }

    /**
     * Obtener datos de los últimos 14 días
     */
    obtenerUltimos14Dias(datos) {
        if (!datos || datos.length === 0) return [];
        
        // Ordenar por fecha
        const datosOrdenados = datos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        // Obtener últimos 14 días
        return datosOrdenados.slice(-14);
    }

    /**
     * Actualizar gráfico KPI específico
     */
    actualizarGraficoKPI(kpiId, datos) {
        const canvasElement = document.getElementById(`chart-kpi-${kpiId}`);
        if (!canvasElement) return;

        // Dibujar gráfico
        this.dibujarGraficoLineaKPI(canvasElement, datos, kpiId);
    }

    /**
     * Dibujar gráfico de línea para KPI
     */
    dibujarGraficoLineaKPI(canvas, datos, kpiId) {
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        // Limpiar canvas
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        if (!datos || datos.length === 0) return;

        // Configuración del gráfico
        const padding = { top: 20, right: 80, bottom: 50, left: 50 }; // Aumentado bottom de 30 a 50
        const graphWidth = rect.width - padding.left - padding.right;
        const graphHeight = rect.height - padding.top - padding.bottom;

        // Obtener valores según el KPI
        const valores = datos.map(d => this.extraerValorKPI(kpiId, d));
        const maxValue = Math.max(...valores) * 1.1;
        const minValue = 0;

        // Función para dibujar línea suave
        const drawSmoothLine = (valores, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            // Función auxiliar para interpolar Catmull-Rom
            const catmullRomInterpolate = (p0, p1, p2, p3, t) => {
                const t2 = t * t;
                const t3 = t2 * t;
                
                return {
                    x: 0.5 * (
                        2 * p1.x +
                        (-p0.x + p2.x) * t +
                        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
                    ),
                    y: 0.5 * (
                        2 * p1.y +
                        (-p0.y + p2.y) * t +
                        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
                    )
                };
            };

            // Convertir valores a puntos
            const points = valores.map((valor, i) => ({
                x: padding.left + (i / (valores.length - 1)) * graphWidth,
                y: padding.top + graphHeight - ((valor - minValue) / (maxValue - minValue)) * graphHeight
            }));

            // Dibujar curvas Catmull-Rom
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[Math.max(0, i - 1)];
                const p1 = points[i];
                const p2 = points[i + 1];
                const p3 = points[Math.min(points.length - 1, i + 2)];

                if (i === 0) {
                    ctx.moveTo(p1.x, p1.y);
                }

                // Dibujar segmento con múltiples puntos para suavidad
                const segments = 10; // Más segmentos = más suave
                for (let j = 0; j <= segments; j++) {
                    const t = j / segments;
                    const point = catmullRomInterpolate(p0, p1, p2, p3, t);
                    
                    if (i === 0 && j === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
            }

            ctx.stroke();
        };

        // Dibujar área bajo la línea
        const drawArea = (valores, color, alpha = 0.3) => {
            ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
            ctx.beginPath();

            valores.forEach((valor, i) => {
                const x = padding.left + (i / (valores.length - 1)) * graphWidth;
                const y = padding.top + graphHeight - ((valor - minValue) / (maxValue - minValue)) * graphHeight;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    const prevX = padding.left + ((i - 1) / (valores.length - 1)) * graphWidth;
                    const prevY = padding.top + graphHeight - ((valores[i - 1] - minValue) / (maxValue - minValue)) * graphHeight;
                    const cpX = (prevX + x) / 2;
                    ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
                    ctx.quadraticCurveTo(x, y, x, y);
                }
            });

            // Cerrar el área
            ctx.lineTo(padding.left + graphWidth, padding.top + graphHeight);
            ctx.lineTo(padding.left, padding.top + graphHeight);
            ctx.closePath();
            ctx.fill();
        };

        // Dibujar gráfico según el tipo de KPI
        if (kpiId === 'calidadLeche') {
            // Gráfico de área apilada para calidad
            this.dibujarGraficoAreaApilada(ctx, datos, rect, padding, graphWidth, graphHeight);
        } else if (kpiId === 'concentradoDiario') {
            // Gráfico de barras para concentrado
            this.dibujarGraficoBarras(ctx, valores, rect, padding, graphWidth, graphHeight, maxValue, datos);
        } else {
            // Gráfico de línea con área para otros KPIs
            const color = this.getColorKPI(kpiId);
            drawArea(valores, color);
            drawSmoothLine(valores, color);

            // Dibujar puntos con tamaño dinámico
            const puntoSize = valores.length > 100 ? 2 : valores.length > 50 ? 2.5 : 3;
            valores.forEach((valor, i) => {
                const x = padding.left + (i / (valores.length - 1)) * graphWidth;
                const y = padding.top + graphHeight - ((valor - minValue) / (maxValue - minValue)) * graphHeight;

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, puntoSize, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        // Dibujar ejes con valores y unidades
        this.dibujarEjes(ctx, padding, graphWidth, graphHeight, maxValue, kpiId, null, null, datos);

        // Dibujar etiqueta del último valor (solo para KPIs que no son calidadLeche)
        if (kpiId !== 'calidadLeche') {
            this.dibujarEtiquetaUltimoValor(ctx, valores, rect, padding, graphWidth, graphHeight, maxValue, kpiId);
        }

        // Dibujar leyenda abajo del gráfico
        try {
            this.dibujarLeyendaGrafico(ctx, rect, kpiId);
        } catch (error) {
            console.error('Error al dibujar leyenda:', error);
        }
    }

    /**
     * Dibujar etiqueta con el valor del último punto
     */
    dibujarEtiquetaUltimoValor(ctx, valores, rect, padding, graphWidth, graphHeight, maxValue, kpiId) {
        if (valores.length === 0) return;
        
        const ultimoValor = valores[valores.length - 1];
        const ultimoX = padding.left + graphWidth;
        const ultimoY = padding.top + graphHeight - ((ultimoValor - 0) / (maxValue - 0)) * graphHeight;
        
        // Formatear el valor según el KPI
        const valorFormateado = this.formatearValorEtiqueta(ultimoValor, kpiId);
        
        // Configurar estilo de la etiqueta
        ctx.font = 'bold 11px sans-serif';
        
        // Medir el texto para calcular el tamaño
        const texto = valorFormateado;
        const metrics = ctx.measureText(texto);
        const paddingEtiqueta = 4;
        const etiquetaWidth = metrics.width + paddingEtiqueta * 2;
        const etiquetaHeight = 16;
        
        // Posicionar siempre a la izquierda del punto
        const etiquetaX = ultimoX - etiquetaWidth - 8;
        const etiquetaY = ultimoY - etiquetaHeight / 2;
        
        // Fondo semi-transparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(etiquetaX, etiquetaY, etiquetaWidth, etiquetaHeight);
        
        // Borde sutil
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(etiquetaX, etiquetaY, etiquetaWidth, etiquetaHeight);
        
        // Texto del valor
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'left';
        ctx.fillText(texto, etiquetaX + paddingEtiqueta, etiquetaY + 11);
        
        // Restaurar alineación
        ctx.textAlign = 'left';
    }

    /**
     * Formatear valor para etiqueta
     */
    formatearValorEtiqueta(valor, kpiId) {
        if (kpiId === 'calidadLeche' || kpiId === 'proteina' || kpiId === 'grasa') {
            return `${valor.toFixed(1)}%`;
        } else if (kpiId === 'vacasOrdeñaEvol') {
            return Math.round(valor).toString();
        } else if (kpiId === 'costoDieta') {
            return `$${Math.round(valor)}`;
        } else if (kpiId === 'stockDiario') {
            return `${Math.round(valor)}kg`;
        } else if (kpiId === 'produccionDiaria') {
            return `${Math.round(valor)}L`;
        } else if (kpiId === 'concentradoDiario') {
            return `${Math.round(valor)}kg`;
        } else {
            return Math.round(valor).toString();
        }
    }

    /**
     * Dibujar gráfico de área apilada (para calidad de leche)
     */
    dibujarGraficoAreaApilada(ctx, datos, rect, padding, graphWidth, graphHeight) {
        // Obtener valores de proteína y grasa
        const valoresProteina = datos.map(d => this.extraerValorKPI('proteina', d));
        const valoresGrasa = datos.map(d => this.extraerValorKPI('grasa', d));
        
        if (valoresProteina.length === 0 || valoresGrasa.length === 0) return;
        
        // Para el dibujado: usar la suma (para apilamiento)
        const maxValueDibujo = Math.max(...valoresProteina.map((p, i) => p + valoresGrasa[i])) * 1.1;
        
        // Para la escala: usar el máximo individual (para valores correctos en eje Y)
        const maxValueEscala = Math.max(...valoresProteina, ...valoresGrasa) * 1.1;
        
        const minValue = 0;

        // Función para dibujar área apilada suave
        const drawSmoothStackedArea = (valoresBase, valoresTop, colorBase, colorTop, alphaBase, alphaTop) => {
            // Dibujar área base (grasa)
            ctx.fillStyle = colorBase.replace('rgb', 'rgba').replace(')', `, ${alphaBase})`);
            ctx.beginPath();

            valoresBase.forEach((valor, i) => {
                const x = padding.left + (i / (valoresBase.length - 1)) * graphWidth;
                const y = padding.top + graphHeight - ((valor - minValue) / (maxValueDibujo - minValue)) * graphHeight;

                if (i === 0) {
                    ctx.moveTo(x, padding.top + graphHeight);
                    ctx.lineTo(x, y);
                } else {
                    const prevX = padding.left + ((i - 1) / (valoresBase.length - 1)) * graphWidth;
                    const prevY = padding.top + graphHeight - ((valoresBase[i - 1] - minValue) / (maxValueDibujo - minValue)) * graphHeight;
                    const cpX = (prevX + x) / 2;
                    ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
                    ctx.quadraticCurveTo(x, y, x, y);
                }
            });

            ctx.lineTo(padding.left + graphWidth, padding.top + graphHeight);
            ctx.lineTo(padding.left, padding.top + graphHeight);
            ctx.closePath();
            ctx.fill();

            // Dibujar área superior (proteína) apilada sobre la base
            ctx.fillStyle = colorTop.replace('rgb', 'rgba').replace(')', `, ${alphaTop})`);
            ctx.beginPath();

            // Primero dibujar la línea superior del área apilada
            valoresTop.forEach((valor, i) => {
                const x = padding.left + (i / (valoresTop.length - 1)) * graphWidth;
                const valorBase = valoresBase[i] || 0;
                const valorTotal = valor + valorBase;
                const y = padding.top + graphHeight - ((valorTotal - minValue) / (maxValueDibujo - minValue)) * graphHeight;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    const prevX = padding.left + ((i - 1) / (valoresTop.length - 1)) * graphWidth;
                    const prevValorBase = valoresBase[i - 1] || 0;
                    const prevValorTotal = valoresTop[i - 1] + prevValorBase;
                    const prevY = padding.top + graphHeight - ((prevValorTotal - minValue) / (maxValueDibujo - minValue)) * graphHeight;
                    const cpX = (prevX + x) / 2;
                    ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
                    ctx.quadraticCurveTo(x, y, x, y);
                }
            });

            // Cerrar el área superior: ir hasta el borde inferior derecho, luego borde inferior izquierdo, y cerrar
            const lastX = padding.left + graphWidth;
            const lastValorBase = valoresBase[valoresBase.length - 1] || 0;
            const lastY = padding.top + graphHeight - ((lastValorBase - minValue) / (maxValueDibujo - minValue)) * graphHeight;
            
            // Línea desde el último punto superior hasta la base en el borde derecho
            ctx.lineTo(lastX, lastY);
            
            // Línea a lo largo de la base hasta el borde izquierdo
            const firstBaseY = padding.top + graphHeight - (((valoresBase[0] || 0) - minValue) / (maxValueDibujo - minValue)) * graphHeight;
            ctx.lineTo(padding.left, firstBaseY);
            
            ctx.closePath();
            ctx.fill();
        };

        // Dibujar áreas apiladas
        drawSmoothStackedArea(valoresGrasa, valoresProteina, 'rgb(251, 146, 60)', 'rgb(99, 102, 241)', 0.6, 0.8);

        // Dibujar líneas superiores
        this.dibujarLineaSuperiorApilada(ctx, valoresProteina, 'rgb(99, 102, 241)', padding, graphWidth, graphHeight, maxValueDibujo, valoresGrasa);
        this.dibujarLineaSuperiorApilada(ctx, valoresGrasa, 'rgb(251, 146, 60)', padding, graphWidth, graphHeight, maxValueDibujo);

        // Dibujar puntos para proteína
        this.dibujarPuntosDatosApilados(ctx, valoresProteina, 'rgb(99, 102, 241)', padding, graphWidth, graphHeight, maxValueDibujo, valoresGrasa);

        // Dibujar ejes con valores correctos
        // Para calidadLeche, usar maxValueDibujo para mostrar valores consistentes con el apilamiento
        const maxValueParaEjes = maxValueDibujo; // Siempre es calidadLeche en esta función
        this.dibujarEjes(ctx, padding, graphWidth, graphHeight, maxValueParaEjes, 'calidadLeche', valoresProteina, valoresGrasa);

        // Dibujar etiquetas de los últimos valores para proteína y grasa
        this.dibujarEtiquetaUltimoValorApilado(ctx, valoresProteina, valoresGrasa, rect, padding, graphWidth, graphHeight, maxValueDibujo);

        // Dibujar leyenda al final para que no se sobrescriba
        this.dibujarLeyendaCalidad(ctx, rect);
    }

    /**
     * Dibujar etiquetas para gráfico de área apilada
     */
    dibujarEtiquetaUltimoValorApilado(ctx, valoresProteina, valoresGrasa, rect, padding, graphWidth, graphHeight, maxValue) {
        if (valoresProteina.length === 0 || valoresGrasa.length === 0) return;
        
        const ultimoIndice = valoresProteina.length - 1;
        const ultimoX = padding.left + graphWidth;
        
        // Etiqueta de proteína (en la altura del valor total)
        const valorProteina = valoresProteina[ultimoIndice];
        const valorGrasa = valoresGrasa[ultimoIndice];
        const valorTotal = valorProteina + valorGrasa;
        
        const yProteina = padding.top + graphHeight - ((valorTotal - 0) / (maxValue - 0)) * graphHeight;
        this.dibujarEtiquetaEnPosicion(ctx, valorProteina, ultimoX, yProteina, 'proteina');
        
        // Etiqueta de grasa (en la altura del valor de grasa)
        const yGrasa = padding.top + graphHeight - ((valorGrasa - 0) / (maxValue - 0)) * graphHeight;
        this.dibujarEtiquetaEnPosicion(ctx, valorGrasa, ultimoX, yGrasa, 'grasa');
    }

    /**
     * Dibujar etiqueta en una posición específica
     */
    dibujarEtiquetaEnPosicion(ctx, valor, x, y, kpiId) {
        // Formatear el valor según el KPI
        const valorFormateado = this.formatearValorEtiqueta(valor, kpiId);
        
        // Configurar estilo de la etiqueta
        ctx.font = 'bold 11px sans-serif';
        
        // Medir el texto para calcular el tamaño
        const texto = valorFormateado;
        const metrics = ctx.measureText(texto);
        const paddingEtiqueta = 4;
        const etiquetaWidth = metrics.width + paddingEtiqueta * 2;
        const etiquetaHeight = 16;
        
        // Posicionar siempre a la izquierda del punto
        const etiquetaX = x - etiquetaWidth - 8;
        const etiquetaY = y - etiquetaHeight / 2;
        
        // Fondo semi-transparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(etiquetaX, etiquetaY, etiquetaWidth, etiquetaHeight);
        
        // Borde sutil
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(etiquetaX, etiquetaY, etiquetaWidth, etiquetaHeight);
        
        // Texto del valor
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'left';
        ctx.fillText(texto, etiquetaX + paddingEtiqueta, etiquetaY + 11);
        
        // Restaurar alineación
        ctx.textAlign = 'left';
    }

    /**
     * Dibujar leyenda para gráfico de calidad
     */
    dibujarLeyendaCalidad(ctx, rect) {
        // Calcular posición centrada en la parte superior con separación
        const anchoTotal = 120; // Ancho total de ambas leyendas + separación
        const startX = (rect.width - anchoTotal) / 2;
        
        // Leyenda para Proteína (centrada en la parte superior)
        ctx.fillStyle = 'rgb(99, 102, 241)';
        ctx.fillRect(startX, 8, 12, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.fillText('Proteína', startX + 15, 17);
        
        // Leyenda para Grasa (centrada en la parte superior con más separación)
        ctx.fillStyle = 'rgb(251, 146, 60)';
        ctx.fillRect(startX + 65, 8, 12, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Grasa', startX + 80, 17);
    }

    /**
     * Dibujar línea superior para gráfico apilado
     */
    dibujarLineaSuperiorApilada(ctx, valores, color, padding, graphWidth, graphHeight, maxValue, valoresBase = null) {
        const minValue = 0;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        valores.forEach((valor, i) => {
            const x = padding.left + (i / (valores.length - 1)) * graphWidth;
            let y;
            
            if (valoresBase && valoresBase[i] !== undefined) {
                // Para gráfico apilado: valor total = valor + valorBase
                const valorTotal = valor + valoresBase[i];
                y = padding.top + graphHeight - ((valorTotal - minValue) / (maxValue - minValue)) * graphHeight;
            } else {
                // Para gráfico normal
                y = padding.top + graphHeight - ((valor - minValue) / (maxValue - minValue)) * graphHeight;
            }

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                const prevX = padding.left + ((i - 1) / (valores.length - 1)) * graphWidth;
                let prevY;
                
                if (valoresBase && valoresBase[i - 1] !== undefined) {
                    const prevValorTotal = valores[i - 1] + valoresBase[i - 1];
                    prevY = padding.top + graphHeight - ((prevValorTotal - minValue) / (maxValue - minValue)) * graphHeight;
                } else {
                    prevY = padding.top + graphHeight - ((valores[i - 1] - minValue) / (maxValue - minValue)) * graphHeight;
                }
                
                var cpX = (prevX + x) / 2;
                ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
                ctx.quadraticCurveTo(x, y, x, y);
            }
        });

        ctx.stroke();
    }

    /**
     * Dibujar puntos de datos para gráfico apilado
     */
    dibujarPuntosDatosApilados(ctx, valores, color, padding, graphWidth, graphHeight, maxValue, valoresBase = null) {
        const minValue = 0;
        
        valores.forEach((valor, i) => {
            const x = padding.left + (i / (valores.length - 1)) * graphWidth;
            let y;
            
            if (valoresBase && valoresBase[i] !== undefined) {
                // Para gráfico apilado: valor total = valor + valorBase
                const valorTotal = valor + valoresBase[i];
                y = padding.top + graphHeight - ((valorTotal - minValue) / (maxValue - minValue)) * graphHeight;
            } else {
                // Para gráfico normal
                y = padding.top + graphHeight - ((valor - minValue) / (maxValue - minValue)) * graphHeight;
            }

            // Dibujar punto
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Borde blanco para mejor visibilidad
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    /**
     * Dibujar gráfico de línea con área
     */
    dibujarGraficoLineaArea(ctx, datos, rect, padding, graphWidth, graphHeight, kpiId) {
        const valores = datos.map(d => this.extraerValorKPI(kpiId, d));
        
        if (valores.length === 0) return;
        
        const maxValue = Math.max(...valores) * 1.1;
        const minValue = 0;
        const color = this.getColorKPI(kpiId);
        
        // Dibujar área bajo la línea
        const drawArea = (valores, color, alpha = 0.3) => {
            ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
            ctx.beginPath();

            valores.forEach((valor, i) => {
                const x = padding.left + (i / (valores.length - 1)) * graphWidth;
                const y = padding.top + graphHeight - ((valor - minValue) / (maxValue - minValue)) * graphHeight;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    const prevX = padding.left + ((i - 1) / (valores.length - 1)) * graphWidth;
                    const prevY = padding.top + graphHeight - ((valores[i - 1] - minValue) / (maxValue - minValue)) * graphHeight;
                    const cpX = (prevX + x) / 2;
                    ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
                    ctx.quadraticCurveTo(x, y, x, y);
                }
            });

            // Cerrar el área
            ctx.lineTo(padding.left + graphWidth, padding.top + graphHeight);
            ctx.lineTo(padding.left, padding.top + graphHeight);
            ctx.closePath();
            ctx.fill();
        };

        // Dibujar línea suave
        if (kpiId === 'calidadLeche') {
            // Gráfico de área apilada para calidad
            this.dibujarGraficoAreaApilada(ctx, datos, rect, padding, graphWidth, graphHeight);
        } else if (kpiId === 'concentradoDiario') {
            // Gráfico de barras para concentrado
            this.dibujarGraficoBarras(ctx, valores, rect, padding, graphWidth, graphHeight, maxValue, datos);
        } else {
            // Gráfico de línea con área para otros KPIs
            drawArea(valores, color);
            drawSmoothLine(valores, color);

            // Dibujar puntos
            valores.forEach((valor, i) => {
                const x = padding.left + (i / (valores.length - 1)) * graphWidth;
                const y = padding.top + graphHeight - ((valor - minValue) / (maxValue - minValue)) * graphHeight;

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        // Dibujar ejes
        this.dibujarEjes(ctx, padding, graphWidth, graphHeight, maxValue, kpiId);

        // Dibujar leyenda abajo del gráfico
        try {
            this.dibujarLeyendaGrafico(ctx, rect, kpiId);
        } catch (error) {
            console.error('Error al dibujar leyenda:', error);
        }
    }

    /**
     * Dibujar leyenda abajo del gráfico
     */
    dibujarLeyendaGrafico(ctx, rect, kpiId) {
        const nombresKPI = {
            'produccionDiaria': 'Leche Diaria',
            'concentradoDiario': 'Concentrado Diario',
            'calidadLeche': 'Calidad de Leche',
            'vacasOrdeñaEvol': 'Vacas en Ordeña',
            'costoDieta': 'Costo de Dieta',
            'stockDiario': 'Stock de Alimento'
        };

        const nombre = nombresKPI[kpiId] || kpiId;
        
        // Posicionar leyenda abajo del gráfico
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(nombre, rect.width / 2, rect.height - 5);
        ctx.textAlign = 'left'; // Restaurar alineación
    }

    /**
     * Dibujar gráfico de barras
     */
    dibujarGraficoBarras(ctx, valores, rect, padding, graphWidth, graphHeight, maxValue, datos) {
        const minValue = 0;
        const barWidth = graphWidth / valores.length * 0.7;
        const barSpacing = graphWidth / valores.length * 0.3;

        valores.forEach((valor, i) => {
            const x = padding.left + i * (barWidth + barSpacing) + barSpacing / 2;
            const barHeight = ((valor - minValue) / (maxValue - minValue)) * graphHeight;
            const y = padding.top + graphHeight - barHeight;

            // Gradiente para barras
            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, 'rgb(251, 146, 60)');
            gradient.addColorStop(1, 'rgb(154, 52, 18)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
        });

        // Dibujar ejes
        this.dibujarEjes(ctx, padding, graphWidth, graphHeight, maxValue, 'concentradoDiario', null, null, datos);

        // Dibujar etiqueta del último valor
        this.dibujarEtiquetaUltimoValor(ctx, valores, rect, padding, graphWidth, graphHeight, maxValue, 'concentradoDiario');

        // Dibujar leyenda abajo del gráfico
        this.dibujarLeyendaGrafico(ctx, rect, 'concentradoDiario');
    }

    /**
     * Dibujar ejes del gráfico con valores y unidades
     */
    dibujarEjes(ctx, padding, graphWidth, graphHeight, maxValue = null, kpiId = null, valoresProteina = null, valoresGrasa = null, datos = null) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px sans-serif';
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + graphHeight);
        ctx.lineTo(padding.left + graphWidth, padding.top + graphHeight);
        ctx.stroke();
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + graphHeight);
        ctx.stroke();
        
        // Obtener unidad para el eje Y
        const unidad = this.obtenerUnidadKPI(kpiId);
        
        // Líneas horizontales de guía con valores
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (i / 4) * graphHeight;
            
            // Línea de guía
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + graphWidth, y);
            ctx.stroke();
            
            // Valor en el eje Y con unidad
            if (maxValue !== null) {
                let value;
                if (kpiId === 'calidadLeche' && valoresGrasa) {
                    // Para calidadLeche, mostrar solo valores de grasa
                    const indice = Math.floor((i / 4) * (valoresGrasa.length - 1));
                    value = valoresGrasa[indice] || 0;
                } else {
                    value = maxValue * (1 - i / 4);
                }
                const formattedValue = this.formatearValorEje(value, kpiId);
                ctx.fillText(formattedValue, padding.left - 35, y + 3);
            }
        }
        
        // Etiqueta de unidad en el eje Y
        if (unidad && maxValue !== null) {
            ctx.save();
            ctx.translate(padding.left - 50, padding.top + graphHeight / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(unidad, 0, 0);
            ctx.restore();
        }
        
        // Valores en el eje X (fechas)
        if (kpiId && datos && datos.length > 0) {
            console.log('Dibujando fechas para KPI:', kpiId, 'con', datos.length, 'datos');
            console.log('Primer dato:', datos[0]);
            
            // Ajustar dinámicamente la cantidad de fechas mostradas
            let maxFechas = 5; // Por defecto
            if (datos.length <= 10) {
                maxFechas = datos.length; // Mostrar todas si son pocas
            } else if (datos.length <= 30) {
                maxFechas = Math.ceil(datos.length / 3); // 1 de cada 3
            } else if (datos.length <= 90) {
                maxFechas = Math.ceil(datos.length / 7); // 1 por semana
            } else {
                maxFechas = Math.ceil(datos.length / 15); // 1 cada 15 días
            }
            
            const step = Math.max(1, Math.floor(datos.length / maxFechas));
            console.log('Step para fechas:', step, 'mostrando', Math.ceil(datos.length / step), 'fechas');
            
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 1.0)'; // Máximo brillo
            ctx.font = 'bold 11px sans-serif'; // Más grande y en negrita
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top'; // Alineación superior
            
            for (let i = 0; i < datos.length; i += step) {
                const x = padding.left + (i / (datos.length - 1)) * graphWidth;
                const fecha = new Date(datos[i].fecha);
                const fechaStr = `${fecha.getDate()}/${fecha.getMonth() + 1}`;
                console.log(`Fecha ${i}:`, fechaStr, 'en x:', x);
                
                // Dibujar rectángulo de fondo para mayor visibilidad
                const textWidth = ctx.measureText(fechaStr).width;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(x - textWidth/2 - 2, padding.top + graphHeight + 22, textWidth + 4, 16);
                
                // Dibujar el texto
                ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
                ctx.fillText(fechaStr, x, padding.top + graphHeight + 25);
            }
            
            ctx.restore();
        } else {
            console.log('No se dibujan fechas. kpiId:', kpiId, 'datos:', datos);
        }
        
        // Etiqueta del eje X
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Fecha', padding.left + graphWidth / 2, padding.top + graphHeight + 35);
        ctx.restore();
    }

    /**
     * Obtener unidad para KPI
     */
    obtenerUnidadKPI(kpiId) {
        const unidades = {
            'produccionDiaria': 'Litros',
            'concentradoDiario': 'kg',
            'calidadLeche': '%',
            'vacasOrdeñaEvol': 'Vacas',
            'costoDieta': '$',
            'stockDiario': 'kg'
        };
        return unidades[kpiId] || '';
    }

    /**
     * Formatear valor para eje Y
     */
    formatearValorEje(value, kpiId) {
        if (kpiId === 'calidadLeche') {
            // Para calidadLeche, mostrar el valor total apilado
            return `${value.toFixed(1)}%`;
        } else if (kpiId === 'vacasOrdeñaEvol') {
            return Math.round(value).toString();
        } else if (kpiId === 'costoDieta') {
            return `$${Math.round(value)}`;
        } else if (kpiId === 'stockDiario') {
            return `${Math.round(value)}kg`;
        } else {
            return Math.round(value).toString();
        }
    }

    /**
     * Obtener color para KPI
     */
    getColorKPI(kpiId) {
        const colors = {
            'produccionDiaria': 'rgb(99, 102, 241)',
            'concentradoDiario': 'rgb(251, 146, 60)',
            'vacasOrdeñaEvol': 'rgb(34, 197, 94)',
            'costoDieta': 'rgb(239, 68, 68)',
            'stockDiario': 'rgb(168, 85, 247)',
            'calidadLeche': 'rgb(99, 102, 241)'
        };
        return colors[kpiId] || 'rgb(99, 102, 241)';
    }

    /**
     * Extraer valor de KPI desde dato
     */
    extraerValorKPI(kpiId, dato) {
        const kpiMappings = {
            'produccionDiaria': 'lecheDiaria',
            'kpiProduccionDiaria': 'lecheDiaria',
            'concentradoDiario': 'concentradoDiario',
            'kpiConcentradoDiario': 'concentradoDiario',
            'calidadLeche': 'proteina',
            'kpiCalidadLeche': 'proteina',
            'proteina': 'proteina',
            'kpiProteina': 'proteina',
            'grasa': 'grasa',
            'kpiGrasa': 'grasa',
            'vacasOrdeñaEvol': 'vacasOrdeña',
            'kpiVacasOrdeñaEvol': 'vacasOrdeña',
            'costoDieta': 'costoDieta',
            'kpiCostoDieta': 'costoDieta',
            'stockDiario': 'stockDiario',
            'kpiStockDiario': 'stockDiario',
            'stockUltimoDia': 'stockDiario',
            'kpiStockUltimoDia': 'stockDiario',
            'lecheDiaria': 'lecheDiaria',
            'kpiLecheDiaria': 'lecheDiaria',
            'litrosVacaDia': 'litrosVacaDia',
            'kpiLitrosVacaDia': 'litrosVacaDia',
            'vacasOrdeña': 'vacasOrdeña',
            'kpiVacasOrdeña': 'vacasOrdeña'
        };
        
        const campo = kpiMappings[kpiId];
        const valor = campo ? (dato[campo] || 0) : 0;
        
        return valor;
    }

    /**
     * Obtener stock del día anterior
     */
    obtenerStockDiaAnterior(datos, fechaActual) {
        if (!datos || datos.length === 0) return null;
        
        const fechaActualDate = new Date(fechaActual);
        const fechaAnteriorDate = new Date(fechaActualDate);
        fechaAnteriorDate.setDate(fechaAnteriorDate.getDate() - 1);
        
        const fechaAnteriorStr = fechaAnteriorDate.toISOString().split('T')[0];
        
        // Filtrar datos según el fundo seleccionado
        const datosFiltrados = this.filtrarDatosPorFundo(datos);
        
        // Buscar registro del día anterior
        const registroAnterior = datosFiltrados.find(d => d.fecha === fechaAnteriorStr);
        
        return registroAnterior ? (registroAnterior.stockDiario || 0) : null;
    }

    /**
     * Obtener el registro más reciente
     */
    obtenerRegistroMasReciente(datos) {
        if (!datos || datos.length === 0) return null;
        
        // Filtrar datos según el fundo seleccionado
        const datosFiltrados = this.filtrarDatosPorFundo(datos);
        
        if (datosFiltrados.length === 0) return null;
        
        // Ordenar por fecha y obtener el más reciente
        return datosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
    }

    /**
     * Mostrar estado vacío
     */
    mostrarEstadoVacio() {
        console.log('📊 Mostrando estado vacío del dashboard');
        
        // Actualizar todos los KPIs con valores por defecto
        const kpis = [
            'kpiLecheDiaria', 'kpiLitrosVacaDia', 'kpiVacasOrdeña', 'kpiCalidadLeche',
            'kpiConcentradoDiario', 'kpiCostoDietaLitro', 'kpiCostoDieta', 'kpiCostoAlimentacion',
            'kpiIngresoEstimado', 'kpiMargenEstimado', 'kpiProduccionDiaria', 'kpiVacasOrdeñaEvol'
        ];
        
        kpis.forEach(id => {
            this.actualizarKPI(id, '0');
        });
    }

    /**
     * Generar alertas basadas en los datos
     */
    generarAlertas(datos) {
        this.alertas = [];
        
        if (!datos || datos.length === 0) return;
        
        // Obtener los últimos 7 días para alertas recientes
        const ultimos7Dias = datos.slice(-7);
        const diaActual = ultimos7Dias[ultimos7Dias.length - 1];
        
        // Alerta de producción baja
        if (diaActual.lecheDiaria < 800) {
            this.alertas.push({
                tipo: 'warning',
                titulo: 'Producción por debajo del objetivo',
                mensaje: `La producción diaria de ${diaActual.lecheDiaria}L está un ${Math.round((1 - diaActual.lecheDiaria/1000) * 100)}% por debajo del objetivo`,
                fecha: diaActual.fecha,
                fundo: diaActual.fundo
            });
        }
        
        // Alerta de stock crítico
        if (diaActual.stockDiario < 100) {
            this.alertas.push({
                tipo: 'danger',
                titulo: 'Stock crítico de alimento',
                mensaje: `Quedan solo ${diaActual.stockDiario}kg de alimento, suficiente para ${Math.round(diaActual.stockDiario/diaActual.concentradoDiario)} días`,
                fecha: diaActual.fecha,
                fundo: diaActual.fundo
            });
        }
        
        // Alerta de calidad baja
        if (diaActual.proteina < 3.0 || diaActual.grasa < 3.5) {
            this.alertas.push({
                tipo: 'warning',
                titulo: 'Calidad de leche por debajo del estándar',
                mensaje: `Proteína: ${diaActual.proteina.toFixed(1)}%, Grasa: ${diaActual.grasa.toFixed(1)}% - Valores por debajo del estándar de calidad`,
                fecha: diaActual.fecha,
                fundo: diaActual.fundo
            });
        }
        
        // Alerta de costo elevado
        if (diaActual.costoDietaLitro > 0.15) {
            this.alertas.push({
                tipo: 'info',
                titulo: 'Costo de dieta elevado',
                mensaje: `El costo por litro de $${diaActual.costoDietaLitro.toFixed(3)} está por encima del óptimo`,
                fecha: diaActual.fecha,
                fundo: diaActual.fundo
            });
        }
        
        // Alerta de éxito en producción
        if (diaActual.lecheDiaria > 1200) {
            this.alertas.push({
                tipo: 'success',
                titulo: '¡Excelente producción!',
                mensaje: `Producción récord de ${diaActual.lecheDiaria}L, superando el objetivo en ${Math.round((diaActual.lecheDiaria/1000 - 1) * 100)}%`,
                fecha: diaActual.fecha,
                fundo: diaActual.fundo
            });
        }
        
        // Alerta de tendencia negativa (comparación con hace 3 días)
        if (ultimos7Dias.length >= 4) {
            const hace3Dias = ultimos7Dias[ultimos7Dias.length - 4];
            const variacion = ((diaActual.lecheDiaria - hace3Dias.lecheDiaria) / hace3Dias.lecheDiaria) * 100;
            
            if (variacion < -10) {
                this.alertas.push({
                    tipo: 'warning',
                    titulo: 'Tendencia de producción negativa',
                    mensaje: `La producción ha disminuido un ${Math.abs(variacion).toFixed(1)}% en los últimos 3 días`,
                    fecha: diaActual.fecha,
                    fundo: diaActual.fundo
                });
            }
        }
        
        console.log(`📊 Generadas ${this.alertas.length} alertas`);
    }

    /**
     * Mostrar alertas en el dashboard
     */
    mostrarAlertas() {
        const alertsContainer = document.querySelector('.alerts-container');
        if (!alertsContainer) return;
        
        if (this.alertas.length === 0) {
            alertsContainer.innerHTML = `
                <h3>🔔 Alertas</h3>
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <p>No hay alertas activas</p>
                </div>
            `;
            return;
        }
        
        const alertsHTML = this.alertas.map(alerta => `
            <div class="alert-item ${alerta.tipo}">
                <div class="alert-icon">
                    ${alerta.tipo === 'danger' ? '🚨' : 
                      alerta.tipo === 'warning' ? '⚠️' : 
                      alerta.tipo === 'success' ? '✅' : 'ℹ️'}
                </div>
                <div class="alert-content">
                    <h4>${alerta.titulo}</h4>
                    <p>${alerta.mensaje}</p>
                    <div class="alert-meta">
                        ${alerta.fundo} • ${new Date(alerta.fecha).toLocaleDateString('es-CL')}
                    </div>
                </div>
            </div>
        `).join('');
        
        alertsContainer.innerHTML = `
            <h3>🔔 Alertas</h3>
            <div class="alerts-list">
                ${alertsHTML}
            </div>
        `;
    }

    /**
     * Inicializar selector de fechas con el rango completo de datos
     */
    inicializarSelectorFechas() {
        if (!this.datosOriginales || this.datosOriginales.length === 0) return;
        
        const fechaInicio = new Date(this.datosOriginales[0].fecha);
        const fechaFin = new Date(this.datosOriginales[this.datosOriginales.length - 1].fecha);
        
        const inputInicio = document.getElementById('fechaInicio');
        const inputFin = document.getElementById('fechaFin');
        
        if (inputInicio && inputFin) {
            inputInicio.value = fechaInicio.toISOString().split('T')[0];
            inputFin.value = fechaFin.toISOString().split('T')[0];
            
            this.fechaInicio = inputInicio.value;
            this.fechaFin = inputFin.value;
            
            console.log(`📅 Selector de fechas inicializado: ${this.fechaInicio} a ${this.fechaFin}`);
        }
    }

    /**
     * Aplicar filtros de fundo y fechas
     */
    aplicarFiltros(datos) {
        let datosFiltrados = [...datos];
        
        // Filtrar por fundo
        if (this.fundoSeleccionado !== 'todos') {
            datosFiltrados = datosFiltrados.filter(d => d.fundo === this.fundoSeleccionado);
        }
        
        // Filtrar por rango de fechas
        if (this.fechaInicio && this.fechaFin) {
            const inicio = new Date(this.fechaInicio);
            const fin = new Date(this.fechaFin);
            fin.setHours(23, 59, 59, 999); // Incluir todo el día final
            
            datosFiltrados = datosFiltrados.filter(d => {
                const fecha = new Date(d.fecha);
                return fecha >= inicio && fecha <= fin;
            });
        }
        
        return datosFiltrados;
    }

    /**
     * Filtrar por fechas seleccionadas
     */
    filtrarPorFechas() {
        const inputInicio = document.getElementById('fechaInicio');
        const inputFin = document.getElementById('fechaFin');
        
        if (inputInicio && inputFin) {
            this.fechaInicio = inputInicio.value;
            this.fechaFin = inputFin.value;
            
            // Validar que la fecha de inicio no sea mayor que la de fin
            if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
                // Intercambiar fechas si están en orden incorrecto
                const temp = this.fechaInicio;
                this.fechaInicio = this.fechaFin;
                this.fechaFin = temp;
                inputInicio.value = this.fechaInicio;
                inputFin.value = this.fechaFin;
            }
            
            console.log(`📅 Filtrando por fechas: ${this.fechaInicio} a ${this.fechaFin}`);
            this.actualizarDashboard();
        }
    }

    /**
     * Resetear fechas al rango completo
     */
    resetearFechas() {
        this.inicializarSelectorFechas();
        console.log('📅 Fechas reseteadas al rango completo');
        this.actualizarDashboard();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DashboardModule = DashboardModule;
}
