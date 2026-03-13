const express = require('express');
const router = express.Router();
const {
    getInventario,
    getInventarioByFundo,
    getAlertasStock,
    getResumenInventario,
    createInventario,
    updateInventario,
    deleteInventario
} = require('../controllers/inventarioController');

// @route   GET /api/inventario
// @desc    Obtener todo el inventario
router.get('/', getInventario);

// @route   GET /api/inventario/fundo/:fundoId
// @desc    Obtener inventario por fundo
router.get('/fundo/:fundoId', getInventarioByFundo);

// @route   GET /api/inventario/alertas
// @desc    Obtener alertas de stock bajo
router.get('/alertas', getAlertasStock);

// @route   GET /api/inventario/resumen
// @desc    Obtener resumen de inventario
router.get('/resumen', getResumenInventario);

// @route   POST /api/inventario
// @desc    Crear un nuevo item de inventario
router.post('/', createInventario);

// @route   PUT /api/inventario/:id
// @desc    Actualizar un item de inventario
router.put('/:id', updateInventario);

// @route   DELETE /api/inventario/:id
// @desc    Eliminar un item de inventario
router.delete('/:id', deleteInventario);

module.exports = router;
