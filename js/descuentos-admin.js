/**
 * MÓDULO DE DESCUENTOS - Sistema de gestión de descuentos en el panel admin
 */

const DescuentoSystem = {
    // Estado
    productosDescuentos: [],
    filtroActual: 'todos',
    
    /**
     * Inicializar la sección de descuentos en el admin
     */
    init: function() {
        console.log('💳 Inicializando sistema de descuentos...');
        this.cargarProductosConDescuento();
    },
    
    /**
     * Renderizar la interfaz de gestión de descuentos
     */
    renderizarUI: function() {
        const page = document.getElementById('page-descuentos');
        
        if (!page) {
            console.warn('⚠️ Elemento page-descuentos no encontrado');
            return;
        }
        
        page.innerHTML = `
            <div class="page-header">
                <h2>Gestión de Descuentos</h2>
                <p>Agregar y gestionar descuentos en productos</p>
            </div>
            
            <div class="descuentos-container">
                <!-- Formulario para agregar descuentos -->
                <div class="descuentos-form">
                    <h3>➕ Agregar Descuento a Producto</h3>
                    
                    <div class="form-group">
                        <label>Seleccionar Producto</label>
                        <select id="descuento-producto-select" class="form-control">
                            <option value="">-- Elige un producto --</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Porcentaje de Descuento (%)</label>
                        <input type="number" id="descuento-porcentaje" class="form-control" 
                               placeholder="Ej: 20" min="1" max="100">
                    </div>
                    
                    <button class="btn btn-primary" onclick="DescuentoSystem.agregarDescuento()">
                        <i class="fas fa-plus"></i> Agregar Descuento
                    </button>
                </div>
                
                <!-- Productos con descuentos -->
                <div class="descuentos-list">
                    <div class="descuentos-header">
                        <h3>Productos con Descuento</h3>
                        <div class="descuentos-filtro">
                            <button class="btn-filtro ${this.filtroActual === 'todos' ? 'active' : ''}" 
                                    onclick="DescuentoSystem.filtrar('todos')">
                                Todos (${this.productosDescuentos.length})
                            </button>
                            <button class="btn-filtro ${this.filtroActual === 'activos' ? 'active' : ''}" 
                                    onclick="DescuentoSystem.filtrar('activos')">
                                Activos (${this.productosDescuentos.filter(p => p.descuento > 0).length})
                            </button>
                        </div>
                    </div>
                    
                    <table class="table-descuentos">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio Original</th>
                                <th>Descuento</th>
                                <th>Precio Final</th>
                                <th>Ahorro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="descuentos-tbody">
                            <tr><td colspan="6" style="text-align: center;">Cargando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.llenarSelectProductos();
        this.mostrarProductosConDescuento();
    },
    
    /**
     * Cargar productos de Firebase
     */
    cargarProductosConDescuento: async function() {
        try {
            console.log('📦 Cargando productos...');
            const snapshot = await db.collection('productos').get();
            
            this.productosDescuentos = [];
            snapshot.forEach(doc => {
                this.productosDescuentos.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ ${this.productosDescuentos.length} productos cargados`);
            this.renderizarUI();
            
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.mostrarError(error.message);
        }
    },
    
    /**
     * Llenar select de productos
     */
    llenarSelectProductos: function() {
        const select = document.getElementById('descuento-producto-select');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Elige un producto --</option>';
        
        this.productosDescuentos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} (₡${(producto.precio || 0).toFixed(0)})`;
            select.appendChild(option);
        });
    },
    
    /**
     * Agregar descuento a un producto
     */
    agregarDescuento: async function() {
        const productoId = document.getElementById('descuento-producto-select').value;
        const porcentaje = parseInt(document.getElementById('descuento-porcentaje').value);
        
        if (!productoId) {
            this.mostrarError('Debes seleccionar un producto');
            return;
        }
        
        if (!porcentaje || porcentaje < 1 || porcentaje > 100) {
            this.mostrarError('Ingresa un porcentaje válido (1-100)');
            return;
        }
        
        try {
            console.log(`💳 Agregando ${porcentaje}% descuento al producto ${productoId}...`);
            
            await db.collection('productos').doc(productoId).update({
                descuento: porcentaje,
                tieneDescuento: true,
                fechaActualizacion: new Date().toISOString()
            });
            
            console.log('✅ Descuento agregado exitosamente');
            this.mostrarExito('Descuento agregado exitosamente');
            
            // Limpiar formulario
            document.getElementById('descuento-porcentaje').value = '';
            document.getElementById('descuento-producto-select').value = '';
            
            // Recargar
            await this.cargarProductosConDescuento();
            
        } catch (error) {
            console.error('❌ Error agregando descuento:', error);
            this.mostrarError(error.message);
        }
    },
    
    /**
     * Mostrar productos con descuento
     */
    mostrarProductosConDescuento: function() {
        const tbody = document.getElementById('descuentos-tbody');
        if (!tbody) return;
        
        let productos = this.productosDescuentos;
        
        // Filtrar
        if (this.filtroActual === 'activos') {
            productos = productos.filter(p => p.descuento > 0);
        }
        
        if (productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No hay productos</td></tr>';
            return;
        }
        
        let html = '';
        productos.forEach(producto => {
            const precioOriginal = producto.precio || 0;
            const descuentoPct = producto.descuento || 0;
            const precioFinal = descuentoPct > 0 
                ? precioOriginal * (1 - descuentoPct / 100) 
                : precioOriginal;
            const ahorro = precioOriginal - precioFinal;
            
            const filaClass = descuentoPct > 0 ? 'fila-descuento' : '';
            
            html += `
                <tr class="${filaClass}">
                    <td><strong>${producto.nombre}</strong></td>
                    <td>₡${precioOriginal.toFixed(0)}</td>
                    <td>
                        ${descuentoPct > 0 
                            ? `<span class="badge-descuento">-${descuentoPct}%</span>` 
                            : '<span style="color: #999;">Sin descuento</span>'}
                    </td>
                    <td>₡${precioFinal.toFixed(0)}</td>
                    <td><strong style="color: #2ecc71;">₡${ahorro.toFixed(0)}</strong></td>
                    <td>
                        ${descuentoPct > 0 
                            ? `<button class="btn btn-sm btn-danger" onclick="DescuentoSystem.quitarDescuento('${producto.id}')">
                                <i class="fas fa-trash"></i> Quitar
                              </button>`
                            : `<button class="btn btn-sm btn-primary" onclick="DescuentoSystem.abrirEditar('${producto.id}')">
                                <i class="fas fa-edit"></i> Agregar
                              </button>`
                        }
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    },
    
    /**
     * Quitar descuento de un producto
     */
    quitarDescuento: async function(productoId) {
        if (!confirm('¿Quitar el descuento de este producto?')) return;
        
        try {
            await db.collection('productos').doc(productoId).update({
                descuento: 0,
                tieneDescuento: false,
                fechaActualizacion: new Date().toISOString()
            });
            
            console.log('✅ Descuento removido');
            this.mostrarExito('Descuento removido');
            await this.cargarProductosConDescuento();
            
        } catch (error) {
            this.mostrarError(error.message);
        }
    },
    
    /**
     * Filtrar productos
     */
    filtrar: function(tipo) {
        this.filtroActual = tipo;
        this.mostrarProductosConDescuento();
        
        // Actualizar botones
        document.querySelectorAll('.btn-filtro').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    },
    
    /**
     * Abrir editor de descuento
     */
    abrirEditar: function(productoId) {
        const producto = this.productosDescuentos.find(p => p.id === productoId);
        if (!producto) return;
        
        const porcentaje = prompt(
            `Ingresa el porcentaje de descuento para "${producto.nombre}":\n(1-100)`,
            '0'
        );
        
        if (porcentaje !== null && porcentaje !== '') {
            const pct = parseInt(porcentaje);
            if (pct >= 1 && pct <= 100) {
                document.getElementById('descuento-producto-select').value = productoId;
                document.getElementById('descuento-porcentaje').value = pct;
                this.agregarDescuento();
            } else {
                this.mostrarError('Ingresa un porcentaje válido (1-100)');
            }
        }
    },
    
    /**
     * Mostrar error
     */
    mostrarError: function(mensaje) {
        console.error('❌', mensaje);
        alert(`❌ Error: ${mensaje}`);
    },
    
    /**
     * Mostrar éxito
     */
    mostrarExito: function(mensaje) {
        console.log('✅', mensaje);
        // Podrías agregar una notificación visual aquí
    }
};

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof DescuentoSystem !== 'undefined') {
            // Será inicializado desde admin.js
        }
    });
}
