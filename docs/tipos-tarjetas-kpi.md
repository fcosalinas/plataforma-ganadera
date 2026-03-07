# 📊 Tipos de Tarjetas KPI - Plataforma Ganadera

## 🎯 Definición de Tipos de Tarjetas

### **Tipo 1: Tarjetas de Valor (`.kpi-card.valor`)**
Tarjetas que muestran un valor actual simple con tendencia.

#### **Estructura:**
```html
<div class="kpi-card valor" data-kpi="identificador">
    <div class="kpi-content">
        <div class="kpi-header">
            <div class="kpi-title">📊 Título</div>
        </div>
        <div class="kpi-value" id="kpiIdentificador">Valor</div>
        <div class="kpi-trend" id="trendIdentificador">➡️ 0%</div>
    </div>
</div>
```

#### **Características:**
- **Ancho**: 24% del contenedor
- **Visual**: Valor numérico + tendencia
- **Interacción**: Sin gráfico, solo métrica instantánea
- **Uso**: KPIs puntuales, totales, contadores

---

### **Tipo 2: Tarjetas Evolutivas (`.kpi-card.evolutivo`)**
Tarjetas que muestran evolución temporal con gráfico.

#### **Estructura:**
```html
<div class="kpi-card evolutivo" data-kpi="identificador">
    <div class="kpi-content">
        <div class="kpi-header">
            <div class="kpi-title">📈 Título</div>
            <div class="kpi-current-value" id="kpiIdentificador">Valor</div>
        </div>
        <div class="kpi-chart">
            <canvas class="chart-canvas" id="chart-kpi-identificador"></canvas>
            <div class="chart-label" id="chart-label-identificador">Valor</div>
        </div>
    </div>
</div>
```

#### **Características:**
- **Ancho**: 24% del contenedor (ahora 4 por fila)
- **Visual**: Gráfico de línea, área o barras
- **Interacción**: Datos históricos (últimos 14 días)
- **Uso**: Tendencias, evolución, comparativas temporales

---

## 📋 Catálogo Completo de Tarjetas (Nueva Estructura)

### **📊 Dashboard - 12 Tarjetas Organizadas en 3 Filas**

#### **Fila 1: KPIs de Operación Diaria (Valor)**
| ID | Título | Icono | Unidad | Tipo | Descripción |
|---|---|---|---|---|---|
| `lecheDiaria` | Leche diaria | 🥛 | L | valor | Producción total del día |
| `litrosVacaDia` | L/vaca/día | 🐄 | L | valor | Eficiencia por vaca |
| `vacasOrdeña` | Vacas ordeña hoy | � | unidades | valor | Vacas en ordeña hoy |
| `costoDietaLitro` | Costo dieta/L | 💰 | $ | valor | Costo por litro producido |

#### **Fila 2: KPIs Evolutivos (Gráficos)**
| ID | Título | Icono | Unidad | Tipo | Gráfico | Descripción |
|---|---|---|---|---|---|---|
| `produccionDiaria` | Producción diaria | 📈 | L | evolutivo | Línea + Área | Evolución producción total |
| `concentradoDiario` | Concentrado diario | 🌾 | kg | evolutivo | Barras | Consumo concentrado diario |
| `calidadLeche` | Calidad de leche | 🧪 | % | evolutivo | Área Apilada | Proteína + Grasa |
| `vacasOrdeñaEvol` | Vacas ordeña | � | unidades | evolutivo | Línea + Área | Evolución rebaño |

#### **Fila 3: KPIs Económicos (Mixtos)**
| ID | Título | Icono | Unidad | Tipo | Descripción |
|---|---|---|---|---|---|
| `costoDieta` | Costo dieta | � | $ | evolutivo | Línea + Área | Evolución costo dieta |
| `ingresoEstimado` | Ingreso estimado | � | $ | valor | Ingreso por ventas leche |
| `costoAlimentacion` | Costo alimentación | 🌾 | $ | valor | Costo total alimentación |
| `margenEstimado` | Margen estimado | 📈 | $ | valor | Ingreso - Costo alimentación |

---

## 🎨 Especificaciones de Gráficos por Tipo

### **📈 Línea con Área Bajo la Línea**
- **KPIs**: `produccionDiaria`, `vacasOrdeñaEvol`, `costoDieta`
- **Visual**: Línea suave con gradiente debajo
- **Colores**: Azules para producción, verdes para costos
- **Puntos**: Resaltado último valor

### **📊 Gráfico de Barras**
- **KPIs**: `concentradoDiario`
- **Visual**: Barras verticales con espaciado
- **Colores**: Naranjas/marrones para alimentación
- **Altura**: Proporcional al valor

### **🔺 Área Apilada**
- **KPIs**: `calidadLeche`
- **Visual**: Dos áreas superpuestas
- **Colores**: Azul (proteína) + Naranja (grasa)
- **Leyenda**: Integrada en el gráfico

---

## 📊 Mapeo de Datos (Nueva Estructura)

### **Campos Requeridos por KPI:**

#### **Producción:**
```javascript
{
  lecheDiaria: Number,        // Leche total día (L)
  litrosVacaDia: Number,      // L/vaca/día
  vacasOrdeña: Number,        // Vacas en ordeña hoy
  vacasOrdeñaEvol: Number     // Evolución vacas ordeña
}
```

#### **Calidad:**
```javascript
{
  proteina: Number,           // % proteína (para área apilada)
  grasa: Number,             // % grasa (para área apilada)
  calidadLeche: Number       // Valor principal mostrado
}
```

#### **Costos e Ingresos:**
```javascript
{
  costoDietaLitro: Number,    // $/L
  costoDieta: Number,        // $ total dieta
  costoAlimentacion: Number,  // $ alimentación
  ingresoEstimado: Number,    // $ ingresos leche
  margenEstimado: Number     // $ margen (calculado)
}
```

#### **Alimentación:**
```javascript
{
  concentradoDiario: Number   // kg concentrado diario
}
```

---

## 🔄 Cálculos Derivados

### **Fórmulas:**
```javascript
// Eficiencia
litrosVacaDia = lecheDiaria / vacasOrdeña

// Costos
costoDietaLitro = costoDieta / lecheDiaria

// Margen
margenEstimado = ingresoEstimado - costoAlimentacion

// Calidad (principal)
calidadLeche = proteina  // o promedio proteína+grasa
```

---

## 🎯 Flujo de Actualización

### **Proceso:**
1. **Carga de datos**: Desde localStorage o API
2. **Filtrado**: Por fundo y período
3. **Cálculo**: Métricas derivadas (eficiencia, márgenes)
4. **Actualización**: KPIs y tendencias
5. **Gráficos**: Dibujado según tipo específico

### **Prioridades:**
1. **Fila 1**: Operación diaria (crítica)
2. **Fila 2**: Tendencias (análisis)
3. **Fila 3**: Económicos (decisión)

---

## 📱 Layout Responsivo

### **Distribución:**
- **Desktop**: 4 tarjetas por fila (24% cada una)
- **Tablet**: 2 tarjetas por fila (48% cada una)
- **Mobile**: 1 tarjeta por fila (100%)

### **Adaptación de Gráficos:**
- **Canvas**: Redimensionamiento automático
- **Gráficos**: Escala proporcional al contenedor
- **Leyendas**: Ajuste de tamaño y posición

---

## 🔧 Mantenimiento y Extensión

### **Para agregar nuevo KPI:**
1. **Definir tipo**: valor o evolutivo
2. **Elegir gráfico**: línea, barras, área apilada
3. **Agregar HTML**: Estructura correspondiente
4. **Mapear datos**: Campo en estructura
5. **Definir cálculo**: Si es métrica derivada

### **Modificaciones de diseño:**
- **CSS**: Clases `.kpi-card.valor` y `.kpi-card.evolutivo`
- **Canvas**: Funciones específicas por tipo de gráfico
- **Datos**: Consistencia en mapeo de campos

---

## 🎨 Identidad Visual

### **Paleta por Categoría:**
- **Producción**: Azules (`#6366f1`, `#3b82f6`)
- **Calidad**: Azul + Naranja (`#6366f1`, `#f97316`)
- **Costos**: Verdes (`#10b981`, `059669`)
- **Alimentación**: Marrones (`#92400e`, `#b45309`)

### **Tipografía:**
- **Títulos**: Inter, 14px, semibold
- **Valores**: Inter, 20px, bold
- **Tendencias**: Inter, 11px, normal
- **Gráficos**: Inter, 10px, normal

---

## � Casos de Uso Especiales

### **Margen Estimado:**
- **Cálculo**: `ingresoEstimado - costoAlimentacion`
- **Visual**: Color según resultado (verde/rojo)
- **Tendencia**: Comparación con día anterior

### **Calidad de Leche:**
- **Doble métrica**: Proteína + Grasa
- **Visual**: Área apilada con leyenda
- **Valor principal**: Proteína (promedio)

### **Vacas Ordeña:**
- **Dos vistas**: Hoy (valor) + Evolución (gráfico)
- **IDs diferentes**: `vacasOrdeña` y `vacasOrdeñaEvol`
- **Mismo dato**: Distinta presentación
