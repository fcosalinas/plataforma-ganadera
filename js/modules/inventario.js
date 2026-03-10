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

    init() {
        console.log('📦 Módulo de Inventario inicializado');
        
        // Verificar si estamos en la sección de inventario
        if (!document.getElementById('inventarioEvolutionChart')) {
            console.log('⚠️ Elementos de inventario no encontrados, esperando a que la sección esté activa');
            return;
        }
        
        this.cargarDatos();
        this.configurarEventListeners();
        this.inicializarGraficos();
        this.actualizarDashboard();
    }

    // Método para reinicializar cuando la sección se activa
    reinit() {
        console.log('🔄 Reinicializando módulo de inventario');
        
        // Destruir gráficos existentes
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        this.charts = {};
        
        // Reinicializar
        this.init();
    }

    cargarDatos() {
        // Simular datos de inventario para 7 fundos
        this.datos = this.generarDatosInventario();
        console.log(`📊 Cargados ${this.datos.length} registros de inventario`);
        
        // Mostrar muestra de datos para depuración
        if (this.datos.length > 0) {
            console.log('📋 Muestra de datos:', this.datos.slice(0, 3));
            console.log('🏭 Fundos únicos:', [...new Set(this.datos.map(d => d.fundo))]);
            console.log('📦 Productos únicos:', [...new Set(this.datos.map(d => d.producto))]);
            console.log('📅 Fechas únicas:', [...new Set(this.datos.map(d => d.fecha))].slice(0, 5));
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
        let datosFiltrados = [...this.datos];
        
        // Filtrar por fundo
        if (this.filtroActual.fundo !== 'todos') {
            datosFiltrados = datosFiltrados.filter(d => d.fundo === this.filtroActual.fundo);
        }
        
        // Filtrar por producto
        if (this.filtroActual.producto !== 'todos') {
            datosFiltrados = datosFiltrados.filter(d => d.producto === this.filtroActual.producto);
        }
        
        // Filtrar por período
        const dias = this.getDiasPeriodo(this.filtroActual.periodo);
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        
        datosFiltrados = datosFiltrados.filter(d => new Date(d.fecha) >= fechaLimite);
        
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
        
        const datosFiltrados = this.filtrarDatos();
        this.actualizarKPIs(datosFiltrados);
        this.actualizarAlertas(datosFiltrados);
        this.actualizarGraficos(datosFiltrados);
        this.actualizarPronosticos(datosFiltrados);
        this.actualizarTabla(datosFiltrados);
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
        
        this.alertas = this.generarAlertas(datos);
        this.renderizarAlertas();
    }

    generarAlertas(datos) {
        const alertas = [];
        const datosHoy = datos.filter(d => d.fecha === datos[datos.length - 1]?.fecha);
        
        datosHoy.forEach(d => {
            // Alerta de stock crítico
            if (d.stockActual < d.stockMinimo) {
                alertas.push({
                    tipo: 'critical',
                    titulo: `🚨 Stock Crítico - ${d.productoNombre} ${d.fundoNombre}`,
                    descripcion: `Quedan ${(d.stockActual / d.consumoDiario).toFixed(1)} días de stock. Nivel actual: ${d.stockActual.toFixed(0)}kg vs consumo diario: ${d.consumoDiario.toFixed(0)}kg. Pedido urgente necesario.`,
                    acciones: ['Generar Pedido', 'Ver Detalles']
                });
            }
            
            // Alerta de merma elevada
            if (d.merma > 0.05) {
                alertas.push({
                    tipo: 'warning',
                    titulo: `⚠️ Merma Elevada - ${d.productoNombre} ${d.fundoNombre}`,
                    descripcion: `Merma del ${(d.merma * 100).toFixed(1)}% supera el umbral del 5%. Revisar condiciones de almacenamiento.`,
                    acciones: ['Investigar', 'Ver Histórico']
                });
            }
            
            // Alerta de oportunidad
            if (Math.random() < 0.1) { // 10% de probabilidad
                alertas.push({
                    tipo: 'info',
                    titulo: `📈 Oportunidad - Compra ${d.productoNombre}`,
                    descripcion: `Proveedor ofrece 15% descuento por compra mayor a 500kg. Stock actual: ${d.stockActual.toFixed(0)}kg.`,
                    acciones: ['Evaluar', 'Ignorar']
                });
            }
        });
        
        return alertas.slice(0, 3); // Limitar a 3 alertas
    }

    renderizarAlertas() {
        const alertsContainer = document.querySelector('.alerts-grid');
        if (!alertsContainer) return;
        
        alertsContainer.innerHTML = '';
        
        this.alertas.forEach(alerta => {
            const alertCard = document.createElement('div');
            alertCard.className = `alert-card alert-${alerta.tipo}`;
            
            alertCard.innerHTML = `
                <div class="alert-content">
                    <div class="alert-title">${alerta.titulo}</div>
                    <div class="alert-description">${alerta.descripcion}</div>
                </div>
                <div class="alert-actions">
                    <button class="alert-action alert-action-primary">${alerta.acciones[0]}</button>
                    <button class="alert-action alert-action-secondary">${alerta.acciones[1]}</button>
                </div>
            `;
            
            alertsContainer.appendChild(alertCard);
        });
    }

    inicializarGraficos() {
        console.log('📈 Inicializando gráficos de inventario');
        
        this.inicializarGraficoEvolucion();
        this.inicializarGraficoConsumoReposicion();
        this.inicializarGraficoDistribucion();
        this.inicializarGraficoEficiencia();
        this.inicializarGraficoPronostico();
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
        
        const tbody = document.querySelector('.inventory-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const datosHoy = datos.filter(d => d.fecha === datos[datos.length - 1]?.fecha);
        
        datosHoy.forEach(d => {
            const row = document.createElement('tr');
            const diasStock = d.stockActual / d.consumoDiario;
            const estado = this.getEstadoStock(diasStock);
            
            row.innerHTML = `
                <td><strong>${d.productoNombre}</strong></td>
                <td>${d.fundoNombre}</td>
                <td>${d.stockActual.toFixed(0)} kg</td>
                <td>${d.consumoDiario.toFixed(0)} kg</td>
                <td>${diasStock.toFixed(1)}</td>
                <td><span class="stock-status stock-${estado.clase}">${estado.texto}</span></td>
                <td>${d.ultimoPedido}</td>
                <td>${diasStock < 3 ? 'Inmediato' : d.proximoPedido}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-primary">${diasStock < 3 ? 'Urgente' : 'Pedir'}</button>
                        <button class="action-btn action-btn-secondary">Ver</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
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
