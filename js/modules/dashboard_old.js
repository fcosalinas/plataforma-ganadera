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
    async init() {
        console.log('📊 Dashboard Module init() llamado');
        try {
            await this.cargarDatos();
            this.inicializarEventos();
            console.log('📊 Dashboard Module inicializado completamente');
        } catch (error) {
            console.error('❌ Error en Dashboard Module init():', error);
        }
    }

    /**
     * Cargar datos desde API o localStorage
     */
    async cargarDatos() {
        try {
            console.log('📊 Dashboard: Cargando datos...');

            // Verificar si el backend está disponible
            if (window.plataforma && window.plataforma.backendAvailable) {
                console.log('📊 Dashboard: Cargando datos desde API...');
                try {
                    const response = await window.apiService.getDashboardData();
                    if (response.success && response.registros) {
                        this.datosOriginales = response.registros;
                        this.datos = [...this.datosOriginales];
                        console.log(`📊 Dashboard: Cargados ${this.datos.length} registros desde API`);
                        console.log('📊 Dashboard: Primer registro:', this.datos[0]);

                        // Actualizar selector de fundos con datos reales
                        this.actualizarSelectorFundos(response.porFundo);

                        this.inicializarSelectorFechas();
                        this.actualizarDashboard();
                        return;
                    }
                } catch (apiError) {
                    console.warn('⚠️ Error cargando desde API, usando fallback:', apiError.message);
                }
            }

            // Fallback a localStorage
            console.log('📊 Dashboard: Usando localStorage como fallback...');
            const datosGuardados = localStorage.getItem('plataformaGanaderaDatos');
            console.log('📊 Dashboard: datosGuardados =', datosGuardados ? 'EXISTE' : 'NULL');

            if (datosGuardados) {
                this.datosOriginales = JSON.parse(datosGuardados);
                this.datos = [...this.datosOriginales];
                console.log(`📊 Dashboard: Cargados ${this.datos.length} registros desde localStorage`);
                console.log('📊 Dashboard: Primer registro:', this.datos[0]);
                this.inicializarSelectorFechas();
                this.actualizarDashboard();
            } else {
                console.log('📊 Dashboard: No hay datos guardados');
                this.mostrarEstadoVacio();
            }
        } catch (error) {
            console.error('❌ Error en cargarDatos():', error);
            this.mostrarEstadoVacio();
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

        // datos.porFundo es un objeto con nombres de fundos como claves
        const fundos = datos ? Object.keys(datos) : [];
        
        // Si no hay fundos en porFundo, intentar extraer de los datos
        if (fundos.length === 0 && this.datosOriginales) {
            const fundosUnicos = [...new Set(this.datosOriginales.map(d => d.fundo?.nombre).filter(f => f))];
            fundos.push(...fundosUnicos);
        }
        
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
        
        console.log(`📊 Selector de fundos actualizado con: ${fundos.join(', ')}`);
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
        // Limpiar consola para mejor visualización
        console.clear();
        console.log('🔄 Dashboard actualizado - Consola limpiada');
        
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
        console.log(`📅 Rango seleccionado: ${this.fechaInicio} a ${this.fechaFin}`);
        console.log(`🏭 Fundo seleccionado: ${this.fundoSeleccionado === 'todos' ? 'Todos los fundos' : this.fundoSeleccionado}`);
    }

    /**
     * Actualizar KPIs del dashboard
     */
    actualizarKPIs(datos) {
        console.log(`🔍 actualizarKPIs llamado con ${datos.length} datos`);
        console.log(`🏭 Fundo seleccionado: "${this.fundoSeleccionado}"`);
        
        if (this.fundoSeleccionado === 'todos') {
            console.log(`📊 Llamando a actualizarKPIsTodosFundos`);
            this.actualizarKPIsTodosFundos(datos);
        } else {
            console.log(`📊 Llamando a actualizarKPIsFundoEspecifico con fundo: "${this.fundoSeleccionado}"`);
            this.actualizarKPIsFundoEspecifico(datos, this.fundoSeleccionado);
        }
        
        // Actualizar tabla de inventario
        this.actualizarTablaInventario(datos);
    }

    /**
     * Actualizar KPIs para todos los fundos
     */
    actualizarKPIsTodosFundos(datos) {
        if (!datos || datos.length === 0) return;
        
        console.log('📊 Datos recibidos para KPIs:', datos[0]);
        
        // Panel 1: Estado del Sistema (KPIs Críticos)
        const ultimoDia = datos[datos.length - 1];
        const penultimoDia = datos.length > 1 ? datos[datos.length - 2] : ultimoDia;
        
        // Mapear datos de MongoDB al formato esperado
        const mapearDatos = (registro) => ({
            lecheDiaria: registro.produccion?.litros || 0,
            vacasOrdeña: registro.vacas?.estanque || 0,
            costoDietaLitro: registro.economia?.costo_alimentacion ? 
                (registro.economia.costo_alimentacion / (registro.produccion?.litros || 1)) : 0,
            proteina: registro.produccion?.proteina || 0,
            grasa: registro.produccion?.grasa || 0,
            costoDieta: registro.economia?.costo_alimentacion || 0
        });
        
        const ultimoDiaMapeado = mapearDatos(ultimoDia);
        const penultimoDiaMapeado = mapearDatos(penultimoDia);
        
        console.log('📊 Datos mapeados:', ultimoDiaMapeado);
        
        // Producción total diaria
        const lecheDiaria = ultimoDiaMapeado.lecheDiaria || 0;
        document.getElementById('kpiLecheDiaria').textContent = `${lecheDiaria.toFixed(0)} L`;
        this.actualizarTrend('trendLecheDiaria', lecheDiaria, penultimoDiaMapeado.lecheDiaria || 0);
        
        // Litros por vaca día
        const litrosPorVaca = ultimoDiaMapeado.lecheDiaria / (ultimoDiaMapeado.vacasOrdeña || 1);
        const litrosPorVacaAnterior = penultimoDiaMapeado.lecheDiaria / (penultimoDiaMapeado.vacasOrdeña || 1);
        document.getElementById('kpiLitrosVacaDia').textContent = `${litrosPorVaca.toFixed(1)} L`;
        this.actualizarTrend('trendLitrosVacaDia', litrosPorVaca, litrosPorVacaAnterior);
        
        // Vacas en ordeña
        const vacasOrdeña = ultimoDiaMapeado.vacasOrdeña || 0;
        document.getElementById('kpiVacasOrdeña').textContent = vacasOrdeña.toFixed(0);
        this.actualizarTrend('trendVacasOrdeña', vacasOrdeña, penultimoDiaMapeado.vacasOrdeña || 0);
        
        // Costo dieta / litro
        const costoDietaLitro = ultimoDiaMapeado.costoDietaLitro || 0;
        document.getElementById('kpiCostoDietaLitro').textContent = `$${costoDietaLitro.toFixed(3)}`;
        this.actualizarTrend('trendCostoDietaLitro', costoDietaLitro, penultimoDiaMapeado.costoDietaLitro || 0);
        
        // % proteína - calcular promedio para "Todos los Fundos"
        const datosUltimaFecha = datos.filter(d => d.fecha === ultimoDia.fecha);
        const promedioProteina = datosUltimaFecha.reduce((sum, d) => sum + (d.produccion?.proteina || 0), 0) / datosUltimaFecha.length || 0;
        const promedioGrasa = datosUltimaFecha.reduce((sum, d) => sum + (d.produccion?.grasa || 0), 0) / datosUltimaFecha.length || 0;
        
        // Para trends, usar promedio del día anterior
        const datosPenultimaFecha = penultimoDia.fecha ? datos.filter(d => d.fecha === penultimoDia.fecha) : [];
        const promedioProteinaAnterior = datosPenultimaFecha.length > 0 ? 
            datosPenultimaFecha.reduce((sum, d) => sum + (d.produccion?.proteina || 0), 0) / datosPenultimaFecha.length : 
            promedioProteina;
        const promedioGrasaAnterior = datosPenultimaFecha.length > 0 ? 
            datosPenultimaFecha.reduce((sum, d) => sum + (d.produccion?.grasa || 0), 0) / datosPenultimaFecha.length : 
            promedioGrasa;
        
        console.log(`🔄 Proteína promedio: ${promedioProteina.toFixed(2)}, Grasa promedio: ${promedioGrasa.toFixed(2)}`);
        
        document.getElementById('kpiProteina').textContent = `${promedioProteina.toFixed(2)}%`;
        this.actualizarTrend('trendProteina', promedioProteina, promedioProteinaAnterior);
        
        // % grasa
        document.getElementById('kpiGrasa').textContent = `${promedioGrasa.toFixed(2)}%`;
        this.actualizarTrend('trendGrasa', promedioGrasa, promedioGrasaAnterior);
        
        // Panel 3: Alimentación
        // Costo dieta / vaca día
        const costoDietaVaca = ultimoDiaMapeado.costoDieta / (ultimoDiaMapeado.vacasOrdeña || 1);
        const costoDietaVacaAnterior = penultimoDiaMapeado.costoDieta / (penultimoDiaMapeado.vacasOrdeña || 1);
        document.getElementById('kpiCostoDietaVaca').textContent = `$${costoDietaVaca.toFixed(2)}`;
        this.actualizarTrend('trendCostoDietaVaca', costoDietaVaca, costoDietaVacaAnterior);
        
        // Costo total diario
        document.getElementById('kpiCostoTotalDiario').textContent = `$${ultimoDiaMapeado.costoDieta.toFixed(0)}`;
        this.actualizarTrend('trendCostoTotalDiario', ultimoDiaMapeado.costoDieta, penultimoDiaMapeado.costoDieta);
        
        // Panel 4: Calidad de Leche
        const calidadGeneral = (promedioProteina + promedioGrasa) / 2;
        const calidadGeneralAnterior = (promedioProteinaAnterior + promedioGrasaAnterior) / 2;
        document.getElementById('kpiCalidadLeche').textContent = `${calidadGeneral.toFixed(2)}%`;
        this.actualizarTrend('trendCalidadLeche', calidadGeneral, calidadGeneralAnterior);
        
        // Panel 5: Económico
        const precioLeche = 0.8; // Precio estimado por litro
        const ingresoEstimado = ultimoDiaMapeado.lecheDiaria * precioLeche;
        const ingresoEstimadoAnterior = penultimoDiaMapeado.lecheDiaria * precioLeche;
        document.getElementById('kpiIngresoEstimado').textContent = `$${ingresoEstimado.toFixed(0)}`;
        this.actualizarTrend('trendIngresoEstimado', ingresoEstimado, ingresoEstimadoAnterior);
        
        const costoAlimentacion = ultimoDiaMapeado.costoDieta;
        const costoAlimentacionAnterior = penultimoDiaMapeado.costoDieta;
        document.getElementById('kpiCostoAlimentacion').textContent = `$${costoAlimentacion.toFixed(0)}`;
        this.actualizarTrend('trendCostoAlimentacion', costoAlimentacion, costoAlimentacionAnterior);
        
        const margenEstimado = ingresoEstimado - costoAlimentacion;
        const margenEstimadoAnterior = ingresoEstimadoAnterior - costoAlimentacionAnterior;
        document.getElementById('kpiMargenEstimado').textContent = `$${margenEstimado.toFixed(0)}`;
        this.actualizarTrend('trendMargenEstimado', margenEstimado, margenEstimadoAnterior);
        
        const costoPorLitro = ultimoDiaMapeado.costoDietaLitro;
        const costoPorLitroAnterior = penultimoDiaMapeado.costoDietaLitro;
        document.getElementById('kpiCostoPorLitro').textContent = `$${costoPorLitro.toFixed(3)}`;
        this.actualizarTrend('trendCostoPorLitro', costoPorLitro, costoPorLitroAnterior);
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
            'trendProteina': 'depende-contexto',
            'trendGrasa': 'depende-contexto'
        };
        
        return perspectivas[elementId] || 'mas-es-mejor'; // Default: más es mejor
    }

    /**
     * Evaluar si el cambio es bueno según la perspectiva
     */
    evaluarCambioPerspectiva(cambio, perspectiva) {
        switch (perspectiva) {
            case 'mas-es-mejor':
                return cambio > 0; // Subir es bueno
                
            case 'menos-es-mejor':
                return cambio < 0; // Bajar es bueno
                
            case 'depende-contexto':
                // Para proteína y grasa, necesitamos valores óptimos
                return this.evaluarCalidadComponente(cambio);
                
            default:
                return cambio > 0; // Default: más es mejor
        }
    }

    /**
     * Evaluar cambios en componentes de calidad (proteína y grasa)
     */
    evaluarCalidadComponente(cambio) {
        // Para calidad, cambios pequeños son buenos, cambios grandes pueden ser malos
        const cambioAbsoluto = Math.abs(cambio);
        
        if (cambioAbsoluto < 0.5) {
            return cambio > 0; // Pequeños aumentos son buenos
        } else if (cambioAbsoluto > 2) {
            return cambio < 0; // Grandes cambios son malos
        } else {
            return true; // Cambios moderados son neutros positivos
        }
    }

    /**
     * Actualizar KPI con indicador de perspectiva
     */
    actualizarKPIConPerspectiva(elementId, valor, unidad, perspectiva = 'mas-es-mejor') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Formatear valor
        let valorFormateado;
        switch (unidad) {
            case 'litros':
                valorFormateado = `${valor.toFixed(0)} L`;
                break;
            case 'porcentaje':
                valorFormateado = `${valor.toFixed(2)}%`;
                break;
            case 'dias':
                valorFormateado = `${valor.toFixed(1)} días`;
                break;
            case 'dinero':
                valorFormateado = `$${valor.toFixed(2)}`;
                break;
            case 'unidades':
                valorFormateado = `${valor.toFixed(0)}`;
                break;
            default:
                valorFormateado = valor.toFixed(1);
        }
        
        element.textContent = valorFormateado;
        
        // Agregar indicador visual de perspectiva
        this.agregarIndicadorPerspectiva(element, valor, perspectiva);
    }

    /**
     * Agregar indicador visual de perspectiva
     */
    agregarIndicadorPerspectiva(element, valor, perspectiva) {
        // Remover indicadores anteriores
        const indicadorExistente = element.querySelector('.perspectiva-indicator');
        if (indicadorExistente) {
            indicadorExistente.remove();
        }
        
        // Crear indicador
        const indicador = document.createElement('span');
        indicador.className = 'perspectiva-indicator';
        
        // Determinar estado según perspectiva y valor
        let estado = this.evaluarEstadoPerspectiva(valor, perspectiva);
        let icono = this.getIconoPerspectiva(estado);
        let clase = this.getClasePerspectiva(estado);
        
        indicador.textContent = icono;
        indicador.className = `perspectiva-indicator ${clase}`;
        
        // Agregar tooltip con información de perspectiva
        indicador.title = this.getTooltipPerspectiva(perspectiva, estado);
        
        // Insertar después del valor
        element.appendChild(indicador);
    }

    /**
     * Evaluar estado según perspectiva y valor
     */
    evaluarEstadoPerspectiva(valor, perspectiva) {
        // Umbrales generales - estos pueden ser específicos por KPI
        const umbrales = {
            'mas-es-mejor': { bueno: 80, medio: 50 },
            'menos-es-mejor': { bueno: 20, medio: 50 },
            'depende-contexto': { bueno: 3.2, medio: 3.0 }
        };
        
        const umbral = umbrales[perspectiva] || umbrales['mas-es-mejor'];
        
        if (perspectiva === 'mas-es-mejor') {
            if (valor >= umbral.bueno) return 'excelente';
            if (valor >= umbral.medio) return 'bueno';
            return 'bajo';
        } else {
            if (valor <= umbral.bueno) return 'excelente';
            if (valor <= umbral.medio) return 'bueno';
            return 'alto';
        }
    }

    /**
     * Obtener icono según estado
     */
    getIconoPerspectiva(estado) {
        const iconos = {
            'excelente': '🟢',
            'bueno': '🟡',
            'bajo': '🔴',
            'alto': '🔴'
        };
        return iconos[estado] || '⚪';
    }

    /**
     * Obtener clase CSS según estado
     */
    getClasePerspectiva(estado) {
        const clases = {
            'excelente': 'perspectiva-excelente',
            'bueno': 'perspectiva-bueno',
            'bajo': 'perspectiva-bajo',
            'alto': 'perspectiva-alto'
        };
        return clases[estado] || 'perspectiva-neutro';
    }

    /**
     * Obtener tooltip de perspectiva
     */
    getTooltipPerspectiva(perspectiva, estado) {
        const mensajes = {
            'mas-es-mejor': {
                'excelente': 'Excelente: Valor muy alto (más es mejor)',
                'bueno': 'Bueno: Valor adecuado',
                'bajo': 'Bajo: Se necesita mejorar (más es mejor)'
            },
            'menos-es-mejor': {
                'excelente': 'Excelente: Valor muy bajo (menos es mejor)',
                'bueno': 'Bueno: Valor controlado',
                'alto': 'Alto: Se necesita reducir (menos es mejor)'
            },
            'depende-contexto': {
                'excelente': 'Excelente: Nivel óptimo',
                'bueno': 'Bueno: Nivel aceptable',
                'bajo': 'Bajo: Por debajo del óptimo',
                'alto': 'Alto: Por encima del óptimo'
            }
        };
        
        return mensajes[perspectiva]?.[estado] || 'Estado normal';
    }

    /**
     * Actualizar tabla de inventario
     */
    actualizarTablaInventario(datos) {
        console.log(`📦 Actualizando tabla de inventario con ${datos.length} datos`);
        
        if (!datos || datos.length === 0) {
            console.warn(`⚠️ No hay datos para actualizar tabla de inventario`);
            return;
        }
        
        const ultimoDia = datos[datos.length - 1];
        console.log(`📊 Último día de datos:`, ultimoDia);
        
        // Concentrado
        const stockConcentrado = ultimoDia.stockDiario;
        const consumoConcentrado = ultimoDia.concentradoDiario;
        const diasConcentrado = consumoConcentrado > 0 ? stockConcentrado / consumoConcentrado : 0;
        
        console.log(`🌾 Concentrado - Stock: ${stockConcentrado}, Consumo: ${consumoConcentrado}, Días: ${diasConcentrado}`);
        
        // Ensilaje Maíz
        const stockEnsilaje = stockConcentrado * 2; // Estimado: 2x el concentrado
        const consumoEnsilaje = consumoConcentrado * 3; // Estimado: 3x el concentrado
        const diasEnsilaje = consumoEnsilaje > 0 ? stockEnsilaje / consumoEnsilaje : 0;
        
        console.log(`🌽 Ensilaje - Stock: ${stockEnsilaje}, Consumo: ${consumoEnsilaje}, Días: ${diasEnsilaje}`);
        
        // Sales y Aditivos
        const stockSales = stockConcentrado * 0.1; // Estimado: 10% del concentrado
        const consumoSales = consumoConcentrado * 0.05; // Estimado: 5% del concentrado
        const diasSales = consumoSales > 0 ? stockSales / consumoSales : 0;
        
        console.log(`🧂 Sales - Stock: ${stockSales}, Consumo: ${consumoSales}, Días: ${diasSales}`);
        
        // Fibra
        const stockFibra = stockConcentrado * 1.5; // Estimado: 1.5x el concentrado
        const consumoFibra = consumoConcentrado * 2; // Estimado: 2x el concentrado
        const diasFibra = consumoFibra > 0 ? stockFibra / consumoFibra : 0;
        
        console.log(`🌾 Fibra - Stock: ${stockFibra}, Consumo: ${consumoFibra}, Días: ${diasFibra}`);
        
        // Actualizar tabla HTML
        this.actualizarHTMLInventario({
            concentrado: { stock: stockConcentrado, consumo: consumoConcentrado, dias: diasConcentrado },
            ensilaje: { stock: stockEnsilaje, consumo: consumoEnsilaje, dias: diasEnsilaje },
            sales: { stock: stockSales, consumo: consumoSales, dias: diasSales },
            fibra: { stock: stockFibra, consumo: consumoFibra, dias: diasFibra }
        });
        
        console.log(`✅ Tabla de inventario actualizada exitosamente`);
    }

    /**
     * Actualizar HTML de la tabla de inventario
     */
    actualizarHTMLInventario(datos) {
        console.log(`🔄 Actualizando HTML de inventario`);
        
        // Actualizar Concentrado
        this.actualizarItemInventario('concentrado', datos.concentrado);
        
        // Actualizar Ensilaje Maíz
        this.actualizarItemInventario('ensilaje', datos.ensilaje);
        
        // Actualizar Sales y Aditivos
        this.actualizarItemInventario('sales', datos.sales);
        
        // Actualizar Fibra
        this.actualizarItemInventario('fibra', datos.fibra);
        
        console.log(`✅ HTML de inventario actualizado`);
    }

    /**
     * Actualizar item individual de inventario
     */
    actualizarItemInventario(item, datos) {
        console.log(`📝 Actualizando item ${item}:`, datos);
        
        // Mapeo de IDs correctos según el HTML
        const idMap = {
            'concentrado': 'stockConcentrado',
            'ensilaje': 'stockEnsilaje', 
            'sales': 'stockSales',
            'fibra': 'stockFibra'
        };
        
        const stockId = idMap[item];
        const consumoId = stockId.replace('stock', 'consumo');
        const diasId = stockId.replace('stock', 'dias');
        const statusId = stockId.replace('stock', 'status');
        const progressId = stockId.replace('stock', 'progress');
        
        // Buscar elementos en la tarjeta
        const stockElement = document.getElementById(stockId);
        const consumoElement = document.getElementById(consumoId);
        const diasElement = document.getElementById(diasId);
        const statusElement = document.getElementById(statusId);
        const progressElement = document.getElementById(progressId);
        
        console.log(`🔍 Elementos encontrados - Stock: ${!!stockElement}, Consumo: ${!!consumoElement}, Días: ${!!diasElement}, Status: ${!!statusElement}, Progress: ${!!progressElement}`);
        
        // Valores por defecto si son undefined
        const stock = datos.stock || 0;
        const consumo = datos.consumo || 0;
        const dias = datos.dias || 0;
        
        if (stockElement) {
            stockElement.textContent = `${stock.toFixed(0)} kg`;
        }
        
        if (consumoElement) {
            consumoElement.textContent = `${consumo.toFixed(1)} kg`;
        }
        
        if (diasElement) {
            diasElement.textContent = `${dias.toFixed(1)} días`;
        }
        
        // Actualizar estado visual
        if (statusElement) {
            this.actualizarEstadoVisual(statusElement, dias);
        }
        
        // Actualizar barra de progreso
        if (progressElement) {
            this.actualizarBarraProgreso(progressElement, dias);
        }
    }

    /**
     * Actualizar estado visual con indicadores modernos
     */
    actualizarEstadoVisual(element, dias) {
        // Remover todas las clases de estado
        element.className = 'item-status';
        
        if (dias < 7) {
            element.classList.add('status-critical');
            element.textContent = '🔴 Crítico';
        } else if (dias < 14) {
            element.classList.add('status-medium');
            element.textContent = '🟡 Medio';
        } else {
            element.classList.add('status-good');
            element.textContent = '🟢 Bueno';
        }
    }

    /**
     * Actualizar barra de progreso visual
     */
    actualizarBarraProgreso(element, dias) {
        // Remover todas las clases de progreso
        element.className = 'progress-fill';
        
        // Calcular porcentaje (máximo 30 días = 100%)
        const porcentaje = Math.min((dias / 30) * 100, 100);
        element.style.width = porcentaje + '%';
        
        // Agregar clase según estado
        if (dias < 7) {
            element.classList.add('critical');
        } else if (dias < 14) {
            element.classList.add('medium');
        } else {
            element.classList.add('good');
        }
    }

    /**
     * Actualizar estado de stock con indicadores visuales
     */
    actualizarEstadoStock(elementId, dias) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Eliminar clases anteriores
        element.classList.remove('stock-normal', 'stock-bajo', 'stock-critico');
        
        if (dias >= 14) {
            element.classList.add('stock-normal');
        } else if (dias >= 7) {
            element.classList.add('stock-bajo');
        } else {
            element.classList.add('stock-critico');
        }
    }

    /**
     * Actualizar gráficos del dashboard
     */
    actualizarGraficos(datos) {
        console.log(`📈 Iniciando actualización de gráficos con ${datos.length} datos`);
        
        // Usar todos los datos del rango de fechas seleccionado (ya filtrados)
        // En lugar de limitar a últimos 14 días
        
        // Lista de todos los gráficos que deberían actualizarse
        const graficos = [
            'produccionDiaria',
            'litrosVacaDiaEvol', 
            'vacasOrdeñaEvol',
            'concentradoDiario',
            'costoDieta',
            'calidadEvol'
        ];
        
        console.log(`📊 Se intentarán actualizar ${graficos.length} gráficos: ${graficos.join(', ')}`);
        
        // Actualizar cada gráfico evolutivo con todos los datos disponibles
        graficos.forEach((kpiId, index) => {
            console.log(`🔄 (${index + 1}/${graficos.length}) Actualizando gráfico: ${kpiId}`);
            try {
                this.actualizarGraficoKPI(kpiId, datos);
                console.log(`✅ Gráfico ${kpiId} actualizado exitosamente`);
            } catch (error) {
                console.error(`❌ Error al actualizar gráfico ${kpiId}:`, error);
                console.error(`Stack trace:`, error.stack);
            }
        });
        
        console.log(`✅ Proceso de actualización de gráficos completado`);
    }

    /**
     * Actualizar gráfico KPI específico
     */
    actualizarGraficoKPI(kpiId, datos) {
        console.log(`🔍 INICIO - Actualizando gráfico ${kpiId} con ${datos.length} datos`);
        
        const canvas = document.getElementById(`chart${kpiId.charAt(0).toUpperCase() + kpiId.slice(1)}`);
        if (!canvas) {
            console.error(`❌ Canvas no encontrado: chart${kpiId.charAt(0).toUpperCase() + kpiId.slice(1)}`);
            return;
        }
        
        console.log(`✅ Canvas encontrado para ${kpiId}`);
        console.log(`📏 Dimensiones HTML: ${canvas.width}x${canvas.height}`);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error(`❌ No se pudo obtener contexto 2D del canvas ${kpiId}`);
            return;
        }
        
        console.log(`✅ Contexto 2D obtenido para ${kpiId}`);
        
        // Test básico: dibujar un rectángulo para verificar que el canvas funciona
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Test de texto
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`TEST: ${kpiId}`, 10, 30);
        ctx.fillText(`Datos: ${datos.length}`, 10, 50);
        
        // Si hay datos, intentar dibujar el gráfico
        if (datos && datos.length > 0) {
            console.log(`📊 Intentando dibujar gráfico con datos reales`);
            this.configurarGrafico(ctx, canvas, kpiId, datos);
        } else {
            console.warn(`⚠️ No hay datos para gráfico ${kpiId}`);
            ctx.fillStyle = 'yellow';
            ctx.fillText('SIN DATOS', 10, 70);
        }
        
        console.log(`✅ FIN - Gráfico ${kpiId} procesado`);
    }

    /**
     * Configurar gráfico según tipo de KPI
     */
    configurarGrafico(ctx, canvas, kpiId, datos) {
        if (!datos || datos.length === 0) return;
        
        console.log(`📊 Configurando gráfico ${kpiId} con estructura MongoDB`);
        
        // Obtener valores según tipo de KPI (adaptado para estructura MongoDB)
        let valores = [];
        let etiquetas = [];
        
        switch (kpiId) {
            case 'produccionDiaria':
                valores = datos.map(d => d.produccion?.litros || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'litrosVacaDiaEvol':
                valores = datos.map(d => {
                    const litros = d.produccion?.litros || 0;
                    const vacas = d.vacas?.estanque || 1;
                    return litros / vacas;
                });
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'vacasOrdeñaEvol':
                valores = datos.map(d => d.vacas?.estanque || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'concentradoDiario':
                valores = datos.map(d => d.alimentacion?.concentrado || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'costoDieta':
                valores = datos.map(d => d.economia?.costo_alimentacion || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'calidadEvol':
                // Para calidad, mostrar promedio de grasa y proteína
                valores = datos.map(d => {
                    const grasa = d.produccion?.grasa || 0;
                    const proteina = d.produccion?.proteina || 0;
                    return (grasa + proteina) / 2;
                });
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            default:
                console.warn(`⚠️ Tipo de gráfico no reconocido: ${kpiId}`);
                return;
        }
        
        console.log(`📈 Valores generados para ${kpiId}:`, valores.slice(0, 5), '...');
        console.log(`📅 Etiquetas generadas:`, etiquetas.slice(0, 5), '...');
        
        // Limitar a últimos 30 puntos para mejor visualización
        if (valores.length > 30) {
            valores = valores.slice(-30);
            etiquetas = etiquetas.slice(-30);
        }
        
        // Dibujar gráfico simple
        this.dibujarGraficoLineas(ctx, canvas, valores, etiquetas, kpiId);
    }

    /**
     * Dibujar gráfico de líneas simple
     */
    dibujarGraficoLineas(ctx, canvas, valores, etiquetas, kpiId) {
        if (!valores || valores.length === 0) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Encontrar valores min y max
        const valorMax = Math.max(...valores);
        const valorMin = Math.min(...valores);
        const rango = valorMax - valorMin || 1;
        
        // Dibujar ejes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Dibujar línea de datos
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        valores.forEach((valor, index) => {
            const x = padding + (index / (valores.length - 1)) * graphWidth;
            const y = height - padding - ((valor - valorMin) / rango) * graphHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Dibujar puntos
        ctx.fillStyle = '#007bff';
        valores.forEach((valor, index) => {
            const x = padding + (index / (valores.length - 1)) * graphWidth;
            const y = height - padding - ((valor - valorMin) / rango) * graphHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Título
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(kpiId, padding, 20);
        
        console.log(`✅ Gráfico ${kpiId} dibujado con ${valores.length} puntos`);
    }

    /**
     * Actualizar estado visual con indicadores modernos
     */
    actualizarEstadoVisual(element, dias) {
        // Remover todas las clases de estado
        element.className = 'item-status';
        
        // Determinar estado según días de stock
        let estado = 'optimal';
        let texto = '✅ Óptimo';
        let color = '#28a745';
        
        if (dias <= 3) {
            estado = 'critico';
            texto = '🚨 Crítico';
            color = '#dc3545';
        } else if (dias <= 7) {
            estado = 'bajo';
            texto = '⚠️ Bajo';
            color = '#ffc107';
        } else if (dias <= 14) {
            estado = 'medio';
            texto = '📊 Medio';
            color = '#17a2b8';
        }
        
        // Agregar clase de estado
        element.classList.add(estado);
        
        // Actualizar texto y color
        element.textContent = texto;
        element.style.color = color;
        
        console.log(`📊 Estado actualizado: ${texto} (${dias} días)`);
    }

    /**
     * Actualizar barra de progreso
     */
    actualizarBarraProgreso(element, dias) {
        // Determinar porcentaje de llenado
        let porcentaje = 100;
        if (dias <= 3) {
            porcentaje = 20; // Crítico
        } else if (dias <= 7) {
            porcentaje = 40; // Bajo
        } else if (dias <= 14) {
            porcentaje = 60; // Medio
        } else if (dias <= 30) {
            porcentaje = 80; // Bueno
        }
        
        // Actualizar barra de progreso
        element.style.width = `${porcentaje}%`;
        
        // Color según estado
        let color = '#28a745'; // Verde por defecto
        if (dias <= 3) {
            color = '#dc3545'; // Rojo
        } else if (dias <= 7) {
            color = '#ffc107'; // Amarillo
        } else if (dias <= 14) {
            color = '#17a2b8'; // Azul
        }
        
        element.style.backgroundColor = color;
        
        console.log(`📊 Barra de progreso actualizada: ${porcentaje}% (${dias} días)`);
    }

    /**
     * Actualizar gráficos evolutivos con datos reales
     */
    actualizarGraficosEvolutivos(datos) {
        console.log(`📊 Actualizando gráficos con ${datos.length} registros reales`);
        
        // En lugar de limitar a últimos 14 días
        
        // Lista de todos los gráficos que deberían actualizarse
        const graficos = [
            'produccionDiaria',
            'litrosVacaDiaEvol', 
            'vacasOrdeñaEvol',
            'concentradoDiario',
            'costoDieta',
            'calidadEvol'
        ];
        
        console.log(`📊 Se intentarán actualizar ${graficos.length} gráficos: ${graficos.join(', ')}`);
        
        // Actualizar cada gráfico evolutivo con todos los datos disponibles
        graficos.forEach((kpiId, index) => {
            console.log(`🔄 (${index + 1}/${graficos.length}) Actualizando gráfico: ${kpiId}`);
            try {
                this.actualizarGraficoKPI(kpiId, datos);
                console.log(`✅ Gráfico ${kpiId} actualizado exitosamente`);
            } catch (error) {
                console.error(`❌ Error al actualizar gráfico ${kpiId}:`, error);
            }
        });
        
        console.log(`✅ Proceso de actualización de gráficos completado`);
    }

    /**
     * Actualizar gráfico KPI específico
     */
    actualizarGraficoKPI(kpiId, datos) {
        console.log(`🔍 INICIO - Actualizando gráfico ${kpiId} con ${datos.length} datos`);
        
        const canvas = document.getElementById(`chart${kpiId.charAt(0).toUpperCase() + kpiId.slice(1)}`);
        if (!canvas) {
            console.error(`❌ Canvas no encontrado: chart${kpiId.charAt(0).toUpperCase() + kpiId.slice(1)}`);
            return;
        }
        
        console.log(`✅ Canvas encontrado para ${kpiId}`);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error(`❌ No se pudo obtener contexto 2D del canvas ${kpiId}`);
            return;
        }
        
        console.log(`✅ Contexto 2D obtenido para ${kpiId}`);
        
        // Si hay datos, intentar dibujar el gráfico
        if (datos && datos.length > 0) {
            console.log(`📊 Intentando dibujar gráfico con datos reales`);
            this.configurarGrafico(ctx, canvas, kpiId, datos);
        } else {
            console.warn(`⚠️ No hay datos para gráfico ${kpiId}`);
        }
        
        console.log(`✅ FIN - Gráfico ${kpiId} procesado`);
    }

    /**
     * Configurar gráfico según tipo de KPI
     */
    configurarGrafico(ctx, canvas, kpiId, datos) {
        if (!datos || datos.length === 0) return;
        
        console.log(`📊 Configurando gráfico ${kpiId} con estructura MongoDB`);
        
        // Obtener valores según tipo de KPI (adaptado para estructura MongoDB)
        let valores = [];
        let etiquetas = [];
        
        switch (kpiId) {
            case 'produccionDiaria':
                valores = datos.map(d => d.produccion?.litros || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'litrosVacaDiaEvol':
                valores = datos.map(d => {
                    const litros = d.produccion?.litros || 0;
                    const vacas = d.vacas?.estanque || 1;
                    return litros / vacas;
                });
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'vacasOrdeñaEvol':
                valores = datos.map(d => d.vacas?.estanque || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'concentradoDiario':
                valores = datos.map(d => d.alimentacion?.concentrado || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'costoDieta':
                valores = datos.map(d => d.economia?.costo_alimentacion || 0);
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            case 'calidadEvol':
                // Para calidad, mostrar promedio de grasa y proteína
                valores = datos.map(d => {
                    const grasa = d.produccion?.grasa || 0;
                    const proteina = d.produccion?.proteina || 0;
                    return (grasa + proteina) / 2;
                });
                etiquetas = datos.map(d => new Date(d.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
                break;
            default:
                console.warn(`⚠️ Tipo de gráfico no reconocido: ${kpiId}`);
                return;
        }
        
        console.log(`📈 Valores generados para ${kpiId}:`, valores.slice(0, 5), '...');
        console.log(`📅 Etiquetas generadas:`, etiquetas.slice(0, 5), '...');
        
        // Limitar a últimos 30 puntos para mejor visualización
        if (valores.length > 30) {
            valores = valores.slice(-30);
            etiquetas = etiquetas.slice(-30);
        }
        
        // Dibujar gráfico simple
        this.dibujarGraficoLineas(ctx, canvas, valores, etiquetas, kpiId);
    }

    /**
     * Dibujar gráfico de líneas simple
     */
    dibujarGraficoLineas(ctx, canvas, valores, etiquetas, kpiId) {
        if (!valores || valores.length === 0) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Encontrar valores min y max
        const valorMax = Math.max(...valores);
        const valorMin = Math.min(...valores);
        const rango = valorMax - valorMin || 1;
        
        // Dibujar ejes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Dibujar línea de datos
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        valores.forEach((valor, index) => {
            const x = padding + (index / (valores.length - 1)) * graphWidth;
            const y = height - padding - ((valor - valorMin) / rango) * graphHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Dibujar puntos
        ctx.fillStyle = '#007bff';
        valores.forEach((valor, index) => {
            const x = padding + (index / (valores.length - 1)) * graphWidth;
            const y = height - padding - ((valor - valorMin) / rango) * graphHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Título
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(kpiId, padding, 20);
        
        console.log(`✅ Gráfico ${kpiId} dibujado con ${valores.length} puntos`);
    }
}

// Exportar el módulo
export default DashboardModule;
        ctx.textAlign = 'center';
        ctx.fillText(this.getTituloEjeY(kpiId), 0, 0);
        ctx.restore();
        
        // GUARDAR DATOS PARA TOOLTIPS
        this.guardarDatosTooltip(canvas, kpiId, valores, etiquetas, escalaX, escalaY, padding);
        
        console.log(`✅ Gráfico ${kpiId} dibujado con ejes, valores y datos para tooltips`);
    }

    /**
     * Guardar datos para tooltips
     */
    guardarDatosTooltip(canvas, kpiId, valores, etiquetas, escalaX, escalaY, padding) {
        // Guardar datos de puntos para detección de hover
        const puntos = valores.map((valor, i) => ({
            x: escalaX(i),
            y: escalaY(valor),
            valor: valor,
            etiqueta: etiquetas[i],
            index: i
        }));
        
        // Guardar en el canvas para acceso posterior
        canvas.dataset.tooltipData = JSON.stringify({
            kpiId: kpiId,
            puntos: puntos,
            titulo: this.getTituloKPI(kpiId),
            unidad: this.getTituloEjeY(kpiId)
        });
        
        // Agregar event listeners para hover
        this.agregarEventListenersTooltip(canvas);
    }

    /**
     * Agregar event listeners para tooltips
     */
    agregarEventListenersTooltip(canvas) {
        // Evitar agregar múltiples veces
        if (canvas.dataset.tooltipListeners === 'true') return;
        
        canvas.addEventListener('mousemove', (e) => this.mostrarTooltip(e, canvas));
        canvas.addEventListener('mouseleave', () => this.ocultarTooltip(canvas));
        
        canvas.dataset.tooltipListeners = 'true';
    }

    /**
     * Mostrar tooltip en hover
     */
    mostrarTooltip(event, canvas) {
        const tooltipData = JSON.parse(canvas.dataset.tooltipData || '{}');
        if (!tooltipData.puntos) return;
        
        const rect = canvas.getBoundingClientRect();
        
        // Calcular coordenadas relativas al canvas real (no al escalado)
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        
        // Encontrar punto más cercano
        let puntoCercano = null;
        let distanciaMinima = Infinity;
        
        tooltipData.puntos.forEach(punto => {
            const distancia = Math.sqrt(Math.pow(x - punto.x, 2) + Math.pow(y - punto.y, 2));
            if (distancia < distanciaMinima && distancia < 15) { // 15px de tolerancia (escalado)
                distanciaMinima = distancia;
                puntoCercano = punto;
            }
        });
        
        if (puntoCercano) {
            this.crearTooltip(canvas, puntoCercano, tooltipData, event.clientX, event.clientY);
        } else {
            this.ocultarTooltip(canvas);
        }
    }

    /**
     * Crear tooltip
     */
    crearTooltip(canvas, punto, tooltipData, clientX, clientY) {
        // Eliminar tooltip existente
        this.ocultarTooltip(canvas);
        
        // Crear tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: sans-serif;
            pointer-events: none;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 200px;
        `;
        
        // Contenido del tooltip
        const valorFormateado = this.formatearValorTooltip(punto.valor, tooltipData.unidad);
        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px; color: ${this.getColorPorKPI(tooltipData.kpiId)};">
                ${tooltipData.titulo}
            </div>
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 2px;">
                ${valorFormateado}
            </div>
            <div style="font-size: 11px; opacity: 0.8;">
                ${punto.etiqueta}
            </div>
        `;
        
        // Posicionar tooltip
        document.body.appendChild(tooltip);
        
        // Calcular posición para evitar salir de la pantalla
        const tooltipRect = tooltip.getBoundingClientRect();
        let left = clientX + 10;
        let top = clientY - tooltipRect.height - 10;
        
        // Ajustar si se sale de la pantalla
        if (left + tooltipRect.width > window.innerWidth) {
            left = clientX - tooltipRect.width - 10;
        }
        
        if (top < 0) {
            top = clientY + 10;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        
        // Guardar referencia
        canvas.dataset.tooltipElement = tooltip.id = 'tooltip-' + Date.now();
    }

    /**
     * Ocultar tooltip
     */
    ocultarTooltip(canvas) {
        const tooltipId = canvas.dataset.tooltipElement;
        if (tooltipId) {
            const tooltip = document.getElementById(tooltipId);
            if (tooltip) {
                tooltip.remove();
            }
            delete canvas.dataset.tooltipElement;
        }
    }

    /**
     * Formatear valor para tooltip
     */
    formatearValorTooltip(valor, unidad) {
        switch (unidad) {
            case 'Litros':
                return `${valor.toFixed(0)} L`;
            case 'L/Vaca':
                return `${valor.toFixed(1)} L/vaca`;
            case 'Vacas':
                return `${valor.toFixed(0)} vacas`;
            case 'kg':
                return `${valor.toFixed(0)} kg`;
            case '$':
                return `$${valor.toFixed(2)}`;
            case '%':
                return `${valor.toFixed(2)}%`;
            default:
                return `${valor.toFixed(2)} ${unidad}`;
        }
    }

    /**
     * Obtener título del KPI para tooltip
     */
    getTituloKPI(kpiId) {
        const titulos = {
            'produccionDiaria': 'Producción Diaria',
            'litrosVacaDiaEvol': 'Litros/Vaca Día',
            'vacasOrdeñaEvol': 'Evolución Vacas Ordeña',
            'concentradoDiario': 'Consumo Concentrado',
            'costoDieta': 'Costo Dieta',
            'calidadEvol': 'Evolución Sólidos'
        };
        
        return titulos[kpiId] || kpiId;
    }

    /**
     * Obtener título para el eje Y según tipo de KPI
     */
    getTituloEjeY(kpiId) {
        const titulos = {
            'produccionDiaria': 'Litros',
            'litrosVacaDiaEvol': 'L/Vaca',
            'vacasOrdeñaEvol': 'Vacas',
            'concentradoDiario': 'kg',
            'costoDieta': '$',
            'calidadEvol': '%'
        };
        
        return titulos[kpiId] || 'Valor';
    }

    /**
     * Obtener color según tipo de KPI
     */
    getColorPorKPI(kpiId) {
        const colores = {
            'produccionDiaria': '#3b82f6',
            'concentradoDiario': '#10b981',
            'calidadLeche': '#f59e0b',
            'calidadEvol': '#f59e0b',
            'vacasOrdeñaEvol': '#8b5cf6',
            'costoDieta': '#ef4444',
            'stockDiario': '#06b6d4'
        };
        
        return colores[kpiId] || '#3b82f6';
    }

    /**
     * Actualizar KPIs para un fundo específico
     */
    actualizarKPIsFundoEspecifico(datos, fundo) {
        console.log(`🔍 actualizarKPIsFundoEspecifico llamado con fundo: "${fundo}"`);
        console.log(`📊 Total datos disponibles: ${datos.length}`);
        
        // Obtener el dato más reciente del fundo
        const datoFundo = datos
            .filter(d => d.fundo === fundo)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];

        console.log(`📋 Dato más reciente encontrado:`, datoFundo);
        console.log(`📋 Proteína en dato: ${datoFundo?.proteina}`);
        console.log(`📋 Grasa en dato: ${datoFundo?.grasa}`);

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
        
        // Actualizar KPIs de proteína y grasa
        console.log(`🔄 Actualizando KPIs de proteína y grasa para fundo específico`);
        const proteinaValor = `${(datoFundo.proteina || 0).toFixed(2)}%`;
        const grasaValor = `${(datoFundo.grasa || 0).toFixed(2)}%`;
        console.log(`📊 Valores a mostrar - Proteína: ${proteinaValor}, Grasa: ${grasaValor}`);
        
        this.actualizarKPI('kpiProteina', proteinaValor);
        this.actualizarKPI('kpiGrasa', grasaValor);
        
        console.log(`✅ KPIs de fundo específico actualizados - Proteína: ${proteinaValor}, Grasa: ${grasaValor}`);

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
        console.log(`📈 Iniciando actualización de gráficos con ${datos.length} datos`);
        
        // Usar todos los datos del rango de fechas seleccionado (ya filtrados)
        // En lugar de limitar a últimos 14 días
        
        // Lista de todos los gráficos que deberían actualizarse
        const graficos = [
            'produccionDiaria',
            'litrosVacaDiaEvol', 
            'vacasOrdeñaEvol',
            'concentradoDiario',
            'costoDieta',
            'calidadEvol'
        ];
        
        console.log(`📊 Se intentarán actualizar ${graficos.length} gráficos: ${graficos.join(', ')}`);
        
        // Actualizar cada gráfico evolutivo con todos los datos disponibles
        graficos.forEach((kpiId, index) => {
            console.log(`🔄 (${index + 1}/${graficos.length}) Actualizando gráfico: ${kpiId}`);
            try {
                this.actualizarGraficoKPI(kpiId, datos);
                console.log(`✅ Gráfico ${kpiId} actualizado exitosamente`);
            } catch (error) {
                console.error(`❌ Error al actualizar gráfico ${kpiId}:`, error);
                console.error(`Stack trace:`, error.stack);
            }
        });
        
        console.log(`✅ Proceso de actualización de gráficos completado`);
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
        
        // Ordenar datos por fecha (más antiguo a más reciente)
        const datosOrdenados = datos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        // Generar alertas para cada día (evaluación diaria)
        for (let i = 7; i < datosOrdenados.length; i++) {
            const diaActual = datosOrdenados[i];
            const fechaActual = new Date(diaActual.fecha);
            
            // 1. Caída de producción por vaca (>5% respecto al promedio de últimos 7 días)
            const ultimos7Dias = datosOrdenados.slice(i - 7, i);
            const promedioUltimos7Dias = ultimos7Dias.reduce((sum, d) => sum + (d.lecheDiaria / d.vacasOrdeña), 0) / 7;
            const litrosPorVacaHoy = diaActual.lecheDiaria / diaActual.vacasOrdeña;
            const caidaProduccion = ((promedioUltimos7Dias - litrosPorVacaHoy) / promedioUltimos7Dias) * 100;
            
            if (caidaProduccion > 5) {
                this.alertas.push({
                    tipo: 'warning',
                    titulo: 'Caída de producción por vaca',
                    mensaje: `Caída del ${caidaProduccion.toFixed(1)}% en producción por vaca. Puede indicar problemas de alimentación, estrés térmico o sanitarios.`,
                    fecha: diaActual.fecha,
                    fundo: diaActual.fundo,
                    indicador: `${litrosPorVacaHoy.toFixed(1)} L/vaca día`,
                    severidad: caidaProduccion > 15 ? 'high' : caidaProduccion > 10 ? 'medium' : 'low'
                });
            }
            
            // 2. Aumento del costo de alimentación (>10% respecto al promedio mensual)
            const diasMesAnterior = [];
            for (let j = i - 1; j >= Math.max(0, i - 30) && diasMesAnterior.length < 30; j--) {
                diasMesAnterior.push(datosOrdenados[j]);
            }
            if (diasMesAnterior.length > 0) {
                const promedioMensual = diasMesAnterior.reduce((sum, d) => sum + d.costoDietaLitro, 0) / diasMesAnterior.length;
                const aumentoCosto = ((diaActual.costoDietaLitro - promedioMensual) / promedioMensual) * 100;
                
                if (aumentoCosto > 10) {
                    this.alertas.push({
                        tipo: 'danger',
                        titulo: 'Aumento del costo de alimentación',
                        mensaje: `Aumento del ${aumentoCosto.toFixed(1)}% en costo por litro. Posibles cambios en formulación o aumento de precios de insumos.`,
                        fecha: diaActual.fecha,
                        fundo: diaActual.fundo,
                        indicador: `$${diaActual.costoDietaLitro.toFixed(3)}/L`,
                        severidad: aumentoCosto > 25 ? 'high' : aumentoCosto > 15 ? 'medium' : 'low'
                    });
                }
            }
            
            // 3. Caída de proteína (<3.1%)
            if (diaActual.proteina < 3.1) {
                this.alertas.push({
                    tipo: 'warning',
                    titulo: 'Caída de proteína',
                    mensaje: `Proteína del ${diaActual.proteina.toFixed(2)}% por debajo del umbral crítico. Puede indicar déficit proteico o baja digestibilidad.`,
                    fecha: diaActual.fecha,
                    fundo: diaActual.fundo,
                    indicador: `${diaActual.proteina.toFixed(2)}%`,
                    severidad: diaActual.proteina < 2.8 ? 'high' : diaActual.proteina < 2.95 ? 'medium' : 'low'
                });
            }
            
            // 4. Caída de grasa (<3.6%)
            if (diaActual.grasa < 3.6) {
                this.alertas.push({
                    tipo: 'warning',
                    titulo: 'Caída de grasa',
                    mensaje: `Grasa del ${diaActual.grasa.toFixed(2)}% por debajo del umbral crítico. Puede indicar déficit de fibra efectiva o exceso de concentrado.`,
                    fecha: diaActual.fecha,
                    fundo: diaActual.fundo,
                    indicador: `${diaActual.grasa.toFixed(2)}%`,
                    severidad: diaActual.grasa < 3.2 ? 'high' : diaActual.grasa < 3.4 ? 'medium' : 'low'
                });
            }
            
            // 5. Quiebre de inventario de alimento (<7 días de stock)
            const diasStock = Math.floor(diaActual.stockDiario / diaActual.concentradoDiario);
            if (diasStock < 7) {
                this.alertas.push({
                    tipo: 'danger',
                    titulo: 'Quiebre de inventario de alimento',
                    mensaje: `Solo quedan ${diasStock} días de stock. Riesgo operativo que requiere reposición urgente.`,
                    fecha: diaActual.fecha,
                    fundo: diaActual.fundo,
                    indicador: `${diasStock} días`,
                    severidad: diasStock < 3 ? 'high' : diasStock < 5 ? 'medium' : 'low'
                });
            }
        }
        
        // Ordenar alertas de más nuevo a más antiguo
        this.alertas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        console.log(`📊 Generadas ${this.alertas.length} alertas`);
        
        // Mostrar alertas en el dashboard
        this.mostrarAlertas();
    }

    /**
     * Mostrar logs detallados de alertas en consola
     */
    mostrarLogsAlertas() {
        console.log('\n🚨 ===== ALERTAS GENERADAS PARA RANGO DE FECHAS =====');
        console.log(`📅 Rango: ${this.fechaInicio} a ${this.fechaFin}`);
        console.log(`🏭 Fundo: ${this.fundoSeleccionado === 'todos' ? 'Todos los fundos' : this.fundoSeleccionado}`);
        console.log(`📊 Total alertas: ${this.alertas.length}\n`);
        
        if (this.alertas.length === 0) {
            console.log('✅ No se generaron alertas en el período seleccionado');
            return;
        }
        
        // Agrupar alertas por tipo
        const alertasPorTipo = this.alertas.reduce((acc, alerta) => {
            if (!acc[alerta.tipo]) acc[alerta.tipo] = [];
            acc[alerta.tipo].push(alerta);
            return acc;
        }, {});
        
        // Mostrar resumen por tipo
        console.log('📋 RESUMEN POR TIPO:');
        Object.entries(alertasPorTipo).forEach(([tipo, alertas]) => {
            const icono = tipo === 'danger' ? '🚨' : tipo === 'warning' ? '⚠️' : 'ℹ️';
            console.log(`${icono} ${tipo.toUpperCase()}: ${alertas.length} alertas`);
        });
        
        console.log('\n📝 DETALLE DE ALERTAS (más nuevas primero):');
        console.log('─'.repeat(80));
        
        this.alertas.forEach((alerta, index) => {
            const icono = alerta.tipo === 'danger' ? '🚨' : alerta.tipo === 'warning' ? '⚠️' : 'ℹ️';
            const severidad = alerta.severidad ? `[${alerta.severidad.toUpperCase()}]` : '';
            const fecha = new Date(alerta.fecha).toLocaleDateString('es-CL');
            
            console.log(`${index + 1}. ${icono} ${alerta.titulo} ${severidad}`);
            console.log(`   📊 Indicador: ${alerta.indicador}`);
            console.log(`   📅 Fecha: ${fecha} | 🏭 Fundo: ${alerta.fundo}`);
            console.log(`   💬 Mensaje: ${alerta.mensaje}`);
            console.log('─'.repeat(80));
        });
        
        // Mostrar estadísticas adicionales
        const alertasHigh = this.alertas.filter(a => a.severidad === 'high').length;
        const alertasMedium = this.alertas.filter(a => a.severidad === 'medium').length;
        const alertasLow = this.alertas.filter(a => a.severidad === 'low').length;
        
        console.log('\n📈 ESTADÍSTICAS DE SEVERIDAD:');
        console.log(`🔴 HIGH (críticas): ${alertasHigh}`);
        console.log(`🟡 MEDIUM (moderadas): ${alertasMedium}`);
        console.log(`🔵 LOW (leves): ${alertasLow}`);
        
        // Mostrar alertas más recientes por fundo
        const alertasPorFundo = this.alertas.reduce((acc, alerta) => {
            if (!acc[alerta.fundo]) acc[alerta.fundo] = [];
            acc[alerta.fundo].push(alerta);
            return acc;
        }, {});
        
        console.log('\n🏭 ALERTAS RECIENTES POR FUNDO:');
        Object.entries(alertasPorFundo).forEach(([fundo, alertas]) => {
            const masReciente = alertas[0]; // Ya están ordenadas por fecha
            const icono = masReciente.tipo === 'danger' ? '🚨' : '⚠️';
            const fecha = new Date(masReciente.fecha).toLocaleDateString('es-CL');
            console.log(`${fundo}: ${icono} ${masReciente.titulo} (${fecha})`);
        });
        
        console.log('\n🚨 ===== FIN DE LOGS DE ALERTAS =====\n');
    }

    /**
     * Mostrar alertas en el dashboard
     */
    mostrarAlertas() {
        console.log('🔍 Buscando contenedor de alertas...');
        const alertsContainer = document.getElementById('alertasContainer');
        console.log('🔍 Contenedor encontrado:', !!alertsContainer);
        
        if (!alertsContainer) {
            console.error('❌ No se encontró el contenedor de alertas #alertasContainer');
            console.log('🔍 Elementos disponibles:', document.querySelectorAll('[id*="alert"], [class*="alert"]'));
            return;
        }
        
        console.log(`📊 Mostrando ${this.alertas.length} alertas en el contenedor`);
        
        if (this.alertas.length === 0) {
            alertsContainer.innerHTML = `
                <h3>🔔 Alertas</h3>
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <p>No hay alertas activas</p>
                </div>
            `;
            console.log('✅ Mostrado estado vacío de alertas');
            return;
        }
        
        // Renderizar contenedor con filtros y paginación
        this.renderizarAlertasConFiltros(alertsContainer);
        
        console.log('✅ Alertas renderizadas exitosamente en el contenedor');
    }

    /**
     * Renderizar alertas con sistema de filtrado y paginación
     */
    renderizarAlertasConFiltros(container) {
        // Estado del filtrado
        this.alertasFiltroEstado = {
            tipo: 'todos',
            severidad: 'todos',
            fundo: 'todos',
            pagina: 1,
            alertasPorPagina: 5
        };
        
        // Renderizar estructura completa
        container.innerHTML = `
            <h3>🔔 Alertas</h3>
            <div class="alerts-filters">
                <div class="filter-row">
                    <select id="alertTipoFilter" class="filter-select">
                        <option value="todos">Todos los tipos</option>
                        <option value="danger">🚨 Peligro</option>
                        <option value="warning">⚠️ Advertencia</option>
                        <option value="info">ℹ️ Información</option>
                        <option value="success">✅ Éxito</option>
                    </select>
                    
                    <select id="alertSeveridadFilter" class="filter-select">
                        <option value="todos">Todas las severidades</option>
                        <option value="high">🔴 Críticas</option>
                        <option value="medium">🟡 Moderadas</option>
                        <option value="low">🔵 Leves</option>
                    </select>
                    
                    <select id="alertFundoFilter" class="filter-select">
                        <option value="todos">Todos los fundos</option>
                        <option value="Dollinco">Dollinco</option>
                        <option value="Pitriuco">Pitriuco</option>
                    </select>
                </div>
                
                <div class="filter-stats">
                    <span id="alertCount">0 alertas</span>
                    <button id="clearFilters" class="btn-clear-filters">Limpiar filtros</button>
                </div>
            </div>
            
            <div id="alertsList" class="alerts-list">
                <!-- Las alertas se cargarán dinámicamente -->
            </div>
            
            <div id="alertsPagination" class="alerts-pagination">
                <!-- Paginación se cargará dinámicamente -->
            </div>
        `;
        
        // Configurar eventos de filtrado
        this.configurarEventosFiltros();
        
        // Aplicar filtros iniciales
        this.aplicarFiltrosAlertas();
    }

    /**
     * Configurar eventos de filtrado
     */
    configurarEventosFiltros() {
        const tipoFilter = document.getElementById('alertTipoFilter');
        const severidadFilter = document.getElementById('alertSeveridadFilter');
        const fundoFilter = document.getElementById('alertFundoFilter');
        const clearFilters = document.getElementById('clearFilters');
        
        if (tipoFilter) {
            tipoFilter.addEventListener('change', () => {
                this.alertasFiltroEstado.tipo = tipoFilter.value;
                this.alertasFiltroEstado.pagina = 1;
                this.aplicarFiltrosAlertas();
            });
        }
        
        if (severidadFilter) {
            severidadFilter.addEventListener('change', () => {
                this.alertasFiltroEstado.severidad = severidadFilter.value;
                this.alertasFiltroEstado.pagina = 1;
                this.aplicarFiltrosAlertas();
            });
        }
        
        if (fundoFilter) {
            fundoFilter.addEventListener('change', () => {
                this.alertasFiltroEstado.fundo = fundoFilter.value;
                this.alertasFiltroEstado.pagina = 1;
                this.aplicarFiltrosAlertas();
            });
        }
        
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.limpiarFiltrosAlertas();
            });
        }
    }

    /**
     * Aplicar filtros a las alertas
     */
    aplicarFiltrosAlertas() {
        let alertasFiltradas = [...this.alertas];
        
        // Filtrar por tipo
        if (this.alertasFiltroEstado.tipo !== 'todos') {
            alertasFiltradas = alertasFiltradas.filter(a => a.tipo === this.alertasFiltroEstado.tipo);
        }
        
        // Filtrar por severidad
        if (this.alertasFiltroEstado.severidad !== 'todos') {
            alertasFiltradas = alertasFiltradas.filter(a => a.severidad === this.alertasFiltroEstado.severidad);
        }
        
        // Filtrar por fundo
        if (this.alertasFiltroEstado.fundo !== 'todos') {
            alertasFiltradas = alertasFiltradas.filter(a => a.fundo === this.alertasFiltroEstado.fundo);
        }
        
        // Actualizar contador
        this.actualizarContadorAlertas(alertasFiltradas.length);
        
        // Aplicar paginación
        this.renderizarAlertasPaginadas(alertasFiltradas);
    }

    /**
     * Renderizar alertas con paginación
     */
    renderizarAlertasPaginadas(alertas) {
        const alertsList = document.getElementById('alertsList');
        const pagination = document.getElementById('alertsPagination');
        
        if (!alertsList || !pagination) return;
        
        const totalAlertas = alertas.length;
        const { pagina, alertasPorPagina } = this.alertasFiltroEstado;
        
        // Calcular paginación
        const totalPages = Math.ceil(totalAlertas / alertasPorPagina);
        const startIndex = (pagina - 1) * alertasPorPagina;
        const endIndex = startIndex + alertasPorPagina;
        const alertasPagina = alertas.slice(startIndex, endIndex);
        
        // Renderizar alertas de la página actual
        if (alertasPagina.length === 0) {
            alertsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>No hay alertas con los filtros seleccionados</p>
                </div>
            `;
        } else {
            const alertsHTML = alertasPagina.map(alerta => this.renderizarAlertaHTML(alerta)).join('');
            alertsList.innerHTML = alertsHTML;
        }
        
        // Renderizar paginación
        this.renderizarPaginacion(totalPages, totalAlertas);
    }

    /**
     * Renderizar HTML de una alerta individual
     */
    renderizarAlertaHTML(alerta) {
        // Determinar icono según tipo y severidad
        let icono = '';
        if (alerta.tipo === 'danger') {
            icono = alerta.severidad === 'high' ? '🚨' : '⚠️';
        } else if (alerta.tipo === 'warning') {
            icono = alerta.severidad === 'high' ? '⚠️' : '⚡';
        } else if (alerta.tipo === 'success') {
            icono = '✅';
        } else if (alerta.tipo === 'info') {
            icono = 'ℹ️';
        }
        
        // Clase de severidad para estilos adicionales
        const severidadClass = alerta.severidad ? `severity-${alerta.severidad}` : '';
        
        return `
            <div class="alert-item ${alerta.tipo} ${severidadClass}">
                <div class="alert-icon">
                    ${icono}
                </div>
                <div class="alert-content">
                    <div class="alert-header">
                        <h4>${alerta.titulo}</h4>
                        <div class="alert-indicator">${alerta.indicador}</div>
                    </div>
                    <p>${alerta.mensaje}</p>
                    <div class="alert-meta">
                        ${alerta.fundo} • ${new Date(alerta.fecha).toLocaleDateString('es-CL')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderizar controles de paginación
     */
    renderizarPaginacion(totalPages, totalAlertas) {
        const pagination = document.getElementById('alertsPagination');
        if (!pagination) return;
        
        const { pagina, alertasPorPagina } = this.alertasFiltroEstado;
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination-controls">';
        
        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn ${pagina === 1 ? 'disabled' : ''}" 
                    onclick="window.plataforma.modules.dashboard.irAPagina(${pagina - 1})"
                    ${pagina === 1 ? 'disabled' : ''}>
                ← Anterior
            </button>
        `;
        
        // Números de página
        const maxPagesToShow = 5;
        let startPage = Math.max(1, pagina - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === pagina ? 'active' : ''}" 
                        onclick="window.plataforma.modules.dashboard.irAPagina(${i})">
                    ${i}
                </button>
            `;
        }
        
        // Botón siguiente
        paginationHTML += `
            <button class="pagination-btn ${pagina === totalPages ? 'disabled' : ''}" 
                    onclick="window.plataforma.modules.dashboard.irAPagina(${pagina + 1})"
                    ${pagina === totalPages ? 'disabled' : ''}>
                Siguiente →
            </button>
        `;
        
        paginationHTML += '</div>';
        
        // Información de paginación
        paginationHTML += `
            <div class="pagination-info">
                Mostrando ${((pagina - 1) * alertasPorPagina) + 1}-${Math.min(pagina * alertasPorPagina, totalAlertas)} 
                de ${totalAlertas} alertas
            </div>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    /**
     * Navegar a página específica
     */
    irAPagina(pagina) {
        this.alertasFiltroEstado.pagina = pagina;
        this.aplicarFiltrosAlertas();
    }

    /**
     * Actualizar contador de alertas
     */
    actualizarContadorAlertas(count) {
        const countElement = document.getElementById('alertCount');
        if (countElement) {
            countElement.textContent = `${count} alerta${count !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Limpiar todos los filtros
     */
    limpiarFiltrosAlertas() {
        // Resetear estado
        this.alertasFiltroEstado = {
            tipo: 'todos',
            severidad: 'todos',
            fundo: 'todos',
            pagina: 1,
            alertasPorPagina: 5
        };
        
        // Resetear selects
        const tipoFilter = document.getElementById('alertTipoFilter');
        const severidadFilter = document.getElementById('alertSeveridadFilter');
        const fundoFilter = document.getElementById('alertFundoFilter');
        
        if (tipoFilter) tipoFilter.value = 'todos';
        if (severidadFilter) severidadFilter.value = 'todos';
        if (fundoFilter) fundoFilter.value = 'todos';
        
        // Aplicar filtros
        this.aplicarFiltrosAlertas();
    }

    /**
     * Inicializar selector de fechas con el rango por defecto
     */
    inicializarSelectorFechas() {
        if (!this.datosOriginales || this.datosOriginales.length === 0) return;
        
        // Obtener rango real de los datos
        const fechas = this.datosOriginales.map(d => new Date(d.fecha));
        const fechaMinima = new Date(Math.min(...fechas));
        const fechaMaxima = new Date(Math.max(...fechas));
        
        // Formatear fechas a YYYY-MM-DD
        const formatearFecha = (fecha) => {
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            return `${año}-${mes}-${dia}`;
        };
        
        const inputInicio = document.getElementById('fechaInicio');
        const inputFin = document.getElementById('fechaFin');
        
        if (inputInicio && inputFin) {
            // Usar rango real de los datos
            inputInicio.value = formatearFecha(fechaMinima);
            inputFin.value = formatearFecha(fechaMaxima);
            
            this.fechaInicio = inputInicio.value;
            this.fechaFin = inputFin.value;
            
            console.log(`📅 Selector de fechas inicializado con rango real: ${this.fechaInicio} a ${this.fechaFin}`);
            console.log(`📊 Rango de datos: ${this.datosOriginales.length} registros`);
        }
    }

    /**
     * Toggle para mostrar/ocultar controles de fecha
     */
    toggleFechas() {
        const fechaControls = document.getElementById('fechaControls');
        if (fechaControls) {
            const isVisible = fechaControls.style.display !== 'none';
            fechaControls.style.display = isVisible ? 'none' : 'block';
        }
    }

    /**
     * Establecer rango de fechas predefinido
     */
    setRangoFechas(tipo) {
        const inputInicio = document.getElementById('fechaInicio');
        const inputFin = document.getElementById('fechaFin');
        
        if (!inputInicio || !inputFin) return;
        
        const hoy = new Date();
        let fechaInicio, fechaFin;
        
        switch (tipo) {
            case 'ultimoMes':
                // Último mes: desde hace 1 mes hasta hoy
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
                fechaFin = new Date();
                break;
                
            case 'ultimos3Meses':
                // Últimos 3 meses: desde hace 3 meses hasta hoy
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 3, hoy.getDate());
                fechaFin = new Date();
                break;
                
            case 'ultimos12Meses':
                // Últimos 12 meses: desde hace 12 meses hasta hoy
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 12, hoy.getDate());
                fechaFin = new Date();
                break;
                
            case 'ultimos24Meses':
                // Últimos 24 meses: desde hace 24 meses hasta hoy
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 24, hoy.getDate());
                fechaFin = new Date();
                break;
                
            default:
                return;
        }
        
        // Formatear fechas a YYYY-MM-DD
        inputInicio.value = fechaInicio.toISOString().split('T')[0];
        inputFin.value = fechaFin.toISOString().split('T')[0];
        
        // Actualizar estado y filtrar
        this.fechaInicio = inputInicio.value;
        this.fechaFin = inputFin.value;
        
        console.log(`📅 Rango de fechas establecido (${tipo}): ${this.fechaInicio} a ${this.fechaFin}`);
        
        // Aplicar filtros
        this.filtrarPorFechas();
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
        
        // Filtrar por rango de fechas (solo si están definidas)
        if (this.fechaInicio && this.fechaFin) {
            const inicio = new Date(this.fechaInicio);
            const fin = new Date(this.fechaFin);
            fin.setHours(23, 59, 59, 999); // Incluir todo el día final
            
            datosFiltrados = datosFiltrados.filter(d => {
                const fecha = new Date(d.fecha);
                return fecha >= inicio && fecha <= fin;
            });
        } else {
            // Si no hay fechas definidas, usar todos los datos
            console.log('📅 Sin filtro de fechas, usando todos los datos disponibles');
        }
        
        console.log(`📊 Filtros aplicados: ${datos.length} → ${datosFiltrados.length} registros`);
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
