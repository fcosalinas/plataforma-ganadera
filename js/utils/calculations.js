// Calculation Utilities - Cálculos y métricas ganaderas
class CalculationUtils {
    
    // Calcular producción total
    static calcularProduccionTotal(datos) {
        return datos.reduce((total, dato) => total + (dato.leche?.totalDiaria || 0), 0);
    }

    // Calcular promedio por vaca
    static calcularPromedioPorVaca(datos) {
        const totalLeche = this.calcularProduccionTotal(datos);
        const totalVacas = datos.reduce((total, dato) => total + (dato.vacas?.totalOrdeña || 0), 0);
        return totalVacas > 0 ? (totalLeche / totalVacas).toFixed(1) : 0;
    }

    // Calcular eficiencia de conversión (L leche / kg forraje)
    static calcularEficienciaConversion(datos) {
        const totalLeche = this.calcularProduccionTotal(datos);
        const totalForrajes = datos.reduce((total, dato) => total + (dato.forrajes?.totalDia || 0), 0);
        return totalForrajes > 0 ? (totalLeche / totalForrajes).toFixed(2) : 0;
    }

    // Calcular tendencia porcentual
    static calcularTendencia(datosActuales, datosAnteriores) {
        if (!datosAnteriores || datosAnteriores.length === 0) return 0;
        
        const promedioActual = this.calcularProduccionTotal(datosActuales) / datosActuales.length;
        const promedioAnterior = this.calcularProduccionTotal(datosAnteriores) / datosAnteriores.length;
        
        if (promedioAnterior === 0) return 0;
        
        return ((promedioActual - promedioAnterior) / promedioAnterior * 100).toFixed(1);
    }

    // Detectar outliers usando Z-score
    static detectarOutliers(datos, campo) {
        const valores = datos.map(d => this.getValorPorCampo(d, campo)).filter(v => v > 0);
        if (valores.length < 3) return [];
        
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const desviacion = Math.sqrt(valores.reduce((sq, n) => sq + Math.pow(n - media, 2), 0) / valores.length);
        
        return datos.filter(d => {
            const valor = this.getValorPorCampo(d, campo);
            const zScore = Math.abs((valor - media) / desviacion);
            return zScore > 2; // Outliers con Z-score > 2
        });
    }

    // Obtener valor anidado por campo string (ej: "leche.total")
    static getValorPorCampo(objeto, campo) {
        return campo.split('.').reduce((o, i) => o?.[i], objeto) || 0;
    }

    // Calcular percentiles
    static calcularPercentiles(datos, campo) {
        const valores = datos.map(d => this.getValorPorCampo(d, campo))
                              .filter(v => v > 0)
                              .sort((a, b) => a - b);
        
        if (valores.length === 0) return { p25: 0, p50: 0, p75: 0, p90: 0 };
        
        const getPercentile = (p) => {
            const index = Math.ceil((p / 100) * valores.length) - 1;
            return valores[Math.max(0, index)];
        };
        
        return {
            p25: getPercentile(25),
            p50: getPercentile(50),
            p75: getPercentile(75),
            p90: getPercentile(90)
        };
    }

    // Calcular métricas de benchmark
    static calcularMetricasBenchmark(datos, periodo = 30) {
        const datosRecientes = this.filtrarPorPeriodo(datos, periodo);
        
        // Agrupar por fundo
        const porFundo = this.agruparPorFundo(datosRecientes);
        
        // Calcular métricas para cada fundo
        const metricas = Object.entries(porFundo).map(([fundo, datosFundo]) => {
            const produccion = this.calcularProduccionTotal(datosFundo);
            const promedioVaca = this.calcularPromedioPorVaca(datosFundo);
            const totalVacas = datosFundo.reduce((total, d) => total + (d.vacas?.totalOrdeña || 0), 0);
            const totalForrajes = datosFundo.reduce((total, d) => total + (d.forrajes?.totalDia || 0), 0);
            const eficiencia = totalForrajes > 0 ? (produccion / totalForrajes).toFixed(2) : 0;
            
            return {
                fundo,
                produccionDiaria: (produccion / datosFundo.length).toFixed(1),
                promedioVaca,
                totalVacas: Math.round(totalVacas / datosFundo.length),
                forrajesDiarios: (totalForrajes / datosFundo.length).toFixed(1),
                eficiencia,
                datos: datosFundo
            };
        });
        
        // Ordenar por producción (descendente)
        return metricas.sort((a, b) => b.produccionDiaria - a.produccionDiaria);
    }

    // Filtrar datos por período
    static filtrarPorPeriodo(datos, dias) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        
        return datos.filter(dato => {
            const fechaDato = new Date(dato.fecha);
            return fechaDato >= fechaLimite;
        });
    }

    // Agrupar datos por fundo
    static agruparPorFundo(datos) {
        return datos.reduce((grupos, dato) => {
            const fundo = dato.fundo || 'Sin Nombre';
            if (!grupos[fundo]) {
                grupos[fundo] = [];
            }
            grupos[fundo].push(dato);
            return grupos;
        }, {});
    }

    // Calcular mejores prácticas
    static calcularMejoresPracticas(metricas) {
        if (metricas.length === 0) return [];
        
        const mejores = {
            produccion: metricas[0], // Ya está ordenado por producción
            eficiencia: [...metricas].sort((a, b) => b.eficiencia - a.eficiencia)[0],
            promedioVaca: [...metricas].sort((a, b) => b.promedioVaca - a.promedioVaca)[0]
        };
        
        return [
            {
                categoria: 'Mayor Producción Diaria',
                fundo: mejores.produccion.fundo,
                valor: mejores.produccion.produccionDiaria,
                unidad: 'L/día',
                icono: '📈'
            },
            {
                categoria: 'Mejor Eficiencia de Conversión',
                fundo: mejores.eficiencia.fundo,
                valor: mejores.eficiencia.eficiencia,
                unidad: 'L/kg',
                icono: '⚡'
            },
            {
                categoria: 'Mejor Rendimiento por Vaca',
                fundo: mejores.promedioVaca.fundo,
                valor: mejores.promedioVaca.promedioVaca,
                unidad: 'L/vaca',
                icono: '🥛'
            }
        ];
    }

    // Generar recomendaciones basadas en gaps
    static generarRecomendaciones(metricas, fundoActual) {
        const miMetrica = metricas.find(m => m.fundo === fundoActual);
        if (!miMetrica) return [];
        
        const recomendaciones = [];
        const topPerformer = metricas[0];
        
        // Gap de producción
        const gapProduccion = ((topPerformer.produccionDiaria - miMetrica.produccionDiaria) / topPerformer.produccionDiaria * 100).toFixed(1);
        if (gapProduccion > 10) {
            recomendaciones.push({
                tipo: 'produccion',
                prioridad: 'alta',
                mensaje: `Tu producción está un ${gapProduccion}% por debajo del líder. Considera revisar la nutrición y manejo del rebaño.`,
                accion: 'Optimizar alimentación y manejo'
            });
        }
        
        // Gap de eficiencia
        const gapEficiencia = ((topPerformer.eficiencia - miMetrica.eficiencia) / topPerformer.eficiencia * 100).toFixed(1);
        if (gapEficiencia > 15) {
            recomendaciones.push({
                tipo: 'eficiencia',
                prioridad: 'media',
                mensaje: `Puedes mejorar tu eficiencia en un ${gapEficiencia}%. Revisa la relación forraje-producción.`,
                accion: 'Balancear ración alimenticia'
            });
        }
        
        // Gap de promedio por vaca
        const gapPromedio = ((topPerformer.promedioVaca - miMetrica.promedioVaca) / topPerformer.promedioVaca * 100).toFixed(1);
        if (gapPromedio > 12) {
            recomendaciones.push({
                tipo: 'rendimiento',
                prioridad: 'alta',
                mensaje: `El rendimiento por vaca podría mejorar un ${gapPromedio}%. Evalúa la salud genética del rebaño.`,
                accion: 'Programa de mejoramiento genético'
            });
        }
        
        return recomendaciones;
    }

    // Calcular estadísticas descriptivas
    static calcularEstadisticas(datos, campo) {
        const valores = datos.map(d => this.getValorPorCampo(d, campo)).filter(v => v > 0);
        if (valores.length === 0) return null;
        
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const varianza = valores.reduce((sq, n) => sq + Math.pow(n - media, 2), 0) / valores.length;
        const desviacion = Math.sqrt(varianza);
        
        const ordenados = [...valores].sort((a, b) => a - b);
        const mediana = ordenados.length % 2 === 0
            ? (ordenados[ordenados.length / 2 - 1] + ordenados[ordenados.length / 2]) / 2
            : ordenados[Math.floor(ordenados.length / 2)];
        
        return {
            media: media.toFixed(2),
            mediana: mediana.toFixed(2),
            desviacion: desviacion.toFixed(2),
            min: Math.min(...valores).toFixed(2),
            max: Math.max(...valores).toFixed(2),
            count: valores.length
        };
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculationUtils;
}
