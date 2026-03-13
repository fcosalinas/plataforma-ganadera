/**
 * Gráficos simples y limpios para el dashboard
 * Implementación minimalista con interactividad básica
 */
class SimpleCharts {
    constructor() {
        this.colors = {
            'chartProduccionDiaria': '#3b82f6',     // Azul brillante
            'chartLitrosVacaDiaEvol': '#10b981',    // Verde brillante
            'chartVacasOrdeñaEvol': '#06b6d4',      // Cyan brillante
            'chartConcentradoDiario': '#f59e0b',    // Ámbar brillante
            'chartCostoDieta': '#ef4444',          // Rojo brillante
            'chartCalidadEvol': '#8b5cf6',          // Púrpura brillante
            // Colores alternativos por si acaso
            'produccionDiaria': '#3b82f6',
            'litrosVacaDiaEvol': '#10b981',
            'vacasOrdeñaEvol': '#06b6d4',
            'concentradoDiario': '#f59e0b',
            'costoDieta': '#ef4444',
            'calidadEvol': '#8b5cf6'
        };
        
        this.titles = {
            'chartProduccionDiaria': 'Producción Diaria',
            'chartLitrosVacaDiaEvol': 'Litros/Vaca/Día',
            'chartVacasOrdeñaEvol': 'Vacas en Ordeña',
            'chartConcentradoDiario': 'Concentrado Diario',
            'chartCostoDieta': 'Costo Dieta',
            'chartCalidadEvol': 'Calidad Leche',
            'produccionDiaria': 'Producción Diaria',
            'litrosVacaDiaEvol': 'Litros/Vaca/Día',
            'vacasOrdeñaEvol': 'Vacas en Ordeña',
            'concentradoDiario': 'Concentrado Diario',
            'costoDieta': 'Costo Dieta',
            'calidadEvol': 'Calidad Leche'
        };
        
        this.units = {
            'chartProduccionDiaria': 'L',
            'chartLitrosVacaDiaEvol': 'L/vaca',
            'chartVacasOrdeñaEvol': 'vacas',
            'chartConcentradoDiario': 'kg',
            'chartCostoDieta': '$',
            'chartCalidadEvol': '%',
            'produccionDiaria': 'L',
            'litrosVacaDiaEvol': 'L/vaca',
            'vacasOrdeñaEvol': 'vacas',
            'concentradoDiario': 'kg',
            'costoDieta': '$',
            'calidadEvol': '%'
        };
    }

    /**
     * Dibujar gráfico de líneas simple
     */
    drawLineChart(canvas, data, kpiId) {
        console.log(`🎨 SimpleCharts.drawLineChart() iniciado`);
        console.log(`📊 Canvas ID:`, canvas.id);
        console.log(`📏 Canvas size:`, canvas.width, 'x', canvas.height);
        console.log(`📈 Data values:`, data.values?.length || 0, 'puntos');
        console.log(`🏷️ Data labels:`, data.labels?.length || 0, 'etiquetas');
        
        const ctx = canvas.getContext('2d');
        const values = data.values || [];
        const labels = data.labels || [];
        
        if (values.length === 0) {
            console.warn('⚠️ No hay valores para dibujar');
            return;
        }
        
        console.log(`🎯 Iniciando dibujo de ${values.length} puntos`);
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log(`🧹 Canvas limpiado`);
        
        // Configuración
        const padding = { top: 40, right: 40, bottom: 60, left: 60 };
        const chartWidth = canvas.width - padding.left - padding.right;
        const chartHeight = canvas.height - padding.top - padding.bottom;
        
        console.log(`📐 Área de gráfico:`, chartWidth, 'x', chartHeight);
        
        // Escalas
        const maxValue = Math.max(...values);
        const scaleX = (i) => padding.left + (i / (values.length - 1)) * chartWidth;
        const scaleY = (value) => padding.top + chartHeight - (value / maxValue) * chartHeight;
        
        console.log(`📊 Max value:`, maxValue);
        console.log(`🔤 Escalas creadas`);
        
        // Guardar datos para interactividad
        canvas.chartData = {
            values,
            labels,
            scaleX,
            scaleY,
            kpiId,
            color: this.colors[kpiId]
        };
        
        // Dibujar área bajo la curva
        const color = this.colors[kpiId] || '#3b82f6';
        ctx.fillStyle = color + '30'; // Más transparente (30% de opacidad)
        ctx.beginPath();
        ctx.moveTo(scaleX(0), scaleY(0));
        
        values.forEach((value, i) => {
            ctx.lineTo(scaleX(i), scaleY(value));
        });
        
        ctx.lineTo(scaleX(values.length - 1), scaleY(0));
        ctx.closePath();
        ctx.fill();
        console.log(`🎨 Área bajo curva dibujada con color ${color}`);
        
        // Dibujar línea
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        values.forEach((value, i) => {
            const x = scaleX(i);
            const y = scaleY(value);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        console.log(`📈 Línea principal dibujada con color ${color}`);
        
        // Dibujar puntos
        ctx.fillStyle = color;
        values.forEach((value, i) => {
            const x = scaleX(i);
            const y = scaleY(value);
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
        console.log(`🔵 Puntos dibujados con color ${color}`);
        
        // Dibujar ejes
        this.drawAxes(ctx, canvas, values, labels, kpiId);
        
        // Configurar interactividad
        this.setupInteractivity(canvas);
        
        console.log(`✅ Gráfico ${kpiId} completado exitosamente`);
    }

    /**
     * Dibujar ejes y etiquetas
     */
    drawAxes(ctx, canvas, values, labels, kpiId) {
        const padding = { top: 40, right: 40, bottom: 60, left: 60 };
        const chartWidth = canvas.width - padding.left - padding.right;
        const chartHeight = canvas.height - padding.top - padding.bottom;
        
        ctx.strokeStyle = '#666';
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.lineWidth = 1;
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.stroke();
        
        // Etiquetas Y
        const maxValue = Math.max(...values);
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const value = (maxValue / ySteps) * i;
            const y = padding.top + chartHeight - (i / ySteps) * chartHeight;
            
            ctx.fillText(this.formatValue(value, kpiId, true), 5, y + 3);
            
            // Grid
            ctx.strokeStyle = '#e0e0e0';
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
            ctx.strokeStyle = '#666';
        }
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartHeight);
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.stroke();
        
        // Etiquetas X
        const xStep = Math.max(1, Math.floor(values.length / 8)); // Máximo 8 etiquetas
        for (let i = 0; i < values.length; i += xStep) {
            const x = padding.left + (i / (values.length - 1)) * chartWidth;
            
            ctx.save();
            ctx.translate(x, padding.top + chartHeight + 15);
            ctx.rotate(-45 * Math.PI / 180);
            ctx.fillText(labels[i], 0, 0);
            ctx.restore();
        }
    }

    /**
     * Configurar interactividad
     */
    setupInteractivity(canvas) {
        canvas.onmousemove = (e) => this.handleMouseMove(e, canvas);
        canvas.onmouseleave = () => this.handleMouseLeave(canvas);
        canvas.style.cursor = 'crosshair';
    }

    /**
     * Manejar mouse move
     */
    handleMouseMove(e, canvas) {
        const data = canvas.chartData;
        if (!data) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const point = this.findNearestPoint(mouseX, mouseY, data);
        
        if (point) {
            this.showTooltip(e, point, data);
            canvas.style.cursor = 'pointer';
        } else {
            this.hideTooltip();
            canvas.style.cursor = 'crosshair';
        }
    }

    /**
     * Manejar mouse leave
     */
    handleMouseLeave(canvas) {
        this.hideTooltip();
        canvas.style.cursor = 'crosshair';
    }

    /**
     * Encontrar punto cercano
     */
    findNearestPoint(mouseX, mouseY, data) {
        const radius = 10;
        
        for (let i = 0; i < data.values.length; i++) {
            const x = data.scaleX(i);
            const y = data.scaleY(data.values[i]);
            
            const distance = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
            
            if (distance <= radius) {
                return {
                    index: i,
                    x: x,
                    y: y,
                    value: data.values[i],
                    label: data.labels[i]
                };
            }
        }
        
        return null;
    }

    /**
     * Mostrar tooltip
     */
    showTooltip(e, point, data) {
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: Arial;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid ${data.color};
        `;
        
        const formattedValue = this.formatValue(point.value, data.kpiId, false);
        const title = this.titles[data.kpiId];
        
        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
            <div>Fecha: ${point.label}</div>
            <div style="color: #4CAF50; font-weight: bold;">Valor: ${formattedValue}</div>
        `;
        
        document.body.appendChild(tooltip);
        
        // 🎯 ESTRATEGIA CORRECTA: Posición relativa al canvas
        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        
        // Coordenadas del mouse relativas al canvas
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Posicionar tooltip relativo al canvas
        const tooltipWidth = 150;
        const tooltipHeight = 80;
        
        let left = rect.left + mouseX - tooltipWidth / 2;
        let top = rect.top + mouseY - tooltipHeight - 15;
        
        // Ajustar si se sale de la pantalla
        if (left < 10) left = 10;
        if (left + tooltipWidth > window.innerWidth - 10) {
            left = window.innerWidth - tooltipWidth - 10;
        }
        if (top < 10) {
            top = rect.top + mouseY + 15;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        
        console.log(`🎯 Tooltip posicionado relativo al canvas:`);
        console.log(`  Canvas rect: (${rect.left}, ${rect.top})`);
        console.log(`  Mouse relativo: (${mouseX}, ${mouseY})`);
        console.log(`  Tooltip final: (${left}, ${top})`);
        
        window.currentTooltip = tooltip;
    }

    /**
     * Ocultar tooltip
     */
    hideTooltip() {
        if (window.currentTooltip) {
            window.currentTooltip.remove();
            window.currentTooltip = null;
        }
    }

    /**
     * Formatear valor
     */
    formatValue(value, kpiId, forAxis) {
        const unit = this.units[kpiId];
        
        if (forAxis) {
            // Para ejes, usar formato más compacto
            if (kpiId === 'costoDieta') {
                return '$' + Math.round(value);
            } else if (kpiId === 'calidadEvol' || kpiId === 'litrosVacaDiaEvol') {
                return value.toFixed(1);
            } else {
                return Math.round(value).toString();
            }
        } else {
            // Para tooltips, usar formato completo
            if (kpiId === 'costoDieta') {
                return '$' + value.toFixed(0);
            } else if (kpiId === 'calidadEvol' || kpiId === 'litrosVacaDiaEvol') {
                return value.toFixed(2) + ' ' + unit;
            } else {
                return Math.round(value) + ' ' + unit;
            }
        }
    }
}

// Exportar para uso global
window.SimpleCharts = SimpleCharts;
