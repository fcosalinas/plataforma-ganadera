const mongoose = require('mongoose');

const fundoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    rut: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 20
    },
    ubicacion: {
        type: String,
        trim: true,
        maxlength: 200
    },
    contacto: {
        nombre: String,
        email: String,
        telefono: String,
        rol: String
    },
    creado: {
        type: Date,
        default: Date.now
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índices para mejor rendimiento
fundoSchema.index({ nombre: 1 });
fundoSchema.index({ rut: 1 });
fundoSchema.index({ activo: 1 });

module.exports = mongoose.model('Fundo', fundoSchema);
