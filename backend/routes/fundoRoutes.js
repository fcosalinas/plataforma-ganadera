const express = require('express');
const router = express.Router();
const {
    getFundos,
    getFundoById,
    createFundo,
    updateFundo,
    deleteFundo
} = require('../controllers/fundoController');

// @route   GET /api/fundos
// @desc    Obtener todos los fundos
router.get('/', getFundos);

// @route   GET /api/fundos/:id
// @desc    Obtener un fundo por ID
router.get('/:id', getFundoById);

// @route   POST /api/fundos
// @desc    Crear un nuevo fundo
router.post('/', createFundo);

// @route   PUT /api/fundos/:id
// @desc    Actualizar un fundo
router.put('/:id', updateFundo);

// @route   DELETE /api/fundos/:id
// @desc    Eliminar un fundo (desactivar)
router.delete('/:id', deleteFundo);

module.exports = router;
