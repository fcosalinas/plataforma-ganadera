const express = require('express');
const router = express.Router();
const {
    getRegistros,
    getRegistrosByFundo,
    getDashboardData,
    getBenchmarkData,
    createRegistro,
    updateRegistro,
    deleteRegistro
} = require('../controllers/registroController');

// @route   GET /api/registros
// @desc    Obtener todos los registros con filtros
router.get('/', getRegistros);

// @route   GET /api/registros/fundo/:fundoId
// @desc    Obtener registros por fundo
router.get('/fundo/:fundoId', getRegistrosByFundo);

// @route   GET /api/registros/dashboard
// @desc    Obtener datos para dashboard
router.get('/dashboard', getDashboardData);

// @route   GET /api/registros/benchmark
// @desc    Obtener datos para benchmark
router.get('/benchmark', getBenchmarkData);

// @route   POST /api/registros
// @desc    Crear un nuevo registro
router.post('/', createRegistro);

// @route   PUT /api/registros/:id
// @desc    Actualizar un registro
router.put('/:id', updateRegistro);

// @route   DELETE /api/registros/:id
// @desc    Eliminar un registro
router.delete('/:id', deleteRegistro);

module.exports = router;
