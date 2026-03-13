const Inventario = require('../models/Inventario');
const Fundo = require('../models/Fundo');

// @desc    Obtener todo el inventario
// @route   GET /api/inventario
// @access  Public
const getInventario = async (req, res) => {
    try {
        const { fundo, producto, alerta } = req.query;
        
        // Construir filtro
        const filtro = {};
        if (fundo) filtro.fundo = fundo;
        if (producto) filtro.producto = producto;
        if (alerta === 'bajo') filtro.dias_stock = { $lt: 30 };
        
        const inventario = await Inventario.find(filtro)
            .populate('fundo', 'nombre')
            .sort({ fundo: 1, producto: 1 })
            .select('-__v -createdAt -updatedAt');
        
        res.json({
            success: true,
            count: inventario.length,
            data: inventario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener inventario',
            error: error.message
        });
    }
};

// @desc    Obtener inventario por fundo
// @route   GET /api/inventario/fundo/:fundoId
// @access  Public
const getInventarioByFundo = async (req, res) => {
    try {
        const { fundoId } = req.params;
        
        const inventario = await Inventario.find({ fundo: fundoId })
            .populate('fundo', 'nombre')
            .sort({ producto: 1 })
            .select('-__v -createdAt -updatedAt');
        
        res.json({
            success: true,
            count: inventario.length,
            data: inventario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener inventario del fundo',
            error: error.message
        });
    }
};

// @desc    Obtener alertas de stock bajo
// @route   GET /api/inventario/alertas
// @access  Public
const getAlertasStock = async (req, res) => {
    try {
        const { fundo } = req.query;
        
        const alertas = await Inventario.getLowStock(fundo);
        
        res.json({
            success: true,
            count: alertas.length,
            data: alertas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener alertas de stock',
            error: error.message
        });
    }
};

// @desc    Obtener resumen de inventario
// @route   GET /api/inventario/resumen
// @access  Public
const getResumenInventario = async (req, res) => {
    try {
        const { fundo } = req.query;
        
        const filtro = fundo ? { fundo } : {};
        
        const inventario = await Inventario.find(filtro)
            .populate('fundo', 'nombre');
        
        // Calcular resumen
        const resumen = {
            totalProductos: 0,
            valorTotalInventario: 0,
            productosConBajoStock: 0,
            porProducto: {},
            porFundo: {}
        };
        
        inventario.forEach(item => {
            // Totales generales
            resumen.totalProductos++;
            resumen.valorTotalInventario += item.cantidad_actual * item.costo_unitario;
            
            if (item.dias_stock < 30) {
                resumen.productosConBajoStock++;
            }
            
            // Agrupar por producto
            if (!resumen.porProducto[item.producto]) {
                resumen.porProducto[item.producto] = {
                    cantidadTotal: 0,
                    valorTotal: 0,
                    fundos: new Set(),
                    alertas: 0
                };
            }
            resumen.porProducto[item.producto].cantidadTotal += item.cantidad_actual;
            resumen.porProducto[item.producto].valorTotal += item.cantidad_actual * item.costo_unitario;
            resumen.porProducto[item.producto].fundos.add(item.fundo.nombre);
            if (item.dias_stock < 30) {
                resumen.porProducto[item.producto].alertas++;
            }
            
            // Agrupar por fundo
            if (!resumen.porFundo[item.fundo.nombre]) {
                resumen.porFundo[item.fundo.nombre] = {
                    cantidadTotal: 0,
                    valorTotal: 0,
                    productos: new Set(),
                    alertas: 0
                };
            }
            resumen.porFundo[item.fundo.nombre].cantidadTotal += item.cantidad_actual;
            resumen.porFundo[item.fundo.nombre].valorTotal += item.cantidad_actual * item.costo_unitario;
            resumen.porFundo[item.fundo.nombre].productos.add(item.producto);
            if (item.dias_stock < 30) {
                resumen.porFundo[item.fundo.nombre].alertas++;
            }
        });
        
        // Convertir Sets a Arrays para JSON
        Object.keys(resumen.porProducto).forEach(producto => {
            resumen.porProducto[producto].fundos = Array.from(resumen.porProducto[producto].fundos);
        });
        
        Object.keys(resumen.porFundo).forEach(fundo => {
            resumen.porFundo[fundo].productos = Array.from(resumen.porFundo[fundo].productos);
        });
        
        res.json({
            success: true,
            resumen
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener resumen de inventario',
            error: error.message
        });
    }
};

// @desc    Crear un nuevo item de inventario
// @route   POST /api/inventario
// @access  Public
const createInventario = async (req, res) => {
    try {
        // Verificar que el fundo exista
        const fundo = await Fundo.findById(req.body.fundo);
        if (!fundo) {
            return res.status(400).json({
                success: false,
                message: '❌ El fundo especificado no existe'
            });
        }
        
        // Verificar que no exista el mismo producto para el mismo fundo
        const existente = await Inventario.findOne({
            fundo: req.body.fundo,
            producto: req.body.producto
        });
        
        if (existente) {
            return res.status(400).json({
                success: false,
                message: '❌ Ya existe un registro de este producto para este fundo'
            });
        }
        
        const inventario = new Inventario(req.body);
        await inventario.save();
        
        // Populate para respuesta
        await inventario.populate('fundo', 'nombre');
        
        res.status(201).json({
            success: true,
            message: '✅ Item de inventario creado exitosamente',
            data: inventario
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: '❌ Error al crear item de inventario',
            error: error.message
        });
    }
};

// @desc    Actualizar un item de inventario
// @route   PUT /api/inventario/:id
// @access  Public
const updateInventario = async (req, res) => {
    try {
        const inventario = await Inventario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('fundo', 'nombre');
        
        if (!inventario) {
            return res.status(404).json({
                success: false,
                message: '❌ Item de inventario no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: '✅ Item de inventario actualizado exitosamente',
            data: inventario
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: '❌ Error al actualizar item de inventario',
            error: error.message
        });
    }
};

// @desc    Eliminar un item de inventario
// @route   DELETE /api/inventario/:id
// @access  Public
const deleteInventario = async (req, res) => {
    try {
        const inventario = await Inventario.findByIdAndDelete(req.params.id);
        
        if (!inventario) {
            return res.status(404).json({
                success: false,
                message: '❌ Item de inventario no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: '✅ Item de inventario eliminado exitosamente',
            data: inventario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al eliminar item de inventario',
            error: error.message
        });
    }
};

module.exports = {
    getInventario,
    getInventarioByFundo,
    getAlertasStock,
    getResumenInventario,
    createInventario,
    updateInventario,
    deleteInventario
};
