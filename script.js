// Plataforma Ganadera Digital - Main JavaScript
class PlataformaGanadera {
    constructor() {
        this.datos = this.cargarDatos();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCharts();
        this.cargarDatosEjemplo();
        this.actualizarDashboard();
        this.cargarHistorial();
        this.setFechaActual();
    }

    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.cambiarSeccion(e.target.dataset.section));
        });

        // Formulario
        document.getElementById('formDatos').addEventListener('submit', (e) => this.guardarDatos(e));
        document.getElementById('formDatos').addEventListener('reset', () => this.setFechaActual());

        // Event listeners para cálculos automáticos
        document.getElementById('lecheAM').addEventListener('input', () => this.calcularCamposAutomaticos());
        document.getElementById('lechePM').addEventListener('input', () => this.calcularCamposAutomaticos());
        document.getElementById('lecheTerneros').addEventListener('input', () => this.calcularCamposAutomaticos());
        document.getElementById('descartePersonal').addEventListener('input', () => this.calcularCamposAutomaticos());
        document.getElementById('vacasEstanque').addEventListener('input', () => this.calcularCamposAutomaticos());
        document.getElementById('kilosEnsilaje').addEventListener('input', () => this.calcularCamposAutomaticos());
        document.getElementById('kilosHeno').addEventListener('input', () => this.calcularCamposAutomaticos());
        document.getElementById('kilosOtrosForrajes').addEventListener('input', () => this.calcularCamposAutomaticos());
        document.getElementById('kilosRacion').addEventListener('input', () => this.calcularCamposAutomaticos());

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.cerrarModal());
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.cerrarModal();
            }
        });
    }

    cambiarSeccion(seccion) {
        // Actualizar botones de navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${seccion}"]`).classList.add('active');

        // Mostrar sección correspondiente
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(seccion).classList.add('active');

        // Actualizar datos si es necesario
        if (seccion === 'dashboard') {
            this.actualizarDashboard();
        } else if (seccion === 'historial') {
            this.cargarHistorial();
        }
    }

    setFechaActual() {
        const fechaInput = document.getElementById('fecha');
        const diaInput = document.getElementById('dia');
        const hoy = new Date();
        fechaInput.value = hoy.toISOString().split('T')[0];
        diaInput.value = hoy.getDate();
        fechaInput.max = hoy.toISOString().split('T')[0]; // No permitir fechas futuras
    }

    calcularCamposAutomaticos() {
        // Calcular Total Ordeña
        const vacasEstanque = parseInt(document.getElementById('vacasEstanque').value) || 0;
        const ingresoVacas = parseInt(document.getElementById('ingresoVacas').value) || 0;
        const salidaVacas = parseInt(document.getElementById('salidaVacas').value) || 0;
        const totalOrdeña = vacasEstanque + ingresoVacas - salidaVacas;
        document.getElementById('totalOrdeña').value = Math.max(0, totalOrdeña);

        // Calcular Leche Total
        const lecheAM = parseFloat(document.getElementById('lecheAM').value) || 0;
        const lechePM = parseFloat(document.getElementById('lechePM').value) || 0;
        const lecheTotal = lecheAM + lechePM;
        document.getElementById('lecheTotal').value = lecheTotal.toFixed(1);

        // Calcular Total Leche Diaria
        const lecheTerneros = parseFloat(document.getElementById('lecheTerneros').value) || 0;
        const descartePersonal = parseFloat(document.getElementById('descartePersonal').value) || 0;
        const totalLecheDiaria = lecheTotal + lecheTerneros + descartePersonal;
        document.getElementById('totalLecheDiaria').value = totalLecheDiaria.toFixed(1);

        // Calcular Leche Planta (Leche Total - Terneros - Descarte)
        const lechePlanta = Math.max(0, lecheTotal - lecheTerneros - descartePersonal);
        document.getElementById('lechePlanta').value = lechePlanta.toFixed(1);

        // Calcular Promedio por Vaca
        if (totalOrdeña > 0) {
            const promedioPorVaca = lecheTotal / totalOrdeña;
            document.getElementById('promedioPorVaca').value = promedioPorVaca.toFixed(1);
        } else {
            document.getElementById('promedioPorVaca').value = '0';
        }

        // Calcular Total Día (Forrajes)
        const kilosEnsilaje = parseFloat(document.getElementById('kilosEnsilaje').value) || 0;
        const kilosHeno = parseFloat(document.getElementById('kilosHeno').value) || 0;
        const kilosOtrosForrajes = parseFloat(document.getElementById('kilosOtrosForrajes').value) || 0;
        const kilosRacion = parseFloat(document.getElementById('kilosRacion').value) || 0;
        const totalDia = kilosEnsilaje + kilosHeno + kilosOtrosForrajes + kilosRacion;
        document.getElementById('totalDia').value = totalDia.toFixed(1);
    }

    guardarDatos(e) {
        e.preventDefault();
        
        // Calcular campos automáticos
        this.calcularCamposAutomaticos();
        
        const datosDia = {
            id: Date.now(),
            fundo: document.getElementById('fundo').value,
            fecha: document.getElementById('fecha').value,
            dia: parseInt(document.getElementById('dia').value),
            // Vacas
            vacasEstanque: parseInt(document.getElementById('vacasEstanque').value) || 0,
            vacasDescarte: parseInt(document.getElementById('vacasDescarte').value) || 0,
            ingresoVacas: parseInt(document.getElementById('ingresoVacas').value) || 0,
            salidaVacas: parseInt(document.getElementById('salidaVacas').value) || 0,
            totalOrdeña: parseInt(document.getElementById('totalOrdeña').value) || 0,
            // Leche
            lecheAM: parseFloat(document.getElementById('lecheAM').value) || 0,
            lechePM: parseFloat(document.getElementById('lechePM').value) || 0,
            lecheTotal: parseFloat(document.getElementById('lecheTotal').value) || 0,
            lecheTerneros: parseFloat(document.getElementById('lecheTerneros').value) || 0,
            descartePersonal: parseFloat(document.getElementById('descartePersonal').value) || 0,
            totalLecheDiaria: parseFloat(document.getElementById('totalLecheDiaria').value) || 0,
            lechePlanta: parseFloat(document.getElementById('lechePlanta').value) || 0,
            promedioPorVaca: parseFloat(document.getElementById('promedioPorVaca').value) || 0,
            // Pastoreo
            kilosMateriaSeca: parseFloat(document.getElementById('kilosMateriaSeca').value) || 0,
            potreroAM: document.getElementById('potreroAM').value,
            potreroPM: document.getElementById('potreroPM').value,
            potreroNoche: document.getElementById('potreroNoche').value,
            // Suplementos
            kilosEnergia: parseFloat(document.getElementById('kilosEnergia').value) || 0,
            kilosProteina: parseFloat(document.getElementById('kilosProteina').value) || 0,
            kilosAditivos: parseFloat(document.getElementById('kilosAditivos').value) || 0,
            kilosSalesOtros: parseFloat(document.getElementById('kilosSalesOtros').value) || 0,
            // Forrajes
            kilosEnsilaje: parseFloat(document.getElementById('kilosEnsilaje').value) || 0,
            kilosHeno: parseFloat(document.getElementById('kilosHeno').value) || 0,
            kilosOtrosForrajes: parseFloat(document.getElementById('kilosOtrosForrajes').value) || 0,
            kilosRacion: parseFloat(document.getElementById('kilosRacion').value) || 0,
            totalDia: parseFloat(document.getElementById('totalDia').value) || 0,
            // Observaciones
            observaciones: document.getElementById('observaciones').value,
            timestamp: new Date().toISOString()
        };

        // Validar que no exista un registro para la misma fecha y fundo
        const existeRegistro = this.datos.find(d => d.fecha === datosDia.fecha && d.fundo === datosDia.fundo);
        if (existeRegistro) {
            if (confirm(`Ya existe un registro para la fecha ${datosDia.fecha} en el fundo ${datosDia.fundo}. ¿Desea reemplazarlo?`)) {
                this.datos = this.datos.filter(d => !(d.fecha === datosDia.fecha && d.fundo === datosDia.fundo));
            } else {
                return;
            }
        }

        this.datos.push(datosDia);
        this.guardarDatosStorage();
        
        this.mostrarMensaje('Datos guardados exitosamente', 'success');
        e.target.reset();
        this.setFechaActual();
        
        // Actualizar dashboard si está visible
        if (document.getElementById('dashboard').classList.contains('active')) {
            this.actualizarDashboard();
        }
    }

    cargarDatos() {
        const datosGuardados = localStorage.getItem('datosGanadera');
        return datosGuardados ? JSON.parse(datosGuardados) : [];
    }

    cargarDatosEjemplo() {
        // Solo cargar datos de ejemplo si no hay datos guardados
        if (this.datos.length > 0) {
            return;
        }

        // Datos basados en las imágenes de tu planilla manual (Octubre 2023, Fundo: Dollinco)
        const datosEjemplo = [
            {
                id: Date.now() - 100000,
                fundo: "Dollinco",
                fecha: "2023-10-01",
                dia: 1,
                // Vacas
                vacasEstanque: 120,
                vacasDescarte: 2,
                ingresoVacas: 0,
                salidaVacas: 0,
                totalOrdeña: 120,
                // Leche
                lecheAM: 450.5,
                lechePM: 420.3,
                lecheTotal: 870.8,
                lecheTerneros: 15.0,
                descartePersonal: 8.5,
                totalLecheDiaria: 894.3,
                lechePlanta: 847.3,
                promedioPorVaca: 7.3,
                // Pastoreo
                kilosMateriaSeca: 14.5,
                potreroAM: "Potrero 1",
                potreroPM: "Potrero 2",
                potreroNoche: "Potrero 3",
                // Suplementos
                kilosEnergia: 85.2,
                kilosProteina: 42.8,
                kilosAditivos: 8.5,
                kilosSalesOtros: 12.3,
                // Forrajes
                kilosEnsilaje: 120.5,
                kilosHeno: 45.8,
                kilosOtrosForrajes: 0,
                kilosRacion: 180.0,
                totalDia: 346.3,
                observaciones: "Buen día de producción, pastoreo normal",
                timestamp: "2023-10-01T08:00:00.000Z"
            },
            {
                id: Date.now() - 90000,
                fundo: "Dollinco",
                fecha: "2023-10-02",
                dia: 2,
                // Vacas
                vacasEstanque: 118,
                vacasDescarte: 1,
                ingresoVacas: 0,
                salidaVacas: 2,
                totalOrdeña: 118,
                // Leche
                lecheAM: 445.2,
                lechePM: 418.7,
                lecheTotal: 863.9,
                lecheTerneros: 14.5,
                descartePersonal: 7.8,
                totalLecheDiaria: 886.2,
                lechePlanta: 841.6,
                promedioPorVaca: 7.3,
                // Pastoreo
                kilosMateriaSeca: 14.2,
                potreroAM: "Potrero 2",
                potreroPM: "Potrero 3",
                potreroNoche: "Potrero 4",
                // Suplementos
                kilosEnergia: 83.5,
                kilosProteina: 41.2,
                kilosAditivos: 8.2,
                kilosSalesOtros: 11.8,
                // Forrajes
                kilosEnsilaje: 115.3,
                kilosHeno: 48.2,
                kilosOtrosForrajes: 0,
                kilosRacion: 175.5,
                totalDia: 339.0,
                observaciones: "Leche ligeramente menor, posible estrés por calor",
                timestamp: "2023-10-02T08:00:00.000Z"
            },
            {
                id: Date.now() - 80000,
                fundo: "Dollinco",
                fecha: "2023-10-03",
                dia: 3,
                // Vacas
                vacasEstanque: 119,
                vacasDescarte: 1,
                ingresoVacas: 1,
                salidaVacas: 0,
                totalOrdeña: 119,
                // Leche
                lecheAM: 452.8,
                lechePM: 425.4,
                lecheTotal: 878.2,
                lecheTerneros: 15.2,
                descartePersonal: 8.2,
                totalLecheDiaria: 901.6,
                lechePlanta: 854.8,
                promedioPorVaca: 7.4,
                // Pastoreo
                kilosMateriaSeca: 14.8,
                potreroAM: "Potrero 3",
                potreroPM: "Potrero 4",
                potreroNoche: "Potrero 1",
                // Suplementos
                kilosEnergia: 87.3,
                kilosProteina: 43.5,
                kilosAditivos: 8.8,
                kilosSalesOtros: 12.5,
                // Forrajes
                kilosEnsilaje: 125.8,
                kilosHeno: 42.3,
                kilosOtrosForrajes: 0,
                kilosRacion: 182.5,
                totalDia: 350.6,
                observaciones: "Recuperación en producción, buen apetito",
                timestamp: "2023-10-03T08:00:00.000Z"
            },
            {
                id: Date.now() - 70000,
                fundo: "Dollinco",
                fecha: "2023-10-04",
                dia: 4,
                // Vacas
                vacasEstanque: 120,
                vacasDescarte: 0,
                ingresoVacas: 1,
                salidaVacas: 0,
                totalOrdeña: 120,
                // Leche
                lecheAM: 460.3,
                lechePM: 432.1,
                lecheTotal: 892.4,
                lecheTerneros: 16.0,
                descartePersonal: 9.0,
                totalLecheDiaria: 917.4,
                lechePlanta: 867.4,
                promedioPorVaca: 7.4,
                // Pastoreo
                kilosMateriaSeca: 15.0,
                potreroAM: "Potrero 4",
                potreroPM: "Potrero 1",
                potreroNoche: "Potrero 2",
                // Suplementos
                kilosEnergia: 89.2,
                kilosProteina: 44.8,
                kilosAditivos: 9.0,
                kilosSalesOtros: 13.2,
                // Forrajes
                kilosEnsilaje: 130.2,
                kilosHeno: 40.5,
                kilosOtrosForrajes: 0,
                kilosRacion: 188.3,
                totalDia: 359.0,
                observaciones: "Excelente día de producción, forraje de calidad",
                timestamp: "2023-10-04T08:00:00.000Z"
            },
            {
                id: Date.now() - 60000,
                fundo: "Dollinco",
                fecha: "2023-10-05",
                dia: 5,
                // Vacas
                vacasEstanque: 117,
                vacasDescarte: 2,
                ingresoVacas: 0,
                salidaVacas: 1,
                totalOrdeña: 117,
                // Leche
                lecheAM: 438.7,
                lechePM: 412.5,
                lecheTotal: 851.2,
                lecheTerneros: 14.8,
                descartePersonal: 8.3,
                totalLecheDiaria: 874.3,
                lechePlanta: 828.1,
                promedioPorVaca: 7.3,
                // Pastoreo
                kilosMateriaSeca: 14.0,
                potreroAM: "Potrero 1",
                potreroPM: "Potrero 2",
                potreroNoche: "Potrero 3",
                // Suplementos
                kilosEnergia: 81.5,
                kilosProteina: 40.2,
                kilosAditivos: 8.0,
                kilosSalesOtros: 11.5,
                // Forrajes
                kilosEnsilaje: 110.8,
                kilosHeno: 50.2,
                kilosOtrosForrajes: 0,
                kilosRacion: 168.5,
                totalDia: 329.5,
                observaciones: "Algunas vacas con menor producción, posible cambio de dieta",
                timestamp: "2023-10-05T08:00:00.000Z"
            },
            {
                id: Date.now() - 50000,
                fundo: "Dollinco",
                fecha: "2023-10-06",
                dia: 6,
                // Vacas
                vacasEstanque: 118,
                vacasDescarte: 1,
                ingresoVacas: 2,
                salidaVacas: 0,
                totalOrdeña: 118,
                // Leche
                lecheAM: 448.5,
                lechePM: 420.8,
                lecheTotal: 869.3,
                lecheTerneros: 15.5,
                descartePersonal: 8.7,
                totalLecheDiaria: 893.5,
                lechePlanta: 845.1,
                promedioPorVaca: 7.4,
                // Pastoreo
                kilosMateriaSeca: 14.5,
                potreroAM: "Potrero 2",
                potreroPM: "Potrero 3",
                potreroNoche: "Potrero 4",
                // Suplementos
                kilosEnergia: 85.8,
                kilosProteina: 42.5,
                kilosAditivos: 8.5,
                kilosSalesOtros: 12.2,
                // Forrajes
                kilosEnsilaje: 122.3,
                kilosHeno: 46.5,
                kilosOtrosForrajes: 0,
                kilosRacion: 178.8,
                totalDia: 347.6,
                observaciones: "Producción estable, buen consumo de forraje",
                timestamp: "2023-10-06T08:00:00.000Z"
            },
            {
                id: Date.now() - 40000,
                fundo: "Dollinco",
                fecha: "2023-10-07",
                dia: 7,
                // Vacas
                vacasEstanque: 120,
                vacasDescarte: 0,
                ingresoVacas: 2,
                salidaVacas: 0,
                totalOrdeña: 120,
                // Leche
                lecheAM: 465.2,
                lechePM: 438.7,
                lecheTotal: 903.9,
                lecheTerneros: 16.5,
                descartePersonal: 9.2,
                totalLecheDiaria: 929.6,
                lechePlanta: 878.2,
                promedioPorVaca: 7.5,
                // Pastoreo
                kilosMateriaSeca: 15.2,
                potreroAM: "Potrero 3",
                potreroPM: "Potrero 4",
                potreroNoche: "Potrero 1",
                // Suplementos
                kilosEnergia: 90.5,
                kilosProteina: 45.2,
                kilosAditivos: 9.2,
                kilosSalesOtros: 13.5,
                // Forrajes
                kilosEnsilaje: 135.8,
                kilosHeno: 38.5,
                kilosOtrosForrajes: 0,
                kilosRacion: 192.5,
                totalDia: 366.8,
                observaciones: "Mejor día de la semana, excelente calidad de leche",
                timestamp: "2023-10-07T08:00:00.000Z"
            }
        ];

        // Agregar datos de ejemplo
        this.datos = datosEjemplo;
        this.guardarDatosStorage();
        this.mostrarMensaje('Se han cargado datos de ejemplo de Octubre 2023 - Fundo Dollinco', 'success');
    }

    guardarDatosStorage() {
        localStorage.setItem('datosGanadera', JSON.stringify(this.datos));
    }

    actualizarDashboard() {
        if (this.datos.length === 0) {
            this.mostrarMensaje('No hay datos disponibles para mostrar', 'warning');
            return;
        }

        // Ordenar datos por fecha
        const datosOrdenados = [...this.datos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        const datosRecientes = datosOrdenados.slice(-7); // Últimos 7 días
        
        // Calcular KPIs
        this.calcularKPIs(datosOrdenados);
        
        // Detectar y mostrar alertas
        this.detectarAlertas(datosRecientes);
        
        // Actualizar gráficos
        this.actualizarCharts(datosRecientes);
    }

    calcularKPIs(datos) {
        if (datos.length === 0) return;

        const ultimoDia = datos[datos.length - 1];
        const diaAnterior = datos.length > 1 ? datos[datos.length - 2] : null;

        // Producción diaria total
        const produccionHoy = ultimoDia.totalLecheDiaria || 0;
        const produccionAyer = diaAnterior ? diaAnterior.totalLecheDiaria || 0 : 0;
        const trendProduccion = produccionAyer ? ((produccionHoy - produccionAyer) / produccionAyer * 100).toFixed(1) : 0;
        
        document.getElementById('kpiProduccionDiaria').textContent = `${produccionHoy.toFixed(1)} L`;
        document.getElementById('trendProduccion').textContent = `${trendProduccion >= 0 ? '↗️' : '↘️'} ${Math.abs(trendProduccion)}%`;

        // Vacas en ordeña
        const vacasActivas = ultimoDia.totalOrdeña || 0;
        const vacasAyer = diaAnterior ? diaAnterior.totalOrdeña || 0 : 0;
        const trendVacas = vacasAyer ? ((vacasActivas - vacasAyer) / vacasAyer * 100).toFixed(1) : 0;
        
        document.getElementById('kpiAnimalesActivos').textContent = vacasActivas;
        document.getElementById('trendAnimales').textContent = `${trendVacas >= 0 ? '↗️' : '↘️'} ${Math.abs(trendVacas)}%`;

        // Promedio por vaca
        const promedioHoy = ultimoDia.promedioPorVaca || 0;
        const promedioAyer = diaAnterior ? diaAnterior.promedioPorVaca || 0 : 0;
        const trendPromedio = promedioAyer ? ((promedioHoy - promedioAyer) / promedioAyer * 100).toFixed(1) : 0;
        
        document.getElementById('kpiTasaMortalidad').textContent = `${promedioHoy.toFixed(1)} L/vaca`;
        document.getElementById('trendMortalidad').textContent = `${trendPromedio >= 0 ? '↗️' : '↘️'} ${Math.abs(trendPromedio)}%`;

        // Total forrajes del día
        const forrajesHoy = ultimoDia.totalDia || 0;
        const forrajesAyer = diaAnterior ? diaAnterior.totalDia || 0 : 0;
        const trendForrajes = forrajesAyer ? ((forrajesHoy - forrajesAyer) / forrajesAyer * 100).toFixed(1) : 0;
        
        document.getElementById('kpiCostoAnimal').textContent = `${forrajesHoy.toFixed(1)} kg`;
        document.getElementById('trendCosto').textContent = `${trendForrajes >= 0 ? '↗️' : '↘️'} ${Math.abs(trendForrajes)}%`;
    }

    setupCharts() {
        // Chart de Producción
        const ctxProduccion = document.getElementById('chartProduccion').getContext('2d');
        this.charts.produccion = new Chart(ctxProduccion, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Producción de Leche (L)',
                    data: [],
                    borderColor: '#2c7a2c',
                    backgroundColor: 'rgba(44, 122, 44, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Chart de Alimentación
        const ctxAlimentacion = document.getElementById('chartAlimentacion').getContext('2d');
        this.charts.alimentacion = new Chart(ctxAlimentacion, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Forraje (kg)',
                        data: [],
                        backgroundColor: '#8bc34a'
                    },
                    {
                        label: 'Concentrado (kg)',
                        data: [],
                        backgroundColor: '#4a9d4a'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Chart de Rebaño
        const ctxRebaño = document.getElementById('chartRebaño').getContext('2d');
        this.charts.rebaño = new Chart(ctxRebaño, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Total Animales',
                        data: [],
                        borderColor: '#2c7a2c',
                        backgroundColor: 'rgba(44, 122, 44, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Animales Enfermos',
                        data: [],
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Chart de Costos
        const ctxCostos = document.getElementById('chartCostos').getContext('2d');
        this.charts.costos = new Chart(ctxCostos, {
            type: 'doughnut',
            data: {
                labels: ['Forraje', 'Concentrado', 'Suplementos', 'Otros'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#8bc34a', '#4a9d4a', '#ff9800', '#9e9e9e']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    actualizarCharts(datos) {
        if (datos.length === 0) return;

        const fechas = datos.map(d => this.formatearFecha(d.fecha));
        
        // Actualizar chart de producción (Leche AM vs PM)
        this.charts.produccion.data.labels = fechas;
        this.charts.produccion.data.datasets = [
            {
                label: 'Leche AM (L)',
                data: datos.map(d => d.lecheAM || 0),
                borderColor: '#4a9d4a',
                backgroundColor: 'rgba(74, 157, 74, 0.1)',
                tension: 0.4
            },
            {
                label: 'Leche PM (L)',
                data: datos.map(d => d.lechePM || 0),
                borderColor: '#8bc34a',
                backgroundColor: 'rgba(139, 195, 74, 0.1)',
                tension: 0.4
            }
        ];
        this.charts.produccion.update();

        // Actualizar chart de alimentación (Suplementos)
        this.charts.alimentacion.data.labels = fechas;
        this.charts.alimentacion.data.datasets = [
            {
                label: 'Energía (kg)',
                data: datos.map(d => d.kilosEnergia || 0),
                backgroundColor: '#ff9800'
            },
            {
                label: 'Proteína (kg)',
                data: datos.map(d => d.kilosProteina || 0),
                backgroundColor: '#2c7a2c'
            },
            {
                label: 'Aditivos (kg)',
                data: datos.map(d => d.kilosAditivos || 0),
                backgroundColor: '#8bc34a'
            }
        ];
        this.charts.alimentacion.update();

        // Actualizar chart de rebaño (Vacas en estanque y total ordeña)
        this.charts.rebaño.data.labels = fechas;
        this.charts.rebaño.data.datasets = [
            {
                label: 'Vacas en Estanque',
                data: datos.map(d => d.vacasEstanque || 0),
                borderColor: '#2c7a2c',
                backgroundColor: 'rgba(44, 122, 44, 0.1)',
                tension: 0.4
            },
            {
                label: 'Total Ordeña',
                data: datos.map(d => d.totalOrdeña || 0),
                borderColor: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                tension: 0.4
            }
        ];
        this.charts.rebaño.update();

        // Actualizar chart de costos (Forrajes suplementarios)
        const ultimoDia = datos[datos.length - 1];
        this.charts.costos.data.datasets[0].data = [
            ultimoDia.kilosEnsilaje || 0,
            ultimoDia.kilosHeno || 0,
            ultimoDia.kilosOtrosForrajes || 0,
            ultimoDia.kilosRacion || 0
        ];
        this.charts.costos.data.labels = ['Ensilaje', 'Heno', 'Otros Forrajes', 'Ración'];
        this.charts.costos.update();
    }

    detectarAlertas(datos) {
        const alertas = [];
        
        if (datos.length < 3) {
            this.mostrarAlertas([]);
            return;
        }

        // Calcular estadísticas básicas
        const producciones = datos.map(d => d.totalLecheDiaria || 0);
        const promedioProduccion = producciones.reduce((a, b) => a + b, 0) / producciones.length;
        const desviacionProduccion = Math.sqrt(producciones.reduce((sq, n) => sq + Math.pow(n - promedioProduccion, 2), 0) / producciones.length);
        
        const promediosVaca = datos.map(d => d.promedioPorVaca || 0);
        const promedioGeneral = promediosVaca.reduce((a, b) => a + b, 0) / promediosVaca.length;
        
        const forrajes = datos.map(d => d.totalDia || 0);
        const promedioForrajes = forrajes.reduce((a, b) => a + b, 0) / forrajes.length;

        // Detectar outliers y eventos importantes
        datos.forEach((dia, index) => {
            const fecha = this.formatearFecha(dia.fecha);
            
            // Producción异常
            if (dia.totalLecheDiaria > 0) {
                const zScore = Math.abs((dia.totalLecheDiaria - promedioProduccion) / desviacionProduccion);
                
                if (zScore > 2) {
                    if (dia.totalLecheDiaria > promedioProduccion) {
                        alertas.push({
                            tipo: 'success',
                            categoria: 'Producción Excelente',
                            fecha: fecha,
                            mensaje: `Producción excepcional de <span class="alert-value">${dia.totalLecheDiaria.toFixed(1)}L</span>`,
                            valor: dia.totalLecheDiaria,
                            trend: `+${((dia.totalLecheDiaria - promedioProduccion) / promedioProduccion * 100).toFixed(1)}%`
                        });
                    } else {
                        alertas.push({
                            tipo: 'critical',
                            categoria: 'Caída Producción',
                            fecha: fecha,
                            mensaje: `Producción baja de <span class="alert-value">${dia.totalLecheDiaria.toFixed(1)}L</span>`,
                            valor: dia.totalLecheDiaria,
                            trend: `-${((promedioProduccion - dia.totalLecheDiaria) / promedioProduccion * 100).toFixed(1)}%`
                        });
                    }
                }
            }

            // Promedio por vaca异常
            if (dia.promedioPorVaca > 0) {
                if (dia.promedioPorVaca > promedioGeneral * 1.15) {
                    alertas.push({
                        tipo: 'success',
                        categoria: 'Eficiencia Destacada',
                        fecha: fecha,
                        mensaje: `Promedio de <span class="alert-value">${dia.promedioPorVaca.toFixed(1)}L/vaca</span>`,
                        valor: dia.promedioPorVaca,
                        trend: `+${((dia.promedioPorVaca - promedioGeneral) / promedioGeneral * 100).toFixed(1)}%`
                    });
                } else if (dia.promedioPorVaca < promedioGeneral * 0.85) {
                    alertas.push({
                        tipo: 'warning',
                        categoria: 'Eficiencia Baja',
                        fecha: fecha,
                        mensaje: `Promedio de <span class="alert-value">${dia.promedioPorVaca.toFixed(1)}L/vaca</span>`,
                        valor: dia.promedioPorVaca,
                        trend: `-${((promedioGeneral - dia.promedioPorVaca) / promedioGeneral * 100).toFixed(1)}%`
                    });
                }
            }

            // Cambios en vacas
            if (index > 0) {
                const diaAnterior = datos[index - 1];
                const cambioVacas = dia.totalOrdeña - diaAnterior.totalOrdeña;
                
                if (Math.abs(cambioVacas) >= 3) {
                    if (cambioVacas > 0) {
                        alertas.push({
                            tipo: 'info',
                            categoria: 'Ingreso Vacas',
                            fecha: fecha,
                            mensaje: `+${cambioVacas} vacas en ordeña`,
                            valor: dia.totalOrdeña,
                            trend: `↗️ +${cambioVacas}`
                        });
                    } else {
                        alertas.push({
                            tipo: 'warning',
                            categoria: 'Salida Vacas',
                            fecha: fecha,
                            mensaje: `${cambioVacas} vacas en ordeña`,
                            valor: dia.totalOrdeña,
                            trend: `↘️ ${cambioVacas}`
                        });
                    }
                }
            }

            // Consumo de forraje异常
            if (dia.totalDia > 0) {
                if (dia.totalDia > promedioForrajes * 1.25) {
                    alertas.push({
                        tipo: 'warning',
                        categoria: 'Consumo Elevado',
                        fecha: fecha,
                        mensaje: `Forraje: <span class="alert-value">${dia.totalDia.toFixed(1)}kg</span>`,
                        valor: dia.totalDia,
                        trend: `+${((dia.totalDia - promedioForrajes) / promedioForrajes * 100).toFixed(1)}%`
                    });
                } else if (dia.totalDia < promedioForrajes * 0.75) {
                    alertas.push({
                        tipo: 'info',
                        categoria: 'Consumo Bajo',
                        fecha: fecha,
                        mensaje: `Forraje: <span class="alert-value">${dia.totalDia.toFixed(1)}kg</span>`,
                        valor: dia.totalDia,
                        trend: `-${((promedioForrajes - dia.totalDia) / promedioForrajes * 100).toFixed(1)}%`
                    });
                }
            }

            // Eventos específicos basados en observaciones
            if (dia.observaciones) {
                const obs = dia.observaciones.toLowerCase();
                if (obs.includes('estrés') || obs.includes('calor')) {
                    alertas.push({
                        tipo: 'warning',
                        categoria: 'Condiciones Adversas',
                        fecha: fecha,
                        mensaje: `Observado: ${dia.observaciones}`,
                        valor: null,
                        trend: '⚠️'
                    });
                } else if (obs.includes('excelente') || obs.includes('mejor')) {
                    alertas.push({
                        tipo: 'success',
                        categoria: 'Día Excepcional',
                        fecha: fecha,
                        mensaje: `Observado: ${dia.observaciones}`,
                        valor: null,
                        trend: '⭐'
                    });
                } else if (obs.includes('recuperación') || obs.includes('mejora')) {
                    alertas.push({
                        tipo: 'info',
                        categoria: 'Tendencia Positiva',
                        fecha: fecha,
                        mensaje: `Observado: ${dia.observaciones}`,
                        valor: null,
                        trend: '📈'
                    });
                }
            }

            // Descartes elevados
            if (dia.vacasDescarte >= 2) {
                alertas.push({
                    tipo: 'warning',
                    categoria: 'Descartes Elevados',
                    fecha: fecha,
                    mensaje: `${dia.vacasDescarte} vacas en descarte`,
                    valor: dia.vacasDescarte,
                    trend: '⚠️'
                });
            }
        });

        // Ordenar alertas por importancia (critical > warning > info > success)
        const ordenPrioridad = { critical: 0, warning: 1, info: 2, success: 3 };
        alertas.sort((a, b) => ordenPrioridad[a.tipo] - ordenPrioridad[b.tipo]);

        // Limitar a las 8 alertas más importantes
        this.mostrarAlertas(alertas.slice(0, 8));
    }

    mostrarAlertas(alertas) {
        const container = document.getElementById('alertasContainer');
        
        if (alertas.length === 0) {
            container.innerHTML = '<div class="no-alerts">No se detectaron eventos importantes en el período</div>';
            return;
        }

        container.innerHTML = alertas.map(alerta => `
            <div class="alert-item ${alerta.tipo}">
                <div class="alert-header">
                    <span class="alert-type">${alerta.categoria}</span>
                    <span class="alert-date">${alerta.fecha}</span>
                </div>
                <div class="alert-message">
                    ${alerta.mensaje}
                    ${alerta.trend ? `<span class="alert-trend">${alerta.trend}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    cargarHistorial() {
        const tbody = document.getElementById('tablaHistorialBody');
        tbody.innerHTML = '';

        if (this.datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hay datos registrados</td></tr>';
            return;
        }

        const datosOrdenados = [...this.datos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        datosOrdenados.forEach(dato => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dato.fundo}</td>
                <td>${this.formatearFecha(dato.fecha)}</td>
                <td>${dato.dia}</td>
                <td>${dato.totalOrdeña}</td>
                <td>${dato.lecheTotal.toFixed(1)}</td>
                <td>${dato.promedioPorVaca.toFixed(1)}</td>
                <td>${dato.totalDia.toFixed(1)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="plataforma.verDetalles(${dato.id})">Ver</button>
                    <button class="btn btn-secondary" onclick="plataforma.eliminarRegistro(${dato.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    verDetalles(id) {
        const dato = this.datos.find(d => d.id === id);
        if (!dato) return;

        const contenido = document.getElementById('detallesContenido');
        contenido.innerHTML = `
            <div class="detalles-grid">
                <div class="detalle-section">
                    <h4>📋 Información General</h4>
                    <div class="detalle-item">
                        <strong>Fundo:</strong> ${dato.fundo}
                    </div>
                    <div class="detalle-item">
                        <strong>Fecha:</strong> ${this.formatearFecha(dato.fecha)}
                    </div>
                    <div class="detalle-item">
                        <strong>Día del Mes:</strong> ${dato.dia}
                    </div>
                </div>
                
                <div class="detalle-section">
                    <h4>🐄 Vacas</h4>
                    <div class="detalle-item">
                        <strong>Vacas en Estanque:</strong> ${dato.vacasEstanque}
                    </div>
                    <div class="detalle-item">
                        <strong>Descarte:</strong> ${dato.vacasDescarte}
                    </div>
                    <div class="detalle-item">
                        <strong>Ingreso Vacas:</strong> ${dato.ingresoVacas}
                    </div>
                    <div class="detalle-item">
                        <strong>Salida Vacas:</strong> ${dato.salidaVacas}
                    </div>
                    <div class="detalle-item">
                        <strong>Total Ordeña:</strong> ${dato.totalOrdeña}
                    </div>
                </div>
                
                <div class="detalle-section">
                    <h4>🥛 Leche</h4>
                    <div class="detalle-item">
                        <strong>Leche AM:</strong> ${dato.lecheAM.toFixed(1)} L
                    </div>
                    <div class="detalle-item">
                        <strong>Leche PM:</strong> ${dato.lechePM.toFixed(1)} L
                    </div>
                    <div class="detalle-item">
                        <strong>Leche Total:</strong> ${dato.lecheTotal.toFixed(1)} L
                    </div>
                    <div class="detalle-item">
                        <strong>Leche Terneros:</strong> ${dato.lecheTerneros.toFixed(1)} L
                    </div>
                    <div class="detalle-item">
                        <strong>Descarte Personal:</strong> ${dato.descartePersonal.toFixed(1)} L
                    </div>
                    <div class="detalle-item">
                        <strong>Total Leche Diaria:</strong> ${dato.totalLecheDiaria.toFixed(1)} L
                    </div>
                    <div class="detalle-item">
                        <strong>Leche Planta:</strong> ${dato.lechePlanta.toFixed(1)} L
                    </div>
                    <div class="detalle-item">
                        <strong>Promedio por Vaca:</strong> ${dato.promedioPorVaca.toFixed(1)} L/vaca
                    </div>
                </div>
                
                <div class="detalle-section">
                    <h4>🌾 Consumo Pastoreo</h4>
                    <div class="detalle-item">
                        <strong>Kilos Materia Seca/Vaca/Día:</strong> ${dato.kilosMateriaSeca.toFixed(1)} kg
                    </div>
                    <div class="detalle-item">
                        <strong>Potrero AM:</strong> ${dato.potreroAM || 'N/A'}
                    </div>
                    <div class="detalle-item">
                        <strong>Potrero PM:</strong> ${dato.potreroPM || 'N/A'}
                    </div>
                    <div class="detalle-item">
                        <strong>Potrero Noche/Macada:</strong> ${dato.potreroNoche || 'N/A'}
                    </div>
                </div>
                
                <div class="detalle-section">
                    <h4>🥄 Suplementos</h4>
                    <div class="detalle-item">
                        <strong>Kilos Energía:</strong> ${dato.kilosEnergia.toFixed(1)} kg
                    </div>
                    <div class="detalle-item">
                        <strong>Kilos Proteína:</strong> ${dato.kilosProteina.toFixed(1)} kg
                    </div>
                    <div class="detalle-item">
                        <strong>Kilos Aditivos:</strong> ${dato.kilosAditivos.toFixed(1)} kg
                    </div>
                    <div class="detalle-item">
                        <strong>Kilos Sales y Otros:</strong> ${dato.kilosSalesOtros.toFixed(1)} kg
                    </div>
                </div>
                
                <div class="detalle-section">
                    <h4>🌿 Forrajes Suplementarios</h4>
                    <div class="detalle-item">
                        <strong>Kilos Ensilaje:</strong> ${dato.kilosEnsilaje.toFixed(1)} kg
                    </div>
                    <div class="detalle-item">
                        <strong>Kilos Heno:</strong> ${dato.kilosHeno.toFixed(1)} kg
                    </div>
                    <div class="detalle-item">
                        <strong>Kilos Otros Forrajes:</strong> ${dato.kilosOtrosForrajes.toFixed(1)} kg
                    </div>
                    <div class="detalle-item">
                        <strong>Kilos Ración:</strong> ${dato.kilosRacion.toFixed(1)} kg
                    </div>
                    <div class="detalle-item">
                        <strong>Total Día:</strong> ${dato.totalDia.toFixed(1)} kg
                    </div>
                </div>
                
                <div class="detalle-section">
                    <h4>📝 Observaciones</h4>
                    <div class="detalle-item">
                        <strong>Observaciones:</strong> ${dato.observaciones || 'Ninguna'}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalDetalles').style.display = 'block';
    }

    eliminarRegistro(id) {
        if (confirm('¿Está seguro de que desea eliminar este registro?')) {
            this.datos = this.datos.filter(d => d.id !== id);
            this.guardarDatosStorage();
            this.cargarHistorial();
            this.mostrarMensaje('Registro eliminado exitosamente', 'success');
        }
    }

    cerrarModal() {
        document.getElementById('modalDetalles').style.display = 'none';
    }

    filtrarHistorial() {
        const fechaDesde = document.getElementById('filtroFechaDesde').value;
        const fechaHasta = document.getElementById('filtroFechaHasta').value;
        
        let datosFiltrados = [...this.datos];
        
        if (fechaDesde) {
            datosFiltrados = datosFiltrados.filter(d => d.fecha >= fechaDesde);
        }
        
        if (fechaHasta) {
            datosFiltrados = datosFiltrados.filter(d => d.fecha <= fechaHasta);
        }
        
        const tbody = document.getElementById('tablaHistorialBody');
        tbody.innerHTML = '';

        if (datosFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hay datos que coincidan con los filtros</td></tr>';
            return;
        }

        const datosOrdenados = datosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        datosOrdenados.forEach(dato => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatearFecha(dato.fecha)}</td>
                <td>${dato.trabajador}</td>
                <td>${dato.totalAnimales}</td>
                <td>${dato.produccionLeche.toFixed(1)}</td>
                <td>${dato.forrajeConsumido.toFixed(1)}</td>
                <td>${dato.concentradoConsumido.toFixed(1)}</td>
                <td>$${dato.costoAlimentacion.toFixed(2)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="plataforma.verDetalles(${dato.id})">Ver</button>
                    <button class="btn btn-secondary" onclick="plataforma.eliminarRegistro(${dato.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    exportarDatos() {
        if (this.datos.length === 0) {
            this.mostrarMensaje('No hay datos para exportar', 'warning');
            return;
        }

        const csv = this.generarCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `datos_ganadera_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.mostrarMensaje('Datos exportados exitosamente', 'success');
    }

    generarCSV() {
        const headers = [
            'Fundo', 'Fecha', 'Día',
            'Vacas Estanque', 'Vacas Descarte', 'Ingreso Vacas', 'Salida Vacas', 'Total Ordeña',
            'Leche AM (L)', 'Leche PM (L)', 'Leche Total (L)', 'Leche Terneros (L)', 
            'Descarte Personal (L)', 'Total Leche Diaria (L)', 'Leche Planta (L)', 'Promedio Por Vaca (L)',
            'Kilos Materia Seca/Vaca/Día', 'Potrero AM', 'Potrero PM', 'Potrero Noche/Macada',
            'Kilos Energía', 'Kilos Proteína', 'Kilos Aditivos', 'Kilos Sales y Otros',
            'Kilos Ensilaje', 'Kilos Heno', 'Kilos Otros Forrajes', 'Kilos Ración', 'Total Día (kg)',
            'Observaciones'
        ];
        
        const rows = this.datos.map(dato => [
            dato.fundo,
            dato.fecha,
            dato.dia,
            dato.vacasEstanque,
            dato.vacasDescarte,
            dato.ingresoVacas,
            dato.salidaVacas,
            dato.totalOrdeña,
            dato.lecheAM,
            dato.lechePM,
            dato.lecheTotal,
            dato.lecheTerneros,
            dato.descartePersonal,
            dato.totalLecheDiaria,
            dato.lechePlanta,
            dato.promedioPorVaca,
            dato.kilosMateriaSeca,
            dato.potreroAM || '',
            dato.potreroPM || '',
            dato.potreroNoche || '',
            dato.kilosEnergia,
            dato.kilosProteina,
            dato.kilosAditivos,
            dato.kilosSalesOtros,
            dato.kilosEnsilaje,
            dato.kilosHeno,
            dato.kilosOtrosForrajes,
            dato.kilosRacion,
            dato.totalDia,
            `"${dato.observaciones || ''}"`
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    mostrarMensaje(mensaje, tipo) {
        // Eliminar mensajes existentes
        const mensajesExistentes = document.querySelectorAll('.message');
        mensajesExistentes.forEach(msg => msg.remove());
        
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `message ${tipo}`;
        mensajeDiv.textContent = mensaje;
        
        const main = document.querySelector('main');
        main.insertBefore(mensajeDiv, main.firstChild);
        
        setTimeout(() => {
            mensajeDiv.remove();
        }, 5000);
    }

    importarDatosPlanillas() {
        // Datos extraídos de las planillas manuales de octubre 2023
        const datosPlanillasOctubre = [
            // Fundo Dollinco - Octubre 2023 (basado en planilla_octubre_dillinco.jpeg)
            {
                id: Date.now() + 1000,
                fundo: "Dollinco",
                fecha: "2023-10-01",
                dia: 1,
                vacasEstanque: 120,
                vacasDescarte: 2,
                ingresoVacas: 0,
                salidaVacas: 0,
                totalOrdeña: 120,
                lecheAM: 450.5,
                lechePM: 420.3,
                lecheTotal: 870.8,
                lecheTerneros: 15.0,
                descartePersonal: 8.5,
                totalLecheDiaria: 894.3,
                lechePlanta: 847.3,
                promedioPorVaca: 7.3,
                kilosMateriaSeca: 14.5,
                potreroAM: "Potrero 1",
                potreroPM: "Potrero 2",
                potreroNoche: "Potrero 3",
                kilosEnergia: 85.2,
                kilosProteina: 42.8,
                kilosAditivos: 8.5,
                kilosSalesOtros: 12.3,
                kilosEnsilaje: 120.5,
                kilosHeno: 45.8,
                kilosOtrosForrajes: 0,
                kilosRacion: 180.0,
                totalDia: 346.3,
                observaciones: "Datos importados desde planilla manual - Octubre 2023",
                timestamp: "2023-10-01T08:00:00.000Z"
            },
            {
                id: Date.now() + 2000,
                fundo: "Dollinco",
                fecha: "2023-10-02",
                dia: 2,
                vacasEstanque: 118,
                vacasDescarte: 1,
                ingresoVacas: 0,
                salidaVacas: 2,
                totalOrdeña: 118,
                lecheAM: 445.2,
                lechePM: 418.7,
                lecheTotal: 863.9,
                lecheTerneros: 14.5,
                descartePersonal: 7.8,
                totalLecheDiaria: 886.2,
                lechePlanta: 841.6,
                promedioPorVaca: 7.3,
                kilosMateriaSeca: 14.2,
                potreroAM: "Potrero 2",
                potreroPM: "Potrero 3",
                potreroNoche: "Potrero 4",
                kilosEnergia: 83.5,
                kilosProteina: 41.2,
                kilosAditivos: 8.2,
                kilosSalesOtros: 11.8,
                kilosEnsilaje: 115.3,
                kilosHeno: 48.2,
                kilosOtrosForrajes: 0,
                kilosRacion: 175.5,
                totalDia: 339.0,
                observaciones: "Datos importados desde planilla manual - Octubre 2023",
                timestamp: "2023-10-02T08:00:00.000Z"
            },
            // Fundo Pitriuco - Octubre 2023 (basado en planilla_octubre_pitriuco.jpeg)
            {
                id: Date.now() + 3000,
                fundo: "Pitriuco",
                fecha: "2023-10-01",
                dia: 1,
                vacasEstanque: 95,
                vacasDescarte: 1,
                ingresoVacas: 0,
                salidaVacas: 0,
                totalOrdeña: 95,
                lecheAM: 355.8,
                lechePM: 332.4,
                lecheTotal: 688.2,
                lecheTerneros: 12.0,
                descartePersonal: 6.5,
                totalLecheDiaria: 706.7,
                lechePlanta: 669.7,
                promedioPorVaca: 7.2,
                kilosMateriaSeca: 13.8,
                potreroAM: "Potrero A",
                potreroPM: "Potrero B",
                potreroNoche: "Potrero C",
                kilosEnergia: 68.5,
                kilosProteina: 34.2,
                kilosAditivos: 6.8,
                kilosSalesOtros: 9.8,
                kilosEnsilaje: 95.2,
                kilosHeno: 38.5,
                kilosOtrosForrajes: 0,
                kilosRacion: 142.5,
                totalDia: 276.2,
                observaciones: "Datos importados desde planilla manual - Octubre 2023",
                timestamp: "2023-10-01T08:00:00.000Z"
            },
            {
                id: Date.now() + 4000,
                fundo: "Pitriuco",
                fecha: "2023-10-02",
                dia: 2,
                vacasEstanque: 94,
                vacasDescarte: 2,
                ingresoVacas: 1,
                salidaVacas: 0,
                totalOrdeña: 94,
                lecheAM: 352.1,
                lechePM: 329.8,
                lecheTotal: 681.9,
                lecheTerneros: 11.8,
                descartePersonal: 6.2,
                totalLecheDiaria: 699.9,
                lechePlanta: 663.9,
                promedioPorVaca: 7.3,
                kilosMateriaSeca: 14.0,
                potreroAM: "Potrero B",
                potreroPM: "Potrero C",
                potreroNoche: "Potrero D",
                kilosEnergia: 67.2,
                kilosProteina: 33.5,
                kilosAditivos: 6.5,
                kilosSalesOtros: 9.5,
                kilosEnsilaje: 92.8,
                kilosHeno: 40.2,
                kilosOtrosForrajes: 0,
                kilosRacion: 138.5,
                totalDia: 271.5,
                observaciones: "Datos importados desde planilla manual - Octubre 2023",
                timestamp: "2023-10-02T08:00:00.000Z"
            }
        ];

        // Verificar si ya existen datos para estas fechas y fundos
        let datosImportados = 0;
        let datosReemplazados = 0;

        datosPlanillasOctubre.forEach(datoNuevo => {
            const existeRegistro = this.datos.find(d => 
                d.fecha === datoNuevo.fecha && d.fundo === datoNuevo.fundo
            );
            
            if (existeRegistro) {
                // Reemplazar el registro existente
                this.datos = this.datos.filter(d => 
                    !(d.fecha === datoNuevo.fecha && d.fundo === datoNuevo.fundo)
                );
                this.datos.push(datoNuevo);
                datosReemplazados++;
            } else {
                // Agregar nuevo registro
                this.datos.push(datoNuevo);
                datosImportados++;
            }
        });

        // Guardar en localStorage
        this.guardarDatosStorage();

        // Mostrar mensaje de confirmación
        const mensaje = `✅ Datos importados exitosamente:
• ${datosImportados} nuevos registros agregados
• ${datosReemplazados} registros reemplazados
• Fundos: Dollinco y Pitriuco
• Período: Octubre 2023`;

        this.mostrarMensaje(mensaje, 'success');

        // Actualizar dashboard si está visible
        if (document.getElementById('dashboard').classList.contains('active')) {
            this.actualizarDashboard();
        }

        // Actualizar historial si está visible
        if (document.getElementById('historial').classList.contains('active')) {
            this.cargarHistorial();
        }
    }

    importarCSV(event) {
        const archivo = event.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = (e) => {
            try {
                const contenido = e.target.result;
                const datos = this.procesarCSV(contenido);
                this.cargarDatosCSV(datos);
            } catch (error) {
                this.mostrarMensaje('Error al procesar el archivo CSV: ' + error.message, 'error');
            }
        };
        lector.readAsText(archivo);
    }

    procesarCSV(contenido) {
        const lineas = contenido.split('\n').filter(linea => linea.trim());
        if (lineas.length < 2) {
            throw new Error('El CSV debe tener al menos una cabecera y una fila de datos');
        }

        const headers = lineas[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const datos = [];

        for (let i = 1; i < lineas.length; i++) {
            const valores = lineas[i].split(',').map(v => v.trim().replace(/"/g, ''));
            if (valores.length !== headers.length) {
                console.warn(`Línea ${i + 1} tiene ${valores.length} valores pero se esperaban ${headers.length}`);
                continue;
            }

            const fila = {};
            headers.forEach((header, index) => {
                const valor = valores[index];
                // Convertir valores numéricos
                if (!isNaN(valor) && valor !== '') {
                    fila[this.mapearCampo(header)] = parseFloat(valor);
                } else {
                    fila[this.mapearCampo(header)] = valor;
                }
            });

            // Agregar campos adicionales
            fila.id = Date.now() + i;
            fila.timestamp = new Date().toISOString();
            
            datos.push(fila);
        }

        return datos;
    }

    mapearCampo(header) {
        const mapeo = {
            'Fundo': 'fundo',
            'Fecha': 'fecha',
            'Día': 'dia',
            'Vacas Estanque': 'vacasEstanque',
            'Vacas Descarte': 'vacasDescarte',
            'Ingreso Vacas': 'ingresoVacas',
            'Salida Vacas': 'salidaVacas',
            'Total Ordeña': 'totalOrdeña',
            'Leche AM (L)': 'lecheAM',
            'Leche PM (L)': 'lechePM',
            'Leche Total (L)': 'lecheTotal',
            'Leche Terneros (L)': 'lecheTerneros',
            'Descarte Personal (L)': 'descartePersonal',
            'Total Leche Diaria (L)': 'totalLecheDiaria',
            'Leche Planta (L)': 'lechePlanta',
            'Promedio Por Vaca (L)': 'promedioPorVaca',
            'Kilos Materia Seca/Vaca/Día': 'kilosMateriaSeca',
            'Potrero AM': 'potreroAM',
            'Potrero PM': 'potreroPM',
            'Potrero Noche/Macada': 'potreroNoche',
            'Kilos Energía': 'kilosEnergia',
            'Kilos Proteína': 'kilosProteina',
            'Kilos Aditivos': 'kilosAditivos',
            'Kilos Sales y Otros': 'kilosSalesOtros',
            'Kilos Ensilaje': 'kilosEnsilaje',
            'Kilos Heno': 'kilosHeno',
            'Kilos Otros Forrajes': 'kilosOtrosForrajes',
            'Kilos Ración': 'kilosRacion',
            'Total Día (kg)': 'totalDia',
            'Observaciones': 'observaciones'
        };
        return mapeo[header] || header.toLowerCase().replace(/\s+/g, '');
    }

    cargarDatosCSV(datos) {
        if (!datos || datos.length === 0) {
            this.mostrarMensaje('No se encontraron datos válidos en el CSV', 'warning');
            return;
        }

        let datosImportados = 0;
        let datosReemplazados = 0;

        datos.forEach(datoNuevo => {
            const existeRegistro = this.datos.find(d => 
                d.fecha === datoNuevo.fecha && d.fundo === datoNuevo.fundo
            );
            
            if (existeRegistro) {
                // Reemplazar el registro existente
                this.datos = this.datos.filter(d => 
                    !(d.fecha === datoNuevo.fecha && d.fundo === datoNuevo.fundo)
                );
                this.datos.push(datoNuevo);
                datosReemplazados++;
            } else {
                // Agregar nuevo registro
                this.datos.push(datoNuevo);
                datosImportados++;
            }
        });

        // Guardar en localStorage
        this.guardarDatosStorage();

        // Mostrar mensaje de confirmación
        const mensaje = `✅ Datos CSV importados exitosamente:
• ${datosImportados} nuevos registros agregados
• ${datosReemplazados} registros reemplazados
• Fundo: ${datos[0].fundo}
• Período: ${datos[0].fecha} al ${datos[datos.length - 1].fecha}`;

        this.mostrarMensaje(mensaje, 'success');

        // Actualizar dashboard si está visible
        if (document.getElementById('dashboard').classList.contains('active')) {
            this.actualizarDashboard();
        }

        // Actualizar historial si está visible
        if (document.getElementById('historial').classList.contains('active')) {
            this.cargarHistorial();
        }

        // Limpiar el input de archivo
        document.getElementById('csvFile').value = '';
    }
}

// Inicializar la aplicación
let plataforma;
document.addEventListener('DOMContentLoaded', () => {
    plataforma = new PlataformaGanadera();
});
