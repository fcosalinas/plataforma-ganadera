const Registro = require('../models/Registro');
const Fundo = require('../models/Fundo');

// @desc    Obtener todos los registros con filtros
// @route   GET /api/registros
// @access  Public
const getRegistros = async (req, res) => {
    try {
        const {
            fundo,
            fechaDesde,
            fechaHasta,
            mes,
            año,
            page = 1,
            limit = 50
        } = req.query;
        
        // Construir filtro
        const filtro = {};
        
        if (fundo) filtro.fundo = fundo;
        if (mes) filtro.mes = parseInt(mes);
        if (año) filtro.año = parseInt(año);
        if (fechaDesde || fechaHasta) {
            filtro.fecha = {};
            if (fechaDesde) filtro.fecha.$gte = new Date(fechaDesde);
            if (fechaHasta) filtro.fecha.$lte = new Date(fechaHasta);
        }
        
        // Paginación
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const registros = await Registro.find(filtro)
            .populate('fundo', 'nombre')
            .sort({ fecha: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .select('-__v -createdAt -updatedAt');
        
        const total = await Registro.countDocuments(filtro);
        
        res.json({
            success: true,
            count: registros.length,
            total,
            pages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: registros
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener registros',
            error: error.message
        });
    }
};

// @desc    Obtener registros por fundo
// @route   GET /api/registros/fundo/:fundoId
// @access  Public
const getRegistrosByFundo = async (req, res) => {
    try {
        const { fundoId } = req.params;
        const { mes, año, limit = 100 } = req.query;
        
        const filtro = { fundo: fundoId };
        if (mes) filtro.mes = parseInt(mes);
        if (año) filtro.año = parseInt(año);
        
        const registros = await Registro.find(filtro)
            .sort({ fecha: -1 })
            .limit(parseInt(limit))
            .select('-__v -createdAt -updatedAt');
        
        res.json({
            success: true,
            count: registros.length,
            data: registros
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener registros del fundo',
            error: error.message
        });
    }
};

// @desc    Obtener datos para dashboard
// @route   GET /api/registros/dashboard
// @access  Public
const getDashboardData = async (req, res) => {
    try {
        const { fundo, periodo = 'todos' } = req.query;
        
        // Calcular fechas según el período
        const ahora = new Date();
        let fechaDesde;
        
        switch (periodo) {
            case 'ultima_semana':
                fechaDesde = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'ultimo_mes':
                fechaDesde = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
                break;
            case 'ultimo_ano':
                fechaDesde = new Date(ahora.getFullYear() - 1, ahora.getMonth(), ahora.getDate());
                break;
            case 'todos':
            default:
                // Obtener todos los datos disponibles
                fechaDesde = new Date(2020, 0, 1); // Desde 2020
                break;
        }
        
        const filtro = { fecha: { $gte: fechaDesde } };
        if (fundo) filtro.fundo = fundo;
        
        // Obtener registros
        const registros = await Registro.find(filtro)
            .populate('fundo', 'nombre')
            .sort({ fecha: -1 })
            .limit(1000)
            .select('-__v -createdAt -updatedAt');
        
        // Si no hay registros con el filtro de fecha, intentar sin filtro de fecha
        if (registros.length === 0) {
            const filtroSinFecha = {};
            if (fundo) filtroSinFecha.fundo = fundo;
            
            const todosRegistros = await Registro.find(filtroSinFecha)
                .populate('fundo', 'nombre')
                .sort({ fecha: -1 })
                .limit(1000)
                .select('-__v -createdAt -updatedAt');
            
            console.log(`📊 Dashboard: Encontrados ${todosRegistros.length} registros sin filtro de fecha`);
            
            // Usar estos registros para el dashboard
            return procesarDashboardData(res, todosRegistros, periodo);
        }
        
        console.log(`📊 Dashboard: Encontrados ${registros.length} registros con período ${periodo}`);
        
        return procesarDashboardData(res, registros, periodo);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener datos del dashboard',
            error: error.message
        });
    }
};

// Función auxiliar para procesar datos del dashboard
function procesarDashboardData(res, registros, periodo) {
    // Calcular KPIs
    const kpis = {
        totalRegistros: registros.length,
        totalLitros: registros.reduce((sum, r) => sum + (r.produccion.litros || 0), 0),
        promedioGrasa: registros.reduce((sum, r) => sum + (r.produccion.grasa || 0), 0) / registros.length || 0,
        promedioProteina: registros.reduce((sum, r) => sum + (r.produccion.proteina || 0), 0) / registros.length || 0,
        totalVacas: registros.reduce((sum, r) => sum + (r.vacas.estanque || 0), 0) / registros.length || 0,
        ingresos: registros.reduce((sum, r) => sum + (r.economia.ingreso_total || 0), 0),
        costos: registros.reduce((sum, r) => sum + (r.economia.costo_total || 0), 0),
        margen: registros.reduce((sum, r) => sum + (r.economia.margen || 0), 0)
    };
    
    // Agrupar por fundo
    const porFundo = {};
    registros.forEach(registro => {
        const nombreFundo = registro.fundo.nombre;
        if (!porFundo[nombreFundo]) {
            porFundo[nombreFundo] = {
                registros: 0,
                litros: 0,
                grasa: 0,
                proteina: 0,
                vacas: 0
            };
        }
        porFundo[nombreFundo].registros++;
        porFundo[nombreFundo].litros += registro.produccion.litros || 0;
        porFundo[nombreFundo].grasa += registro.produccion.grasa || 0;
        porFundo[nombreFundo].proteina += registro.produccion.proteina || 0;
        porFundo[nombreFundo].vacas += registro.vacas.estanque || 0;
    });
    
    // Calcular promedios por fundo
    Object.keys(porFundo).forEach(fundo => {
        const datos = porFundo[fundo];
        datos.grasa = datos.grasa / datos.registros || 0;
        datos.proteina = datos.proteina / datos.registros || 0;
        datos.vacas = datos.vacas / datos.registros || 0;
    });
    
    res.json({
        success: true,
        periodo,
        kpis,
        porFundo,
        registros: registros.slice(0, 50) // Últimos 50 registros
    });
}

// @desc    Obtener datos para benchmark
// @route   GET /api/registros/benchmark
// @access  Public
const getBenchmarkData = async (req, res) => {
    try {
        const { mes, año } = req.query;
        
        const filtro = {};
        if (mes) filtro.mes = parseInt(mes);
        if (año) filtro.año = parseInt(año);
        
        const registros = await Registro.find(filtro)
            .populate('fundo', 'nombre')
            .select('-__v -createdAt -updatedAt');
        
        // Agrupar por fundo para benchmark
        const benchmark = {};
        registros.forEach(registro => {
            const nombreFundo = registro.fundo.nombre;
            if (!benchmark[nombreFundo]) {
                benchmark[nombreFundo] = {
                    fundo: nombreFundo,
                    registros: 0,
                    totalLitros: 0,
                    promedioGrasa: 0,
                    promedioProteina: 0,
                    promedioUrea: 0,
                    totalVacas: 0,
                    produccionPorVaca: 0,
                    ingresoTotal: 0,
                    costoTotal: 0,
                    margenTotal: 0
                };
            }
            
            const datos = benchmark[nombreFundo];
            datos.registros++;
            datos.totalLitros += registro.produccion.litros || 0;
            datos.promedioGrasa += registro.produccion.grasa || 0;
            datos.promedioProteina += registro.produccion.proteina || 0;
            datos.promedioUrea += registro.produccion.urea || 0;
            datos.totalVacas += registro.vacas.estanque || 0;
            datos.ingresoTotal += registro.economia.ingreso_total || 0;
            datos.costoTotal += registro.economia.costo_total || 0;
            datos.margenTotal += registro.economia.margen || 0;
        });
        
        // Calcular promedios y producción por vaca
        Object.keys(benchmark).forEach(fundo => {
            const datos = benchmark[fundo];
            datos.promedioGrasa = datos.promedioGrasa / datos.registros || 0;
            datos.promedioProteina = datos.promedioProteina / datos.registros || 0;
            datos.promedioUrea = datos.promedioUrea / datos.registros || 0;
            datos.totalVacas = datos.totalVacas / datos.registros || 0;
            datos.produccionPorVaca = datos.totalVacas > 0 ? datos.totalLitros / datos.totalVacas : 0;
        });
        
        // Convertir a array y ordenar
        const ranking = Object.values(benchmark).sort((a, b) => b.produccionPorVaca - a.produccionPorVaca);
        
        res.json({
            success: true,
            periodo: { mes, año },
            benchmark: ranking,
            totalFundos: ranking.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener datos de benchmark',
            error: error.message
        });
    }
};

// @desc    Crear un nuevo registro
// @route   POST /api/registros
// @access  Public
const createRegistro = async (req, res) => {
    try {
        // Verificar que el fundo exista
        const fundo = await Fundo.findById(req.body.fundo);
        if (!fundo) {
            return res.status(400).json({
                success: false,
                message: '❌ El fundo especificado no existe'
            });
        }
        
        // Extraer día, mes, año de la fecha
        const fecha = new Date(req.body.fecha);
        req.body.dia = fecha.getDate();
        req.body.mes = fecha.getMonth() + 1;
        req.body.año = fecha.getFullYear();
        
        const registro = new Registro(req.body);
        await registro.save();
        
        // Populate para respuesta
        await registro.populate('fundo', 'nombre');
        
        res.status(201).json({
            success: true,
            message: '✅ Registro creado exitosamente',
            data: registro
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: '❌ Error al crear registro',
            error: error.message
        });
    }
};

// @desc    Actualizar un registro
// @route   PUT /api/registros/:id
// @access  Public
const updateRegistro = async (req, res) => {
    try {
        // Si se actualiza la fecha, actualizar día, mes, año
        if (req.body.fecha) {
            const fecha = new Date(req.body.fecha);
            req.body.dia = fecha.getDate();
            req.body.mes = fecha.getMonth() + 1;
            req.body.año = fecha.getFullYear();
        }
        
        const registro = await Registro.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('fundo', 'nombre');
        
        if (!registro) {
            return res.status(404).json({
                success: false,
                message: '❌ Registro no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: '✅ Registro actualizado exitosamente',
            data: registro
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: '❌ Error al actualizar registro',
            error: error.message
        });
    }
};

// @desc    Eliminar un registro
// @route   DELETE /api/registros/:id
// @access  Public
const deleteRegistro = async (req, res) => {
    try {
        const registro = await Registro.findByIdAndDelete(req.params.id);
        
        if (!registro) {
            return res.status(404).json({
                success: false,
                message: '❌ Registro no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: '✅ Registro eliminado exitosamente',
            data: registro
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al eliminar registro',
            error: error.message
        });
    }
};

module.exports = {
    getRegistros,
    getRegistrosByFundo,
    getDashboardData,
    getBenchmarkData,
    createRegistro,
    updateRegistro,
    deleteRegistro
};
