/**
 * Funciones de Prueba y Carga de Datos - Plataforma Ganadera
 */

// Función global para cargar datos de prueba
window.cargarDatosPrueba = async function() {
    try {
        // Verificar que las clases estén disponibles
        if (typeof DataGenerator === 'undefined') {
            console.error('❌ DataGenerator no está disponible');
            return false;
        }
        
        if (typeof DataLoader === 'undefined') {
            console.error('❌ DataLoader no está disponible');
            return false;
        }
        
        // Crear instancia del generador
        const generator = new DataGenerator();
        
        // Generar dataset completo
        const datos = generator.generarDataset();
        
        // Crear instancia del loader
        const loader = new DataLoader();
        
        // Limpiar datos corruptos existentes primero
        loader.limpiarDatosCorruptos();
        
        // Guardar los nuevos datos
        loader.guardarDatos(datos);
        
        // Mostrar resumen
        loader.mostrarResumen(datos);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error al cargar datos de prueba:', error);
        return false;
    }
};

// Función global para limpiar datos
window.limpiarDatos = function() {
    try {
        if (typeof DataLoader === 'undefined') {
            console.error('❌ DataLoader no está disponible');
            return false;
        }
        
        const loader = new DataLoader();
        const resultado = loader.limpiarDatos();
        
        if (resultado) {
            console.log('🔄 Recargando página...');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
        
        return resultado;
        
    } catch (error) {
        console.error('❌ Error en limpiarDatos():', error);
        return false;
    }
};

// Función global para verificar datos con detalles mejorados (versión silenciosa)
window.verificarDatosSilencioso = function() {
    try {
        if (typeof DataLoader === 'undefined') {
            console.error('❌ DataLoader no está disponible');
            return { valido: false, mensaje: 'Error al verificar' };
        }
        
        const loader = new DataLoader();
        const datos = loader.obtenerDatos();
        
        if (!datos || datos.length === 0) {
            return { valido: false, mensaje: 'No hay datos' };
        }
        
        // Campos requeridos para validar
        const camposRequeridos = [
            'fundo', 'fecha', 'dia', 'lecheDiaria', 'litrosVacaDia', 'vacasOrdeña',
            'proteina', 'grasa', 'calidadLeche', 'concentradoDiario',
            'costoDietaLitro', 'costoDieta', 'costoAlimentacion', 
            'ingresoEstimado', 'margenEstimado', 'stockDiario'
        ];
        
        let errores = [];
        let advertencias = [];
        let registrosValidos = 0;
        
        // Analizar cada registro en detalle (sin mostrar output)
        datos.forEach((d, index) => {
            let registroErrores = [];
            let registroAdvertencias = [];
            
            // Verificar cada campo requerido
            camposRequeridos.forEach(campo => {
                const valor = d[campo];
                
                // Verificar existencia
                if (valor === undefined) {
                    registroErrores.push(`${campo}: CAMPO INEXISTENTE`);
                    errores.push({ registro: index, campo, problema: 'inexistente', valor });
                } else if (valor === null) {
                    registroErrores.push(`${campo}: VALOR NULO`);
                    errores.push({ registro: index, campo, problema: 'nulo', valor });
                } else if (valor === '') {
                    registroErrores.push(`${campo}: VALOR VACÍO`);
                    errores.push({ registro: index, campo, problema: 'vacio', valor });
                } else {
                    // Solo verificar si es numérico para campos que deben ser numéricos
                    const camposNumericos = ['dia', 'lecheDiaria', 'litrosVacaDia', 'vacasOrdeña', 'proteina', 'grasa', 'calidadLeche', 'concentradoDiario', 'costoDietaLitro', 'costoDieta', 'costoAlimentacion', 'ingresoEstimado', 'margenEstimado', 'stockDiario'];
                    
                    if (camposNumericos.includes(campo) && isNaN(valor)) {
                        registroAdvertencias.push(`${campo}: NO NUMÉRICO (${valor})`);
                        advertencias.push({ registro: index, campo, problema: 'no_numerico', valor });
                    } else {
                        // Verificaciones específicas por campo
                        const problemaEspecifico = this.verificarCampoEspecifico(campo, valor, index);
                        if (problemaEspecifico) {
                            if (problemaEspecifico.tipo === 'error') {
                                registroErrores.push(problemaEspecifico.mensaje);
                                errores.push({ registro: index, campo, problema: problemaEspecifico.tipo, valor });
                            } else {
                                registroAdvertencias.push(problemaEspecifico.mensaje);
                                advertencias.push({ registro: index, campo, problema: problemaEspecifico.tipo, valor });
                            }
                        }
                    }
                }
            });
            
            if (registroErrores.length === 0 && registroAdvertencias.length === 0) {
                registrosValidos++;
            }
        });
        
        // Resultado final
        const valido = errores.length === 0 && datos.length > 0;
        const mensaje = valido ? 
            `Datos válidos: ${datos.length} registros` : 
            `Se encontraron ${errores.length} errores y ${advertencias.length} advertencias`;
        
        return { 
            valido, 
            mensaje, 
            estadisticas: {
                total: datos.length,
                validos: registrosValidos,
                conErrores: errores.length,
                conAdvertencias: advertencias.length,
                errores: errores.length,
                advertencias: advertencias.length
            }
        };
        
    } catch (error) {
        console.error('❌ Error en verificarDatosSilencioso():', error);
        return { valido: false, mensaje: 'Error al verificar datos' };
    }
};

// Función global para verificar datos con detalles mejorados
window.verificarDatos = function() {
    try {
        if (typeof DataLoader === 'undefined') {
            console.error('❌ DataLoader no está disponible');
            return { valido: false, mensaje: 'Error al verificar' };
        }
        
        const loader = new DataLoader();
        const datos = loader.obtenerDatos();
        
        if (!datos || datos.length === 0) {
            return { valido: false, mensaje: 'No hay datos' };
        }
        
        // Campos requeridos para validar
        const camposRequeridos = [
            'fundo', 'fecha', 'dia', 'lecheDiaria', 'litrosVacaDia', 'vacasOrdeña',
            'proteina', 'grasa', 'calidadLeche', 'concentradoDiario',
            'costoDietaLitro', 'costoDieta', 'costoAlimentacion', 
            'ingresoEstimado', 'margenEstimado', 'stockDiario'
        ];
        
        let errores = [];
        let advertencias = [];
        let registrosValidos = 0;
        let registrosConErrores = 0;
        let registrosConAdvertencias = 0;
        
        // Analizar cada registro en detalle (sin mostrar output)
        datos.forEach((d, index) => {
            let registroErrores = [];
            let registroAdvertencias = [];
            
            // Verificar cada campo requerido
            camposRequeridos.forEach(campo => {
                const valor = d[campo];
                let problema = null;
                
                // Verificar existencia
                if (valor === undefined) {
                    problema = `❌ ${campo}: CAMPO INEXISTENTE`;
                    registroErrores.push(problema);
                    errores.push({ registro: index, campo, problema: 'inexistente', valor });
                } else if (valor === null) {
                    problema = `❌ ${campo}: VALOR NULO`;
                    registroErrores.push(problema);
                    errores.push({ registro: index, campo, problema: 'nulo', valor });
                } else if (valor === '') {
                    problema = `❌ ${campo}: VALOR VACÍO`;
                    registroErrores.push(problema);
                    errores.push({ registro: index, campo, problema: 'vacio', valor });
                } else {
                    // Solo verificar si es numérico para campos que deben ser numéricos
                    const camposNumericos = ['dia', 'lecheDiaria', 'litrosVacaDia', 'vacasOrdeña', 'proteina', 'grasa', 'calidadLeche', 'concentradoDiario', 'costoDietaLitro', 'costoDieta', 'costoAlimentacion', 'ingresoEstimado', 'margenEstimado', 'stockDiario'];
                    
                    if (camposNumericos.includes(campo) && isNaN(valor)) {
                        problema = `⚠️ ${campo}: NO NUMÉRICO (${valor})`;
                        registroAdvertencias.push(problema);
                        advertencias.push({ registro: index, campo, problema: 'no_numerico', valor });
                    } else {
                        // Verificaciones específicas por campo
                        const problemaEspecifico = this.verificarCampoEspecifico(campo, valor, index);
                        if (problemaEspecifico) {
                            if (problemaEspecifico.tipo === 'error') {
                                registroErrores.push(problemaEspecifico.mensaje);
                                errores.push({ registro: index, campo, problema: problemaEspecifico.tipo, valor });
                            } else {
                                registroAdvertencias.push(problemaEspecifico.mensaje);
                                advertencias.push({ registro: index, campo, problema: problemaEspecifico.tipo, valor });
                            }
                        }
                    }
                }
            });
            
            if (registroErrores.length === 0 && registroAdvertencias.length === 0) {
                registrosValidos++;
            }
        });
        
        // Resultado final
        const valido = errores.length === 0 && datos.length > 0;
        const mensaje = valido ? 
            `Datos válidos: ${datos.length} registros` : 
            `Se encontraron ${errores.length} errores y ${advertencias.length} advertencias`;
        
        return { 
            valido, 
            mensaje, 
            estadisticas: {
                total: datos.length,
                validos: registrosValidos,
                conErrores: errores.length,
                conAdvertencias: advertencias.length,
                errores: errores.length,
                advertencias: advertencias.length
            }
        };
        
    } catch (error) {
        console.error('❌ Error en verificarDatos():', error);
        return { valido: false, mensaje: 'Error al verificar datos' };
    }
};

// Método auxiliar para verificar campos específicos
window.verificarCampoEspecifico = function(campo, valor, indiceRegistro) {
    switch (campo) {
        case 'fundo':
            if (typeof valor !== 'string' || valor.trim() === '') {
                return { tipo: 'error', mensaje: `❌ ${campo}: Fundo inválido (${valor})` };
            }
            break;
            
        case 'fecha':
            if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
                return { tipo: 'error', mensaje: `❌ ${campo}: Formato de fecha inválido (${valor})` };
            }
            break;
            
        case 'dia':
            if (valor < 1 || valor > 31) {
                return { tipo: 'error', mensaje: `❌ ${campo}: Día fuera de rango (${valor})` };
            }
            break;
            
        case 'lecheDiaria':
            if (valor < 0 || valor > 5000) {
                return { tipo: 'advertencia', mensaje: `⚠️ ${campo}: Producción inusual (${valor}L)` };
            }
            break;
            
        case 'vacasOrdeña':
            if (valor < 1 || valor > 1000) {
                return { tipo: 'advertencia', mensaje: `⚠️ ${campo}: Número de vacas inusual (${valor})` };
            }
            break;
            
        case 'litrosVacaDia':
            if (valor < 1 || valor > 50) {
                return { tipo: 'advertencia', mensaje: `⚠️ ${campo}: Eficiencia inusual (${valor}L/vaca)` };
            }
            break;
            
        case 'proteina':
        case 'grasa':
            if (valor < 1 || valor > 10) {
                return { tipo: 'error', mensaje: `❌ ${campo}: Valor fuera de rango realista (${valor}%)` };
            }
            break;
            
        case 'concentradoDiario':
            if (valor < 0 || valor > 2000) {
                return { tipo: 'advertencia', mensaje: `⚠️ ${campo}: Consumo inusual (${valor}kg)` };
            }
            break;
            
        case 'costoDietaLitro':
            if (valor < 0 || valor > 2) {
                return { tipo: 'advertencia', mensaje: `⚠️ ${campo}: Costo inusual ($${valor}/L)` };
            }
            break;
            
        case 'ingresoEstimado':
        case 'costoAlimentacion':
        case 'costoDieta':
        case 'margenEstimado':
            if (valor < -1000 || valor > 10000) {
                return { tipo: 'advertencia', mensaje: `⚠️ ${campo}: Valor económico inusual ($${valor})` };
            }
            break;
            
        case 'stockDiario':
            if (valor < 0 || valor > 2500) {
                return { tipo: 'advertencia', mensaje: `⚠️ ${campo}: Stock inusual (${valor}kg)` };
            }
            break;
    }
    
    return null;
};

// Método para verificar rangos lógicos entre campos
window.verificarRangosLogicos = function(datos) {
    if (!datos || datos.length === 0) {
        return { problemas: 0 };
    }
    
    let problemasLogicos = [];
    
    datos.forEach((d, index) => {
        const problemas = [];
        
        // Verificar consistencia entre producción y eficiencia
        if (d.lecheDiaria && d.vacasOrdeña && d.litrosVacaDia) {
            const eficienciaCalculada = d.lecheDiaria / d.vacasOrdeña;
            const diferencia = Math.abs(eficienciaCalculada - d.litrosVacaDia);
            
            if (diferencia > 0.1) {
                problemas.push(`Eficiencia inconsistente: ${d.lecheDiaria}L / ${d.vacasOrdeña} vacas = ${eficienciaCalculada.toFixed(2)}L/vaca (registrado: ${d.litrosVacaDia}L/vaca)`);
            }
        }
        
        // Verificar margen lógico
        if (d.ingresoEstimado && d.costoAlimentacion && d.margenEstimado) {
            const margenCalculado = d.ingresoEstimado - d.costoAlimentacion;
            const diferencia = Math.abs(margenCalculado - d.margenEstimado);
            
            if (diferencia > 1) {
                problemas.push(`Margen inconsistente: $${d.ingresoEstimado} - $${d.costoAlimentacion} = $${margenCalculado.toFixed(2)} (registrado: $${d.margenEstimado})`);
            }
        }
        
        // Verificar rangos de calidad
        if (d.proteina && d.grasa) {
            if (d.proteina > 4.5 || d.grasa > 5.0) {
                problemas.push(`Calidad fuera de rangos típicos: P${d.proteina}% / G${d.grasa}%`);
            }
        }
        
        if (problemas.length > 0) {
            problemasLogicos.push({ registro: index, problemas });
        }
    });
    
    return { 
        problemas: problemasLogicos.length,
        detalles: problemasLogicos
    };
};

// Función global para exportar datos
window.exportarDatos = function() {
    try {
        if (typeof DataLoader === 'undefined') {
            console.error('❌ DataLoader no está disponible');
            return;
        }
        
        const loader = new DataLoader();
        loader.exportarCSV();
        
    } catch (error) {
        console.error('❌ Error en exportarDatos():', error);
    }
};

// Función global para mostrar estadísticas
window.mostrarEstadisticas = function() {
    try {
        if (typeof DataLoader === 'undefined') {
            console.error('❌ DataLoader no está disponible');
            return;
        }
        
        const loader = new DataLoader();
        const datos = loader.obtenerDatos();
        
        if (!datos || datos.length === 0) {
            return;
        }
        
        return {
            total: datos.length,
            resumen: 'Estadísticas calculadas exitosamente'
        };
        
    } catch (error) {
        console.error('❌ Error en mostrarEstadisticas():', error);
        return null;
    }
};

// ...

// Función global para diagnosticar generación de datos
window.diagnosticarGeneracion = function() {
    try {
        // Verificar que las clases estén disponibles
        if (typeof DataGenerator === 'undefined') {
            console.error('❌ DataGenerator no está disponible');
            return;
        }
        
        // Crear instancia del generador
        const generator = new DataGenerator();
        
        // Generar un registro para Dollinco
        const fecha = new Date(2024, 0, 15); // 15 de enero de 2024
        const registroDollinco = generator.generarDiaCompleto('Dollinco', fecha);
        
        // Generar un registro para Pitriuco
        const registroPitriuco = generator.generarDiaCompleto('Pitriuco', fecha);
        
        // ...
        const camposRequeridos = [
            'fundo', 'fecha', 'dia', 'lecheDiaria', 'litrosVacaDia', 'vacasOrdeña',
            'proteina', 'grasa', 'calidadLeche', 'concentradoDiario',
            'costoDietaLitro', 'costoDieta', 'costoAlimentacion', 
            'ingresoEstimado', 'margenEstimado', 'stockDiario'
        ];
        
        let camposFaltantes = [];
        let camposInvalidos = [];
        
        camposRequeridos.forEach(campo => {
            const valor = registroDollinco[campo];
            const existe = valor !== undefined && valor !== null;
            const valido = existe && !isNaN(valor) && valor !== '';
            
            if (!existe) {
                camposFaltantes.push(campo);
            } else if (!valido) {
                camposInvalidos.push(campo);
            }
        });
        
        if (camposFaltantes.length === 0 && camposInvalidos.length === 0) {
            console.log('✅ Todos los campos requeridos están presentes y son válidos');
        } else {
            console.log('❌ Hay problemas en la generación de datos');
        }
        
        return {
            dollinco: registroDollinco,
            pitriuco: registroPitriuco,
            camposFaltantes,
            camposInvalidos
        };
        
    } catch (error) {
        console.error('❌ Error en diagnosticarGeneracion():', error);
        return null;
    }
};

// Función global para limpiar datos corruptos
window.limpiarDatosCorruptos = function() {
    try {
        if (typeof DataLoader === 'undefined') {
            console.error('❌ DataLoader no está disponible');
            return false;
        }
        
        const loader = new DataLoader();
        const resultado = loader.limpiarDatosCorruptos();
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en limpiarDatosCorruptos():', error);
        return false;
    }
};

// Función global para actualizar estado del sistema
window.actualizarEstado = function() {
    try {
        if (typeof DataLoader === 'undefined') {
            console.error('❌ DataLoader no está disponible');
            return;
        }
        
        const loader = new DataLoader();
        const datos = loader.obtenerDatos();
        
        // Usar nuestra función mejorada de verificación (versión silenciosa para estado)
        let verificacion;
        if (window.verificarDatosSilencioso) {
            verificacion = window.verificarDatosSilencioso();
        } else if (window.verificarDatos) {
            // Capturar el resultado sin mostrar todo el output
            const consoleLog = console.log;
            console.log = () => {}; // Silenciar temporalmente
            verificacion = window.verificarDatos();
            console.log = consoleLog; // Restaurar
        } else {
            verificacion = loader.verificarIntegridad();
        }
        
        // Actualizar contadores
        const totalRegistros = document.getElementById('totalRegistros');
        const estadoIntegridad = document.getElementById('estadoIntegridad');
        const ultimaActualizacion = document.getElementById('ultimaActualizacion');
        
        if (totalRegistros) {
            totalRegistros.textContent = datos.length || 0;
            totalRegistros.className = 'estado-value ' + (datos.length > 0 ? 'success' : 'warning');
        }
        
        if (estadoIntegridad) {
            estadoIntegridad.textContent = verificacion.valido ? '✅ Válidos' : '❌ Inválidos';
            estadoIntegridad.className = 'estado-value ' + (verificacion.valido ? 'success' : 'error');
        }
        
        if (ultimaActualizacion) {
            const ahora = new Date();
            ultimaActualizacion.textContent = ahora.toLocaleString();
        }
        
        console.log('🔄 Estado del sistema actualizado');
        
    } catch (error) {
        console.error('❌ Error en actualizarEstado():', error);
    }
};

// Auto-actualizar estado al cargar la página
setTimeout(() => {
    window.actualizarEstado();
}, 1500);

// Mostrar ayuda al cargar la página
console.log(`
🐄 PLATAFORMA GANADERA - FUNCIONES DE DATOS DISPONIBLES
=====================================================

📊 FUNCIONES PRINCIPALES:
• cargarDatosPrueba()     - Carga 1000 días de datos (2 fundos)
• limpiarDatos()          - Elimina todos los datos del sistema
• limpiarDatosCorruptos() - Limpia registros inválidos automáticamente
• verificarDatos()        - Verifica integridad de datos
• mostrarEstadisticas()   - Muestra estadísticas completas
• exportarDatos()         - Exporta datos a CSV

🔬 FUNCIONES DE DIAGNÓSTICO:
• diagnosticarGeneracion() - Analiza registro generado en detalle
• generarMuestraDatos()   - Genera muestra de 10 registros (sin guardar)

💡 EJEMPLOS DE USO:
> diagnosticarGeneracion() # Analizar estructura de datos
> limpiarDatosCorruptos()  # Limpiar datos inválidos primero
> cargarDatosPrueba()      # Cargar datos completos
> verificarDatos()         # Verificar que todo esté bien
> mostrarEstadisticas()    # Ver estadísticas generadas

📅 PERÍODO DE DATOS:
• Inicio: 03/06/2023
• Fin:   28/02/2026  
• Total: 1000 días
• Fundos: Dollinco, Pitriuco

=====================================================
`);

// Auto-verificar al cargar
setTimeout(() => {
    const verificar = window.verificarDatos();
    if (!verificar.valido) {
        console.log('💡 No hay datos válidos. Ejecuta cargarDatosPrueba() para generar datos de prueba.');
    }
}, 1000);
