/**
 * Generador de Datos de Prueba - Plataforma Ganadera
 * Período: 1000 días hasta 28/02/2026
 * Fundos: Dollinco y Pitriuco
 */

class DataGenerator {
    constructor() {
        this.fundos = ['Dollinco', 'Pitriuco'];
        this.fechaFin = new Date('2026-02-28');
        this.fechaInicio = new Date(this.fechaFin);
        this.fechaInicio.setDate(this.fechaInicio.getDate() - 999); // 1000 días inclusive
        
        // Parámetros base por fundo
        this.parametros = {
            'Dollinco': {
                vacasBase: 120,
                lecheBase: 850,
                eficienciaBase: 7.1,
                costoBase: 0.38,
                proteinaBase: 3.25,
                grasaBase: 3.85
            },
            'Pitriuco': {
                vacasBase: 95,
                lecheBase: 650,
                eficienciaBase: 6.8,
                costoBase: 0.42,
                proteinaBase: 3.15,
                grasaBase: 3.75
            }
        };
    }

    /**
     * Generar todos los datos para el período completo
     */
    generarDatosCompletos() {
        const datos = [];
        const fechaActual = new Date(this.fechaInicio);
        
        while (fechaActual <= this.fechaFin) {
            for (const fundo of this.fundos) {
                const dia = this.generarDiaCompleto(fundo, new Date(fechaActual));
                datos.push(dia);
            }
            fechaActual.setDate(fechaActual.getDate() + 1);
        }
        
        return datos;
    }

    /**
     * Generar datos para un día específico de un fundo
     */
    generarDiaCompleto(fundo, fecha) {
        const params = this.parametros[fundo];
        const diaDelMes = fecha.getDate();
        const diaDelAño = this.getDiaDelAño(fecha);
        const estacion = this.getEstacion(diaDelAño);
        
        // Variaciones estacionales y aleatorias
        const factorEstacional = this.getFactorEstacional(estacion);
        const variacionDiaria = this.getVariacionAleatoria(-0.1, 0.1);
        const factorTotal = factorEstacional + variacionDiaria;
        
        // Producción
        const vacasOrdeña = Math.round(params.vacasBase * (1 + factorTotal * 0.15));
        const lecheDiaria = Math.round(params.lecheBase * (1 + factorTotal));
        const litrosVacaDia = parseFloat((lecheDiaria / vacasOrdeña).toFixed(2));
        
        // Calidad (con variaciones naturales)
        const proteina = parseFloat((params.proteinaBase + this.getVariacionAleatoria(-0.15, 0.15)).toFixed(2));
        const grasa = parseFloat((params.grasaBase + this.getVariacionAleatoria(-0.2, 0.2)).toFixed(2));
        
        // Alimentación
        const concentradoDiario = Math.round(vacasOrdeña * 4.2 * (1 + factorTotal * 0.1));
        
        // Costos
        const precioLeche = 0.95; // $/L precio venta
        const costoDieta = parseFloat((lecheDiaria * params.costoBase * (1 + factorTotal * 0.05)).toFixed(2));
        const costoDietaLitro = parseFloat((costoDieta / lecheDiaria).toFixed(3));
        const costoAlimentacion = parseFloat((costoDieta * 0.75).toFixed(2)); // 75% del costo es alimentación
        const ingresoEstimado = parseFloat((lecheDiaria * precioLeche).toFixed(2));
        const margenEstimado = parseFloat((ingresoEstimado - costoAlimentacion).toFixed(2));
        
        // Stock
        const stockDiario = Math.round(concentradoDiario * 1.1); // Stock de alimento: 10% de seguridad sobre consumo diario
        
        return {
            id: Date.now() + Math.random(),
            fundo: fundo,
            fecha: this.formatearFecha(fecha),
            dia: diaDelMes,
            
            // Producción
            lecheDiaria: lecheDiaria,
            litrosVacaDia: litrosVacaDia,
            vacasOrdeña: vacasOrdeña,
            vacasOrdeñaEvol: vacasOrdeña, // Mismo dato para evolución
            
            // Calidad
            proteina: Math.max(2.8, Math.min(3.6, proteina)), // Limitar rango realista
            grasa: Math.max(3.4, Math.min(4.3, grasa)),     // Limitar rango realista
            calidadLeche: proteina, // Valor principal
            
            // Alimentación
            concentradoDiario: concentradoDiario,
            
            // Economía
            costoDietaLitro: costoDietaLitro,
            costoDieta: costoDieta,
            costoAlimentacion: costoAlimentacion,
            ingresoEstimado: ingresoEstimado,
            margenEstimado: margenEstimado,
            
            // Stock
            stockDiario: stockDiario,
            
            // Datos adicionales para compatibilidad
            totalOrdeña: vacasOrdeña,
            lecheTotal: lecheDiaria,
            promedioPorVaca: litrosVacaDia,
            
            timestamp: fecha.toISOString()
        };
    }

    /**
     * Obtener día del año (1-366)
     */
    getDiaDelAño(fecha) {
        const inicio = new Date(fecha.getFullYear(), 0, 0);
        const diff = fecha - inicio;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    /**
     * Determinar estación del año
     */
    getEstacion(diaDelAño) {
        if (diaDelAño >= 80 && diaDelAño < 172) return 'primavera';
        if (diaDelAño >= 172 && diaDelAño < 266) return 'verano';
        if (diaDelAño >= 266 && diaDelAño < 355) return 'otoño';
        return 'invierno';
    }

    /**
     * Factor estacional para producción
     */
    getFactorEstacional(estacion) {
        const factores = {
            'primavera': 0.08,  // +8% producción
            'verano': -0.05,    // -5% producción (calor)
            'otoño': 0.12,      // +12% producción (mejor pastura)
            'invierno': -0.15   // -15% producción (frío)
        };
        return factores[estacion] || 0;
    }

    /**
     * Variación aleatoria controlada
     */
    getVariacionAleatoria(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Formatear fecha como YYYY-MM-DD
     */
    formatearFecha(fecha) {
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    }

    /**
     * Generar eventos especiales (vacaciones, problemas técnicos, etc.)
     */
    agregarEventosEspeciales(datos) {
        return datos.map(dia => {
            const fecha = new Date(dia.fecha);
            const mes = fecha.getMonth();
            const diaMes = fecha.getDate();
            
            // Vacaciones de verano (enero)
            if (mes === 0 && diaMes >= 10 && diaMes <= 25) {
                // Reducción de personal, menor producción
                dia.lecheDiaria = Math.round(dia.lecheDiaria * 0.85);
                dia.vacasOrdeña = Math.round(dia.vacasOrdeña * 0.9);
                dia.litrosVacaDia = parseFloat((dia.lecheDiaria / dia.vacasOrdeña).toFixed(2));
            }
            
            // Problemas técnicos aleatorios
            if (Math.random() < 0.005) { // 0.5% de probabilidad
                dia.lecheDiaria = Math.round(dia.lecheDiaria * 0.6);
                dia.observaciones = 'Problemas técnicos en equipo de ordeña';
            }
            
            // Días de lluvia intensa
            if (Math.random() < 0.02) { // 2% de probabilidad
                dia.concentradoDiario = Math.round(dia.concentradoDiario * 1.2);
                dia.costoDieta = parseFloat((dia.costoDieta * 1.1).toFixed(2));
                dia.observaciones = 'Día lluvioso, mayor consumo de concentrado';
            }
            
            return dia;
        });
    }

    /**
     * Validar y corregir datos
     */
    validarDatos(datos) {
        return datos.map(dia => {
            // Asegurar valores positivos
            dia.lecheDiaria = Math.max(100, dia.lecheDiaria);
            dia.vacasOrdeña = Math.max(10, dia.vacasOrdeña);
            dia.litrosVacaDia = parseFloat(Math.max(2, Math.min(15, dia.litrosVacaDia)).toFixed(2));
            
            // Recalcular dependencias
            dia.litrosVacaDia = parseFloat((dia.lecheDiaria / dia.vacasOrdeña).toFixed(2));
            dia.costoDietaLitro = parseFloat((dia.costoDieta / dia.lecheDiaria).toFixed(3));
            dia.margenEstimado = parseFloat((dia.ingresoEstimado - dia.costoAlimentacion).toFixed(2));
            
            return dia;
        });
    }

    /**
     * Generar dataset completo
     */
    generarDataset() {
        console.log('🔄 Generando datos de prueba...');
        console.log(`📅 Período: ${this.formatearFecha(this.fechaInicio)} al ${this.formatearFecha(this.fechaFin)}`);
        console.log(`📊 Total días: ${Math.floor((this.fechaFin - this.fechaInicio) / (1000 * 60 * 60 * 24)) + 1}`);
        console.log(`🏭 Fundos: ${this.fundos.join(', ')}`);
        
        let datos = this.generarDatosCompletos();
        datos = this.agregarEventosEspeciales(datos);
        datos = this.validarDatos(datos);
        
        // Estadísticas
        const stats = this.calcularEstadisticas(datos);
        console.log('\n📈 Estadísticas generadas:');
        console.log(`• Registros totales: ${datos.length}`);
        console.log(`• Producción promedio: ${stats.lechePromedio.toFixed(1)} L/día`);
        console.log(`• Eficiencia promedio: ${stats.eficienciaPromedio.toFixed(2)} L/vaca`);
        console.log(`• Proteína promedio: ${stats.proteinaPromedio.toFixed(2)}%`);
        console.log(`• Grasa promedio: ${stats.grasaPromedio.toFixed(2)}%`);
        console.log(`• Margen promedio: $${stats.margenPromedio.toFixed(0)}/día`);
        
        return datos;
    }

    /**
     * Calcular estadísticas del dataset
     */
    calcularEstadisticas(datos) {
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
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DataGenerator = DataGenerator;
}
