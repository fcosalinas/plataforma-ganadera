// Carga Module - Manejo del formulario de carga de datos
class CargaModule {
    constructor() {
        this.form = null;
        this.charts = {};
    }

    async init() {
        try {
            console.log('🚀 Inicializando módulo de carga...');
            
            // Verificar si existe el formulario original
            this.form = document.getElementById('formDatos');
            
            if (this.form) {
                // Modo original: formulario de captura
                this.setupEventListeners();
                this.setupAutoCalculations();
                this.setFechaActual();
                console.log('✅ Módulo de carga inicializado en modo formulario');
            } else {
                // Modo nuevo: integración de datos
                this.setupDataIntegrationMode();
                console.log('✅ Módulo de carga inicializado en modo integración');
            }
            
        } catch (error) {
            console.error('❌ Error al inicializar módulo de carga:', error);
            throw error;
        }
    }

    /**
     * Configurar modo de integración de datos
     */
    setupDataIntegrationMode() {
        // El modo de integración usa las funciones globales de data-test.js
        // No necesita configurar eventos del formulario
        
        // Actualizar estado inicial
        if (typeof actualizarEstado === 'function') {
            setTimeout(() => {
                actualizarEstado();
            }, 500);
        }
        
        console.log('📊 Modo de integración de datos activado');
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
        // Verificar si existe el formulario antes de agregar eventos
        if (!this.form) {
            console.log('📊 No hay formulario disponible, omitiendo setupEventListeners');
            return;
        }

        // Submit del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarDatos();
        });

        // Reset del formulario
        this.form.addEventListener('reset', () => {
            setTimeout(() => {
                this.limpiarCalculos();
                this.setFechaActual();
            }, 100);
        });

        // Validación de campos numéricos
        this.form.addEventListener('input', (e) => {
            if (e.target.type === 'number') {
                this.validarNumero(e.target);
            }
        });
    }

    setupAutoCalculations() {
        // Verificar si existe el formulario antes de configurar cálculos
        if (!this.form) {
            console.log('📊 No hay formulario disponible, omitiendo setupAutoCalculations');
            return;
        }

        // Campos que disparan cálculos automáticos
        const camposCalculo = [
            'vacasEstanque', 'vacasDescarte', 'ingresoVacas', 'salidaVacas',
            'lecheAM', 'lechePM', 'lecheTerneros', 'descartePersonal',
            'kilosEnsilaje', 'kilosHeno', 'kilosOtrosForrajes', 'kilosRacion'
        ];

        camposCalculo.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.addEventListener('input', () => this.calcularTotales());
            }
        });
    }

    calcularTotales() {
        // Cálculo de Total Ordeña
        const vacasEstanque = parseFloat(document.getElementById('vacasEstanque').value) || 0;
        const vacasDescarte = parseFloat(document.getElementById('vacasDescarte').value) || 0;
        const ingresoVacas = parseFloat(document.getElementById('ingresoVacas').value) || 0;
        const salidaVacas = parseFloat(document.getElementById('salidaVacas').value) || 0;
        const totalOrdeña = vacasEstanque + vacasDescarte + ingresoVacas - salidaVacas;
        
        document.getElementById('totalOrdeña').value = Math.max(0, totalOrdeña);

        // Cálculo de Leche Total
        const lecheAM = parseFloat(document.getElementById('lecheAM').value) || 0;
        const lechePM = parseFloat(document.getElementById('lechePM').value) || 0;
        const lecheTotal = lecheAM + lechePM;
        
        document.getElementById('lecheTotal').value = lecheTotal;

        // Cálculo de Total Leche Diaria
        const lecheTerneros = parseFloat(document.getElementById('lecheTerneros').value) || 0;
        const descartePersonal = parseFloat(document.getElementById('descartePersonal').value) || 0;
        const totalLecheDiaria = lecheTotal + lecheTerneros + descartePersonal;
        
        document.getElementById('totalLecheDiaria').value = totalLecheDiaria;

        // Cálculo de Leche Planta
        const lechePlanta = totalLecheDiaria - descartePersonal;
        document.getElementById('lechePlanta').value = Math.max(0, lechePlanta);

        // Cálculo de Promedio por Vaca
        if (totalOrdeña > 0) {
            const promedioPorVaca = lecheTotal / totalOrdeña;
            document.getElementById('promedioPorVaca').value = promedioPorVaca.toFixed(1);
        } else {
            document.getElementById('promedioPorVaca').value = '';
        }

        // Cálculo de Total Día Forrajes
        const kilosEnsilaje = parseFloat(document.getElementById('kilosEnsilaje').value) || 0;
        const kilosHeno = parseFloat(document.getElementById('kilosHeno').value) || 0;
        const kilosOtrosForrajes = parseFloat(document.getElementById('kilosOtrosForrajes').value) || 0;
        const kilosRacion = parseFloat(document.getElementById('kilosRacion').value) || 0;
        const totalDia = kilosEnsilaje + kilosHeno + kilosOtrosForrajes + kilosRacion;
        
        document.getElementById('totalDia').value = totalDia;
    }

    validarNumero(campo) {
        const valor = parseFloat(campo.value);
        const min = parseFloat(campo.min);
        const max = parseFloat(campo.max);

        if (isNaN(valor)) {
            campo.setCustomValidity('Por favor, ingrese un número válido');
        } else if (min !== undefined && valor < min) {
            campo.setCustomValidity(`El valor mínimo es ${min}`);
        } else if (max !== undefined && valor > max) {
            campo.setCustomValidity(`El valor máximo es ${max}`);
        } else {
            campo.setCustomValidity('');
        }
    }

    setFechaActual() {
        // Verificar si existe el formulario antes de configurar fecha
        if (!this.form) {
            console.log('📊 No hay formulario disponible, omitiendo setFechaActual');
            return;
        }

        const fechaInput = document.getElementById('fecha');
        if (fechaInput && !fechaInput.value) {
            const hoy = new Date().toISOString().split('T')[0];
            fechaInput.value = hoy;
        }
    }

    limpiarCalculos() {
        // Limpiar campos de solo lectura
        const camposSoloLectura = ['totalOrdeña', 'lecheTotal', 'totalLecheDiaria', 
                                  'lechePlanta', 'promedioPorVaca', 'totalDia'];
        
        camposSoloLectura.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.value = '';
            }
        });
    }

    async guardarDatos() {
        try {
            // Validar formulario
            if (!this.form.checkValidity()) {
                this.form.reportValidity();
                return;
            }

            // Recopilar datos del formulario
            const datos = this.recopilarDatosFormulario();
            
            // Validaciones adicionales
            if (!this.validacionesAdicionales(datos)) {
                return;
            }

            // Guardar en MongoDB a través de la API
            const apiURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:3000/api/registros'
                : 'https://name-plataforma-ganadera-backend.onrender.com/api/registros';
            
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Mostrar notificación de éxito
                window.plataforma.mostrarNotificacion('✅ Datos guardados correctamente en MongoDB', 'success');
                
                // Limpiar formulario
                this.form.reset();
                this.limpiarCalculos();
                this.setFechaActual();
                
                // Opcional: Redirigir a dashboard
                setTimeout(() => {
                    if (confirm('¿Desea ver el dashboard con los nuevos datos?')) {
                        window.plataforma.switchSection('dashboard');
                    }
                }, 1000);
            } else {
                throw new Error(result.message || 'Error al guardar en la base de datos');
            }
            
        } catch (error) {
            console.error('Error al guardar datos:', error);
            window.plataforma.mostrarNotificacion('❌ Error al guardar los datos: ' + error.message, 'error');
        }
    }

    recopilarDatosFormulario() {
        return {
            id: Date.now(),
            fundo: document.getElementById('fundo').value.trim(),
            fecha: document.getElementById('fecha').value,
            dia: parseInt(document.getElementById('dia').value),
            vacas: {
                estanque: parseInt(document.getElementById('vacasEstanque').value) || 0,
                descarte: parseInt(document.getElementById('vacasDescarte').value) || 0,
                ingreso: parseInt(document.getElementById('ingresoVacas').value) || 0,
                salida: parseInt(document.getElementById('salidaVacas').value) || 0,
                totalOrdeña: parseInt(document.getElementById('totalOrdeña').value) || 0
            },
            leche: {
                am: parseFloat(document.getElementById('lecheAM').value) || 0,
                pm: parseFloat(document.getElementById('lechePM').value) || 0,
                total: parseFloat(document.getElementById('lecheTotal').value) || 0,
                terneros: parseFloat(document.getElementById('lecheTerneros').value) || 0,
                descartePersonal: parseFloat(document.getElementById('descartePersonal').value) || 0,
                totalDiaria: parseFloat(document.getElementById('totalLecheDiaria').value) || 0,
                planta: parseFloat(document.getElementById('lechePlanta').value) || 0,
                promedioPorVaca: parseFloat(document.getElementById('promedioPorVaca').value) || 0
            },
            pastoreo: {
                kilosMateriaSeca: parseFloat(document.getElementById('kilosMateriaSeca').value) || 0,
                potreroAM: document.getElementById('potreroAM').value.trim(),
                potreroPM: document.getElementById('potreroPM').value.trim(),
                potreroNoche: document.getElementById('potreroNoche').value.trim()
            },
            suplementos: {
                energia: parseFloat(document.getElementById('kilosEnergia').value) || 0,
                proteina: parseFloat(document.getElementById('kilosProteina').value) || 0,
                aditivos: parseFloat(document.getElementById('kilosAditivos').value) || 0,
                salesOtros: parseFloat(document.getElementById('kilosSalesOtros').value) || 0
            },
            forrajes: {
                ensilaje: parseFloat(document.getElementById('kilosEnsilaje').value) || 0,
                heno: parseFloat(document.getElementById('kilosHeno').value) || 0,
                otrosForrajes: parseFloat(document.getElementById('kilosOtrosForrajes').value) || 0,
                racion: parseFloat(document.getElementById('kilosRacion').value) || 0,
                totalDia: parseFloat(document.getElementById('totalDia').value) || 0
            },
            observaciones: document.getElementById('observaciones').value.trim(),
            timestamp: new Date().toISOString()
        };
    }

    validacionesAdicionales(datos) {
        // Validar que el total de ordeña sea positivo
        if (datos.vacas.totalOrdeña <= 0) {
            window.plataforma.mostrarNotificacion('⚠️ El total de vacas en ordeña debe ser mayor a cero', 'warning');
            return false;
        }

        // Validar producción mínima por vaca
        if (datos.leche.promedioPorVaca < 5) {
            if (!confirm('⚠️ El promedio de leche por vaca parece bajo. ¿Desea continuar?')) {
                return false;
            }
        }

        // Validar consistencia de fechas
        const fechaRegistro = new Date(datos.fecha);
        const diaMes = datos.dia;
        if (fechaRegistro.getDate() !== diaMes) {
            if (!confirm('⚠️ El día del mes no coincide con la fecha. ¿Desea continuar?')) {
                return false;
            }
        }

        return true;
    }

    // Método para precargar datos (para edición)
    async precargarDatos(id) {
        try {
            const datos = StorageUtils.getDatos().find(d => d.id === id);
            if (!datos) {
                throw new Error('Datos no encontrados');
            }

            // Llenar formulario con los datos
            document.getElementById('fundo').value = datos.fundo || '';
            document.getElementById('fecha').value = datos.fecha || '';
            document.getElementById('dia').value = datos.dia || '';
            
            // Vacas
            document.getElementById('vacasEstanque').value = datos.vacas?.estanque || '';
            document.getElementById('vacasDescarte').value = datos.vacas?.descarte || '';
            document.getElementById('ingresoVacas').value = datos.vacas?.ingreso || '';
            document.getElementById('salidaVacas').value = datos.vacas?.salida || '';
            
            // Leche
            document.getElementById('lecheAM').value = datos.leche?.am || '';
            document.getElementById('lechePM').value = datos.leche?.pm || '';
            document.getElementById('lecheTerneros').value = datos.leche?.terneros || '';
            document.getElementById('descartePersonal').value = datos.leche?.descartePersonal || '';
            
            // Pastoreo
            document.getElementById('kilosMateriaSeca').value = datos.pastoreo?.kilosMateriaSeca || '';
            document.getElementById('potreroAM').value = datos.pastoreo?.potreroAM || '';
            document.getElementById('potreroPM').value = datos.pastoreo?.potreroPM || '';
            document.getElementById('potreroNoche').value = datos.pastoreo?.potreroNoche || '';
            
            // Suplementos
            document.getElementById('kilosEnergia').value = datos.suplementos?.energia || '';
            document.getElementById('kilosProteina').value = datos.suplementos?.proteina || '';
            document.getElementById('kilosAditivos').value = datos.suplementos?.aditivos || '';
            document.getElementById('kilosSalesOtros').value = datos.suplementos?.salesOtros || '';
            
            // Forrajes
            document.getElementById('kilosEnsilaje').value = datos.forrajes?.ensilaje || '';
            document.getElementById('kilosHeno').value = datos.forrajes?.heno || '';
            document.getElementById('kilosOtrosForrajes').value = datos.forrajes?.otrosForrajes || '';
            document.getElementById('kilosRacion').value = datos.forrajes?.racion || '';
            
            // Observaciones
            document.getElementById('observaciones').value = datos.observaciones || '';
            
            // Recalcular totales
            this.calcularTotales();
            
            console.log('✅ Datos precargados correctamente');
            
        } catch (error) {
            console.error('❌ Error al precargar datos:', error);
            window.plataforma.mostrarNotificacion('❌ Error al cargar los datos', 'error');
        }
    }

    // Limpiar módulo
    destroy() {
        // Destruir gráficos si existen
        Object.values(this.charts).forEach(chart => {
            ChartUtils.destruirGrafico(chart);
        });
        
        // Limpiar event listeners
        if (this.form) {
            this.form.removeEventListener('submit', this.guardarDatos);
            this.form.removeEventListener('reset', this.limpiarCalculos);
        }
        
        this.charts = {};
        this.form = null;
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

        // Obtener datos actuales del localStorage
        const datosActuales = JSON.parse(localStorage.getItem('datos_ganaderos') || '[]');
        
        let datosImportados = 0;
        let datosReemplazados = 0;

        datos.forEach(datoNuevo => {
            const existeRegistro = datosActuales.find(d => 
                d.fecha === datoNuevo.fecha && d.fundo === datoNuevo.fundo
            );
            
            if (existeRegistro) {
                // Reemplazar el registro existente
                const indice = datosActuales.findIndex(d => 
                    d.fecha === datoNuevo.fecha && d.fundo === datoNuevo.fundo
                );
                datosActuales[indice] = datoNuevo;
                datosReemplazados++;
            } else {
                // Agregar nuevo registro
                datosActuales.push(datoNuevo);
                datosImportados++;
            }
        });

        // Guardar en localStorage
        localStorage.setItem('datos_ganaderos', JSON.stringify(datosActuales));

        // Mostrar mensaje de confirmación
        const mensaje = `✅ Datos CSV importados exitosamente:
• ${datosImportados} nuevos registros agregados
• ${datosReemplazados} registros reemplazados
• Fundo: ${datos[0].fundo}
• Período: ${datos[0].fecha} al ${datos[datos.length - 1].fecha}`;

        this.mostrarMensaje(mensaje, 'success');

        // Siempre disparar evento de actualización para todos los módulos
        window.dispatchEvent(new CustomEvent('datosActualizados'));
        
        // También actualizar dashboard específicamente si existe
        if (window.plataforma?.modules?.dashboard) {
            window.plataforma.modules.dashboard.cargarDatos();
        }

        // Limpiar el input de archivo
        document.getElementById('csvFile').value = '';
    }

    generarDatosPrueba() {
        const datosActuales = JSON.parse(localStorage.getItem('datos_ganaderos') || '[]');
        const fechasGeneradas = new Set(datosActuales.map(d => `${d.fundo}-${d.fecha.substring(0, 7)}`)); // fundo-YYYY-MM
        
        // Rangos estadísticos basados en datos existentes
        const rangos = {
            // Empresas existentes
            Dollinco: {
                vacasEstanque: { min: 118, max: 122, media: 120 },
                lecheAM: { min: 445, max: 465, media: 452 },
                lechePM: { min: 418, max: 435, media: 426 },
                lecheTerneros: { min: 14, max: 16, media: 15 },
                descartePersonal: { min: 7.5, max: 9.5, media: 8.2 },
                kilosMateriaSeca: { min: 14.0, max: 15.2, media: 14.6 },
                kilosEnergia: { min: 83, max: 90, media: 86 },
                kilosProteina: { min: 41, max: 45, media: 43 },
                kilosAditivos: { min: 8.0, max: 9.2, media: 8.5 },
                kilosSalesOtros: { min: 11.5, max: 13.5, media: 12.4 },
                kilosEnsilaje: { min: 115, max: 132, media: 122 },
                kilosHeno: { min: 40, max: 49, media: 44 },
                kilosRacion: { min: 175, max: 190, media: 182 }
            },
            Pitriuco: {
                vacasEstanque: { min: 93, max: 97, media: 95 },
                lecheAM: { min: 350, max: 365, media: 357 },
                lechePM: { min: 328, max: 340, media: 334 },
                lecheTerneros: { min: 11.5, max: 12.8, media: 12.1 },
                descartePersonal: { min: 6.0, max: 7.0, media: 6.5 },
                kilosMateriaSeca: { min: 13.6, max: 14.4, media: 14.0 },
                kilosEnergia: { min: 67, max: 71, media: 69 },
                kilosProteina: { min: 33, max: 36, media: 34.5 },
                kilosAditivos: { min: 6.5, max: 7.2, media: 6.8 },
                kilosSalesOtros: { min: 9.5, max: 10.5, media: 10.0 },
                kilosEnsilaje: { min: 92, max: 100, media: 96 },
                kilosHeno: { min: 36, max: 41, media: 38 },
                kilosRacion: { min: 138, max: 148, media: 143 }
            },
            // Nuevas empresas
            'Río Bueno': {
                // Más grande que Dollinco pero menos eficiente
                vacasEstanque: { min: 145, max: 155, media: 150 },
                lecheAM: { min: 520, max: 560, media: 540 },
                lechePM: { min: 480, max: 520, media: 500 },
                lecheTerneros: { min: 18, max: 22, media: 20 },
                descartePersonal: { min: 12, max: 15, media: 13.5 },
                kilosMateriaSeca: { min: 16.0, max: 17.5, media: 16.8 },
                kilosEnergia: { min: 105, max: 115, media: 110 },
                kilosProteina: { min: 52, max: 58, media: 55 },
                kilosAditivos: { min: 10, max: 12, media: 11 },
                kilosSalesOtros: { min: 15, max: 18, media: 16.5 },
                kilosEnsilaje: { min: 145, max: 165, media: 155 },
                kilosHeno: { min: 55, max: 65, media: 60 },
                kilosRacion: { min: 220, max: 240, media: 230 }
            },
            'Paillaco': {
                // Más chica que Dollinco pero más eficiente
                vacasEstanque: { min: 75, max: 85, media: 80 },
                lecheAM: { min: 340, max: 370, media: 355 },
                lechePM: { min: 320, max: 350, media: 335 },
                lecheTerneros: { min: 10, max: 12, media: 11 },
                descartePersonal: { min: 4.5, max: 6.0, media: 5.2 },
                kilosMateriaSeca: { min: 12.5, max: 13.5, media: 13.0 },
                kilosEnergia: { min: 58, max: 65, media: 61.5 },
                kilosProteina: { min: 29, max: 33, media: 31 },
                kilosAditivos: { min: 5.5, max: 6.5, media: 6.0 },
                kilosSalesOtros: { min: 8, max: 9.5, media: 8.8 },
                kilosEnsilaje: { min: 75, max: 88, media: 81 },
                kilosHeno: { min: 30, max: 37, media: 33 },
                kilosRacion: { min: 115, max: 130, media: 122 }
            },
            'Lanco': {
                // Más chica que Dollinco pero con excelente producción por vaca
                vacasEstanque: { min: 65, max: 75, media: 70 },
                lecheAM: { min: 310, max: 340, media: 325 },
                lechePM: { min: 290, max: 320, media: 305 },
                lecheTerneros: { min: 9, max: 11, media: 10 },
                descartePersonal: { min: 4.0, max: 5.5, media: 4.8 },
                kilosMateriaSeca: { min: 11.8, max: 12.8, media: 12.3 },
                kilosEnergia: { min: 52, max: 58, media: 55 },
                kilosProteina: { min: 26, max: 30, media: 28 },
                kilosAditivos: { min: 5.0, max: 6.0, media: 5.5 },
                kilosSalesOtros: { min: 7.5, max: 8.8, media: 8.2 },
                kilosEnsilaje: { min: 68, max: 78, media: 73 },
                kilosHeno: { min: 27, max: 33, media: 30 },
                kilosRacion: { min: 100, max: 115, media: 107 }
            },
            'Santa Anita': {
                // Mediano tamaño, producción estable
                vacasEstanque: { min: 93, max: 99, media: 96 },
                lecheAM: { min: 710, max: 730, media: 720 },
                lechePM: { min: 670, max: 690, media: 680 },
                lecheTerneros: { min: 38, max: 42, media: 40 },
                descartePersonal: { min: 14, max: 16, media: 15 },
                kilosMateriaSeca: { min: 14.8, max: 15.6, media: 15.2 },
                kilosEnergia: { min: 145, max: 155, media: 150 },
                kilosProteina: { min: 95, max: 105, media: 100 },
                kilosAditivos: { min: 11, max: 13, media: 12 },
                kilosSalesOtros: { min: 18, max: 22, media: 20 },
                kilosEnsilaje: { min: 580, max: 620, media: 600 },
                kilosHeno: { min: 170, max: 190, media: 180 },
                kilosRacion: { min: 240, max: 260, media: 250 }
            },
            'El Roble': {
                // Más pequeño, en recuperación
                vacasEstanque: { min: 81, max: 85, media: 83 },
                lecheAM: { min: 570, max: 590, media: 580 },
                lechePM: { min: 540, max: 560, media: 550 },
                lecheTerneros: { min: 33, max: 37, media: 35 },
                descartePersonal: { min: 16, max: 20, media: 18 },
                kilosMateriaSeca: { min: 13.4, max: 14.2, media: 13.8 },
                kilosEnergia: { min: 125, max: 135, media: 130 },
                kilosProteina: { min: 80, max: 90, media: 85 },
                kilosAditivos: { min: 9, max: 11, media: 10 },
                kilosSalesOtros: { min: 16, max: 20, media: 18 },
                kilosEnsilaje: { min: 480, max: 520, media: 500 },
                kilosHeno: { min: 140, max: 160, media: 150 },
                kilosRacion: { min: 210, max: 230, media: 220 }
            }
        };
        
        const nuevosDatos = [];
        const fechaInicio = new Date('2025-07-01'); // 1 de julio de 2025
        const fechaFin = new Date('2026-02-28'); // 28 de febrero de 2026
        
        // Generar datos para cada día en el rango especificado
        for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            const fechaStr = `${año}-${mes}-${dia}`;
            const diaMes = fecha.getDate();
            
            // Generar para cada empresa
            const empresas = ['Dollinco', 'Pitriuco', 'Río Bueno', 'Paillaco', 'Lanco', 'Santa Anita', 'El Roble'];
            for (const nombreEmpresa of empresas) {
                // Verificar si ya existe un registro para esta fecha y empresa
                const existeRegistro = datosActuales.some(d => 
                    d.fundo === nombreEmpresa && d.fecha === fechaStr
                );
                
                if (existeRegistro) continue; // Saltar si ya existe
                
                const rangosFundo = rangos[nombreEmpresa];
                
                const registro = {
                    id: Date.now() + Math.random(),
                    fundo: nombreEmpresa,
                    fecha: fechaStr,
                    dia: diaMes,
                    vacasEstanque: Math.round(this.valorAleatorio(rangosFundo.vacasEstanque)),
                    vacasDescarte: Math.floor(Math.random() * 3),
                    ingresoVacas: Math.random() < 0.15 ? Math.floor(Math.random() * 4) : 0, // 15% probabilidad
                    salidaVacas: Math.random() < 0.12 ? Math.floor(Math.random() * 3) : 0, // 12% probabilidad
                    lecheAM: this.valorAleatorio(rangosFundo.lecheAM),
                    lechePM: this.valorAleatorio(rangosFundo.lechePM),
                    lecheTerneros: this.valorAleatorio(rangosFundo.lecheTerneros),
                    descartePersonal: this.valorAleatorio(rangosFundo.descartePersonal),
                    kilosMateriaSeca: this.valorAleatorio(rangosFundo.kilosMateriaSeca),
                    potreroAM: nombreEmpresa === 'Dollinco' || nombreEmpresa === 'Río Bueno' 
                        ? `Potrero ${Math.floor(Math.random() * 12) + 1}`
                        : `Potrero ${String.fromCharCode(65 + Math.floor(Math.random() * 12))}`,
                    potreroPM: nombreEmpresa === 'Dollinco' || nombreEmpresa === 'Río Bueno'
                        ? `Potrero ${Math.floor(Math.random() * 12) + 1}`
                        : `Potrero ${String.fromCharCode(65 + Math.floor(Math.random() * 12))}`,
                    potreroNoche: nombreEmpresa === 'Dollinco' || nombreEmpresa === 'Río Bueno'
                        ? `Potrero ${Math.floor(Math.random() * 12) + 1}`
                        : `Potrero ${String.fromCharCode(65 + Math.floor(Math.random() * 12))}`,
                    kilosEnergia: this.valorAleatorio(rangosFundo.kilosEnergia),
                    kilosProteina: this.valorAleatorio(rangosFundo.kilosProteina),
                    kilosAditivos: this.valorAleatorio(rangosFundo.kilosAditivos),
                    kilosSalesOtros: this.valorAleatorio(rangosFundo.kilosSalesOtros),
                    kilosEnsilaje: this.valorAleatorio(rangosFundo.kilosEnsilaje),
                    kilosHeno: this.valorAleatorio(rangosFundo.kilosHeno),
                    kilosOtrosForrajes: Math.random() < 0.3 ? this.valorAleatorio({min: 20, max: 60, media: 40}) : 0,
                    kilosRacion: this.valorAleatorio(rangosFundo.kilosRacion),
                    observaciones: `Datos generados - ${fechaStr}`,
                    timestamp: new Date().toISOString()
                };
                
                // Calcular campos derivados
                registro.totalOrdeña = registro.vacasEstanque;
                registro.lecheTotal = registro.lecheAM + registro.lechePM;
                registro.totalLecheDiaria = registro.lecheTotal + registro.lecheTerneros + registro.descartePersonal;
                registro.lechePlanta = registro.totalLecheDiaria * 0.95;
                registro.promedioPorVaca = registro.lecheTotal / registro.totalOrdeña;
                registro.totalDia = registro.kilosEnsilaje + registro.kilosHeno + registro.kilosOtrosForrajes + registro.kilosRacion;
                
                nuevosDatos.push(registro);
            }
        }
        
        if (nuevosDatos.length > 0) {
            // Combinar con datos existentes y guardar
            const datosCompletos = [...datosActuales, ...nuevosDatos];
            localStorage.setItem('datos_ganaderos', JSON.stringify(datosCompletos));
            
            // Disparar evento de actualización
            window.dispatchEvent(new CustomEvent('datosActualizados'));
            
            this.mostrarMensaje(`✅ Se generaron ${nuevosDatos.length} registros de prueba para 7 empresas (todos los días desde 01/07/2025 hasta 28/02/2026): Dollinco, Pitriuco, Río Bueno, Paillaco, Lanco, Santa Anita y El Roble`, 'success');
            
            return nuevosDatos.length;
        } else {
            this.mostrarMensaje('ℹ️ Ya existen datos para todos los períodos', 'info');
            return 0;
        }
    }

    limpiarYRegenerarDatos() {
        // Limpiar todos los datos existentes
        localStorage.removeItem('datos_ganaderos');
        
        // Generar nuevos datos desde cero
        this.generarDatosPrueba();
    }

    valorAleatorio(rango) {
        const variacion = (rango.max - rango.min) * 0.3;
        const min = Math.max(rango.min, rango.media - variacion);
        const max = Math.min(rango.max, rango.media + variacion);
        return parseFloat((Math.random() * (max - min) + min).toFixed(1));
    }

    mostrarMensaje(mensaje, tipo) {
        // Eliminar mensajes existentes
        const mensajesExistentes = document.querySelectorAll('.message');
        mensajesExistentes.forEach(msg => msg.remove());
        
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `message ${tipo}`;
        mensajeDiv.textContent = mensaje;
        
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(mensajeDiv, main.firstChild);
            
            setTimeout(() => {
                mensajeDiv.remove();
            }, 5000);
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.CargaModule = CargaModule;
}
