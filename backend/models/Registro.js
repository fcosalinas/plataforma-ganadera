const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
    fundo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fundo',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    dia: {
        type: Number,
        required: true,
        min: 1,
        max: 31
    },
    mes: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    año: {
        type: Number,
        required: true,
        min: 2020,
        max: 2030
    },
    vacas: {
        estanque: {
            type: Number,
            required: true,
            min: 0
        },
        descarte: {
            type: Number,
            required: true,
            min: 0
        },
        ingreso: {
            type: Number,
            required: true,
            min: 0
        },
        salida: {
            type: Number,
            required: true,
            min: 0
        }
    },
    produccion: {
        litros: {
            type: Number,
            required: true,
            min: 0
        },
        grasa: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        proteina: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        urea: {
            type: Number,
            min: 0,
            max: 100
        },
        recuento: {
            type: Number,
            min: 0
        },
        rct: {
            type: Number,
            min: 0,
            max: 100
        },
        crioscopia: {
            type: Number,
            min: -1000,
            max: 0
        }
    },
    alimentacion: {
        concentrado: {
            type: Number,
            required: true,
            min: 0
        },
        ensilaje: {
            type: Number,
            required: true,
            min: 0
        },
        sales: {
            type: Number,
            required: true,
            min: 0
        },
        fibra: {
            type: Number,
            required: true,
            min: 0
        },
        medicamentos: {
            type: Number,
            required: true,
            min: 0
        }
    },
    economia: {
        precio_leche: {
            type: Number,
            required: true,
            min: 0
        },
        costo_alimentacion: {
            type: Number,
            required: true,
            min: 0
        },
        ingreso_total: {
            type: Number,
            min: 0
        },
        costo_total: {
            type: Number,
            min: 0
        },
        margen: {
            type: Number,
            min: 0
        }
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índices para mejor rendimiento
registroSchema.index({ fundo: 1, fecha: -1 });
registroSchema.index({ fecha: -1 });
registroSchema.index({ fundo: 1, mes: 1, año: 1 });
registroSchema.index({ año: 1, mes: 1 });

// Middleware para calcular campos económicos automáticamente
registroSchema.pre('save', function(next) {
    // Calcular ingreso total
    if (this.produccion.litros && this.economia.precio_leche) {
        this.economia.ingreso_total = this.produccion.litros * this.economia.precio_leche;
    }
    
    // Calcular costo total de alimentación
    const costoAlimentacion = 
        (this.alimentacion.concentrado || 0) * 0.5 +  // Precio estimado
        (this.alimentacion.ensilaje || 0) * 0.1 +
        (this.alimentacion.sales || 0) * 0.8 +
        (this.alimentacion.fibra || 0) * 0.3 +
        (this.alimentacion.medicamentos || 0) * 2.0;
    
    this.economia.costo_alimentacion = costoAlimentacion;
    this.economia.costo_total = costoAlimentacion;
    
    // Calcular margen
    if (this.economia.ingreso_total && this.economia.costo_total) {
        this.economia.margen = this.economia.ingreso_total - this.economia.costo_total;
    }
    
    next();
});

module.exports = mongoose.model('Registro', registroSchema);
