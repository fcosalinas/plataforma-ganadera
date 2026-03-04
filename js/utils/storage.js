// Storage Utilities - Manejo de datos persistentes
class StorageUtils {
    static KEYS = {
        DATOS_GANADEROS: 'datos_ganaderos',
        CONFIGURACION: 'configuracion',
        BENCHMARK_DATA: 'benchmark_data'
    };

    // Guardar datos
    static saveDatos(datos) {
        try {
            const datosExistentes = this.getDatos();
            datosExistentes.push(datos);
            localStorage.setItem(this.KEYS.DATOS_GANADEROS, JSON.stringify(datosExistentes));
            return true;
        } catch (error) {
            console.error('Error al guardar datos:', error);
            return false;
        }
    }

    // Obtener todos los datos
    static getDatos() {
        try {
            const datos = localStorage.getItem(this.KEYS.DATOS_GANADEROS);
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al obtener datos:', error);
            return [];
        }
    }

    // Verificar si hay datos
    static hasData() {
        return this.getDatos().length > 0;
    }

    // Cargar datos de ejemplo
    static loadExampleData() {
        const datosEjemplo = [
            {
                id: Date.now() + 1,
                fundo: 'Dollinco',
                fecha: '2024-01-15',
                dia: 15,
                vacas: {
                    estanque: 120,
                    descarte: 2,
                    ingreso: 5,
                    salida: 3,
                    totalOrdeña: 122
                },
                leche: {
                    am: 850,
                    pm: 820,
                    total: 1670,
                    terneros: 50,
                    descartePersonal: 20,
                    totalDiaria: 1700,
                    planta: 1680,
                    promedioPorVaca: 13.7
                },
                pastoreo: {
                    kilosMateriaSeca: 14.5,
                    potreroAM: 'Potrero 1',
                    potreroPM: 'Potrero 2',
                    potreroNoche: 'Potrero 3'
                },
                suplementos: {
                    energia: 180,
                    proteina: 120,
                    aditivos: 15,
                    salesOtros: 25
                },
                forrajes: {
                    ensilaje: 800,
                    heno: 200,
                    otrosForrajes: 100,
                    racion: 300,
                    totalDia: 1400
                },
                observaciones: 'Buen día de producción, vacas en buen estado'
            },
            {
                id: Date.now() + 2,
                fundo: 'Santa Anita',
                fecha: '2024-01-15',
                dia: 15,
                vacas: {
                    estanque: 95,
                    descarte: 1,
                    ingreso: 3,
                    salida: 2,
                    totalOrdeña: 96
                },
                leche: {
                    am: 720,
                    pm: 680,
                    total: 1400,
                    terneros: 40,
                    descartePersonal: 15,
                    totalDiaria: 1420,
                    planta: 1405,
                    promedioPorVaca: 14.6
                },
                pastoreo: {
                    kilosMateriaSeca: 15.2,
                    potreroAM: 'Potrero A',
                    potreroPM: 'Potrero B',
                    potreroNoche: 'Potrero C'
                },
                suplementos: {
                    energia: 150,
                    proteina: 100,
                    aditivos: 12,
                    salesOtros: 20
                },
                forrajes: {
                    ensilaje: 600,
                    heno: 180,
                    otrosForrajes: 80,
                    racion: 250,
                    totalDia: 1110
                },
                observaciones: 'Producción estable, se necesita mejorar pastoreo'
            },
            {
                id: Date.now() + 3,
                fundo: 'El Roble',
                fecha: '2024-01-15',
                dia: 15,
                vacas: {
                    estanque: 85,
                    descarte: 3,
                    ingreso: 2,
                    salida: 1,
                    totalOrdeña: 83
                },
                leche: {
                    am: 580,
                    pm: 550,
                    total: 1130,
                    terneros: 35,
                    descartePersonal: 18,
                    totalDiaria: 1150,
                    planta: 1132,
                    promedioPorVaca: 13.6
                },
                pastoreo: {
                    kilosMateriaSeca: 13.8,
                    potreroAM: 'Norte 1',
                    potreroPM: 'Norte 2',
                    potreroNoche: 'Norte 3'
                },
                suplementos: {
                    energia: 130,
                    proteina: 85,
                    aditivos: 10,
                    salesOtros: 18
                },
                forrajes: {
                    ensilaje: 500,
                    heno: 150,
                    otrosForrajes: 70,
                    racion: 220,
                    totalDia: 940
                },
                observaciones: 'Rebaño en recuperación post-enfermedad'
            }
        ];

        datosEjemplo.forEach(dato => this.saveDatos(dato));
        console.log('✅ Datos de ejemplo cargados');
    }

    // Eliminar dato por ID
    static deleteDato(id) {
        try {
            const datos = this.getDatos();
            const datosFiltrados = datos.filter(dato => dato.id !== id);
            localStorage.setItem(this.KEYS.DATOS_GANADEROS, JSON.stringify(datosFiltrados));
            return true;
        } catch (error) {
            console.error('Error al eliminar dato:', error);
            return false;
        }
    }

    // Actualizar dato
    static updateDato(id, nuevosDatos) {
        try {
            const datos = this.getDatos();
            const index = datos.findIndex(dato => dato.id === id);
            if (index !== -1) {
                datos[index] = { ...datos[index], ...nuevosDatos };
                localStorage.setItem(this.KEYS.DATOS_GANADEROS, JSON.stringify(datos));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al actualizar dato:', error);
            return false;
        }
    }

    // Obtener datos por fundo
    static getDatosPorFundo(fundo) {
        return this.getDatos().filter(dato => dato.fundo === fundo);
    }

    // Obtener datos por período
    static getDatosPorPeriodo(dias) {
        const datos = this.getDatos();
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        
        return datos.filter(dato => {
            const fechaDato = new Date(dato.fecha);
            return fechaDato >= fechaLimite;
        });
    }

    // Guardar configuración
    static saveConfig(config) {
        try {
            localStorage.setItem(this.KEYS.CONFIGURACION, JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            return false;
        }
    }

    // Obtener configuración
    static getConfig() {
        try {
            const config = localStorage.getItem(this.KEYS.CONFIGURACION);
            return config ? JSON.parse(config) : {};
        } catch (error) {
            console.error('Error al obtener configuración:', error);
            return {};
        }
    }

    // Limpiar todos los datos
    static clearAllData() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error al limpiar datos:', error);
            return false;
        }
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageUtils;
}
