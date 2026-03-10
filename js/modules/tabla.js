// Tabla Module - Vista tabular de datos
class TablaModule {
    constructor() {
        this.datos = [];
        this.datosFiltrados = [];
        this.paginaActual = 1;
        this.registrosPorPagina = 25;
        this.campoOrden = 'fecha';
        this.direccionOrden = 'desc';
        this.filtros = {
            fundo: 'todos',
            periodo: 'todos'
        };
    }

    async init() {
        try {
            console.log('🚀 Inicializando módulo de tabla...');
            
            // Cargar datos
            this.cargarDatos();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Escuchar eventos de actualización de datos
            window.addEventListener('datosActualizados', () => {
                console.log('🔄 Tabla recibió evento datosActualizados');
                this.cargarDatos();
                this.aplicarFiltros();
            });
            
            // Actualizar vista
            this.actualizarVista();
            
            console.log('✅ Módulo de tabla inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar módulo de tabla:', error);
        }
    }

    setupEventListeners() {
        // Event listeners para filtros
        const filtroFundo = document.getElementById('filtroFundo');
        const filtroPeriodo = document.getElementById('filtroPeriodo');
        
        if (filtroFundo) {
            filtroFundo.addEventListener('change', () => {
                this.filtros.fundo = filtroFundo.value;
                this.aplicarFiltros();
            });
        }
        
        if (filtroPeriodo) {
            filtroPeriodo.addEventListener('change', () => {
                this.filtros.periodo = filtroPeriodo.value;
                this.aplicarFiltros();
            });
        }
    }

    cargarDatos() {
        this.datos = StorageUtils.getDatos();
        this.datosFiltrados = [...this.datos];
        this.actualizarSelectorFundos();
    }

    actualizarSelectorFundos() {
        const selector = document.getElementById('filtroFundo');
        if (!selector) return;

        // Obtener fundos únicos
        const fundos = [...new Set(this.datos.map(d => d.fundo).filter(f => f))];
        
        // Guardar selección actual
        const seleccionActual = selector.value;
        
        // Limpiar opciones (mantener "Todos los Fundos")
        selector.innerHTML = '<option value="todos">Todos los Fundos</option>';
        
        // Agregar opciones de fundos
        fundos.forEach(fundo => {
            const option = document.createElement('option');
            option.value = fundo;
            // Mapear nombres para mostrar
            let nombreMostrar = fundo;
            if (fundo === 'Dollinco') nombreMostrar = 'Agricola A';
            else if (fundo === 'Pitriuco') nombreMostrar = 'Agricola B';
            option.textContent = nombreMostrar;
            selector.appendChild(option);
        });
        
        // Restaurar selección si existe
        if (fundos.includes(seleccionActual)) {
            selector.value = seleccionActual;
        }
    }

    aplicarFiltros() {
        this.datosFiltrados = [...this.datos];
        
        // Filtrar por fundo
        if (this.filtros.fundo !== 'todos') {
            this.datosFiltrados = this.datosFiltrados.filter(d => d.fundo === this.filtros.fundo);
        }
        
        // Filtrar por período
        if (this.filtros.periodo !== 'todos') {
            const dias = parseInt(this.filtros.periodo);
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - dias);
            
            this.datosFiltrados = this.datosFiltrados.filter(d => {
                const fechaDato = new Date(d.fecha);
                return fechaDato >= fechaLimite;
            });
        }
        
        // Aplicar ordenamiento
        this.aplicarOrdenamiento();
        
        // Resetear paginación
        this.paginaActual = 1;
        
        // Actualizar vista
        this.actualizarVista();
    }

    aplicarOrdenamiento() {
        this.datosFiltrados.sort((a, b) => {
            let valorA = a[this.campoOrden];
            let valorB = b[this.campoOrden];
            
            // Manejar valores nulos
            if (valorA === null || valorA === undefined) valorA = '';
            if (valorB === null || valorB === undefined) valorB = '';
            
            // Ordenamiento numérico para números
            if (!isNaN(valorA) && !isNaN(valorB)) {
                valorA = parseFloat(valorA);
                valorB = parseFloat(valorB);
            }
            
            // Ordenamiento de fechas
            if (this.campoOrden === 'fecha') {
                valorA = new Date(valorA);
                valorB = new Date(valorB);
            }
            
            if (valorA < valorB) {
                return this.direccionOrden === 'asc' ? -1 : 1;
            }
            if (valorA > valorB) {
                return this.direccionOrden === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    ordenar(campo) {
        if (this.campoOrden === campo) {
            // Cambiar dirección si es el mismo campo
            this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
        } else {
            // Nuevo campo, dirección descendente por defecto
            this.campoOrden = campo;
            this.direccionOrden = 'desc';
        }
        
        this.aplicarOrdenamiento();
        this.actualizarVista();
    }

    actualizarVista() {
        this.actualizarEstadisticas();
        this.actualizarTabla();
        this.actualizarPaginacion();
    }

    actualizarEstadisticas() {
        // Total de registros
        const totalRegistros = document.getElementById('totalRegistros');
        if (totalRegistros) {
            totalRegistros.textContent = this.datosFiltrados.length;
        }
        
        // Total de fundos
        const fundosUnicos = [...new Set(this.datosFiltrados.map(d => d.fundo).filter(f => f))];
        const totalFundos = document.getElementById('totalFundos');
        if (totalFundos) {
            totalFundos.textContent = fundosUnicos.length;
        }
        
        // Período mostrado
        const periodoMostrado = document.getElementById('periodoMostrado');
        if (periodoMostrado) {
            if (this.datosFiltrados.length > 0) {
                const fechas = this.datosFiltrados.map(d => d.fecha).sort();
                const fechaInicio = fechas[0];
                const fechaFin = fechas[fechas.length - 1];
                periodoMostrado.textContent = `${fechaInicio} al ${fechaFin}`;
            } else {
                periodoMostrado.textContent = 'Sin datos';
            }
        }
    }

    actualizarTabla() {
        const tbody = document.getElementById('tablaBody');
        if (!tbody) return;
        
        // Calcular índices para paginación
        const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
        const fin = inicio + this.registrosPorPagina;
        const datosPagina = this.datosFiltrados.slice(inicio, fin);
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        // Agregar filas
        datosPagina.forEach(dato => {
            const fila = this.crearFila(dato);
            tbody.appendChild(fila);
        });
    }

    crearFila(dato) {
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>${dato.fecha || '-'}</td>
            <td><strong>${dato.fundo || '-'}</strong></td>
            <td>${dato.dia || '-'}</td>
            <td>${dato.vacasEstanque || '-'}</td>
            <td>${dato.lecheTotal ? dato.lecheTotal.toFixed(1) : '-'}</td>
            <td>${dato.promedioPorVaca ? dato.promedioPorVaca.toFixed(1) : '-'}</td>
            <td>${dato.totalDia ? dato.totalDia.toFixed(1) : '-'}</td>
            <td>${dato.kilosMateriaSeca || '-'}</td>
            <td>${dato.observaciones || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="window.plataforma.modules.tabla.editarRegistro('${dato.id}')">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="window.plataforma.modules.tabla.eliminarRegistro('${dato.id}')">🗑️</button>
            </td>
        `;
        
        return fila;
    }

    actualizarPaginacion() {
        const totalPaginas = Math.ceil(this.datosFiltrados.length / this.registrosPorPagina);
        
        // Actualizar información de paginación
        const paginationInfo = document.getElementById('paginationInfo');
        if (paginationInfo) {
            const inicio = (this.paginaActual - 1) * this.registrosPorPagina + 1;
            const fin = Math.min(this.paginaActual * this.registrosPorPagina, this.datosFiltrados.length);
            paginationInfo.textContent = `Mostrando ${inicio}-${fin} de ${this.datosFiltrados.length} registros`;
        }
        
        // Actualizar página actual
        const paginaActualSpan = document.getElementById('paginaActual');
        if (paginaActualSpan) {
            paginaActualSpan.textContent = `Página ${this.paginaActual} de ${totalPaginas}`;
        }
        
        // Actualizar botones
        const btnAnterior = document.getElementById('btnAnterior');
        const btnSiguiente = document.getElementById('btnSiguiente');
        
        if (btnAnterior) {
            btnAnterior.disabled = this.paginaActual === 1;
        }
        
        if (btnSiguiente) {
            btnSiguiente.disabled = this.paginaActual === totalPaginas || totalPaginas === 0;
        }
    }

    paginaAnterior() {
        if (this.paginaActual > 1) {
            this.paginaActual--;
            this.actualizarVista();
        }
    }

    paginaSiguiente() {
        const totalPaginas = Math.ceil(this.datosFiltrados.length / this.registrosPorPagina);
        if (this.paginaActual < totalPaginas) {
            this.paginaActual++;
            this.actualizarVista();
        }
    }

    limpiarFiltros() {
        // Resetear filtros
        this.filtros = {
            fundo: 'todos',
            periodo: 'todos'
        };
        
        // Actualizar selects
        const filtroFundo = document.getElementById('filtroFundo');
        const filtroPeriodo = document.getElementById('filtroPeriodo');
        
        if (filtroFundo) filtroFundo.value = 'todos';
        if (filtroPeriodo) filtroPeriodo.value = 'todos';
        
        // Aplicar filtros
        this.aplicarFiltros();
    }

    exportarCSV() {
        if (this.datosFiltrados.length === 0) {
            alert('No hay datos para exportar');
            return;
        }
        
        // Crear CSV
        const headers = [
            'Fecha', 'Fundo', 'Día', 'Vacas Estanque', 'Leche Total (L)', 
            'Promedio/Vaca (L)', 'Forraje Total (kg)', 'Materia Seca/Vaca', 'Observaciones'
        ];
        
        const filas = this.datosFiltrados.map(dato => [
            dato.fecha || '',
            dato.fundo || '',
            dato.dia || '',
            dato.vacasEstanque || '',
            dato.lecheTotal || '',
            dato.promedioPorVaca || '',
            dato.totalDia || '',
            dato.kilosMateriaSeca || '',
            dato.observaciones || ''
        ]);
        
        const csv = [headers, ...filas].map(row => row.join(',')).join('\n');
        
        // Descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `datos_ganaderos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    editarRegistro(id) {
        // Implementar edición de registro
        alert(`Función de edición para registro ${id} - Por implementar`);
    }

    eliminarRegistro(id) {
        if (confirm('¿Está seguro de que desea eliminar este registro?')) {
            // Eliminar de datos
            this.datos = this.datos.filter(d => d.id !== id);
            
            // Guardar en localStorage
            localStorage.setItem('datos_ganaderos', JSON.stringify(this.datos));
            
            // Recargar y actualizar vista
            this.cargarDatos();
            this.aplicarFiltros();
            
            // Disparar evento de actualización
            window.dispatchEvent(new CustomEvent('datosActualizados'));
        }
    }

    destroy() {
        // Limpiar event listeners y recursos
        console.log('🧹 Limpiando módulo de tabla...');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.TablaModule = TablaModule;
}
