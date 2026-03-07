/**
 * Cargador de Datos de Prueba - Plataforma Ganadera
 */

class DataLoader {
    constructor() {
        this.storageKey = 'plataformaGanaderaDatos';
    }

    /**
     * Limpiar datos corruptos automáticamente
     */
    limpiarDatosCorruptos() {
        try {
            const datos = this.obtenerDatos();
            if (!datos || datos.length === 0) {
                return [];
            }

            // Campos requeridos para validar
            const camposRequeridos = ['fundo', 'fecha', 'lecheDiaria', 'litrosVacaDia', 'vacasOrdeña', 'proteina', 'grasa', 'concentradoDiario', 'costoDietaLitro', 'stockDiario'];
            
            // Filtrar solo registros válidos
            const datosValidos = datos.filter(d => {
                return camposRequeridos.every(campo => {
                    const valor = d[campo];
                    const existe = valor !== undefined && valor !== null && valor !== '';
                    
                    if (!existe) return false;
                    
                    // Solo verificar que sea numérico para campos que deben ser numéricos
                    const camposNumericos = ['dia', 'lecheDiaria', 'litrosVacaDia', 'vacasOrdeña', 'proteina', 'grasa', 'calidadLeche', 'concentradoDiario', 'costoDietaLitro', 'costoDieta', 'costoAlimentacion', 'ingresoEstimado', 'margenEstimado', 'stockDiario'];
                    
                    if (camposNumericos.includes(campo)) {
                        return !isNaN(valor);
                    }
                    
                    return true; // Para fundo y fecha, solo verificar que exista y no esté vacío
                });
            });

            if (datosValidos.length !== datos.length) {
                console.log(`🧹 Limpiando ${datos.length - datosValidos.length} registros corruptos`);
                this.guardarDatos(datosValidos);
                return datosValidos;
            }

            return datos;
            
        } catch (error) {
            console.error('❌ Error al limpiar datos corruptos:', error);
            return [];
        }
    }

    /**
     * Cargar datos de prueba generados
     */
    async cargarDatosPrueba() {
        try {
            console.log('🔄 Iniciando carga de datos de prueba...');
            
            // Limpiar datos corruptos existentes primero
            this.limpiarDatosCorruptos();
            
            // Verificar si ya existen datos
            const datosExistentes = this.obtenerDatos();
            if (datosExistentes && datosExistentes.length > 0) {
                const confirmar = confirm(
                    `Ya existen ${datosExistentes.length} registros en el sistema.\n\n` +
                    `¿Desea reemplazar todos los datos con los datos de prueba generados?\n\n` +
                    `Esto eliminará permanentemente los datos actuales.`
                );
                
                if (!confirmar) {
                    console.log('❌ Operación cancelada por el usuario');
                    return false;
                }
            }
            
            // Generar nuevos datos
            const generator = new DataGenerator();
            const datos = generator.generarDataset();
            
            // Guardar en localStorage
            this.guardarDatos(datos);
            
            // Mostrar resumen
            this.mostrarResumen(datos);
            
            console.log('✅ Datos de prueba cargados exitosamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error al cargar datos de prueba:', error);
            return false;
        }
    }

    /**
     * Guardar datos en localStorage
     */
    guardarDatos(datos) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(datos));
            console.log(`💾 Guardados ${datos.length} registros en localStorage`);
        } catch (error) {
            console.error('❌ Error al guardar datos:', error);
            throw error;
        }
    }

    /**
     * Obtener datos desde localStorage
     */
    obtenerDatos() {
        try {
            const datos = localStorage.getItem(this.storageKey);
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('❌ Error al obtener datos:', error);
            return [];
        }
    }

    /**
     * Mostrar resumen de datos cargados
     */
    mostrarResumen(datos) {
        if (!datos || datos.length === 0) {
            console.log('📊 No hay datos para mostrar');
            return;
        }

        // Agrupar por fundo
        const porFundo = {};
        datos.forEach(d => {
            if (!porFundo[d.fundo]) {
                porFundo[d.fundo] = [];
            }
            porFundo[d.fundo].push(d);
        });

        // Fechas
        const fechas = datos.map(d => d.fecha).sort();
        const fechaInicio = fechas[0];
        const fechaFin = fechas[fechas.length - 1];

        console.log('\n📊 RESUMEN DE DATOS CARGADOS');
        console.log('='.repeat(50));
        console.log(`📅 Período: ${fechaInicio} al ${fechaFin}`);
        console.log(`📈 Total registros: ${datos.length}`);
        console.log(`🏭 Fundos: ${Object.keys(porFundo).join(', ')}`);
        console.log('');

        // Estadísticas por fundo
        Object.entries(porFundo).forEach(([fundo, datosFundo]) => {
            const stats = this.calcularEstadisticasFundo(datosFundo);
            console.log(`🏭 ${fundo}:`);
            console.log(`  • Registros: ${datosFundo.length}`);
            console.log(`  • Producción promedio: ${stats.lechePromedio.toFixed(1)} L/día`);
            console.log(`  • Eficiencia promedio: ${stats.eficienciaPromedio.toFixed(2)} L/vaca`);
            console.log(`  • Proteína promedio: ${stats.proteinaPromedio.toFixed(2)}%`);
            console.log(`  • Grasa promedio: ${stats.grasaPromedio.toFixed(2)}%`);
            console.log(`  • Margen promedio: $${stats.margenPromedio.toFixed(0)}/día`);
            console.log('');
        });

        // Estadísticas generales
        const statsGenerales = this.calcularEstadisticasFundo(datos);
        console.log('📈 ESTADÍSTICAS GENERALES:');
        console.log(`  • Producción total: ${(statsGenerales.lechePromedio * datos.length).toFixed(0)} L`);
        console.log(`  • Promedio diario: ${statsGenerales.lechePromedio.toFixed(1)} L`);
        console.log(`  • Eficiencia general: ${statsGenerales.eficienciaPromedio.toFixed(2)} L/vaca`);
        console.log(`  • Calidad promedio: P${statsGenerales.proteinaPromedio.toFixed(2)}% / G${statsGenerales.grasaPromedio.toFixed(2)}%`);
        console.log(`  • Margen total: $${(statsGenerales.margenPromedio * datos.length).toFixed(0)}`);
        console.log('');
    }

    /**
     * Calcular estadísticas para un conjunto de datos
     */
    calcularEstadisticasFundo(datos) {
        const lecheTotal = datos.reduce((sum, d) => sum + d.lecheDiaria, 0);
        const vacasTotal = datos.reduce((sum, d) => sum + d.vacasOrdeña, 0);
        const proteinaTotal = datos.reduce((sum, d) => sum + d.proteina, 0);
        const grasaTotal = datos.reduce((sum, d) => sum + d.grasa, 0);
        const margenTotal = datos.reduce((sum, d) => sum + d.margenEstimado, 0);

        return {
            lechePromedio: lecheTotal / datos.length,
            eficienciaPromedio: lecheTotal / vacasTotal,
            proteinaPromedio: proteinaTotal / datos.length,
            grasaPromedio: grasaTotal / datos.length,
            margenPromedio: margenTotal / datos.length
        };
    }

    /**
     * Limpiar todos los datos
     */
    limpiarDatos() {
        try {
            const confirmar = confirm(
                '¿Está seguro que desea eliminar todos los datos del sistema?\n\n' +
                'Esta acción no se puede deshacer.'
            );
            
            if (confirmar) {
                localStorage.removeItem(this.storageKey);
                console.log('🗑️ Todos los datos han sido eliminados');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error al limpiar datos:', error);
            return false;
        }
    }

    /**
     * Exportar datos a CSV
     */
    exportarCSV() {
        try {
            const datos = this.obtenerDatos();
            if (!datos || datos.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            // Definir columnas
            const columnas = [
                'fundo', 'fecha', 'dia', 'lecheDiaria', 'litrosVacaDia', 'vacasOrdeña',
                'proteina', 'grasa', 'calidadLeche', 'concentradoDiario',
                'costoDietaLitro', 'costoDieta', 'costoAlimentacion', 
                'ingresoEstimado', 'margenEstimado'
            ];

            // Generar CSV
            let csv = columnas.join(',') + '\n';
            datos.forEach(d => {
                const fila = columnas.map(col => d[col] || 0).join(',');
                csv += fila + '\n';
            });

            // Descargar archivo
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `plataforma-ganadera-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log('📁 Datos exportados a CSV');
        } catch (error) {
            console.error('❌ Error al exportar datos:', error);
        }
    }

    /**
     * Verificar integridad de datos
     */
    verificarIntegridad() {
        try {
            const datos = this.obtenerDatos();
            if (!datos || datos.length === 0) {
                console.log('📊 No hay datos almacenados');
                return { valido: false, mensaje: 'No hay datos' };
            }

            // Verificar campos requeridos
            const camposRequeridos = [
                'fundo', 'fecha', 'lecheDiaria', 'litrosVacaDia', 'vacasOrdeña',
                'proteina', 'grasa', 'concentradoDiario', 'costoDietaLitro', 'stockDiario'
            ];

            let errores = 0;
            datos.forEach((d, index) => {
                camposRequeridos.forEach(campo => {
                    const valor = d[campo];
                    
                    // Verificar existencia básica
                    if (valor === undefined || valor === null || valor === '') {
                        errores++;
                        console.warn(`⚠️ Dato inválido en registro ${index}: campo ${campo} (valor: ${valor})`);
                        return;
                    }
                    
                    // Solo verificar si es numérico para campos que deben ser numéricos
                    const camposNumericos = ['lecheDiaria', 'litrosVacaDia', 'vacasOrdeña', 'proteina', 'grasa', 'concentradoDiario', 'costoDietaLitro', 'stockDiario'];
                    
                    if (camposNumericos.includes(campo) && isNaN(valor)) {
                        errores++;
                        console.warn(`⚠️ Dato inválido en registro ${index}: campo ${campo} (no numérico: ${valor})`);
                    }
                });
            });

            if (errores > 0) {
                return { 
                    valido: false, 
                    mensaje: `Se encontraron ${errores} errores de integridad` 
                };
            }

            // Verificar rangos lógicos
            const rangosInvalidos = datos.filter(d => 
                d.lecheDiaria <= 0 || d.vacasOrdeña <= 0 || 
                d.proteina < 2 || d.proteina > 4 ||
                d.grasa < 3 || d.grasa > 5
            );

            if (rangosInvalidos.length > 0) {
                return { 
                    valido: false, 
                    mensaje: `${rangosInvalidos.length} registros con valores fuera de rango` 
                };
            }

            return { 
                valido: true, 
                mensaje: `Datos válidos: ${datos.length} registros` 
            };

        } catch (error) {
            console.error('❌ Error al verificar integridad:', error);
            return { valido: false, mensaje: 'Error al verificar datos' };
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DataLoader = DataLoader;
}
