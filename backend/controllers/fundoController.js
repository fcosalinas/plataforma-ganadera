const Fundo = require('../models/Fundo');

// @desc    Obtener todos los fundos
// @route   GET /api/fundos
// @access  Public
const getFundos = async (req, res) => {
    try {
        const { activo = true } = req.query;
        
        const fundos = await Fundo.find({ activo })
            .sort({ nombre: 1 })
            .select('-__v -createdAt -updatedAt');
        
        res.json({
            success: true,
            count: fundos.length,
            data: fundos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener fundos',
            error: error.message
        });
    }
};

// @desc    Obtener un fundo por ID
// @route   GET /api/fundos/:id
// @access  Public
const getFundoById = async (req, res) => {
    try {
        const fundo = await Fundo.findById(req.params.id)
            .select('-__v -createdAt -updatedAt');
        
        if (!fundo) {
            return res.status(404).json({
                success: false,
                message: '❌ Fundo no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: fundo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener fundo',
            error: error.message
        });
    }
};

// @desc    Crear un nuevo fundo
// @route   POST /api/fundos
// @access  Public
const createFundo = async (req, res) => {
    try {
        const fundo = new Fundo(req.body);
        await fundo.save();
        
        res.status(201).json({
            success: true,
            message: '✅ Fundo creado exitosamente',
            data: fundo
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: '❌ Error al crear fundo',
            error: error.message
        });
    }
};

// @desc    Actualizar un fundo
// @route   PUT /api/fundos/:id
// @access  Public
const updateFundo = async (req, res) => {
    try {
        const fundo = await Fundo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!fundo) {
            return res.status(404).json({
                success: false,
                message: '❌ Fundo no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: '✅ Fundo actualizado exitosamente',
            data: fundo
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: '❌ Error al actualizar fundo',
            error: error.message
        });
    }
};

// @desc    Eliminar un fundo (desactivar)
// @route   DELETE /api/fundos/:id
// @access  Public
const deleteFundo = async (req, res) => {
    try {
        const fundo = await Fundo.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { new: true }
        );
        
        if (!fundo) {
            return res.status(404).json({
                success: false,
                message: '❌ Fundo no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: '✅ Fundo desactivado exitosamente',
            data: fundo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Error al desactivar fundo',
            error: error.message
        });
    }
};

module.exports = {
    getFundos,
    getFundoById,
    createFundo,
    updateFundo,
    deleteFundo
};
