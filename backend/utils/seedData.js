const mongoose = require('mongoose');
require('dotenv').config();
const Fundo = require('../models/Fundo');
const Registro = require('../models/Registro');
const Inventario = require('../models/Inventario');

// Datos de ejemplo para fundos (mismo dueño)
const fundosEjemplo = [
    {
        nombre: 'Agricola A',
        rut: '76.123.456-7',
        ubicacion: 'Los Lagos, Región de Los Lagos',
        contacto: {
            nombre: 'Juan Pérez García',
            email: 'juan.perez@agricola-a.cl',
            telefono: '+56 9 1234 5678',
            rol: 'Administrador y Propietario'
        }
    },
    {
        nombre: 'Agricola B',
        rut: '76.123.456-8',
        ubicacion: 'Osorno, Región de Los Lagos',
        contacto: {
            nombre: 'Juan Pérez García',
            email: 'juan.perez@agricola-b.cl',
            telefono: '+56 9 1234 5678',
            rol: 'Administrador y Propietario'
        }
    }
];

// Función para generar número aleatorio en rango
function randomBetween(min, max, decimals = 0) {
    const value = Math.random() * (max - min) + min;
    return decimals === 0 ? Math.round(value) : parseFloat(value.toFixed(decimals));
}

// Función para generar fecha aleatoria en rango
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Función para generar variación estacional (más producción en primavera/verano)
function variacionEstacional(fecha) {
    const mes = fecha.getMonth() + 1; // 1-12
    // Factores de producción por mes (1.0 = 100%)
    const factores = {
        1: 0.85,  // Enero - Verano (buena producción)
        2: 0.88,  // Febrero - Verano
        3: 0.90,  // Marzo - Otoño
        4: 0.82,  // Abril - Otoño
        5: 0.78,  // Mayo - Otoño
        6: 0.75,  // Junio - Invierno
        7: 0.72,  // Julio - Invierno
        8: 0.74,  // Agosto - Invierno
        9: 0.80,  // Septiembre - Primavera
        10: 0.88, // Octubre - Primavera
        11: 0.92, // Noviembre - Primavera
        12: 0.95  // Diciembre - Verano
    };
    return factores[mes] || 1.0;
}

// Función para generar datos realistas de vacas
function generarDatosVacas(fecha, baseVacas) {
    const estacional = variacionEstacional(fecha);
    const variacionDiaria = 0.95 + Math.random() * 0.1; // ±5% variación diaria
    
    return {
        estanque: Math.round(baseVacas * estacional * variacionDiaria),
        descarte: randomBetween(1, 5),
        ingreso: randomBetween(0, 8),
        salida: randomBetween(0, 6)
    };
}

// Función para generar producción realista
function generarProduccion(vacas, fecha) {
    const estacional = variacionEstacional(fecha);
    const litrosPorVaca = 18 + Math.random() * 8; // 18-26 litros por vaca
    
    const litros = Math.round(vacas.estanque * litrosPorVaca * estacional);
    
    return {
        litros: litros,
        grasa: randomBetween(3.2, 4.3, 2),
        proteina: randomBetween(3.0, 3.9, 2),
        urea: randomBetween(12, 25, 1),
        recuento: Math.round(50000 + Math.random() * 200000),
        rct: randomBetween(70, 88),
        crioscopia: randomBetween(-560, -520)
    };
}

// Función para generar alimentación realista
function generarAlimentacion(vacas, precioConcentrado = 0.45) {
    return {
        concentrado: Math.round(vacas.estanque * (6 + Math.random() * 2)), // 6-8 kg por vaca
        ensilaje: Math.round(vacas.estanque * (18 + Math.random() * 4)), // 18-22 kg por vaca
        sales: Math.round(vacas.estanque * (0.08 + Math.random() * 0.04)), // 80-120 g por vaca
        fibra: Math.round(vacas.estanque * (2.5 + Math.random() * 1.5)), // 2.5-4 kg por vaca
        medicamentos: Math.round(vacas.estanque * (0.02 + Math.random() * 0.03)) // 20-50 g por vaca
    };
}

// Función para generar economía realista
function generarEconomia(produccion, alimentacion, precioLeche = 280) {
    const costoConcentrado = 0.45; // $/kg
    const costoEnsilaje = 0.08; // $/kg
    const costoSales = 0.80; // $/kg
    const costoFibra = 0.25; // $/kg
    const costoMedicamentos = 2.50; // $/kg
    
    const costoTotalAlimentacion = 
        (alimentacion.concentrado * costoConcentrado) +
        (alimentacion.ensilaje * costoEnsilaje) +
        (alimentacion.sales * costoSales) +
        (alimentacion.fibra * costoFibra) +
        (alimentacion.medicamentos * costoMedicamentos);
    
    const ingresoTotal = produccion.litros * precioLeche;
    const margen = ingresoTotal - costoTotalAlimentacion;
    
    return {
        precio_leche: precioLeche,
        costo_alimentacion: costoTotalAlimentacion,
        ingreso_total: ingresoTotal,
        costo_total: costoTotalAlimentacion,
        margen: margen
    };
}

// Generar registros para un fundo
function generarRegistrosFundo(fundoId, fechaInicio, fechaFin, baseVacas) {
    const registros = [];
    const fechaActual = new Date(fechaInicio);
    
    console.log(`📅 Generando registros desde ${fechaInicio.toISOString().split('T')[0]} hasta ${fechaFin.toISOString().split('T')[0]}`);
    
    while (fechaActual <= fechaFin) {
        // Solo generar registros para días hábiles (evitar fines de semana)
        const diaSemana = fechaActual.getDay();
        if (diaSemana !== 0 && diaSemana !== 6) {
            // Generar datos realistas con variación estacional
            const vacas = generarDatosVacas(fechaActual, baseVacas);
            const produccion = generarProduccion(vacas, fechaActual);
            const alimentacion = generarAlimentacion(vacas);
            const economia = generarEconomia(produccion, alimentacion);
            
            // Variar el precio de la leche mensualmente
            const mes = fechaActual.getMonth() + 1;
            const precioLeche = 260 + (mes - 1) * 2 + Math.random() * 10; // $260-$300 con variación
            
            const registro = {
                fundo: fundoId,
                fecha: new Date(fechaActual),
                dia: fechaActual.getDate(),
                mes: fechaActual.getMonth() + 1,
                año: fechaActual.getFullYear(),
                vacas: vacas,
                produccion: produccion,
                alimentacion: alimentacion,
                economia: generarEconomia(produccion, alimentacion, precioLeche)
            };
            
            registros.push(registro);
        }
        
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    console.log(`📊 Generados ${registros.length} registros para el fundo`);
    return registros;
}

// Generar inventario para un fundo
function generarInventarioFundo(fundoId) {
    const productos = ['concentrado', 'ensilaje', 'sales', 'fibra', 'medicamentos'];
    const inventario = [];
    
    productos.forEach(producto => {
        let cantidad_actual, costo_unitario, alerta_minimo, consumo_diario_promedio;
        
        switch (producto) {
            case 'concentrado':
                cantidad_actual = randomBetween(5000, 15000);
                costo_unitario = randomBetween(0.4, 0.6, 2);
                alerta_minimo = 3000;
                consumo_diario_promedio = randomBetween(600, 800);
                break;
            case 'ensilaje':
                cantidad_actual = randomBetween(20000, 50000);
                costo_unitario = randomBetween(0.08, 0.12, 2);
                alerta_minimo = 10000;
                consumo_diario_promedio = randomBetween(2000, 3000);
                break;
            case 'sales':
                cantidad_actual = randomBetween(500, 2000);
                costo_unitario = randomBetween(0.7, 0.9, 2);
                alerta_minimo = 300;
                consumo_diario_promedio = randomBetween(60, 100);
                break;
            case 'fibra':
                cantidad_actual = randomBetween(3000, 8000);
                costo_unitario = randomBetween(0.25, 0.35, 2);
                alerta_minimo = 2000;
                consumo_diario_promedio = randomBetween(350, 500);
                break;
            case 'medicamentos':
                cantidad_actual = randomBetween(100, 500);
                costo_unitario = randomBetween(1.5, 3.0, 2);
                alerta_minimo = 50;
                consumo_diario_promedio = randomBetween(10, 25);
                break;
        }
        
        inventario.push({
            fundo: fundoId,
            producto,
            cantidad_actual,
            unidad: producto === 'ensilaje' ? 'kg' : 'kg',
            costo_unitario,
            proveedor: `Proveedor ${producto.charAt(0).toUpperCase() + producto.slice(1)} SA`,
            fecha_ultima_compra: randomDate(new Date(2024, 0, 1), new Date()),
            alerta_minimo,
            consumo_diario_promedio
        });
    });
    
    return inventario;
}

// Función principal para poblar la base de datos
async function seedDatabase() {
    try {
        console.log('🌱 Iniciando generación de datos de ejemplo mejorados...');
        
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas');
        
        // Limpiar datos existentes
        console.log('🧹 Limpiando datos existentes...');
        await Fundo.deleteMany({});
        await Registro.deleteMany({});
        await Inventario.deleteMany({});
        
        // Crear fundos
        console.log('🏭 Creando fundos...');
        const fundosCreados = await Fundo.create(fundosEjemplo);
        console.log(`✅ ${fundosCreados.length} fundos creados`);
        
        // Generar registros para cada fundo con datos realistas
        console.log('📊 Generando registros de producción realistas...');
        const fechaInicio = new Date(2024, 0, 1); // 1 de enero de 2024
        const fechaFin = new Date(2026, 1, 28); // 28 de febrero de 2026
        
        let totalRegistros = 0;
        
        // Datos base para cada fundo (diferentes tamaños de rodeo)
        const datosFundos = [
            { nombre: 'Agricola A', baseVacas: 180 },
            { nombre: 'Agricola B', baseVacas: 150 }
        ];
        
        for (let i = 0; i < fundosCreados.length; i++) {
            const fundo = fundosCreados[i];
            const datosFundo = datosFundos[i];
            
            console.log(`📈 Generando registros para ${fundo.nombre} (${datosFundo.baseVacas} vacas base)...`);
            const registros = generarRegistrosFundo(fundo._id, fechaInicio, fechaFin, datosFundo.baseVacas);
            await Registro.insertMany(registros);
            totalRegistros += registros.length;
            console.log(`✅ ${registros.length} registros creados para ${fundo.nombre}`);
        }
        
        console.log(`✅ Total de ${totalRegistros} registros creados`);
        
        // Generar inventario para cada fundo
        console.log('📦 Generando inventario realista...');
        let totalInventario = 0;
        
        for (const fundo of fundosCreados) {
            const inventario = generarInventarioFundo(fundo._id);
            await Inventario.insertMany(inventario);
            totalInventario += inventario.length;
            console.log(`📋 ${inventario.length} items de inventario creados para ${fundo.nombre}`);
        }
        
        console.log(`✅ Total de ${totalInventario} items de inventario creados`);
        
        // Resumen final
        console.log('\n🎉 Base de datos poblada exitosamente con datos realistas:');
        console.log(`📊 Fundos: ${fundosCreados.length} (mismo dueño)`);
        console.log(`📈 Registros: ${totalRegistros} (1/1/2024 - 28/2/2026)`);
        console.log(`📦 Inventario: ${totalInventario} items`);
        console.log(`📅 Período: ${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`);
        console.log(`👤 Dueño: Juan Pérez García (ambos fundos)`);
        
        // Estadísticas generadas
        const diasTotales = Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
        const diasHabiles = Math.floor(diasTotales * 5/7); // ~71% son días hábiles
        console.log(`📊 Estadísticas: ${diasTotales} días totales, ~${diasHabiles} días hábiles`);
        
        // Cerrar conexión
        await mongoose.disconnect();
        console.log('🔚 Conexión cerrada');
        
    } catch (error) {
        console.error('❌ Error al poblar la base de datos:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
