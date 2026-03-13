/**
 * Módulo de Gestión de Inventario
 * Plataforma Ganadera - Módulo completo para control de inventario
 */

class InventarioModule {
    constructor() {
        this.datos = [];
        this.filtroActual = {
            fundo: 'todos',
            periodo: '30d',
            producto: 'todos'
        };
        this.charts = {};
        this.alertas = [];
        this.pronosticos = {};
        
        this.init();
    }

    async init() {
        console.log('📦 Módulo de Inventario inicializado');
        
        // Verificar si estamos en la sección de inventario
        if (!document.getElementById('inventarioEvolutionChart')) {
            console.log('⚠️ Elementos de inventario no encontrados, esperando a que la sección esté activa');
            console.log('🔍 Elementos disponibles:', document.querySelectorAll('canvas').length);
            return;
        }
        
        console.log('✅ Elementos de inventario encontrados, procediendo con la inicialización');
        await this.cargarDatos();
        this.configurarEventListeners();
        this.inicializarGraficos();
        this.actualizarDashboard();
        console.log('✅ Inventario inicializado completamente');
    }

    // Método para reinicializar cuando la sección se activa
    async reinit() {
        console.log('🔄 Reinicializando módulo de inventario');
        
        // Destruir gráficos existentes
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        this.charts = {};
        
        // Reinicializar
        await this.init();
    }

    async cargarDatos() {
        try {
            console.log('🔄 Cargando datos de inventario desde MongoDB...');
            
            // Cargar datos de inventario desde la API
            const apiURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:3000/api/inventario'
                : 'https://name-plataforma-ganadera-backend.onrender.com/api/inventario';
            
            const response = await fetch(apiURL);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Validar que los datos sean válidos
            if (!result.success || !Array.isArray(result.data)) {
                throw new Error('La API no devolvió datos válidos de inventario');
            }
            
            this.datos = result.data;
            console.log(`✅ Datos reales de inventario cargados: ${this.datos.length} registros`);
            
            // Mostrar muestra de datos para depuración
            if (this.datos.length > 0) {
                console.log('📋 Muestra completa de datos reales:', this.datos.slice(0, 2));
                console.log('🏭 Fundos únicos:', [...new Set(this.datos.map(d => d.fundo?.nombre || d.fundo))]);
                console.log('📦 Productos únicos:', [...new Set(this.datos.map(d => d.producto?.nombre || d.producto))]);
                console.log('📅 Fechas únicas:', [...new Set(this.datos.map(d => d.fecha))].slice(0, 5));
                
                // Analizar estructura de campos disponibles
                console.log('🔍 Análisis de campos disponibles:');
                const muestra = this.datos[0];
                Object.keys(muestra).forEach(key => {
                    console.log(`  • ${key}:`, muestra[key]);
                });
                
                // Verificar campos específicos para inventario-moderno
                console.log('📊 Verificación de campos necesarios:');
                this.datos.slice(0, 3).forEach((d, i) => {
                    console.log(`Registro ${i + 1}:`);
                    console.log(`  - stockActual: ${d.stockActual || '❌ NO EXISTE'}`);
                    console.log(`  - consumoDiario: ${d.consumoDiario || '❌ NO EXISTE'}`);
                    console.log(`  - stockMinimo: ${d.stockMinimo || '❌ NO EXISTE'}`);
                    console.log(`  - stockOptimo: ${d.stockOptimo || '❌ NO EXISTE'}`);
                    console.log(`  - producto: ${d.producto?.nombre || d.producto || '❌ NO EXISTE'}`);
                });
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos de inventario:', error.message);
            // Fallback a datos simulados si falla la API
            console.log('⚠️ Usando datos simulados de inventario');
            this.datos = this.generarDatosInventario();
            console.log(`📊 Cargados ${this.datos.length} registros de inventario simulados`);
            
            // Mostrar muestra de datos para depuración
            if (this.datos.length > 0) {
                console.log('📋 Muestra de datos simulados:', this.datos.slice(0, 3));
                console.log('🏭 Fundos únicos:', [...new Set(this.datos.map(d => d.fundo))]);
                console.log('📦 Productos únicos:', [...new Set(this.datos.map(d => d.producto))]);
                console.log('📅 Fechas únicas:', [...new Set(this.datos.map(d => d.fecha))].slice(0, 5));
            }
        }
    }

    generarDatosInventario() {
        const productos = ['concentrado', 'ensilaje', 'sales', 'fibra', 'medicamentos'];
        const fundos = ['fundo1', 'fundo2', 'fundo3', 'fundo4', 'fundo5', 'fundo6', 'fundo7'];
        const datos = [];
        
        // Generar datos para los últimos 90 días
        const hoy = new Date();
        for (let i = 89; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - i);
            
            fundos.forEach(fundo => {
                productos.forEach(producto => {
                    const stockBase = this.getStockBase(producto);
                    const consumoDiario = this.getConsumoDiario(producto);
                    const variacion = (Math.random() - 0.5) * 0.2; // ±10% de variación
                    
                    datos.push({
                        id: `${fundo}_${producto}_${i}`,
                        fecha: fecha.toISOString().split('T')[0],
                        fundo: fundo,
                        fundoNombre: this.getNombreFundo(fundo),
                        producto: producto,
                        productoNombre: this.getNombreProducto(producto),
                        stockActual: Math.max(0, stockBase - (consumoDiario * i * (1 + variacion))),
                        consumoDiario: consumoDiario * (1 + variacion),
                        stockMinimo: stockBase * 0.2,
                        stockOptimo: stockBase * 0.8,
                        merma: Math.random() * 0.05, // 0-5% de merma
                        costoUnitario: this.getCostoUnitario(producto),
                        ultimoPedido: this.getUltimoPedido(fecha, i),
                        proximoPedido: this.getProximoPedido(fecha, i, stockBase, consumoDiario),
                        eficienciaAlmacenamiento: 0.8 + Math.random() * 0.15 // 80-95%
                    });
                });
            });
        }
        
        return datos;
    }

    getStockBase(producto) {
        const stocks = {
            'concentrado': 1000,
            'ensilaje': 3000,
            'sales': 200,
            'fibra': 1500,
            'medicamentos': 100
        };
        return stocks[producto] || 500;
    }

    getConsumoDiario(producto) {
        const consumos = {
            'concentrado': 50,
            'ensilaje': 150,
            'sales': 8,
            'fibra': 40,
            'medicamentos': 2
        };
        return consumos[producto] || 25;
    }

    getCostoUnitario(producto) {
        const costos = {
            'concentrado': 450,
            'ensilaje': 120,
            'sales': 280,
            'fibra': 180,
            'medicamentos': 850
        };
        return costos[producto] || 300;
    }

    getNombreFundo(fundo) {
        const nombres = {
            'fundo1': 'Fundo 1 - Agrícola A',
            'fundo2': 'Fundo 2 - Agrícola B',
            'fundo3': 'Fundo 3 - Agrícola C',
            'fundo4': 'Fundo 4 - Agrícola D',
            'fundo5': 'Fundo 5 - Agrícola E',
            'fundo6': 'Fundo 6 - Agrícola F',
            'fundo7': 'Fundo 7 - Agrícola G'
        };
        return nombres[fundo] || fundo;
    }

    getNombreProducto(producto) {
        const nombres = {
            'concentrado': 'Concentrado Premium',
            'ensilaje': 'Ensilaje de Maíz',
            'sales': 'Sales Minerales',
            'fibra': 'Fibra de Alfalfa',
            'medicamentos': 'Medicamentos'
        };
        return nombres[producto] || producto;
    }

    getUltimoPedido(fecha, diasAtras) {
        const ultimaFecha = new Date(fecha);
        ultimaFecha.setDate(ultimaFecha.getDate() - Math.floor(Math.random() * 30) - 10);
        return ultimaFecha.toISOString().split('T')[0];
    }

    getProximoPedido(fecha, diasAtras, stockBase, consumoDiario) {
        const proximaFecha = new Date(fecha);
        proximaFecha.setDate(proximaFecha.getDate() + Math.floor(Math.random() * 20) + 5);
        return proximaFecha.toISOString().split('T')[0];
    }

    configurarEventListeners() {
        // Filtros
        document.getElementById('fundoSelect')?.addEventListener('change', (e) => {
            this.filtroActual.fundo = e.target.value;
            this.actualizarDashboard();
        });

        document.getElementById('periodoSelect')?.addEventListener('change', (e) => {
            this.filtroActual.periodo = e.target.value;
            this.actualizarDashboard();
        });

        document.getElementById('productoSelect')?.addEventListener('change', (e) => {
            this.filtroActual.producto = e.target.value;
            this.actualizarDashboard();
        });

        // Botones de acción
        document.querySelectorAll('.alert-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleAlertAction(e.target);
            });
        });

        // Controles de gráficos
        document.querySelectorAll('.chart-control').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleChartControl(e.target);
            });
        });
    }

    filtrarDatos() {
        console.log('🔍 Filtrando datos de inventario...');
        let datosFiltrados = [...this.datos];
        
        // Filtrar por fundo
        if (this.filtroActual.fundo !== 'todos') {
            datosFiltrados = datosFiltrados.filter(d => {
                const nombreFundo = d.fundo?.nombre || d.fundo || '';
                return nombreFundo === this.filtroActual.fundo;
            });
            console.log(`🏭 Filtrado por fundo "${this.filtroActual.fundo}": ${datosFiltrados.length} registros`);
        }
        
        // Filtrar por producto
        if (this.filtroActual.producto !== 'todos') {
            datosFiltrados = datosFiltrados.filter(d => {
                const nombreProducto = d.producto?.nombre || d.producto || '';
                return nombreProducto === this.filtroActual.producto;
            });
            console.log(`📦 Filtrado por producto "${this.filtroActual.producto}": ${datosFiltrados.length} registros`);
        }
        
        // Filtrar por período (solo si las fechas son válidas)
        const dias = this.getDiasPeriodo(this.filtroActual.periodo);
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        
        // Solo filtrar por fecha si los registros tienen fechas válidas
        const datosConFecha = datosFiltrados.filter(d => d.fecha && d.fecha !== 'undefined');
        const datosSinFecha = datosFiltrados.filter(d => !d.fecha || d.fecha === 'undefined');
        
        if (datosConFecha.length > 0) {
            datosConFecha.forEach(d => {
                console.log(`📅 Registro con fecha: ${d.fundo?.nombre || d.fundo} - ${d.fecha}`);
            });
            datosFiltrados = datosConFecha.filter(d => new Date(d.fecha) >= fechaLimite);
            console.log(`📅 Filtrado por período (${dias} días): ${datosFiltrados.length} registros`);
        } else {
            console.log(`⚠️ No hay registros con fechas válidas, usando todos los ${datosSinFecha.length} registros`);
            datosFiltrados = datosSinFecha;
        }
        
        console.log(`✅ Filtrado completado: ${datosFiltrados.length} registros finales`);
        return datosFiltrados;
    }

    getDiasPeriodo(periodo) {
        const periodos = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };
        return periodos[periodo] || 30;
    }

    actualizarDashboard() {
        console.log('🔄 Actualizando dashboard de inventario');
        console.log(`📊 Datos disponibles: ${this.datos.length} registros`);
        
        const datosFiltrados = this.filtrarDatos();
        console.log(`🔍 Datos filtrados: ${datosFiltrados.length} registros`);
        
        this.actualizarKPIs(datosFiltrados);
        this.actualizarAlertas(datosFiltrados);
        this.actualizarGraficos(datosFiltrados);
        this.actualizarPronosticos(datosFiltrados);
        this.actualizarTabla(datosFiltrados);
        
        // Actualizar la sección inventario-moderno
        this.actualizarInventarioModerno(datosFiltrados);
        
        console.log('✅ Dashboard de inventario actualizado');
    }

    actualizarKPIs(datos) {
        console.log('📊 Actualizando KPIs de inventario');
        
        // Calcular KPIs
        const valorTotal = this.calcularValorTotalInventario(datos);
        const diasStockPromedio = this.calcularDiasStockPromedio(datos);
        const rotacion = this.calcularRotacion(datos);
        const mermaAcumulada = this.calcularMermaAcumulada(datos);
        const pedidosPendientes = this.contarPedidosPendientes(datos);
        const eficiencia = this.calcularEficienciaAlmacenamiento(datos);
        
        // Actualizar DOM
        this.actualizarKPI('valorTotal', this.formatearMoneda(valorTotal));
        this.actualizarKPI('diasStock', diasStockPromedio.toFixed(1));
        this.actualizarKPI('rotacion', rotacion.toFixed(1) + 'x');
        this.actualizarKPI('merma', mermaAcumulada.toFixed(1) + '%');
        this.actualizarKPI('pedidosPendientes', pedidosPendientes.toString());
        this.actualizarKPI('eficiencia', eficiencia.toFixed(1) + '%');
    }

    calcularValorTotalInventario(datos) {
        const datosHoy = datos.filter(d => d.fecha === datos[datos.length - 1]?.fecha);
        return datosHoy.reduce((total, d) => total + (d.stockActual * d.costoUnitario), 0);
    }

    calcularDiasStockPromedio(datos) {
        const datosHoy = datos.filter(d => d.fecha === datos[datos.length - 1]?.fecha);
        if (datosHoy.length === 0) return 0;
        
        const totalDias = datosHoy.reduce((total, d) => total + (d.stockActual / d.consumoDiario), 0);
        return totalDias / datosHoy.length;
    }

    calcularRotacion(datos) {
        // Rotación = Consumo total / Stock promedio
        const consumoTotal = datos.reduce((total, d) => total + d.consumoDiario, 0);
        const stockPromedio = this.calcularValorTotalInventario(datos) / this.getCostoUnitarioPromedio(datos);
        
        return stockPromedio > 0 ? consumoTotal / stockPromedio : 0;
    }

    calcularMermaAcumulada(datos) {
        const datosHoy = datos.filter(d => d.fecha === datos[datos.length - 1]?.fecha);
        if (datosHoy.length === 0) return 0;
        
        const mermaTotal = datosHoy.reduce((total, d) => total + d.merma, 0);
        return (mermaTotal / datosHoy.length) * 100;
    }

    contarPedidosPendientes(datos) {
        const hoy = new Date().toISOString().split('T')[0];
        return datos.filter(d => d.proximoPedido <= hoy && d.stockActual < d.stockMinimo).length;
    }

    calcularEficienciaAlmacenamiento(datos) {
        const datosHoy = datos.filter(d => d.fecha === datos[datos.length - 1]?.fecha);
        if (datosHoy.length === 0) return 0;
        
        const eficienciaTotal = datosHoy.reduce((total, d) => total + d.eficienciaAlmacenamiento, 0);
        return (eficienciaTotal / datosHoy.length) * 100;
    }

    getCostoUnitarioPromedio(datos) {
        const costos = [...new Set(datos.map(d => d.costoUnitario))];
        return costos.reduce((total, costo) => total + costo, 0) / costos.length;
    }

    actualizarKPI(id, valor) {
        const elementos = document.querySelectorAll('.kpi-value');
        elementos.forEach(el => {
            const title = el.parentElement.querySelector('.kpi-title');
            if (title && this.getKPIId(title.textContent) === id) {
                el.textContent = valor;
            }
        });
    }

    getKPIId(title) {
        const ids = {
            'Valor Total Inventario': 'valorTotal',
            'Días de Stock Promedio': 'diasStock',
            'Rotación Inventario': 'rotacion',
            'Merma Acumulada': 'merma',
            'Pedidos Pendientes': 'pedidosPendientes',
            'Eficiencia Almacenamiento': 'eficiencia'
        };
        return ids[title] || title;
    }

    actualizarAlertas(datos) {
        console.log('🚨 Actualizando alertas de inventario');
        console.log(`📊 Datos para alertas: ${datos.length} registros`);
        
        this.alertas = this.generarAlertas(datos);
        console.log(`🔥 Alertas generadas: ${this.alertas.length}`);
        this.alertas.forEach((alerta, i) => {
            console.log(`  ${i+1}. [${alerta.tipo}] ${alerta.titulo}`);
        });
        
        this.renderizarAlertas();
    }

    generarAlertas(datos) {
        const alertas = [];
        
        try {
            // Agrupar datos por producto para el estado más reciente
            const datosPorProducto = {};
            datos.forEach(d => {
                const producto = d.producto || 'desconocido';
                if (!datosPorProducto[producto]) {
                    datosPorProducto[producto] = d;
                }
            });
            
            Object.values(datosPorProducto).forEach(d => {
                const stockActual = d.cantidad_actual || 0;
                const consumoDiario = d.consumo_diario_promedio || 0;
                const diasStock = d.dias_stock || 0;
                const stockMinimo = d.alerta_minimo || 0;
                
                // Alerta de stock crítico
                if (diasStock < 3 || stockActual < stockMinimo) {
                    alertas.push({
                        tipo: 'critical',
                        titulo: `🚨 Stock Crítico - ${d.producto}`,
                        descripcion: `Quedan ${diasStock.toFixed(1)} días de stock. Nivel actual: ${stockActual.toFixed(0)}kg vs consumo diario: ${consumoDiario.toFixed(0)}kg. Pedido urgente necesario.`,
                        acciones: ['Generar Pedido', 'Ver Detalles'],
                        producto: d.producto,
                        fundo: d.fundo?.nombre || 'N/A'
                    });
                }
                
                // Alerta de stock bajo
                else if (diasStock < 7) {
                    alertas.push({
                        tipo: 'warning',
                        titulo: `⚠️ Stock Bajo - ${d.producto}`,
                        descripcion: `Quedan ${diasStock.toFixed(1)} días de stock. Nivel actual: ${stockActual.toFixed(0)}kg. Considerar reabastecimiento pronto.`,
                        acciones: ['Programar Pedido', 'Ver Histórico'],
                        producto: d.producto,
                        fundo: d.fundo?.nombre || 'N/A'
                    });
                }
                
                // Alerta de oportunidad de compra
                if (diasStock > 60) {
                    alertas.push({
                        tipo: 'info',
                        titulo: `📈 Oportunidad - ${d.producto}`,
                        descripcion: `Stock elevado (${diasStock.toFixed(1)} días). Considerar negociar mejores precios o reducir inventario.`,
                        acciones: ['Optimizar', 'Mantener'],
                        producto: d.producto,
                        fundo: d.fundo?.nombre || 'N/A'
                    });
                }
                
                // Alerta de consumo inusual
                if (consumoDiario > 0) {
                    const consumoEsperado = stockMinimo * 0.3; // Estimar consumo esperado
                    if (consumoDiario > consumoEsperado * 1.5) {
                        alertas.push({
                            tipo: 'warning',
                            titulo: `📊 Consumo Elevado - ${d.producto}`,
                            descripcion: `Consumo diario (${consumoDiario.toFixed(0)}kg) es 50% superior a lo esperado. Revisar eficiencia de alimentación.`,
                            acciones: ['Analizar', 'Optimizar'],
                            producto: d.producto,
                            fundo: d.fundo?.nombre || 'N/A'
                        });
                    }
                }
                
                // Alerta de proveedor
                if (d.fecha_ultima_compra) {
                    const diasDesdeUltimaCompra = Math.floor((new Date() - new Date(d.fecha_ultima_compra)) / (1000 * 60 * 60 * 24));
                    if (diasDesdeUltimaCompra > 90) {
                        alertas.push({
                            tipo: 'info',
                            titulo: `📅 Revisión Proveedor - ${d.producto}`,
                            descripcion: `Hace ${diasDesdeUltimaCompra} días desde la última compra. Considerar evaluar proveedor o negociar mejores condiciones.`,
                            acciones: ['Evaluar', 'Contactar'],
                            producto: d.producto,
                            fundo: d.fundo?.nombre || 'N/A'
                        });
                    }
                }
            });
            
            // Alerta general de inventario
            const valorTotal = datos.reduce((total, d) => total + ((d.cantidad_actual || 0) * (d.costo_unitario || 0)), 0);
            if (valorTotal > 1000000) { // Más de $1M en inventario
                alertas.push({
                    tipo: 'info',
                    titulo: '💰 Capital Inmovilizado Elevado',
                    descripcion: `El valor total del inventario es de $${(valorTotal/1000000).toFixed(1)}M. Considerar optimizar niveles de stock.`,
                    acciones: ['Optimizar', 'Mantener'],
                    producto: 'General',
                    fundo: 'Todos'
                });
            }
            
        } catch (error) {
            console.warn('⚠️ Error generando alertas:', error.message);
        }
        
        // Ordenar alertas por prioridad (critical > warning > info)
        alertas.sort((a, b) => {
            const prioridad = { critical: 3, warning: 2, info: 1 };
            return prioridad[b.tipo] - prioridad[a.tipo];
        });
        
        return alertas.slice(0, 6); // Limitar a 6 alertas más importantes
    }

    renderizarAlertas() {
        console.log(`📋 Renderizando ${this.alertas.length} alertas`);
        
        // Usar el contenedor específico del sidebar
        const alertsContainer = document.getElementById('alertasContainer');
        console.log(`🔍 Contenedor #alertasContainer encontrado:`, !!alertsContainer);
        
        if (!alertsContainer) {
            console.log('⚠️ No se encontró contenedor #alertasContainer');
            // Buscar alternativas
            console.log('🔍 Buscando contenedores alternativos...');
            const alternatives = [
                '.alerts-panel',
                '.dashboard-sidebar',
                '#alertasContainer'
            ];
            alternatives.forEach(selector => {
                const element = document.querySelector(selector);
                console.log(`  • ${selector}:`, !!element);
            });
            return;
        }
        
        console.log(`📝 Contenedor encontrado,innerHTML actual:`, alertsContainer.innerHTML.substring(0, 100));
        
        // Limpiar alertas existentes
        alertsContainer.innerHTML = '';
        
        if (this.alertas.length === 0) {
            console.log('ℹ️ No hay alertas, mostrando mensaje de estado bueno');
            alertsContainer.innerHTML = `
                <div class="alert-item alert-success">
                    <div class="alert-icon">✅</div>
                    <div class="alert-content">
                        <div class="alert-title">Sin Alertas</div>
                        <div class="alert-description">El inventario está en buen estado</div>
                    </div>
                </div>
            `;
            return;
        }
        
        console.log(`🎨 Renderizando ${this.alertas.length} alertas...`);
        
        // Renderizar cada alerta
        this.alertas.forEach((alerta, index) => {
            const alertItem = document.createElement('div');
            alertItem.className = `alert-item alert-${alerta.tipo}`;
            alertItem.innerHTML = `
                <div class="alert-content-wrapper">
                    <div class="alert-header">
                        <div class="alert-info">
                            <div class="alert-title">${alerta.titulo}</div>
                            <div class="alert-description">${alerta.descripcion}</div>
                            <div class="alert-meta">
                                <span class="alert-product">📦 ${alerta.producto}</span>
                                <span class="alert-fundo">🏭 ${alerta.fundo}</span>
                            </div>
                        </div>
                    </div>
                    <div class="alert-actions">
                        ${alerta.acciones.slice(0, 2).map((accion, i) => `
                            <button class="btn btn-${this.getButtonType(alerta.tipo, i)} btn-sm" 
                                    onclick="window.plataforma.modules.inventario.handleAlertAction('${accion}', '${alerta.producto}', '${alerta.fundo}')">
                                <i class="fas ${this.getButtonIcon(accion)}"></i>
                                ${accion}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            
            alertsContainer.appendChild(alertItem);
            console.log(`✅ Alerta ${index + 1} agregada: ${alerta.titulo}`);
        });
        
        console.log(`✅ Alertas renderizadas. NuevoinnerHTML:`, alertsContainer.innerHTML.substring(0, 200));
        console.log('✅ Alertas renderizadas correctamente en sidebar');
    }
    
    getAlertIcon(tipo) {
        const icons = {
            critical: '🚨',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[tipo] || '📢';
    }
    
    getButtonType(alertType, buttonIndex) {
        // Primer botón (acción principal) usa el tipo de alerta
        // Segundo botón (acción secundaria) usa outline
        if (buttonIndex === 0) {
            const types = {
                critical: 'danger',
                warning: 'warning',
                info: 'info'
            };
            return types[alertType] || 'primary';
        } else {
            return 'outline-secondary';
        }
    }
    
    getButtonIcon(action) {
        const icons = {
            'Generar Pedido': 'fa-shopping-cart',
            'Ver Detalles': 'fa-eye',
            'Programar Pedido': 'fa-calendar-plus',
            'Ver Histórico': 'fa-history',
            'Optimizar': 'fa-chart-line',
            'Mantener': 'fa-check',
            'Analizar': 'fa-search',
            'Evaluar': 'fa-clipboard-check',
            'Contactar': 'fa-phone'
        };
        return icons[action] || 'fa-cog';
    }
    
    handleAlertAction(action, producto, fundo) {
        console.log(`🔔 Acción de alerta: ${action} - Producto: ${producto} - Fundo: ${fundo}`);
        
        // Aquí puedes implementar las acciones específicas
        switch(action) {
            case 'Generar Pedido':
                this.generarPedido(producto, fundo);
                break;
            case 'Ver Detalles':
                this.verDetallesProducto(producto, fundo);
                break;
            case 'Programar Pedido':
                this.programarPedido(producto, fundo);
                break;
            case 'Optimizar':
                this.optimizarInventario(producto, fundo);
                break;
            case 'Analizar':
                this.analizarConsumo(producto, fundo);
                break;
            default:
                console.log(`Acción "${action}" no implementada aún`);
        }
    }
    
    generarPedido(producto, fundo) {
        console.log(`� Generando pedido para ${producto} en ${fundo}`);
        // Implementar lógica de generación de pedido
        alert(`Generando pedido automático para ${producto} en ${fundo}`);
    }
    
    verDetallesProducto(producto, fundo) {
        console.log(`🔍 Viendo detalles de ${producto} en ${fundo}`);
        // Implementar vista de detalles
        alert(`Mostrando detalles de ${producto} en ${fundo}`);
    }
    
    programarPedido(producto, fundo) {
        console.log(`📅 Programando pedido para ${producto} en ${fundo}`);
        alert(`Programando pedido para ${producto} en ${fundo}`);
    }
    
    optimizarInventario(producto, fundo) {
        console.log(`⚡ Optimizando inventario de ${producto} en ${fundo}`);
        alert(`Optimizando niveles de inventario para ${producto} en ${fundo}`);
    }
    
    analizarConsumo(producto, fundo) {
        console.log(`📊 Analizando consumo de ${producto} en ${fundo}`);
        alert(`Analizando patrones de consumo para ${producto} en ${fundo}`);
    }

    /**
     * Actualizar la sección inventario-moderno con datos reales
     */
    actualizarInventarioModerno(datos) {
        console.log('🔄 Actualizando sección inventario-moderno...');
        
        // Agrupar datos por producto
        const datosPorProducto = {};
        datos.forEach(d => {
            const producto = d.producto?.nombre || d.producto || 'desconocido';
            if (!datosPorProducto[producto]) {
                datosPorProducto[producto] = d;
            }
        });
        
        // Actualizar cada producto
        const productos = ['concentrado', 'ensilaje', 'sales', 'fibra'];
        
        productos.forEach(producto => {
            const datosProducto = datosPorProducto[producto];
            if (datosProducto) {
                this.actualizarProductoInventario(producto, datosProducto);
            } else {
                console.log(`⚠️ No hay datos para producto: ${producto}`);
            }
        });
        
        console.log('✅ Sección inventario-moderno actualizada');
    }

    /**
     * Actualizar un producto específico en inventario-moderno
     */
    actualizarProductoInventario(producto, datos) {
        // Usar los campos reales de la base de datos
        const stockActual = datos.cantidad_actual || 0;
        const consumoDiario = datos.consumo_diario_promedio || 0;
        const diasDisponibles = datos.dias_stock || 0;
        const stockMinimo = datos.alerta_minimo || 0;
        const stockOptimo = stockMinimo * 2; // Estimar óptimo como 2x el mínimo
        
        // Calcular progreso (porcentaje respecto al nivel óptimo)
        const progreso = stockOptimo > 0 ? Math.min((stockActual / stockOptimo) * 100, 100) : 0;
        
        // Determinar estado
        let estado = 'status-critical';
        let estadoTexto = '🔴 Crítico';
        
        if (diasDisponibles > 30) {
            estado = 'status-good';
            estadoTexto = '🟢 Óptimo';
        } else if (diasDisponibles > 7) {
            estado = 'status-medium';
            estadoTexto = '🟡 Medio';
        }
        
        // Mapear nombres de productos para los IDs
        const productoMap = {
            'concentrado': 'Concentrado',
            'ensilaje': 'Ensilaje',
            'sales': 'Sales',
            'fibra': 'Fibra'
        };
        
        const productoId = productoMap[producto] || producto.charAt(0).toUpperCase() + producto.slice(1);
        
        // Actualizar DOM
        this.actualizarElemento(`stock${productoId}`, `${stockActual.toFixed(0)} kg`);
        this.actualizarElemento(`consumo${productoId}`, `${consumoDiario.toFixed(0)} kg`);
        this.actualizarElemento(`dias${productoId}`, `${diasDisponibles.toFixed(1)} días`);
        this.actualizarElemento(`status${productoId}`, estadoTexto);
        
        // Actualizar barra de progreso
        const progressBar = document.getElementById(`progress${productoId}`);
        if (progressBar) {
            progressBar.style.width = `${progreso}%`;
        }
        
        console.log(`✅ Producto ${producto} actualizado: ${stockActual}kg, ${diasDisponibles.toFixed(1)} días (${estadoTexto})`);
    }

    /**
     * Actualizar elemento DOM de forma segura
     */
    actualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        } else {
            console.warn(`⚠️ Elemento no encontrado: ${id}`);
        }
    }

    inicializarGraficos() {
        console.log('📈 Inicializando gráficos de inventario');
        
        this.inicializarGraficoEvolucion();
        this.inicializarGraficoConsumoReposicion();
        this.inicializarGraficoDistribucion();
        this.inicializarGraficoEficiencia();
        this.inicializarGraficoPronostico();
        
        console.log('✅ Gráficos de inventario inicializados');
    }

    inicializarGraficoEvolucion() {
        const canvas = document.getElementById('inventarioEvolutionChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const datos = this.filtrarDatos();
        
        // Agrupar datos por fecha
        const datosPorFecha = {};
        datos.forEach(d => {
            if (!datosPorFecha[d.fecha]) {
                datosPorFecha[d.fecha] = {
                    valor: 0,
                    volumen: 0,
                    unidades: 0
                };
            }
            datosPorFecha[d.fecha].valor += d.stockActual * d.costoUnitario;
            datosPorFecha[d.fecha].volumen += d.stockActual;
            datosPorFecha[d.fecha].unidades += 1;
        });
        
        const fechas = Object.keys(datosPorFecha).sort();
        const valores = fechas.map(fecha => datosPorFecha[fecha].valor);
        const volumenes = fechas.map(fecha => datosPorFecha[fecha].volumen);
        const unidades = fechas.map(fecha => datosPorFecha[fecha].unidades);
        
        this.charts.evolucion = new Chart(ctx, {
            type: 'line',
            data: {
                labels: fechas.map(fecha => {
                    const date = new Date(fecha);
                    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
                }),
                datasets: [{
                    label: 'Valor del Inventario',
                    data: valores,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    y: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-CL');
                            }
                        }
                    }
                }
            }
        });
        
        // Guardar datasets adicionales para cambiar vista
        this.charts.evolucion.datasetsAdicionales = {
            volumen: {
                label: 'Volumen Total',
                data: volumenes,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            },
            unidades: {
                label: 'Unidades',
                data: unidades,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)'
            }
        };
        
        console.log('📊 Gráfico de evolución inicializado');
    }

    inicializarGraficoConsumoReposicion() {
        const canvas = document.getElementById('consumoReposicionChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const datos = this.filtrarDatos();
        
        // Agrupar datos por fecha
        const datosPorFecha = {};
        datos.forEach(d => {
            if (!datosPorFecha[d.fecha]) {
                datosPorFecha[d.fecha] = {
                    consumo: 0,
                    reposicion: 0
                };
            }
            datosPorFecha[d.fecha].consumo += d.consumoDiario;
            // Simular reposición (en datos reales vendría de otra fuente)
            datosPorFecha[d.fecha].reposicion = Math.random() * 100 + 50;
        });
        
        const fechas = Object.keys(datosPorFecha).sort();
        const consumo = fechas.map(fecha => datosPorFecha[fecha].consumo);
        const reposicion = fechas.map(fecha => datosPorFecha[fecha].reposicion);
        
        this.charts.consumoReposicion = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: fechas.map(fecha => {
                    const date = new Date(fecha);
                    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
                }),
                datasets: [
                    {
                        label: 'Consumo Diario',
                        data: consumo,
                        backgroundColor: '#ef4444',
                        borderColor: '#dc2626',
                        borderWidth: 1
                    },
                    {
                        label: 'Reposición',
                        data: reposicion,
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    y: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    }
                }
            }
        });
        
        console.log('📊 Gráfico de consumo vs reposición inicializado');
    }

    inicializarGraficoDistribucion() {
        const canvas = document.getElementById('distribucionChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const datos = this.filtrarDatos();
        
        // Agrupar por producto
        const distribucion = {};
        datos.forEach(d => {
            if (!distribucion[d.productoNombre]) {
                distribucion[d.productoNombre] = {
                    valor: 0,
                    volumen: 0
                };
            }
            distribucion[d.productoNombre].valor += d.stockActual * d.costoUnitario;
            distribucion[d.productoNombre].volumen += d.stockActual;
        });
        
        const productos = Object.keys(distribucion);
        const valores = productos.map(p => distribucion[p].valor);
        const volumenes = productos.map(p => distribucion[p].volumen);
        
        this.charts.distribucion = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: productos,
                datasets: [{
                    label: 'Valor por Producto',
                    data: valores,
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                }
            }
        });
        
        // Guardar dataset de volumen para cambiar vista
        this.charts.distribucion.datasetVolumen = {
            label: 'Volumen por Producto',
            data: volumenes
        };
        
        console.log('📊 Gráfico de distribución inicializado');
    }

    inicializarGraficoEficiencia() {
        const canvas = document.getElementById('eficienciaChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const datos = this.filtrarDatos();
        
        // Agrupar por fundo
        const eficiencia = {};
        datos.forEach(d => {
            if (!eficiencia[d.fundoNombre]) {
                eficiencia[d.fundoNombre] = {
                    rotacion: 0,
                    merma: 0,
                    costo: 0,
                    count: 0
                };
            }
            eficiencia[d.fundoNombre].rotacion += d.consumoDiario / (d.stockActual || 1);
            eficiencia[d.fundoNombre].merma += d.merma;
            eficiencia[d.fundoNombre].costo += d.costoUnitario;
            eficiencia[d.fundoNombre].count += 1;
        });
        
        // Calcular promedios
        const fundos = Object.keys(eficiencia);
        const rotacion = fundos.map(f => eficiencia[f].rotacion / eficiencia[f].count);
        const merma = fundos.map(f => (eficiencia[f].merma / eficiencia[f].count) * 100);
        const costo = fundos.map(f => eficiencia[f].costo / eficiencia[f].count);
        
        this.charts.eficiencia = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: fundos,
                datasets: [{
                    label: 'Rotación de Inventario',
                    data: rotacion,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                },
                scales: {
                    r: {
                        grid: {
                            color: '#333333'
                        },
                        pointLabels: {
                            color: '#a0a0a0'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            backdropColor: 'transparent'
                        }
                    }
                }
            }
        });
        
        // Guardar datasets adicionales
        this.charts.eficiencia.datasetsAdicionales = {
            merma: {
                label: 'Merma (%)',
                data: merma,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)'
            },
            costo: {
                label: 'Costo Unitario',
                data: costo,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)'
            }
        };
        
        console.log('📊 Gráfico de eficiencia inicializado');
    }

    inicializarGraficoPronostico() {
        const canvas = document.getElementById('forecastChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const datos = this.filtrarDatos();
        
        // Generar datos históricos y pronóstico
        const diasHistoricos = 30;
        const diasPronostico = 15;
        const totalDias = diasHistoricos + diasPronostico;
        
        const fechas = [];
        const valoresHistoricos = [];
        const valoresPronostico = [];
        
        // Datos históricos
        for (let i = diasHistoricos; i >= 0; i--) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - i);
            fechas.push(fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }));
            valoresHistoricos.push(Math.random() * 100000 + 200000);
        }
        
        // Datos pronosticados (con tendencia)
        const ultimoValor = valoresHistoricos[valoresHistoricos.length - 1];
        for (let i = 1; i <= diasPronostico; i++) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() + i);
            fechas.push(fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }));
            valoresPronostico.push(ultimoValor + (i * 2000) + (Math.random() * 10000 - 5000));
        }
        
        this.charts.pronostico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: fechas,
                datasets: [
                    {
                        label: 'Histórico',
                        data: [...valoresHistoricos, ...Array(diasPronostico).fill(null)],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: 'Pronóstico',
                        data: [...Array(diasHistoricos).fill(null), ...valoresPronostico],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    y: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-CL');
                            }
                        }
                    }
                }
            }
        });
        
        console.log('📊 Gráfico de pronóstico inicializado');
    }

    actualizarGraficos(datos) {
        console.log('🔄 Actualizando gráficos con datos filtrados');
        
        // Actualizar cada gráfico con los nuevos datos
        this.actualizarGraficoEvolucion(datos);
        this.actualizarGraficoConsumoReposicion(datos);
        this.actualizarGraficoDistribucion(datos);
        this.actualizarGraficoEficiencia(datos);
        this.actualizarGraficoPronostico(datos);
    }

    actualizarGraficoEvolucion(datos) {
        if (!this.charts.evolucion) return;
        
        // Agrupar datos por fecha
        const datosPorFecha = {};
        datos.forEach(d => {
            if (!datosPorFecha[d.fecha]) {
                datosPorFecha[d.fecha] = {
                    valor: 0,
                    volumen: 0,
                    unidades: 0
                };
            }
            datosPorFecha[d.fecha].valor += d.stockActual * d.costoUnitario;
            datosPorFecha[d.fecha].volumen += d.stockActual;
            datosPorFecha[d.fecha].unidades += 1;
        });
        
        const fechas = Object.keys(datosPorFecha).sort();
        const valores = fechas.map(fecha => datosPorFecha[fecha].valor);
        const volumenes = fechas.map(fecha => datosPorFecha[fecha].volumen);
        const unidades = fechas.map(fecha => datosPorFecha[fecha].unidades);
        
        // Actualizar datasets
        this.charts.evolucion.data.labels = fechas.map(fecha => {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
        });
        
        this.charts.evolucion.data.datasets[0].data = valores;
        this.charts.evolucion.datasetsAdicionales.volumen.data = volumenes;
        this.charts.evolucion.datasetsAdicionales.unidades.data = unidades;
        
        this.charts.evolucion.update();
    }

    actualizarGraficoConsumoReposicion(datos) {
        if (!this.charts.consumoReposicion) return;
        
        // Agrupar datos por fecha
        const datosPorFecha = {};
        datos.forEach(d => {
            if (!datosPorFecha[d.fecha]) {
                datosPorFecha[d.fecha] = {
                    consumo: 0,
                    reposicion: 0
                };
            }
            datosPorFecha[d.fecha].consumo += d.consumoDiario;
            datosPorFecha[d.fecha].reposicion = Math.random() * 100 + 50;
        });
        
        const fechas = Object.keys(datosPorFecha).sort();
        const consumo = fechas.map(fecha => datosPorFecha[fecha].consumo);
        const reposicion = fechas.map(fecha => datosPorFecha[fecha].reposicion);
        
        this.charts.consumoReposicion.data.labels = fechas.map(fecha => {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
        });
        
        this.charts.consumoReposicion.data.datasets[0].data = consumo;
        this.charts.consumoReposicion.data.datasets[1].data = reposicion;
        
        this.charts.consumoReposicion.update();
    }

    actualizarGraficoDistribucion(datos) {
        if (!this.charts.distribucion) return;
        
        // Agrupar por producto
        const distribucion = {};
        datos.forEach(d => {
            if (!distribucion[d.productoNombre]) {
                distribucion[d.productoNombre] = {
                    valor: 0,
                    volumen: 0
                };
            }
            distribucion[d.productoNombre].valor += d.stockActual * d.costoUnitario;
            distribucion[d.productoNombre].volumen += d.stockActual;
        });
        
        const productos = Object.keys(distribucion);
        const valores = productos.map(p => distribucion[p].valor);
        const volumenes = productos.map(p => distribucion[p].volumen);
        
        this.charts.distribucion.data.labels = productos;
        this.charts.distribucion.data.datasets[0].data = valores;
        this.charts.distribucion.datasetVolumen.data = volumenes;
        
        this.charts.distribucion.update();
    }

    actualizarGraficoEficiencia(datos) {
        if (!this.charts.eficiencia) return;
        
        // Agrupar por fundo
        const eficiencia = {};
        datos.forEach(d => {
            if (!eficiencia[d.fundoNombre]) {
                eficiencia[d.fundoNombre] = {
                    rotacion: 0,
                    merma: 0,
                    costo: 0,
                    count: 0
                };
            }
            eficiencia[d.fundoNombre].rotacion += d.consumoDiario / (d.stockActual || 1);
            eficiencia[d.fundoNombre].merma += d.merma;
            eficiencia[d.fundoNombre].costo += d.costoUnitario;
            eficiencia[d.fundoNombre].count += 1;
        });
        
        // Calcular promedios
        const fundos = Object.keys(eficiencia);
        const rotacion = fundos.map(f => eficiencia[f].rotacion / eficiencia[f].count);
        const merma = fundos.map(f => (eficiencia[f].merma / eficiencia[f].count) * 100);
        const costo = fundos.map(f => eficiencia[f].costo / eficiencia[f].count);
        
        this.charts.eficiencia.data.labels = fundos;
        this.charts.eficiencia.data.datasets[0].data = rotacion;
        this.charts.eficiencia.datasetsAdicionales.merma.data = merma;
        this.charts.eficiencia.datasetsAdicionales.costo.data = costo;
        
        this.charts.eficiencia.update();
    }

    actualizarGraficoPronostico(datos) {
        if (!this.charts.pronostico) return;
        
        // El pronóstico se mantiene igual, pero podríamos actualizarlo
        // basándonos en las tendencias recientes
        console.log('📊 Gráfico de pronóstico mantenido (se podría actualizar con tendencias)');
    }

    actualizarPronosticos(datos) {
        console.log('🔮 Actualizando pronósticos');
        
        const pronosticos = this.calcularPronosticos(datos);
        this.renderizarPronosticos(pronosticos);
    }

    calcularPronosticos(datos) {
        return {
            demanda: '+15.2%',
            inversion: '$458,000',
            riesgo: '2 productos',
            oportunidad: '$125,000'
        };
    }

    renderizarPronosticos(pronosticos) {
        const forecastItems = document.querySelectorAll('.forecast-value');
        const valores = [pronosticos.demanda, pronosticos.inversion, pronosticos.riesgo, pronosticos.oportunidad];
        
        forecastItems.forEach((item, index) => {
            if (valores[index]) {
                item.textContent = valores[index];
            }
        });
    }

    actualizarTabla(datos) {
        console.log('📋 Actualizando tabla de inventario');
        
        const tablaContainer = document.querySelector('.inventory-table-container');
        if (!tablaContainer) {
            console.log('⚠️ Tabla de inventario no encontrada');
            return;
        }
        
        const tabla = tablaContainer.querySelector('table tbody');
        if (!tabla) {
            console.log('⚠️ Cuerpo de tabla no encontrado');
            return;
        }
        
        // Limpiar tabla
        tabla.innerHTML = '';
        
        if (datos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="8">No hay datos disponibles</td></tr>';
            return;
        }
        
        // Agrupar datos por producto para mostrar el más reciente
        const datosPorProducto = {};
        datos.forEach(d => {
            const producto = d.producto || 'desconocido';
            if (!datosPorProducto[producto]) {
                datosPorProducto[producto] = d;
            }
        });
        
        Object.values(datosPorProducto).forEach(d => {
            const row = document.createElement('tr');
            
            // Usar campos reales de la base de datos
            const stockActual = d.cantidad_actual || 0;
            const consumoDiario = d.consumo_diario_promedio || 0;
            const diasStock = consumoDiario > 0 ? stockActual / consumoDiario : 0;
            const estado = this.getEstadoStock(diasStock);
            
            row.innerHTML = `
                <td><strong>${d.producto || 'N/A'}</strong></td>
                <td>${d.fundo?.nombre || 'N/A'}</td>
                <td>${stockActual.toFixed(0)} kg</td>
                <td>${consumoDiario.toFixed(0)} kg</td>
                <td>${diasStock.toFixed(1)}</td>
                <td><span class="stock-status stock-${estado.clase}">${estado.texto}</span></td>
                <td>${d.fecha_ultima_compra ? new Date(d.fecha_ultima_compra).toLocaleDateString() : 'N/A'}</td>
                <td>${diasStock < 3 ? 'Inmediato' : 'Próxima semana'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-primary">${diasStock < 3 ? 'Urgente' : 'Pedir'}</button>
                        <button class="action-btn action-btn-secondary">Ver</button>
                    </div>
                </td>
            `;
            
            tabla.appendChild(row);
        });
        
        console.log('✅ Tabla de inventario actualizada');
    }

    getEstadoStock(dias) {
        if (dias < 3) return { clase: 'critical', texto: 'Crítico' };
        if (dias < 7) return { clase: 'warning', texto: 'Bajo' };
        return { clase: 'good', texto: 'Óptimo' };
    }

    handleAlertAction(button) {
        const action = button.textContent;
        console.log(`🔘 Acción de alerta: ${action}`);
        
        if (action === 'Generar Pedido') {
            this.generarPedido();
        } else if (action === 'Investigar') {
            this.investigarMerma();
        } else if (action === 'Evaluar') {
            this.evaluarOportunidad();
        }
    }

    handleChartControl(button) {
        // Quitar clase active de todos los botones del mismo grupo
        const group = button.parentElement;
        group.querySelectorAll('.chart-control').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Agregar clase active al botón clickeado
        button.classList.add('active');
        
        const chartCard = button.closest('.chart-card');
        const chartTitle = chartCard.querySelector('.chart-title').textContent;
        const controlText = button.textContent;
        
        console.log(`📊 Control de gráfico: ${chartTitle} - ${controlText}`);
        
        // Cambiar vista según el gráfico y control
        if (chartTitle.includes('Evolución del Inventario')) {
            this.cambiarVistaEvolucion(controlText);
        } else if (chartTitle.includes('Consumo vs Reposición')) {
            this.cambiarVistaConsumoReposicion(controlText);
        } else if (chartTitle.includes('Distribución')) {
            this.cambiarVistaDistribucion(controlText);
        } else if (chartTitle.includes('Eficiencia')) {
            this.cambiarVistaEficiencia(controlText);
        }
    }

    cambiarVistaEvolucion(vista) {
        if (!this.charts.evolucion) return;
        
        let dataset;
        if (vista === 'Valor') {
            dataset = this.charts.evolucion.data.datasets[0];
        } else if (vista === 'Volumen') {
            dataset = this.charts.evolucion.datasetsAdicionales.volumen;
        } else if (vista === 'Unidades') {
            dataset = this.charts.evolucion.datasetsAdicionales.unidades;
        }
        
        if (dataset) {
            // Actualizar el dataset principal
            this.charts.evolucion.data.datasets[0] = {
                ...dataset,
                borderWidth: 2,
                fill: vista === 'Valor',
                tension: 0.4
            };
            
            // Actualizar el eje Y según la vista
            if (vista === 'Valor') {
                this.charts.evolucion.options.scales.y.ticks.callback = function(value) {
                    return '$' + value.toLocaleString('es-CL');
                };
            } else if (vista === 'Volumen') {
                this.charts.evolucion.options.scales.y.ticks.callback = function(value) {
                    return value.toLocaleString('es-CL') + ' kg';
                };
            } else {
                this.charts.evolucion.options.scales.y.ticks.callback = function(value) {
                    return value.toLocaleString('es-CL');
                };
            }
            
            this.charts.evolucion.update();
        }
    }

    cambiarVistaConsumoReposicion(vista) {
        // Para consumo vs reposición, solo cambiar el período
        console.log(`📊 Cambiando vista de consumo/reposición a: ${vista}`);
        // En una implementación real, aquí se filtrarían los datos según el período
        this.actualizarGraficos(this.filtrarDatos());
    }

    cambiarVistaDistribucion(vista) {
        if (!this.charts.distribucion) return;
        
        if (vista === 'Por Valor') {
            this.charts.distribucion.data.datasets[0].data = this.charts.distribucion.data.datasets[0].data;
            this.charts.distribucion.data.datasets[0].label = 'Valor por Producto';
        } else if (vista === 'Por Volumen') {
            this.charts.distribucion.data.datasets[0].data = this.charts.distribucion.datasetVolumen.data;
            this.charts.distribucion.data.datasets[0].label = 'Volumen por Producto';
        }
        
        this.charts.distribucion.update();
    }

    cambiarVistaEficiencia(vista) {
        if (!this.charts.eficiencia) return;
        
        let dataset;
        if (vista === 'Rotación') {
            dataset = this.charts.eficiencia.data.datasets[0];
        } else if (vista === 'Merma') {
            dataset = this.charts.eficiencia.datasetsAdicionales.merma;
        } else if (vista === 'Costo') {
            dataset = this.charts.eficiencia.datasetsAdicionales.costo;
        }
        
        if (dataset) {
            this.charts.eficiencia.data.datasets[0] = dataset;
            this.charts.eficiencia.update();
        }
    }

    generarPedido() {
        console.log('📦 Generando pedido automático');
        // Lógica para generar pedido
    }

    investigarMerma() {
        console.log('🔍 Investigando causas de merma');
        // Lógica para investigar merma
    }

    evaluarOportunidad() {
        console.log('💰 Evaluando oportunidad de compra');
        // Lógica para evaluar oportunidad
    }

    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    }
}

// Inicializar el módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('inventario.html')) {
        window.inventarioModule = new InventarioModule();
    }
});

// Exportar para uso global
window.InventarioModule = InventarioModule;
