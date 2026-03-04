// Benchmark Module - Comparación y análisis entre productores
class BenchmarkModule {
    constructor() {
        this.charts = {};
        this.datosBenchmark = [];
        this.periodoActual = 30;
        this.metricaActual = 'produccion';
    }

    async init() {
        try {
            console.log('🚀 Inicializando módulo de benchmark...');
            
            this.setupEventListeners();
            await this.cargarDatosBenchmark();
            await this.actualizarDatos();
            
            console.log('✅ Módulo de benchmark inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar módulo de benchmark:', error);
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
        // Cambio de período
        const periodSelect = document.getElementById('benchmarkPeriod');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.periodoActual = parseInt(e.target.value);
                this.actualizarDatos();
            });
        }

        // Cambio de métrica
        const metricSelect = document.getElementById('benchmarkMetric');
        if (metricSelect) {
            metricSelect.addEventListener('change', (e) => {
                this.metricaActual = e.target.value;
                this.actualizarDatos();
            });
        }
    }

    async cargarDatosBenchmark() {
        try {
            // Cargar datos del storage
            const datos = StorageUtils.getDatos();
            
            // Calcular métricas de benchmark
            this.datosBenchmark = CalculationUtils.calcularMetricasBenchmark(datos, this.periodoActual);
            
            console.log(`📊 Cargados ${this.datosBenchmark.length} productores para benchmark`);
        } catch (error) {
            console.error('❌ Error al cargar datos de benchmark:', error);
            this.datosBenchmark = [];
        }
    }

    async actualizarDatos() {
        try {
            // Recargar datos con el período actual
            await this.cargarDatosBenchmark();
            
            // Actualizar cada componente
            this.actualizarTablaRanking();
            this.actualizarGraficos();
            this.actualizarAnalisis();
            
            console.log('✅ Benchmark actualizado correctamente');
        } catch (error) {
            console.error('❌ Error al actualizar benchmark:', error);
            window.plataforma.mostrarNotificacion('❌ Error al actualizar benchmark', 'error');
        }
    }

    actualizarTablaRanking() {
        const tbody = document.getElementById('benchmarkTableBody');
        if (!tbody) return;

        if (this.datosBenchmark.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        No hay datos suficientes para el benchmark. Carga más datos para ver comparaciones.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.datosBenchmark.map((dato, index) => {
            const posicion = index + 1;
            const medalla = this.getMedalla(posicion);
            const tendencia = this.calcularTendencia(dato);
            const trendIcon = this.getTrendIcon(tendencia);
            
            return `
                <tr class="${posicion === 1 ? 'top-performer' : ''}">
                    <td class="posicion">
                        ${medalla} ${posicion}
                    </td>
                    <td class="fundo">
                        <strong>${dato.fundo}</strong>
                        ${posicion === 1 ? '<span class="leader-badge">Líder</span>' : ''}
                    </td>
                    <td class="metrica produccion">
                        ${dato.produccionDiaria} L
                        <small>/día</small>
                    </td>
                    <td class="metrica promedio">
                        ${dato.promedioVaca} L
                        <small>/vaca</small>
                    </td>
                    <td class="metrica vacas">
                        ${dato.totalVacas}
                    </td>
                    <td class="metrica forrajes">
                        ${dato.forrajesDiarios} kg
                        <small>/día</small>
                    </td>
                    <td class="metrica eficiencia">
                        ${dato.eficiencia}
                        <small>L/kg</small>
                    </td>
                    <td class="tendencia">
                        ${trendIcon} ${tendencia > 0 ? '+' : ''}${tendencia}%
                    </td>
                </tr>
            `;
        }).join('');
    }

    actualizarGraficos() {
        if (this.datosBenchmark.length === 0) return;

        // Destruir gráficos existentes
        Object.values(this.charts).forEach(chart => {
            ChartUtils.destruirGrafico(chart);
        });

        // Crear nuevos gráficos
        this.crearGraficoProduccion();
        this.crearGraficoEficiencia();
        this.crearGraficoForrajes();
        this.crearGraficoDistribucion();
    }

    crearGraficoProduccion() {
        const canvas = document.getElementById('benchmarkProduccionChart');
        if (!canvas || this.datosBenchmark.length === 0) return;

        this.charts.produccion = ChartUtils.crearGraficoBenchmark(
            'benchmarkProduccionChart',
            this.datosBenchmark,
            'produccionDiaria'
        );
    }

    crearGraficoEficiencia() {
        const canvas = document.getElementById('benchmarkEficienciaChart');
        if (!canvas || this.datosBenchmark.length === 0) return;

        this.charts.eficiencia = ChartUtils.crearGraficoBenchmark(
            'benchmarkEficienciaChart',
            this.datosBenchmark,
            'promedioVaca'
        );
    }

    crearGraficoForrajes() {
        const canvas = document.getElementById('benchmarkForrajesChart');
        if (!canvas || this.datosBenchmark.length === 0) return;

        this.charts.forrajes = ChartUtils.crearGraficoBenchmark(
            'benchmarkForrajesChart',
            this.datosBenchmark,
            'forrajesDiarios'
        );
    }

    crearGraficoDistribucion() {
        const canvas = document.getElementById('benchmarkDistribucionChart');
        if (!canvas || this.datosBenchmark.length === 0) return;

        // Preparar datos para gráfico de dona
        const datosDistribucion = {
            labels: this.datosBenchmark.map(d => d.fundo),
            values: this.datosBenchmark.map(d => parseFloat(d.produccionDiaria))
        };

        this.charts.distribucion = ChartUtils.crearGraficoDistribucion(
            'benchmarkDistribucionChart',
            datosDistribucion
        );
    }

    actualizarAnalisis() {
        if (this.datosBenchmark.length === 0) return;

        // Mejores prácticas
        this.actualizarMejoresPracticas();
        
        // Áreas de mejora
        this.actualizarAreasMejora();
        
        // Recomendaciones
        this.actualizarRecomendaciones();
    }

    actualizarMejoresPracticas() {
        const container = document.getElementById('mejoresPracticas');
        if (!container) return;

        const mejoresPracticas = CalculationUtils.calcularMejoresPracticas(this.datosBenchmark);
        
        container.innerHTML = mejoresPracticas.map(practica => `
            <div class="practica-item">
                <div class="practica-header">
                    <span class="practica-icono">${practica.icono}</span>
                    <div class="practica-info">
                        <strong>${practica.categoria}</strong>
                        <div class="practica-valor">${practica.valor} ${practica.unidad}</div>
                    </div>
                </div>
                <div class="practica-fundo">
                    <small>Líder: ${practica.fundo}</small>
                </div>
            </div>
        `).join('');
    }

    actualizarAreasMejora() {
        const container = document.getElementById('areasMejora');
        if (!container) return;

        // Obtener el fundo actual (del primer dato o configuración)
        const fundoActual = this.obtenerFundoActual();
        
        if (!fundoActual) {
            container.innerHTML = '<p>No hay datos suficientes para analizar áreas de mejora.</p>';
            return;
        }

        const areas = this.identificarAreasMejora(fundoActual);
        
        container.innerHTML = areas.map(area => `
            <div class="area-item ${area.prioridad}">
                <div class="area-header">
                    <span class="area-icono">${area.icono}</span>
                    <div class="area-info">
                        <strong>${area.categoria}</strong>
                        <div class="area-gap">Gap: ${area.gap}%</div>
                    </div>
                </div>
                <div class="area-descripcion">
                    <small>${area.descripcion}</small>
                </div>
            </div>
        `).join('');
    }

    actualizarRecomendaciones() {
        const container = document.getElementById('recomendaciones');
        if (!container) return;

        const fundoActual = this.obtenerFundoActual();
        
        if (!fundoActual) {
            container.innerHTML = '<p>Carga más datos para recibir recomendaciones personalizadas.</p>';
            return;
        }

        const recomendaciones = CalculationUtils.generarRecomendaciones(this.datosBenchmark, fundoActual);
        
        container.innerHTML = recomendaciones.map(rec => `
            <div class="recomendacion-item ${rec.prioridad}">
                <div class="recomendacion-header">
                    <span class="rec-prioridad">${rec.prioridad.toUpperCase()}</span>
                    <strong>${rec.accion}</strong>
                </div>
                <div class="recomendacion-contenido">
                    <p>${rec.mensaje}</p>
                </div>
            </div>
        `).join('');
    }

    // Métodos auxiliares
    getMedalla(posicion) {
        const medallas = {
            1: '🥇',
            2: '🥈',
            3: '🥉'
        };
        return medallas[posicion] || '';
    }

    calcularTendencia(dato) {
        // Simular tendencia (en producción real se calcularía con datos históricos)
        return Math.floor(Math.random() * 21) - 10; // -10 a +10
    }

    getTrendIcon(tendencia) {
        if (tendencia > 5) return '📈';
        if (tendencia < -5) return '📉';
        return '➡️';
    }

    obtenerFundoActual() {
        // Intentar obtener el fundo actual de los datos o configuración
        if (this.datosBenchmark.length > 0) {
            return this.datosBenchmark[0].fundo; // Por defecto, el primero
        }
        return null;
    }

    identificarAreasMejora(fundoActual) {
        const miMetrica = this.datosBenchmark.find(m => m.fundo === fundoActual);
        if (!miMetrica) return [];

        const topPerformer = this.datosBenchmark[0];
        const areas = [];

        // Producción
        const gapProduccion = ((topPerformer.produccionDiaria - miMetrica.produccionDiaria) / topPerformer.produccionDiaria * 100).toFixed(1);
        if (gapProduccion > 10) {
            areas.push({
                categoria: 'Producción',
                gap: gapProduccion,
                icono: '📈',
                prioridad: 'alta',
                descripcion: 'Tu producción está significativamente por debajo del líder'
            });
        }

        // Eficiencia
        const gapEficiencia = ((topPerformer.eficiencia - miMetrica.eficiencia) / topPerformer.eficiencia * 100).toFixed(1);
        if (gapEficiencia > 15) {
            areas.push({
                categoria: 'Eficiencia',
                gap: gapEficiencia,
                icono: '⚡',
                prioridad: 'media',
                descripcion: 'Puedes optimizar la conversión de alimento en leche'
            });
        }

        // Rendimiento
        const gapRendimiento = ((topPerformer.promedioVaca - miMetrica.promedioVaca) / topPerformer.promedioVaca * 100).toFixed(1);
        if (gapRendimiento > 12) {
            areas.push({
                categoria: 'Rendimiento',
                gap: gapRendimiento,
                icono: '🥛',
                prioridad: 'alta',
                descripcion: 'El rendimiento individual por vaca necesita mejorar'
            });
        }

        return areas.sort((a, b) => {
            const prioridades = { alta: 3, media: 2, baja: 1 };
            return prioridades[b.prioridad] - prioridades[a.prioridad];
        });
    }

    // Exportar datos de benchmark
    exportarBenchmark() {
        try {
            const datosExportar = {
                fecha: new Date().toISOString(),
                periodo: this.periodoActual,
                metrica: this.metricaActual,
                ranking: this.datosBenchmark,
                mejoresPracticas: CalculationUtils.calcularMejoresPracticas(this.datosBenchmark)
            };

            const blob = new Blob([JSON.stringify(datosExportar, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `benchmark_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            window.plataforma.mostrarNotificación('✅ Benchmark exportado correctamente', 'success');
        } catch (error) {
            console.error('❌ Error al exportar benchmark:', error);
            window.plataforma.mostrarNotificación('❌ Error al exportar benchmark', 'error');
        }
    }

    // Limpiar módulo
    destroy() {
        // Destruir gráficos
        Object.values(this.charts).forEach(chart => {
            ChartUtils.destruirGrafico(chart);
        });
        
        this.charts = {};
        this.datosBenchmark = [];
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.BenchmarkModule = BenchmarkModule;
}
