const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
    fundo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fundo',
        required: true
    },
    producto: {
        type: String,
        required: true,
        trim: true,
        enum: ['concentrado', 'ensilaje', 'sales', 'fibra', 'medicamentos']
    },
    cantidad_actual: {
        type: Number,
        required: true,
        min: 0
    },
    unidad: {
        type: String,
        required: true,
        trim: true,
        enum: ['kg', 'toneladas', 'litros', 'sacos', 'unidades']
    },
    costo_unitario: {
        type: Number,
        required: true,
        min: 0
    },
    proveedor: {
        type: String,
        trim: true,
        maxlength: 100
    },
    fecha_ultima_compra: {
        type: Date,
        default: Date.now
    },
    dias_stock: {
        type: Number,
        min: 0,
        default: 0
    },
    alerta_minimo: {
        type: Number,
        required: true,
        min: 0
    },
    consumo_diario_promedio: {
        type: Number,
        min: 0,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índices para mejor rendimiento
inventarioSchema.index({ fundo: 1, producto: 1 });
inventarioSchema.index({ fundo: 1 });
inventarioSchema.index({ producto: 1 });
inventarioSchema.index({ dias_stock: 1 });

// Middleware para calcular días de stock automáticamente
inventarioSchema.pre('save', function(next) {
    if (this.consumo_diario_promedio > 0) {
        this.dias_stock = Math.floor(this.cantidad_actual / this.consumo_diario_promedio);
    }
    next();
});

// Método estático para obtener productos con bajo stock
inventarioSchema.statics.getLowStock = function(fundoId = null) {
    const query = { dias_stock: { $lt: 30 } };
    if (fundoId) {
        query.fundo = fundoId;
    }
    return this.find(query).populate('fundo', 'nombre');
};

module.exports = mongoose.model('Inventario', inventarioSchema);
