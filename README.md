# 🐄 Plataforma Ganadera Digital

## 📋 Descripción

Plataforma web modular para digitalización y benchmark de producción ganadera. Diseñada para consultores que necesitan gestionar múltiples clientes y comparar métricas de rendimiento entre productores.

## 🏗️ Arquitectura Modular v2.0

### 📁 Estructura de Archivos

```
plataforma-ganadera/
├── index.html                 # HTML principal (orchestrator)
├── views/                     # Vistas modulares
│   ├── carga.html            # Formulario de carga de datos
│   ├── dashboard.html        # Dashboard con KPIs y alertas
│   ├── benchmark.html        # Comparación entre productores
│   └── historial.html        # Historial de registros
├── js/                        # JavaScript modular
│   ├── main.js               # Orchestrator principal
│   ├── utils/                # Utilidades reutilizables
│   │   ├── storage.js        # Gestión de localStorage
│   │   ├── calculations.js   # Cálculos y métricas
│   │   └── charts.js         # Configuración de gráficos
│   └── modules/              # Módulos de funcionalidad
│       ├── carga.js          # Gestión de formulario
│       ├── dashboard.js     # Dashboard y alertas
│       ├── benchmark.js      # Análisis comparativo
│       └── historial.js     # Historial y exportación
├── css/                       # Estilos modulares
│   ├── main.css             # Estilos base y variables
│   └── components.css       # Estilos de componentes
└── data/                      # Datos de configuración (futuro)
```

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

- **📝 Carga de Datos**: Formulario completo para producción y alimentación
- **📊 Dashboard**: KPIs en tiempo real con gráficos interactivos
- **🚨 Alertas Inteligentes**: Detección automática de outliers y eventos
- **🏆 Benchmark**: Comparación entre productores vs promedio del grupo
- **📈 Análisis**: Mejores prácticas y recomendaciones personalizadas
- **📋 Historial**: Gestión completa con filtros y exportación CSV
- **📱 Responsive**: Diseño adaptativo para todos los dispositivos

### 🎯 Módulos de Benchmark

#### Métricas Comparativas
- Producción total diaria (L/día)
- Promedio por vaca (L/vaca)
- Eficiencia de conversión (L/kg)
- Tamaño de rebaño

#### Análisis Inteligente
- **Top Performers**: Identificación de líderes por categoría
- **Gaps de Rendimiento**: Comparación vs mejores del grupo
- **Recomendaciones**: Sugerencias basadas en datos reales
- **Tendencias**: Evolución temporal de métricas

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Charts**: Chart.js para visualizaciones
- **Storage**: LocalStorage para persistencia
- **Architecture**: Module Pattern JavaScript
- **Design**: Component-based CSS con variables CSS

## 📦 Instalación y Uso
{
  forrajeConsumido: Number, // kg
  concentradoConsumido: Number, // kg
  aguaConsumida: Number, // Litros
  suplementosMinerales: Number, // kg
  costoAlimentacion: Number, // $
  tipoForraje: String // pastura, heneno, silaje, mixto
}
```

## 🛠️ Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para Chart.js)

### Pasos
1. **Clonar o descargar** los archivos del proyecto
2. **Abrir `index.html`** en el navegador
3. **Comenzar a cargar datos** en el formulario
4. **Ver resultados** en el dashboard

### Estructura de Archivos
```
plataforma-ganadera/
├── index.html          # Página principal
├── styles.css          # Estilos y diseño
├── script.js           # Lógica de la aplicación
└── README.md          # Documentación
```

## 🎯 Adaptación a tu Planilla Manual

**Para personalizar completamente la plataforma a tu formato actual:**

1. **Comparte una imagen** de tu planilla manual
2. **Analizaré los campos** específicos que utilizas
3. **Adaptaré el formulario** para que coincida exactamente
4. **Ajustaré los KPIs** según tus métricas importantes
5. **Personalizaré los gráficos** para tus necesidades específicas

## 📞 Soporte

Esta plataforma está diseñada para evolucionar según tus necesidades. 

**¿Necesitas adaptaciones específicas?**
- Modificación de campos
- Nuevos KPIs
- Tipos de gráficos diferentes
- Integraciones específicas

**Comunícate para personalizar la solución a tu operación ganadera específica.**

---

**Plataforma Ganadera Digital v1.0**  
*Transformando datos manuales en decisiones inteligentes*
