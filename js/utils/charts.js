// Chart Utilities - Configuración y gestión de gráficos
class ChartUtils {
    
    // Colores para gráficos
    static COLORS = {
        primario: '#2563eb',
        secundario: '#10b981',
        peligro: '#ef4444',
        advertencia: '#f59e0b',
        info: '#3b82f6',
        exito: '#22c55e',
        gradientes: {
            azul: ['#3b82f6', '#1d4ed8'],
            verde: ['#22c55e', '#16a34a'],
            naranja: ['#f59e0b', '#d97706'],
            rojo: ['#ef4444', '#dc2626']
        }
    };

    // Configuración base para todos los gráficos
    static getBaseConfig(type = 'line') {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += this.formatNumber(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: type === 'line' || type === 'bar' ? {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: (value) => this.formatNumber(value)
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            } : undefined
        };
    }

    // Formatear números
    static formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toFixed(1);
    }

    // Crear gráfico de línea para producción
    static crearGraficoProduccion(canvasId, datos, etiquetas) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: 'Producción de Leche (L)',
                    data: datos,
                    borderColor: this.COLORS.primario,
                    backgroundColor: this.createGradient(ctx, 'azul'),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: this.COLORS.primario,
                    pointBorderWidth: 2
                }]
            },
            options: this.getBaseConfig('line')
        });
    }

    // Crear gráfico de barras para alimentación
    static crearGraficoAlimentacion(canvasId, datos, etiquetas) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: etiquetas,
                datasets: [
                    {
                        label: 'Forrajes (kg)',
                        data: datos.forrajes,
                        backgroundColor: this.COLORS.verde,
                        borderColor: this.COLORS.verde,
                        borderWidth: 1
                    },
                    {
                        label: 'Suplementos (kg)',
                        data: datos.suplementos,
                        backgroundColor: this.COLORS.advertencia,
                        borderColor: this.COLORS.advertencia,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                ...this.getBaseConfig('bar'),
                scales: {
                    ...this.getBaseConfig('bar').scales,
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    // Crear gráfico de evolución del rebaño
    static crearGraficoRebaño(canvasId, datos) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: datos.labels,
                datasets: [
                    {
                        label: 'Vacas en Ordeña',
                        data: datos.ordenia,
                        borderColor: this.COLORS.primario,
                        backgroundColor: this.createGradient(ctx, 'azul'),
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'Total Rebaño',
                        data: datos.total,
                        borderColor: this.COLORS.segundario,
                        backgroundColor: this.createGradient(ctx, 'verde'),
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3
                    }
                ]
            },
            options: this.getBaseConfig('line')
        });
    }

    // Crear gráfico de dona para distribución
    static crearGraficoDistribucion(canvasId, datos) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: datos.labels,
                datasets: [{
                    data: datos.values,
                    backgroundColor: [
                        this.COLORS.primario,
                        this.COLORS.segundario,
                        this.COLORS.advertencia,
                        this.COLORS.info,
                        this.COLORS.peligro
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${this.formatNumber(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Crear gráfico de benchmark comparativo
    static crearGraficoBenchmark(canvasId, datos, metrica = 'produccion') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const labels = datos.map(d => d.fundo);
        const valores = datos.map(d => d[metrica]);
        const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Valor Real',
                        data: valores,
                        backgroundColor: datos.map((d, i) => 
                            i === 0 ? this.COLORS.exito : this.COLORS.primario
                        ),
                        borderColor: datos.map((d, i) => 
                            i === 0 ? this.COLORS.exito : this.COLORS.primario
                        ),
                        borderWidth: 1
                    },
                    {
                        label: 'Promedio del Grupo',
                        data: Array(labels.length).fill(promedio),
                        type: 'line',
                        borderColor: this.COLORS.peligro,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                ...this.getBaseConfig('bar'),
                plugins: {
                    ...this.getBaseConfig('bar').plugins,
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: promedio,
                                yMax: promedio,
                                borderColor: this.COLORS.peligro,
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    content: 'Promedio',
                                    enabled: true,
                                    position: 'end'
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    // Crear gráfico de radar para benchmark multidimensional
    static crearGraficoRadar(canvasId, datos) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Producción', 'Eficiencia', 'Rendimiento', 'Escalabilidad', 'Consistencia'],
                datasets: datos.map((d, i) => ({
                    label: d.fundo,
                    data: [
                        (d.produccionDiaria / 1000).toFixed(2),
                        (d.eficiencia * 10).toFixed(2),
                        (d.promedioVaca).toFixed(2),
                        (d.totalVacas / 50).toFixed(2),
                        85 // Consistencia base
                    ],
                    borderColor: i === 0 ? this.COLORS.exito : this.COLORS.primario,
                    backgroundColor: i === 0 ? 
                        this.createRadarGradient(ctx, 'verde', 0.3) : 
                        this.createRadarGradient(ctx, 'azul', 0.1),
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    // Crear gradiente para gráficos
    static createGradient(ctx, colorType, opacity = 0.1) {
        if (!ctx || typeof ctx.createLinearGradient !== 'function') {
            // Fallback a color sólido si el gradiente no está disponible
            const colors = this.COLORS.gradientes[colorType] || this.COLORS.gradientes.azul;
            return colors[0] + Math.round(opacity * 255).toString(16);
        }
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        const colors = this.COLORS.gradientes[colorType] || this.COLORS.gradientes.azul;
        gradient.addColorStop(0, colors[0] + Math.round(opacity * 255).toString(16));
        gradient.addColorStop(1, colors[1] + '00');
        return gradient;
    }

    // Crear gradiente para radar
    static createRadarGradient(ctx, colorType, opacity = 0.1) {
        const colors = this.COLORS.gradientes[colorType] || this.COLORS.gradientes.azul;
        return colors[0] + Math.round(opacity * 255).toString(16);
    }

    // Actualizar gráfico con nuevos datos
    static actualizarGrafico(chart, nuevosDatos, nuevasEtiquetas) {
        if (!chart) return;
        
        chart.data.labels = nuevasEtiquetas;
        chart.data.datasets[0].data = nuevosDatos;
        chart.update('active');
    }

    // Destruir gráfico
    static destruirGrafico(chart) {
        if (chart) {
            chart.destroy();
        }
    }

    // Exportar gráfico como imagen
    static exportarGrafico(chart, filename = 'chart.png') {
        if (!chart) return;
        
        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartUtils;
}
