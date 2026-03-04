// Dashboard Module - Visualización de KPIs y alertas
class DashboardModule {
    constructor() {
        this.charts = {};
        this.alertas = [];
        this.actualizacionIntervalo = null;
    }

    async init() {
        try {
            console.log('🚀 Inicializando módulo de dashboard...');
            
            await this.cargarDatos();
            this.setupAutoActualizacion();
            
            // Escuchar eventos de actualización de datos
            window.addEventListener('datosActualizados', () => {
                console.log('🔄 Dashboard recibió evento datosActualizados');
                this.cargarDatos();
            });
            
            console.log('✅ Módulo de dashboard inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar módulo de dashboard:', error);
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

    async cargarDatos() {
        try {
            const datos = StorageUtils.getDatos();
            
            if (datos.length === 0) {
                this.mostrarEstadoVacio();
                return;
            }

            // Actualizar selector de fundos
            this.actualizarSelectorFundos(datos);
            
            // Filtrar datos según el fundo seleccionado
            const datosFiltrados = this.filtrarDatosPorFundo(datos);
            
            // Actualizar KPIs
            this.actualizarKPIs(datosFiltrados);
            
            // Crear gráficos
            await this.crearGraficos(datosFiltrados);
            
            // Detectar y mostrar alertas
            await this.detectarYMostrarAlertas(datosFiltrados);
            
        } catch (error) {
            console.error('❌ Error al cargar datos del dashboard:', error);
        }
    }

    mostrarEstadoVacio() {
        const kpis = document.querySelectorAll('.kpi-value');
        kpis.forEach(kpi => {
            kpi.textContent = '0';
        });

        const trends = document.querySelectorAll('.kpi-trend');
        trends.forEach(trend => {
            trend.textContent = '➡️ 0%';
        });

        // Mostrar mensaje en contenedor de alertas
        const alertasContainer = document.getElementById('alertasContainer');
        if (alertasContainer) {
            alertasContainer.innerHTML = `
                <div class="alert-item info">
                    <div class="alert-icon">ℹ️</div>
                    <div class="alert-content">
                        <strong>No hay datos disponibles</strong>
                        <p>Comienza cargando datos en la sección de Carga de Datos</p>
                    </div>
                </div>
            `;
        }
    }

    actualizarKPIs(datos) {
        // Obtener el fundo seleccionado
        const fundoSeleccionado = document.getElementById('fundoDashboard')?.value || 'todos';
        
        if (fundoSeleccionado === 'todos') {
            // Para "todos los fundos", mostrar el promedio del día más reciente de cada fundo
            this.actualizarKPIsTodosFundos(datos);
        } else {
            // Para un fundo específico, mostrar el dato más reciente de ese fundo
            this.actualizarKPIsFundoEspecifico(datos, fundoSeleccionado);
        }
    }

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
        const produccionTotal = datosRecientesPorFundo.reduce((sum, d) => sum + (d.lecheTotal || 0), 0);
        const produccionPromedio = produccionTotal / datosRecientesPorFundo.length;
        this.actualizarKPI('kpiProduccionDiaria', `${produccionPromedio.toFixed(1)} L`);

        // Leche planta acumulado mensual (sumar todos los datos del mes más reciente con datos)
        const mesActual = new Date().toISOString().substring(0, 7); // YYYY-MM
        console.log('🔍 Debug - mesActual:', mesActual);
        
        // Buscar el mes más reciente con datos
        const mesesConDatos = [...new Set(datos.map(d => d.fecha.substring(0, 7)))].sort().reverse();
        const mesMasReciente = mesesConDatos[0] || mesActual;
        console.log('🔍 Debug - mesMasReciente:', mesMasReciente);
        
        const datosMesActual = datos.filter(d => d.fecha.substring(0, 7) === mesMasReciente);
        console.log('🔍 Debug - datosMesActual.length:', datosMesActual.length);
        const lechePlantaAcumulado = datosMesActual.reduce((sum, d) => sum + (d.lechePlanta || 0), 0);
        console.log('🔍 Debug - lechePlantaAcumulado:', lechePlantaAcumulado);
        this.actualizarKPI('kpiLechePlanta', `${lechePlantaAcumulado.toFixed(0)} L`);

        // B) Rebaño / Base productiva
        const vacasTotal = datosRecientesPorFundo.reduce((sum, d) => sum + (d.totalOrdeña || d.vacasEstanque || 0), 0);
        const vacasEntrantes = datosRecientesPorFundo.reduce((sum, d) => sum + (d.ingresoVacas || 0), 0);
        const vacasSalientes = datosRecientesPorFundo.reduce((sum, d) => sum + (d.salidaVacas || 0), 0);
        const vacasSecas = datosRecientesPorFundo.reduce((sum, d) => sum + (d.vacasSecas || 0), 0);
        
        this.actualizarKPI('kpiTotalVacas', vacasTotal);
        this.actualizarKPI('kpiVacasEntrantes', vacasEntrantes);
        this.actualizarKPI('kpiVacasSalientes', vacasSalientes);
        this.actualizarKPI('kpiVacasSecas', vacasSecas);

        // C) Eficiencia productiva
        const promedioGeneral = vacasTotal > 0 ? produccionTotal / vacasTotal : 0;
        const lecheDiariaTotal = datosRecientesPorFundo.reduce((sum, d) => sum + (d.totalLecheDiaria || 0), 0);
        const lecheDiariaPromedio = lecheDiariaTotal / datosRecientesPorFundo.length;
        
        this.actualizarKPI('kpiLitrosVacaDia', `${promedioGeneral.toFixed(1)} L`);
        this.actualizarKPI('kpiLecheDiaria', `${lecheDiariaPromedio.toFixed(1)} L`);

        // D) Calidad / Sólidos (valores simulados para ejemplo)
        const proteinaPromedio = 3.2; // % típico
        const grasaPromedio = 3.8; // % típico
        
        this.actualizarKPI('kpiProteina', `${proteinaPromedio.toFixed(1)}%`);
        this.actualizarKPI('kpiGrasa', `${grasaPromedio.toFixed(1)}%`);

        // E) Costos de alimentación
        const costoTotalDiario = datosRecientesPorFundo.reduce((sum, d) => sum + (d.costoAlimentacion || 0), 0);
        const costoDiariaLitro = produccionTotal > 0 ? costoTotalDiario / produccionTotal : 0;
        const costoDiariaVaca = vacasTotal > 0 ? costoTotalDiario / vacasTotal : 0;
        const costoTotalPromedio = costoTotalDiario / datosRecientesPorFundo.length;
        
        this.actualizarKPI('kpiCostoDiariaLitro', `$${costoDiariaLitro.toFixed(2)}`);
        this.actualizarKPI('kpiCostoDiariaVaca', `$${costoDiariaVaca.toFixed(2)}`);
        this.actualizarKPI('kpiCostoTotalDiario', `$${costoTotalPromedio.toFixed(0)}`);

        // F) Consumos de dieta
        const concentradoTotal = datosRecientesPorFundo.reduce((sum, d) => sum + (d.kilosEnergia || 0), 0);
        const ensilajeTotal = datosRecientesPorFundo.reduce((sum, d) => sum + (d.kilosEnsilaje || 0), 0);
        const otrosForrajesTotal = datosRecientesPorFundo.reduce((sum, d) => sum + (d.kilosOtrosForrajes || 0), 0);
        const salesAditivosTotal = datosRecientesPorFundo.reduce((sum, d) => sum + (d.kilosSalesOtros || 0), 0);
        const fibraTotal = datosRecientesPorFundo.reduce((sum, d) => sum + (d.kilosProteina || 0), 0);
        const siloVaca = vacasTotal > 0 ? ensilajeTotal / vacasTotal : 0;
        
        this.actualizarKPI('kpiConcentrado', `${(concentradoTotal / datosRecientesPorFundo.length).toFixed(1)} kg`);
        this.actualizarKPI('kpiEnsilaje', `${(ensilajeTotal / datosRecientesPorFundo.length).toFixed(1)} kg`);
        this.actualizarKPI('kpiOtrosForrajes', `${(otrosForrajesTotal / datosRecientesPorFundo.length).toFixed(1)} kg`);
        this.actualizarKPI('kpiSalesAditivos', `${(salesAditivosTotal / datosRecientesPorFundo.length).toFixed(1)} kg`);
        this.actualizarKPI('kpiFibra', `${(fibraTotal / datosRecientesPorFundo.length).toFixed(1)} kg`);
        this.actualizarKPI('kpiSiloVaca', `${siloVaca.toFixed(1)} kg`);

        // Para "Todos los Fundos" no calcular tendencias (son datos agregados)
        // Solo mostrar tendencia neutra para todos los KPIs
        this.actualizarTendencia('trendProduccion', 0);
        this.actualizarTendencia('trendLechePlanta', 0);
        this.actualizarTendencia('trendTotalVacas', 0);
        this.actualizarTendencia('trendVacasEntrantes', 0);
        this.actualizarTendencia('trendVacasSalientes', 0);
        this.actualizarTendencia('trendVacasSecas', 0);
        this.actualizarTendencia('trendLitrosVacaDia', 0);
        this.actualizarTendencia('trendLecheDiaria', 0);
        this.actualizarTendencia('trendProteina', 0);
        this.actualizarTendencia('trendGrasa', 0);
        this.actualizarTendencia('trendCostoDiariaLitro', 0);
        this.actualizarTendencia('trendCostoDiariaVaca', 0);
        this.actualizarTendencia('trendCostoTotalDiario', 0);
        this.actualizarTendencia('trendConcentrado', 0);
        this.actualizarTendencia('trendEnsilaje', 0);
        this.actualizarTendencia('trendOtrosForrajes', 0);
        this.actualizarTendencia('trendSalesAditivos', 0);
        this.actualizarTendencia('trendFibra', 0);
        this.actualizarTendencia('trendSiloVaca', 0);
    }

    actualizarKPIsFundoEspecifico(datos, fundoSeleccionado) {
        // Filtrar datos del fundo específico
        const datosFiltrados = datos.filter(d => d.fundo === fundoSeleccionado);
        
        if (datosFiltrados.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        // Obtener el dato más reciente del fundo
        const datosOrdenados = datosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        const datoDiario = datosOrdenados[0];

        // Obtener promedio de los últimos 7 días (excluyendo el día actual)
        const datosUltimos7Dias = datosOrdenados.slice(1, 8); // Saltar el primero (día actual)
        
        // Producción total diaria
        const produccionDiaria = datoDiario.lecheTotal || 0;
        this.actualizarKPI('kpiProduccionDiaria', `${produccionDiaria.toFixed(1)} L`);

        // Leche planta acumulado mensual para este fundo (mes más reciente con datos)
        const mesActual = new Date().toISOString().substring(0, 7); // YYYY-MM
        console.log('🔍 Debug - fundoSeleccionado:', fundoSeleccionado, 'mesActual:', mesActual);
        
        // Buscar el mes más reciente con datos para este fundo
        const mesesConDatosFundo = [...new Set(datosFiltrados.map(d => d.fecha.substring(0, 7)))].sort().reverse();
        const mesMasRecienteFundo = mesesConDatosFundo[0] || mesActual;
        console.log('🔍 Debug - mesMasRecienteFundo:', mesMasRecienteFundo);
        
        const datosMesActualFundo = datosFiltrados.filter(d => d.fecha.substring(0, 7) === mesMasRecienteFundo);
        console.log('🔍 Debug - datosMesActualFundo.length:', datosMesActualFundo.length);
        const lechePlantaAcumuladoFundo = datosMesActualFundo.reduce((sum, d) => sum + (d.lechePlanta || 0), 0);
        console.log('🔍 Debug - lechePlantaAcumuladoFundo:', lechePlantaAcumuladoFundo);
        this.actualizarKPI('kpiLechePlanta', `${lechePlantaAcumuladoFundo.toFixed(0)} L`);

        // Vacas en ordeña (Total vacas)
        const vacasDiario = datoDiario.totalOrdeña || datoDiario.vacasEstanque || 0;
        this.actualizarKPI('kpiTotalVacas', vacasDiario);

        // Otros KPIs del rebaño (último valor ingresado)
        this.actualizarKPI('kpiVacasEntrantes', datoDiario.ingresoVacas || 0);
        this.actualizarKPI('kpiVacasSalientes', datoDiario.salidaVacas || 0);
        this.actualizarKPI('kpiVacasSecas', datoDiario.vacasSecas || 0);

        // Promedio por vaca (Litros/vaca día)
        const promedioPorVacaDiario = vacasDiario > 0 ? (produccionDiaria / vacasDiario).toFixed(1) : 0;
        this.actualizarKPI('kpiLitrosVacaDia', `${promedioPorVacaDiario} L`);

        // Total forrajes día
        const forrajesDiario = datoDiario.totalDia || 
            (datoDiario.kilosEnsilaje || 0) + (datoDiario.kilosHeno || 0) + 
            (datoDiario.kilosOtrosForrajes || 0) + (datoDiario.kilosRacion || 0);
        this.actualizarKPI('kpiCostoAnimal', `${forrajesDiario.toFixed(1)} kg`);

        // Actualizar tendencias comparando con promedio de últimos 7 días
        this.actualizarTendenciasDiarias(datoDiario, datosUltimos7Dias);
    }

    actualizarSelectorFundos(datos) {
        const selector = document.getElementById('fundoDashboard');
        if (!selector) return;

        // Obtener fundos únicos
        const fundos = [...new Set(datos.map(d => d.fundo).filter(f => f))];
        
        // Guardar selección actual
        const seleccionActual = selector.value;
        
        // Limpiar opciones (mantener "Todos los Fundos")
        selector.innerHTML = '<option value="todos">Todos los Fundos</option>';
        
        // Agregar opciones de fundos
        fundos.forEach(fundo => {
            const option = document.createElement('option');
            option.value = fundo;
            option.textContent = fundo;
            selector.appendChild(option);
        });
        
        // Restaurar selección si existe
        if (fundos.includes(seleccionActual)) {
            selector.value = seleccionActual;
        }
    }

    filtrarPorFundo(fundoSeleccionado) {
        const datos = StorageUtils.getDatos();
        
        // Debug: Buscar datos específicos de Dollinco 28/3/26
        const datosDollinco = datos.filter(d => d.fundo === 'Dollinco' && d.fecha === '2026-03-28');
        console.log('🔍 Datos Dollinco 28/3/26:', datosDollinco);
        if (datosDollinco.length > 0) {
            console.log('📊 Vacas entrantes:', datosDollinco[0].ingresoVacas || 0);
            console.log('📊 Vacas salientes:', datosDollinco[0].salidaVacas || 0);
        }
        
        // Actualizar KPIs con el fundo seleccionado específicamente
        if (fundoSeleccionado === 'todos') {
            this.actualizarKPIsTodosFundos(datos);
        } else {
            this.actualizarKPIsFundoEspecifico(datos, fundoSeleccionado);
        }
        
        // Actualizar gráficos con datos filtrados
        const datosFiltrados = this.filtrarDatosPorFundo(datos, fundoSeleccionado);
        this.crearGraficos(datosFiltrados);
        
        // Actualizar alertas
        this.detectarYMostrarAlertas(datosFiltrados);
    }

    filtrarDatosPorFundo(datos, fundoSeleccionado = null) {
        if (!fundoSeleccionado) {
            fundoSeleccionado = document.getElementById('fundoDashboard')?.value || 'todos';
        }
        
        if (fundoSeleccionado === 'todos') {
            return datos;
        }
        
        return datos.filter(d => d.fundo === fundoSeleccionado);
    }

    actualizarKPI(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    actualizarTendenciasDiarias(datoDiario, datosUltimos7Dias) {
        // Si no hay suficientes datos históricos, mostrar tendencia neutra
        if (datosUltimos7Dias.length === 0 || !datoDiario) {
            this.actualizarTendencia('trendProduccion', 0);
            this.actualizarTendencia('trendAnimales', 0);
            this.actualizarTendencia('trendMortalidad', 0);
            this.actualizarTendencia('trendCosto', 0);
            return;
        }

        // Calcular promedios de los últimos 7 días
        const promedioProduccion7Dias = datosUltimos7Dias.reduce((sum, d) => sum + (d.lecheTotal || 0), 0) / datosUltimos7Dias.length;
        const promedioVacas7Dias = datosUltimos7Dias.reduce((sum, d) => sum + (d.totalOrdeña || d.vacasEstanque || 0), 0) / datosUltimos7Dias.length;
        const promedioVacasEntrantes7Dias = datosUltimos7Dias.reduce((sum, d) => sum + (d.ingresoVacas || 0), 0) / datosUltimos7Dias.length;
        const promedioVacasSalientes7Dias = datosUltimos7Dias.reduce((sum, d) => sum + (d.salidaVacas || 0), 0) / datosUltimos7Dias.length;
        const promedioForrajes7Dias = datosUltimos7Dias.reduce((sum, d) => {
            return sum + (d.totalDia || (d.kilosEnsilaje || 0) + (d.kilosHeno || 0) + (d.kilosOtrosForrajes || 0) + (d.kilosRacion || 0));
        }, 0) / datosUltimos7Dias.length;

        // Valores del día actual
        console.log('🔍 Debug - datoDiario:', datoDiario);
        const produccionDiaria = datoDiario.lecheTotal || 0;
        const vacasDiario = datoDiario.totalOrdeña || datoDiario.vacasEstanque || 0;
        const vacasEntrantesDiario = datoDiario.ingresoVacas || 0;
        const vacasSalientesDiario = datoDiario.salidaVacas || 0;
        console.log('🔍 Debug - produccionDiaria:', produccionDiaria, 'vacasDiario:', vacasDiario);
        const forrajesDiario = datoDiario.totalDia || 
            (datoDiario.kilosEnsilaje || 0) + (datoDiario.kilosHeno || 0) + 
            (datoDiario.kilosOtrosForrajes || 0) + (datoDiario.kilosRacion || 0);

        // Validar que los valores sean números válidos
        if (typeof produccionDiaria !== 'number' || typeof vacasDiario !== 'number') {
            console.error('❌ Datos inválidos en actualizarTendenciasDiarias:', { produccionDiaria, vacasDiario });
            // Mostrar tendencia neutra para todos los KPIs
            this.actualizarTendencia('trendProduccion', 0);
            this.actualizarTendencia('trendLechePlanta', 0);
            this.actualizarTendencia('trendTotalVacas', 0);
            this.actualizarTendencia('trendVacasEntrantes', 0);
            this.actualizarTendencia('trendVacasSalientes', 0);
            this.actualizarTendencia('trendVacasSecas', 0);
            this.actualizarTendencia('trendLitrosVacaDia', 0);
            this.actualizarTendencia('trendLecheDiaria', 0);
            this.actualizarTendencia('trendProteina', 0);
            this.actualizarTendencia('trendGrasa', 0);
            this.actualizarTendencia('trendCostoDiariaLitro', 0);
            this.actualizarTendencia('trendCostoDiariaVaca', 0);
            this.actualizarTendencia('trendCostoTotalDiario', 0);
            this.actualizarTendencia('trendConcentrado', 0);
            this.actualizarTendencia('trendEnsilaje', 0);
            this.actualizarTendencia('trendOtrosForrajes', 0);
            this.actualizarTendencia('trendSalesAditivos', 0);
            this.actualizarTendencia('trendFibra', 0);
            this.actualizarTendencia('trendSiloVaca', 0);
            return;
        }

        // Calcular promedio por vaca
        const promedioPorVacaDiario = vacasDiario > 0 ? produccionDiaria / vacasDiario : 0;
        const promedioPorVaca7Dias = promedioVacas7Dias > 0 ? promedioProduccion7Dias / promedioVacas7Dias : 0;

        // Calcular variaciones porcentuales
        const variacionProduccion = promedioProduccion7Dias > 0 ? 
            ((produccionDiaria - promedioProduccion7Dias) / promedioProduccion7Dias * 100) : 0;
        const variacionVacas = promedioVacas7Dias > 0 ? 
            ((vacasDiario - promedioVacas7Dias) / promedioVacas7Dias * 100) : 0;
        const variacionVacasEntrantes = promedioVacasEntrantes7Dias > 0 ? 
            ((vacasEntrantesDiario - promedioVacasEntrantes7Dias) / promedioVacasEntrantes7Dias * 100) : 0;
        const variacionVacasSalientes = promedioVacasSalientes7Dias > 0 ? 
            ((vacasSalientesDiario - promedioVacasSalientes7Dias) / promedioVacasSalientes7Dias * 100) : 0;
        const variacionPromedio = promedioPorVaca7Dias > 0 ? 
            ((promedioPorVacaDiario - promedioPorVaca7Dias) / promedioPorVaca7Dias * 100) : 0;
        const variacionForrajes = promedioForrajes7Dias > 0 ? 
            ((forrajesDiario - promedioForrajes7Dias) / promedioForrajes7Dias * 100) : 0;

        // Actualizar tendencias para todos los KPIs
        this.actualizarTendencia('trendProduccion', variacionProduccion);
        this.actualizarTendencia('trendLechePlanta', variacionProduccion); // Misma tendencia que producción
        
        // Tendencias de rebaño
        this.actualizarTendencia('trendTotalVacas', variacionVacas);
        this.actualizarTendencia('trendVacasEntrantes', variacionVacasEntrantes);
        this.actualizarTendencia('trendVacasSalientes', variacionVacasSalientes);
        this.actualizarTendencia('trendVacasSecas', 0); // No se calcula tendencia para secas
        
        // Tendencias de eficiencia
        this.actualizarTendencia('trendLitrosVacaDia', variacionPromedio);
        this.actualizarTendencia('trendLecheDiaria', variacionProduccion); // Misma tendencia que producción
        
        // Tendencias de calidad (valores simulados, sin tendencia real)
        this.actualizarTendencia('trendProteina', 0);
        this.actualizarTendencia('trendGrasa', 0);
        
        // Tendencias de costos (simuladas)
        this.actualizarTendencia('trendCostoDiariaLitro', 0);
        this.actualizarTendencia('trendCostoDiariaVaca', 0);
        this.actualizarTendencia('trendCostoTotalDiario', 0);
        
        // Tendencias de consumos
        this.actualizarTendencia('trendConcentrado', 0);
        this.actualizarTendencia('trendEnsilaje', variacionForrajes);
        this.actualizarTendencia('trendOtrosForrajes', 0);
        this.actualizarTendencia('trendSalesAditivos', 0);
        this.actualizarTendencia('trendFibra', 0);
        this.actualizarTendencia('trendSiloVaca', variacionForrajes);
    }

    actualizarTendencias(datosActuales, datosAnteriores) {
        // Tendencia producción
        const tendenciaProduccion = CalculationUtils.calcularTendencia(datosActuales, datosAnteriores);
        this.actualizarTendencia('trendProduccion', tendenciaProduccion);

        // Tendencia vacas
        const totalVacasActuales = datosActuales.reduce((total, d) => total + (d.vacas?.totalOrdeña || 0), 0);
        const totalVacasAnteriores = datosAnteriores.reduce((total, d) => total + (d.vacas?.totalOrdeña || 0), 0);
        const promedioVacasActuales = datosActuales.length > 0 ? totalVacasActuales / datosActuales.length : 0;
        const promedioVacasAnteriores = datosAnteriores.length > 0 ? totalVacasAnteriores / datosAnteriores.length : 0;
        const tendenciaVacas = promedioVacasAnteriores > 0 ? 
            ((promedioVacasActuales - promedioVacasAnteriores) / promedioVacasAnteriores * 100).toFixed(1) : 0;
        this.actualizarTendencia('trendAnimales', tendenciaVacas);

        // Tendencia promedio por vaca
        const promedioActual = CalculationUtils.calcularPromedioPorVaca(datosActuales);
        const promedioAnterior = CalculationUtils.calcularPromedioPorVaca(datosAnteriores);
        const tendenciaPromedio = promedioAnterior > 0 ? 
            ((promedioActual - promedioAnterior) / promedioAnterior * 100).toFixed(1) : 0;
        this.actualizarTendencia('trendMortalidad', tendenciaPromedio);

        // Tendencia forrajes
        const totalForrajesActuales = datosActuales.reduce((total, d) => total + (d.forrajes?.totalDia || 0), 0);
        const totalForrajesAnteriores = datosAnteriores.reduce((total, d) => total + (d.forrajes?.totalDia || 0), 0);
        const promedioForrajesActuales = datosActuales.length > 0 ? totalForrajesActuales / datosActuales.length : 0;
        const promedioForrajesAnteriores = datosAnteriores.length > 0 ? totalForrajesAnteriores / datosAnteriores.length : 0;
        const tendenciaForrajes = promedioForrajesAnteriores > 0 ? 
            ((promedioForrajesActuales - promedioForrajesAnteriores) / promedioForrajesAnteriores * 100).toFixed(1) : 0;
        this.actualizarTendencia('trendCosto', tendenciaForrajes);
    }

    actualizarTendencia(id, tendencia) {
        const elemento = document.getElementById(id);
        if (!elemento) return;

        const valor = parseFloat(tendencia);
        let icono = '➡️';
        let clase = '';

        if (valor > 1) {
            icono = '📈';
            clase = 'positiva';
        } else if (valor < -1) {
            icono = '📉';
            clase = 'negativa';
        }

        elemento.textContent = `${icono} ${valor > 0 ? '+' : ''}${valor.toFixed(1)}%`;
        elemento.className = `kpi-trend ${clase}`;
    }

    async crearGraficos(datos) {
        // Destruir gráficos existentes
        Object.values(this.charts).forEach(chart => {
            ChartUtils.destruirGrafico(chart);
        });

        // Obtener datos para los últimos 7 días
        const datosRecientes = CalculationUtils.filtrarPorPeriodo(datos, 7);
        
        if (datosRecientes.length === 0) return;

        // Preparar datos para gráficos
        const labels = datosRecientes.map(d => {
            const fecha = new Date(d.fecha);
            return fecha.toLocaleDateString('es', { day: 'numeric', month: 'short' });
        });

        // Gráfico de producción
        const datosProduccion = datosRecientes.map(d => d.lecheTotal || 0);
        this.charts.produccion = ChartUtils.crearGraficoProduccion('chartProduccion', datosProduccion, labels);

        // Gráfico de alimentación
        const datosAlimentacion = {
            forrajes: datosRecientes.map(d => d.totalDia || 0),
            suplementos: datosRecientes.map(d => 
                (d.kilosEnergia || 0) + (d.kilosProteina || 0) + 
                (d.kilosAditivos || 0) + (d.kilosSalesOtros || 0)
            )
        };
        this.charts.alimentacion = ChartUtils.crearGraficoAlimentacion('chartAlimentacion', datosAlimentacion, labels);

        // Gráfico de evolución del rebaño
        const datosRebaño = {
            labels: labels,
            ordenia: datosRecientes.map(d => d.totalOrdeña || d.vacasEstanque || 0),
            total: datosRecientes.map(d => (d.totalOrdeña || d.vacasEstanque || 0) + (d.vacasDescarte || 0))
        };
        this.charts.rebaño = ChartUtils.crearGraficoRebaño('chartRebaño', datosRebaño);

        // Gráfico de distribución de costos
        const ultimoDato = datosRecientes[datosRecientes.length - 1];
        const datosDistribucion = {
            labels: ['Ensilaje', 'Heno', 'Ración', 'Otros Forrajes', 'Suplementos'],
            values: [
                ultimoDato.kilosEnsilaje || 0,
                ultimoDato.kilosHeno || 0,
                ultimoDato.kilosRacion || 0,
                ultimoDato.kilosOtrosForrajes || 0,
                (ultimoDato.kilosEnergia || 0) + (ultimoDato.kilosProteina || 0)
            ]
        };
        this.charts.distribucion = ChartUtils.crearGraficoDistribucion('chartDistribucion', datosDistribucion);
    }

    async detectarYMostrarAlertas(datos) {
        try {
            this.alertas = this.detectarAlertas(datos);
            this.mostrarAlertas();
        } catch (error) {
            console.error('❌ Error al detectar alertas:', error);
        }
    }

    detectarAlertas(datos) {
        const alertas = [];
        
        if (datos.length === 0) return alertas;

        // Detectar outliers en producción
        const outliersProduccion = CalculationUtils.detectarOutliers(datos, 'lecheTotal');
        outliersProduccion.forEach(dato => {
            alertas.push({
                tipo: 'warning',
                titulo: 'Producción Inusual',
                mensaje: `Producción de ${dato.lecheTotal}L en ${dato.fundo} fuera de rango normal`,
                fecha: dato.fecha,
                fundo: dato.fundo,
                icono: '⚠️'
            });
        });

        // Detectar producción baja
        const datosRecientes = CalculationUtils.filtrarPorPeriodo(datos, 3);
        const promedioReciente = CalculationUtils.calcularPromedioPorVaca(datosRecientes);
        
        if (promedioReciente < 10 && datosRecientes.length > 0) {
            alertas.push({
                tipo: 'danger',
                titulo: 'Producción Baja',
                mensaje: `El promedio de ${promedioReciente}L/vaca está por debajo del umbral recomendado`,
                fecha: new Date().toISOString().split('T')[0],
                icono: '🚨'
            });
        }

        // Detectar problemas en observaciones
        const palabrasClave = ['problema', 'enfermo', 'muerto', 'baja', 'urgente', 'emergencia'];
        datos.forEach(dato => {
            if (dato.observaciones) {
                const observacion = dato.observaciones.toLowerCase();
                palabrasClave.forEach(palabra => {
                    if (observacion.includes(palabra)) {
                        alertas.push({
                            tipo: 'danger',
                            titulo: 'Alerta Crítica',
                            mensaje: `Problema detectado: ${dato.observaciones.substring(0, 50)}...`,
                            fecha: dato.fecha,
                            fundo: dato.fundo,
                            icono: '🚨'
                        });
                    }
                });
            }
        });

        // Detectar buenas noticias
        const palabrasBuenas = ['excelente', 'mejor', 'record', 'óptimo', 'muy bueno'];
        datos.forEach(dato => {
            if (dato.observaciones) {
                const observacion = dato.observaciones.toLowerCase();
                palabrasBuenas.forEach(palabra => {
                    if (observacion.includes(palabra)) {
                        alertas.push({
                            tipo: 'success',
                            titulo: 'Buen Desempeño',
                            mensaje: dato.observaciones.substring(0, 50) + '...',
                            fecha: dato.fecha,
                            fundo: dato.fundo,
                            icono: '🎉'
                        });
                    }
                });
            }
        });

        // Ordenar alertas por tipo y fecha
        return alertas.sort((a, b) => {
            const prioridad = { danger: 3, warning: 2, success: 1, info: 0 };
            if (prioridad[a.tipo] !== prioridad[b.tipo]) {
                return prioridad[b.tipo] - prioridad[a.tipo];
            }
            return new Date(b.fecha) - new Date(a.fecha);
        }).slice(0, 10); // Limitar a 10 alertas más importantes
    }

    mostrarAlertas() {
        const container = document.getElementById('alertasContainer');
        if (!container) return;

        if (this.alertas.length === 0) {
            container.innerHTML = `
                <div class="alert-item info">
                    <div class="alert-icon">ℹ️</div>
                    <div class="alert-content">
                        <strong>Sin alertas</strong>
                        <p>No hay eventos importantes que reportar</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.alertas.map(alerta => `
            <div class="alert-item ${alerta.tipo}">
                <div class="alert-icon">${alerta.icono}</div>
                <div class="alert-content">
                    <strong>${alerta.titulo}</strong>
                    <p>${alerta.mensaje}</p>
                    <div class="alert-meta">
                        <small>${alerta.fundo || 'Global'} • ${new Date(alerta.fecha).toLocaleDateString('es')}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupAutoActualizacion() {
        // Actualizar cada 5 minutos
        this.actualizacionIntervalo = setInterval(() => {
            this.cargarDatos();
        }, 5 * 60 * 1000);
    }

    // Método para actualización manual
    async actualizar() {
        await this.cargarDatos();
        window.plataforma.mostrarNotificacion('✅ Dashboard actualizado', 'success');
    }

    // Exportar dashboard como imagen
    exportarDashboard() {
        // Implementar exportación de dashboard
        const dashboard = document.querySelector('.dashboard-layout');
        if (dashboard) {
            html2canvas(dashboard).then(canvas => {
                const link = document.createElement('a');
                link.download = `dashboard_${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL();
                link.click();
            });
        }
    }

    // Limpiar módulo
    destroy() {
        // Limpiar intervalo de actualización
        if (this.actualizacionIntervalo) {
            clearInterval(this.actualizacionIntervalo);
        }

        // Destruir gráficos
        Object.values(this.charts).forEach(chart => {
            ChartUtils.destruirGrafico(chart);
        });

        this.charts = {};
        this.alertas = [];
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DashboardModule = DashboardModule;
}
