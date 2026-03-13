require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Importar rutas
const fundoRoutes = require('./routes/fundoRoutes');
const registroRoutes = require('./routes/registroRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');

// Conectar a la base de datos
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/fundos', fundoRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/inventario', inventarioRoutes);

// Ruta de bienvenida
app.get('/api', (req, res) => {
    res.json({
        message: '🐄 Plataforma Ganadera Digital API',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            fundos: '/api/fundos',
            registros: '/api/registros',
            inventario: '/api/inventario'
        }
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `❌ Ruta no encontrada: ${req.originalUrl}`
    });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
    console.error('❌ Error del servidor:', err.stack);
    
    // Error de Mongoose (validación)
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: '❌ Error de validación',
            errors
        });
    }
    
    // Error de duplicado (MongoDB)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `❌ El campo ${field} ya existe`
        });
    }
    
    // Error por defecto
    res.status(err.status || 500).json({
        success: false,
        message: err.message || '❌ Error interno del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📡 API disponible en: http://localhost:${PORT}/api`);
    console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
