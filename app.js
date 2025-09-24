// Estado de la aplicación
let estadoApp = {
    loteActual: '',
    arbolActual: 1,
    tipoActual: '265',
    segmentosTemporales: [],
    medicionesGuardadas: [],
    lotesGuardados: []
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos guardados
    cargarDatosGuardados();
    
    // Event Listeners principales
    document.getElementById('btnNuevoLote').addEventListener('click', nuevoLote);
    document.getElementById('btnAbrirLote').addEventListener('click', toggleLotesGuardados);
    document.getElementById('btnAgregarSegmento').addEventListener('click', agregarSegmento);
    document.getElementById('btnGuardarMedicion').addEventListener('click', guardarMedicion);
    document.getElementById('btnSiguienteArbol').addEventListener('click', siguienteArbol);
    document.getElementById('btnGuardarLote').addEventListener('click', guardarLote);
    document.getElementById('btnExportar').addEventListener('click', exportarCSV);
    document.getElementById('btnExportarTodo').addEventListener('click', exportarTodoCSV);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarTodo);
    
    // Listeners de cambios
    document.getElementById('lote').addEventListener('input', actualizarEstado);
    document.getElementById('numeroArbol').addEventListener('change', cambiarArbol);
    document.getElementById('tipoMedicion').addEventListener('change', cambiarTipo);
    
    // Enter en altura agrega segmento
    document.getElementById('altura').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            agregarSegmento();
        }
    });
    
    // Modal
    document.querySelector('.close').addEventListener('click', cerrarModal);
    
    // Inicializar vista
    actualizarVista();
    
    // Service Worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registrado'))
            .catch(err => console.log('Error registrando SW:', err));
    }
});

// Función para nuevo lote
function nuevoLote() {
    const nombreLote = document.getElementById('lote').value.trim();
    
    if (!nombreLote) {
        mostrarMensaje('Ingrese un nombre de lote', 'error');
        return;
    }
    
    // Resetear estado para nuevo lote
    estadoApp.loteActual = nombreLote;
    estadoApp.arbolActual = 1;
    estadoApp.tipoActual = '265';
    estadoApp.segmentosTemporales = [];
    estadoApp.medicionesGuardadas = [];
    
    // Actualizar campos
    document.getElementById('numeroArbol').value = 1;
    document.getElementById('tipoMedicion').value = '265';
    
    actualizarVista();
    guardarEstado();
    mostrarMensaje(`Lote "${nombreLote}" iniciado`, 'success');
}

// Función para mostrar/ocultar lotes guardados
function toggleLotesGuardados() {
    const listaLotes = document.getElementById('lotesGuardados');
    
    if (listaLotes.style.display === 'none') {
        mostrarLotesGuardados();
        listaLotes.style.display = 'block';
    } else {
        listaLotes.style.display = 'none';
    }
}

// Mostrar lotes guardados
function mostrarLotesGuardados() {
    const listaLotes = document.getElementById('lotesGuardados');
    
    if (estadoApp.lotesGuardados.length === 0) {
        listaLotes.innerHTML = '<p class="empty-message">No hay lotes guardados</p>';
        return;
    }
    
    listaLotes.innerHTML = '<h3>Lotes Guardados:</h3>' + 
        estadoApp.lotesGuardados.map((lote, index) => `
            <div class="lote-item" onclick="cargarLote(${index})">
                <div>
                    <strong>${lote.nombre}</strong>
                    <br>
                    <small>Árboles: ${obtenerTotalArboles(lote.mediciones)} | 
                    Fecha: ${new Date(lote.fecha).toLocaleDateString()}</small>
                </div>
                <button class="btn-delete" onclick="event.stopPropagation(); eliminarLoteGuardado(${index})">×</button>
            </div>
        `).join('');
}

// Cargar un lote guardado
function cargarLote(index) {
    const lote = estadoApp.lotesGuardados[index];
    
    estadoApp.loteActual = lote.nombre;
    estadoApp.medicionesGuardadas = lote.mediciones || [];
    estadoApp.arbolActual = obtenerSiguienteArbol();
    estadoApp.tipoActual = '265';
    estadoApp.segmentosTemporales = [];
    
    // Actualizar campos
    document.getElementById('lote').value = lote.nombre;
    document.getElementById('numeroArbol').value = estadoApp.arbolActual;
    document.getElementById('tipoMedicion').value = '265';
    document.getElementById('lotesGuardados').style.display = 'none';
    
    actualizarVista();
    mostrarMensaje(`Lote "${lote.nombre}" cargado`, 'success');
}

// Agregar segmento
function agregarSegmento() {
    const alturaAcumulada = parseFloat(document.getElementById('altura').value);
    const numeroSegmento = parseInt(document.getElementById('numeroSegmento').value);
    
    if (!alturaAcumulada || alturaAcumulada <= 0) {
        mostrarMensaje('Ingrese una altura válida', 'error');
        return;
    }
    
    // Validar que la altura sea mayor que el segmento anterior
    if (estadoApp.segmentosTemporales.length > 0) {
        const ultimoSegmento = estadoApp.segmentosTemporales[estadoApp.segmentosTemporales.length - 1];
        if (alturaAcumulada <= ultimoSegmento.alturaAcumulada) {
            mostrarMensaje(`La altura debe ser mayor a ${ultimoSegmento.alturaAcumulada}m (segmento anterior)`, 'error');
            return;
        }
    }
    
    // Calcular largo del segmento
    let largoSegmento;
    if (estadoApp.segmentosTemporales.length === 0) {
        // Primer segmento
        largoSegmento = alturaAcumulada;
    } else {
        // Segmentos siguientes: diferencia con el anterior
        const alturaAnterior = estadoApp.segmentosTemporales[estadoApp.segmentosTemporales.length - 1].alturaAcumulada;
        largoSegmento = alturaAcumulada - alturaAnterior;
    }
    
    // Agregar segmento con altura acumulada y largo
    const segmento = {
        numero: numeroSegmento,
        alturaAcumulada: alturaAcumulada,
        largo: parseFloat(largoSegmento.toFixed(2))
    };
    
    estadoApp.segmentosTemporales.push(segmento);
    
    // Limpiar y preparar siguiente
    document.getElementById('altura').value = '';
    document.getElementById('numeroSegmento').value = numeroSegmento + 1;
    document.getElementById('altura').focus();
    
    actualizarListaSegmentos();
    actualizarEstadoActual();
    mostrarMensaje(`Segmento ${numeroSegmento}: ${alturaAcumulada.toFixed(2)}m (largo: ${largoSegmento.toFixed(2)}m)`, 'success');
}

// Actualizar lista de segmentos
function actualizarListaSegmentos() {
    const lista = document.getElementById('listaSegmentos');
    
    if (estadoApp.segmentosTemporales.length === 0) {
        lista.innerHTML = '<p class="empty-message">No hay segmentos agregados</p>';
        return;
    }
    
    lista.innerHTML = estadoApp.segmentosTemporales.map((seg, index) => `
        <div class="segment-item">
            <div class="segment-info">
                <span><strong>Segmento ${seg.numero}</strong></span>
                <span>Altura: <strong>${seg.alturaAcumulada.toFixed(2)} m</strong></span>
                <span>Largo: <strong>${seg.largo.toFixed(2)} m</strong></span>
            </div>
            <div class="segment-actions">
                <button class="btn-edit" onclick="editarSegmento(${index})">✏️</button>
                <button class="btn-delete" onclick="eliminarSegmento(${index})">×</button>
            </div>
        </div>
    `).join('');
    
    // La altura total es el último valor acumulado
    if (estadoApp.segmentosTemporales.length > 0) {
        const alturaTotal = estadoApp.segmentosTemporales[estadoApp.segmentosTemporales.length - 1].alturaAcumulada;
        
        lista.innerHTML += `
            <div style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 6px;">
                <strong>Altura Total: ${alturaTotal.toFixed(2)} m</strong>
                <br>
                <small>Número de segmentos: ${estadoApp.segmentosTemporales.length}</small>
            </div>
        `;
    }
}

// Eliminar segmento
function eliminarSegmento(index) {
    estadoApp.segmentosTemporales.splice(index, 1);
    
    // Renumerar segmentos y recalcular largos
    estadoApp.segmentosTemporales.forEach((seg, i) => {
        seg.numero = i + 1;
        
        // Recalcular largos
        if (i === 0) {
            seg.largo = seg.alturaAcumulada;
        } else {
            seg.largo = parseFloat((seg.alturaAcumulada - estadoApp.segmentosTemporales[i - 1].alturaAcumulada).toFixed(2));
        }
    });
    
    // Actualizar número siguiente
    document.getElementById('numeroSegmento').value = estadoApp.segmentosTemporales.length + 1;
    
    actualizarListaSegmentos();
    actualizarEstadoActual();
    mostrarMensaje('Segmento eliminado y largos recalculados', 'info');
}

// Editar segmento
function editarSegmento(index) {
    const segmento = estadoApp.segmentosTemporales[index];
    const nuevaAltura = prompt(`Editar altura acumulada del segmento ${segmento.numero} (actual: ${segmento.alturaAcumulada}m):`, segmento.alturaAcumulada);
    
    if (nuevaAltura !== null && !isNaN(nuevaAltura) && parseFloat(nuevaAltura) > 0) {
        const alturaNum = parseFloat(nuevaAltura);
        
        // Validar que sea mayor que el segmento anterior
        if (index > 0) {
            const segmentoAnterior = estadoApp.segmentosTemporales[index - 1];
            if (alturaNum <= segmentoAnterior.alturaAcumulada) {
                mostrarMensaje(`La altura debe ser mayor a ${segmentoAnterior.alturaAcumulada}m (segmento anterior)`, 'error');
                return;
            }
        }
        
        // Validar que sea menor que el segmento siguiente
        if (index < estadoApp.segmentosTemporales.length - 1) {
            const segmentoSiguiente = estadoApp.segmentosTemporales[index + 1];
            if (alturaNum >= segmentoSiguiente.alturaAcumulada) {
                mostrarMensaje(`La altura debe ser menor a ${segmentoSiguiente.alturaAcumulada}m (segmento siguiente)`, 'error');
                return;
            }
        }
        
        // Actualizar altura acumulada
        estadoApp.segmentosTemporales[index].alturaAcumulada = alturaNum;
        
        // Recalcular largos de este segmento y los siguientes
        for (let i = index; i < estadoApp.segmentosTemporales.length; i++) {
            if (i === 0) {
                estadoApp.segmentosTemporales[i].largo = estadoApp.segmentosTemporales[i].alturaAcumulada;
            } else {
                estadoApp.segmentosTemporales[i].largo = parseFloat(
                    (estadoApp.segmentosTemporales[i].alturaAcumulada - 
                     estadoApp.segmentosTemporales[i - 1].alturaAcumulada).toFixed(2)
                );
            }
        }
        
        actualizarListaSegmentos();
        mostrarMensaje('Segmento actualizado y largos recalculados', 'success');
    }
}

// Guardar medición actual
function guardarMedicion() {
    if (!estadoApp.loteActual) {
        mostrarMensaje('Debe crear o abrir un lote primero', 'error');
        return;
    }
    
    if (estadoApp.segmentosTemporales.length === 0) {
        mostrarMensaje('Agregue al menos un segmento', 'error');
        return;
    }
    
    // La altura total es el último valor acumulado
    const alturaTotal = estadoApp.segmentosTemporales[estadoApp.segmentosTemporales.length - 1].alturaAcumulada;
    
    // Crear objeto de medición
    const medicion = {
        arbol: estadoApp.arbolActual,
        tipo: estadoApp.tipoActual,
        segmentos: [...estadoApp.segmentosTemporales],
        alturaTotal: alturaTotal.toFixed(2),
        fecha: new Date().toISOString()
    };
    
    // Guardar medición
    estadoApp.medicionesGuardadas.push(medicion);
    
    // Limpiar segmentos temporales
    estadoApp.segmentosTemporales = [];
    document.getElementById('numeroSegmento').value = 1;
    document.getElementById('altura').value = '';
    
    // Cambiar tipo de medición o pasar a siguiente árbol
    if (estadoApp.tipoActual === '265') {
        // Cambiar a India para el mismo árbol
        estadoApp.tipoActual = 'India';
        document.getElementById('tipoMedicion').value = 'India';
        mostrarMensaje(`Árbol ${estadoApp.arbolActual} - Tipo 265 guardado (${alturaTotal.toFixed(2)}m). Ahora mida con tipo India`, 'success');
    } else {
        // Ya se midió con ambos tipos, mostrar opción de siguiente árbol
        document.getElementById('btnSiguienteArbol').style.display = 'block';
        mostrarMensaje(`Árbol ${estadoApp.arbolActual} completado (265 e India)`, 'success');
    }
    
    actualizarVista();
    guardarEstado();
}

// Siguiente árbol
function siguienteArbol() {
    estadoApp.arbolActual++;
    estadoApp.tipoActual = '265';
    estadoApp.segmentosTemporales = [];
    
    document.getElementById('numeroArbol').value = estadoApp.arbolActual;
    document.getElementById('tipoMedicion').value = '265';
    document.getElementById('numeroSegmento').value = 1;
    document.getElementById('altura').value = '';
    document.getElementById('btnSiguienteArbol').style.display = 'none';
    
    actualizarVista();
    mostrarMensaje(`Iniciando medición del árbol ${estadoApp.arbolActual}`, 'info');
}

// Cambiar árbol manualmente
function cambiarArbol() {
    const nuevoArbol = parseInt(document.getElementById('numeroArbol').value);
    
    if (nuevoArbol > 0) {
        estadoApp.arbolActual = nuevoArbol;
        estadoApp.segmentosTemporales = [];
        document.getElementById('numeroSegmento').value = 1;
        actualizarVista();
    }
}

// Cambiar tipo de medición
function cambiarTipo() {
    estadoApp.tipoActual = document.getElementById('tipoMedicion').value;
    actualizarEstadoActual();
}

// Guardar lote completo
function guardarLote() {
    if (!estadoApp.loteActual) {
        mostrarMensaje('No hay lote activo', 'error');
        return;
    }
    
    // Buscar si el lote ya existe
    const indexExistente = estadoApp.lotesGuardados
        .findIndex(l => l.nombre === estadoApp.loteActual);
    
    const loteData = {
        nombre: estadoApp.loteActual,
        mediciones: [...estadoApp.medicionesGuardadas],
        fecha: new Date().toISOString()
    };
    
    if (indexExistente >= 0) {
        // Actualizar lote existente
        estadoApp.lotesGuardados[indexExistente] = loteData;
        mostrarMensaje(`Lote "${estadoApp.loteActual}" actualizado`, 'success');
    } else {
        // Agregar nuevo lote
        estadoApp.lotesGuardados.push(loteData);
        mostrarMensaje(`Lote "${estadoApp.loteActual}" guardado`, 'success');
    }
    
    guardarEstado();
}

// Exportar a CSV
function exportarCSV() {
    if (estadoApp.medicionesGuardadas.length === 0) {
        mostrarMensaje('No hay mediciones para exportar', 'error');
        return;
    }
    
    // Generar CSV con altura acumulada y largo del segmento
    let csv = 'Lote,Arbol,Tipo,Segmento,Altura_Acumulada_m,Largo_Segmento_m,Altura_Total_m\n';
    
    estadoApp.medicionesGuardadas.forEach(medicion => {
        medicion.segmentos.forEach(segmento => {
            csv += `${estadoApp.loteActual},${medicion.arbol},${medicion.tipo},${segmento.numero},${segmento.alturaAcumulada.toFixed(2)},${segmento.largo.toFixed(2)},${medicion.alturaTotal}\n`;
        });
    });
    
    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fecha = new Date().toISOString().split('T')[0];
    const filename = `alturas_${estadoApp.loteActual}_${fecha}.csv`;
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    mostrarMensaje('CSV del lote actual exportado exitosamente', 'success');
}

// Exportar TODOS los lotes a CSV
function exportarTodoCSV() {
    // Verificar que hay datos para exportar
    const hayDatosActuales = estadoApp.medicionesGuardadas.length > 0;
    const hayLotesGuardados = estadoApp.lotesGuardados.length > 0;
    
    if (!hayDatosActuales && !hayLotesGuardados) {
        mostrarMensaje('No hay datos para exportar', 'error');
        return;
    }
    
    // Generar CSV con todos los datos
    let csv = 'Lote,Arbol,Tipo,Segmento,Altura_Acumulada_m,Largo_Segmento_m,Altura_Total_m,Fecha_Medicion\n';
    
    // Exportar lotes guardados
    let totalArboles = 0;
    let totalLotes = 0;
    
    estadoApp.lotesGuardados.forEach(lote => {
        const fecha = lote.fecha ? new Date(lote.fecha).toLocaleDateString() : '';
        lote.mediciones.forEach(medicion => {
            medicion.segmentos.forEach(segmento => {
                csv += `${lote.nombre},${medicion.arbol},${medicion.tipo},${segmento.numero},`;
                csv += `${segmento.alturaAcumulada.toFixed(2)},${segmento.largo.toFixed(2)},`;
                csv += `${medicion.alturaTotal},${fecha}\n`;
            });
        });
        totalLotes++;
        totalArboles += obtenerTotalArboles(lote.mediciones);
    });
    
    // Agregar lote actual si tiene mediciones
    if (hayDatosActuales && estadoApp.loteActual) {
        const fechaActual = new Date().toLocaleDateString();
        estadoApp.medicionesGuardadas.forEach(medicion => {
            medicion.segmentos.forEach(segmento => {
                csv += `${estadoApp.loteActual},${medicion.arbol},${medicion.tipo},${segmento.numero},`;
                csv += `${segmento.alturaAcumulada.toFixed(2)},${segmento.largo.toFixed(2)},`;
                csv += `${medicion.alturaTotal},${fechaActual}\n`;
            });
        });
        totalLotes++;
        totalArboles += obtenerTotalArboles(estadoApp.medicionesGuardadas);
    }
    
    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fecha = new Date().toISOString().split('T')[0];
    const filename = `alturas_TODOS_LOS_LOTES_${fecha}.csv`;
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    const totalMediciones = csv.split('\n').length - 2; // Restar header y última línea vacía
    mostrarMensaje(`✅ CSV exportado: ${totalLotes} lotes, ${totalArboles} árboles, ${totalMediciones} registros totales`, 'success');
}

// Limpiar todo
function limpiarTodo() {
    if (confirm('¿Está seguro de limpiar todos los datos? Esta acción no se puede deshacer.')) {
        estadoApp = {
            loteActual: '',
            arbolActual: 1,
            tipoActual: '265',
            segmentosTemporales: [],
            medicionesGuardadas: [],
            lotesGuardados: estadoApp.lotesGuardados // Mantener lotes guardados
        };
        
        // Limpiar campos
        document.getElementById('lote').value = '';
        document.getElementById('numeroArbol').value = '1';
        document.getElementById('tipoMedicion').value = '265';
        document.getElementById('numeroSegmento').value = '1';
        document.getElementById('altura').value = '';
        
        actualizarVista();
        guardarEstado();
        mostrarMensaje('Datos limpiados', 'info');
    }
}

// Actualizar vista general
function actualizarVista() {
    actualizarEstadoActual();
    actualizarListaSegmentos();
    actualizarResumen();
}

// Actualizar estado actual
function actualizarEstadoActual() {
    document.getElementById('statusArbol').textContent = estadoApp.arbolActual;
    document.getElementById('statusTipo').textContent = estadoApp.tipoActual;
    document.getElementById('statusSegmentos').textContent = estadoApp.segmentosTemporales.length;
}

// Actualizar resumen del lote
function actualizarResumen() {
    const resumen = document.getElementById('resumenLote');
    
    if (estadoApp.medicionesGuardadas.length === 0) {
        resumen.innerHTML = '<p class="empty-message">No hay mediciones guardadas aún</p>';
        
        // Mostrar estadísticas globales si hay lotes guardados
        if (estadoApp.lotesGuardados.length > 0) {
            let totalLotesGuardados = estadoApp.lotesGuardados.length;
            let totalArbolesGuardados = 0;
            let totalMedicionesGuardadas = 0;
            
            estadoApp.lotesGuardados.forEach(lote => {
                totalArbolesGuardados += obtenerTotalArboles(lote.mediciones);
                totalMedicionesGuardadas += lote.mediciones.length;
            });
            
            resumen.innerHTML += `
                <div style="margin-top: 15px; padding: 15px; background: #fff3e0; border-radius: 8px;">
                    <strong>📊 Estadísticas Globales:</strong><br>
                    <small>
                        • Lotes guardados: ${totalLotesGuardados}<br>
                        • Total de árboles: ${totalArbolesGuardados}<br>
                        • Total de mediciones: ${totalMedicionesGuardadas}
                    </small>
                </div>
            `;
        }
        
        return;
    }
    
    // Agrupar por árbol
    const arboles = {};
    estadoApp.medicionesGuardadas.forEach(med => {
        if (!arboles[med.arbol]) {
            arboles[med.arbol] = [];
        }
        arboles[med.arbol].push(med);
    });
    
    resumen.innerHTML = Object.keys(arboles).map(arbol => {
        const mediciones = arboles[arbol];
        const tipos = mediciones.map(m => m.tipo).join(', ');
        const alturas = mediciones.map(m => `${m.tipo}: ${m.alturaTotal}m`).join(' | ');
        
        return `
            <div class="summary-item" onclick="verDetalleMedicion(${arbol})">
                <div class="summary-info">
                    <strong>Árbol ${arbol}</strong>
                    <br>
                    <small>Tipos: ${tipos} | ${alturas}</small>
                </div>
                <div class="summary-actions">
                    <button class="btn-edit" onclick="event.stopPropagation(); editarMedicion(${arbol})">✏️</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Agregar estadísticas del lote actual
    const totalArboles = Object.keys(arboles).length;
    const totalMediciones = estadoApp.medicionesGuardadas.length;
    
    resumen.innerHTML += `
        <div style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 6px;">
            <strong>Lote actual: ${totalArboles} árboles | ${totalMediciones} mediciones</strong>
        </div>
    `;
    
    // Mostrar estadísticas globales
    if (estadoApp.lotesGuardados.length > 0) {
        let totalLotesGuardados = estadoApp.lotesGuardados.length;
        let totalArbolesGuardados = 0;
        let totalMedicionesGuardadas = 0;
        
        estadoApp.lotesGuardados.forEach(lote => {
            totalArbolesGuardados += obtenerTotalArboles(lote.mediciones);
            totalMedicionesGuardadas += lote.mediciones.length;
        });
        
        resumen.innerHTML += `
            <div style="margin-top: 10px; padding: 10px; background: #fff3e0; border-radius: 6px;">
                <strong>📊 Total Global:</strong><br>
                <small>
                    • Lotes guardados: ${totalLotesGuardados}<br>
                    • Lote actual: ${estadoApp.loteActual || 'Sin nombre'}<br>
                    • Total árboles (todos los lotes): ${totalArbolesGuardados + totalArboles}<br>
                    • Total mediciones (todos los lotes): ${totalMedicionesGuardadas + totalMediciones}
                </small>
            </div>
        `;
    }
}

// Ver detalle de medición
function verDetalleMedicion(arbol) {
    const mediciones = estadoApp.medicionesGuardadas.filter(m => m.arbol == arbol);
    
    let detalle = `<h3>Árbol ${arbol}</h3>`;
    
    mediciones.forEach(med => {
        detalle += `<h4>Tipo: ${med.tipo}</h4>`;
        detalle += '<table style="width:100%; border-collapse: collapse;">';
        detalle += '<tr style="background:#e3f2fd;"><th style="padding:8px; border:1px solid #ddd;">Segmento</th><th style="padding:8px; border:1px solid #ddd;">Altura Acum.</th><th style="padding:8px; border:1px solid #ddd;">Largo</th></tr>';
        
        med.segmentos.forEach(seg => {
            detalle += `<tr>`;
            detalle += `<td style="padding:8px; border:1px solid #ddd; text-align:center;">${seg.numero}</td>`;
            detalle += `<td style="padding:8px; border:1px solid #ddd; text-align:right;">${seg.alturaAcumulada.toFixed(2)}m</td>`;
            detalle += `<td style="padding:8px; border:1px solid #ddd; text-align:right;">${seg.largo.toFixed(2)}m</td>`;
            detalle += `</tr>`;
        });
        
        detalle += `<tr style="background:#e3f2fd; font-weight:bold;">`;
        detalle += `<td colspan="2" style="padding:8px; border:1px solid #ddd;">Altura Total:</td>`;
        detalle += `<td style="padding:8px; border:1px solid #ddd; text-align:right;">${med.alturaTotal}m</td>`;
        detalle += `</tr>`;
        detalle += '</table>';
    });
    
    mostrarModal(detalle);
}

// Editar medición (básico)
function editarMedicion(arbol) {
    const mediciones = estadoApp.medicionesGuardadas.filter(m => m.arbol == arbol);
    
    if (mediciones.length > 0) {
        // Cargar la primera medición del árbol para editar
        const medicion = mediciones[0];
        estadoApp.arbolActual = arbol;
        estadoApp.tipoActual = medicion.tipo;
        estadoApp.segmentosTemporales = medicion.segmentos.map(seg => ({
            numero: seg.numero,
            alturaAcumulada: seg.alturaAcumulada,
            largo: seg.largo
        }));
        
        document.getElementById('numeroArbol').value = arbol;
        document.getElementById('tipoMedicion').value = medicion.tipo;
        document.getElementById('numeroSegmento').value = medicion.segmentos.length + 1;
        
        // Eliminar la medición actual para reemplazarla
        const index = estadoApp.medicionesGuardadas.findIndex(m => m.arbol == arbol && m.tipo === medicion.tipo);
        if (index >= 0) {
            estadoApp.medicionesGuardadas.splice(index, 1);
        }
        
        actualizarVista();
        mostrarMensaje(`Editando árbol ${arbol} - Tipo ${medicion.tipo}`, 'info');
    }
}

// Modal
function mostrarModal(contenido) {
    document.getElementById('edicionContenido').innerHTML = contenido;
    document.getElementById('modalEdicion').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modalEdicion').style.display = 'none';
}

// Guardar estado
function guardarEstado() {
    localStorage.setItem('medicionAlturas', JSON.stringify(estadoApp));
    
    const estado = document.getElementById('estadoGuardado');
    estado.textContent = '✓ Datos guardados';
    estado.style.background = '#e8f5e9';
    
    setTimeout(() => {
        estado.textContent = 'Guardado automático activo';
    }, 2000);
}

// Cargar datos guardados
function cargarDatosGuardados() {
    const datosGuardados = localStorage.getItem('medicionAlturas');
    
    if (datosGuardados) {
        estadoApp = JSON.parse(datosGuardados);
        
        // Restaurar campos
        document.getElementById('lote').value = estadoApp.loteActual || '';
        document.getElementById('numeroArbol').value = estadoApp.arbolActual || 1;
        document.getElementById('tipoMedicion').value = estadoApp.tipoActual || '265';
        
        actualizarVista();
    }
}

// Actualizar estado cuando cambian campos
function actualizarEstado() {
    estadoApp.loteActual = document.getElementById('lote').value;
    guardarEstado();
}

// Utilidades
function obtenerTotalArboles(mediciones) {
    const arboles = new Set(mediciones.map(m => m.arbol));
    return arboles.size;
}

function obtenerSiguienteArbol() {
    if (estadoApp.medicionesGuardadas.length === 0) return 1;
    
    const maxArbol = Math.max(...estadoApp.medicionesGuardadas.map(m => m.arbol));
    return maxArbol + 1;
}

function eliminarLoteGuardado(index) {
    if (confirm('¿Eliminar este lote guardado?')) {
        estadoApp.lotesGuardados.splice(index, 1);
        guardarEstado();
        mostrarLotesGuardados();
        mostrarMensaje('Lote eliminado', 'info');
    }
}

// Mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;
    
    switch(tipo) {
        case 'success':
            msgDiv.style.background = '#4caf50';
            break;
        case 'error':
            msgDiv.style.background = '#f44336';
            break;
        case 'info':
            msgDiv.style.background = '#2196f3';
            break;
    }
    
    msgDiv.textContent = mensaje;
    document.body.appendChild(msgDiv);
    
    // Mensajes largos duran más tiempo
    const duracion = mensaje.length > 50 ? 4000 : 3000;
    
    setTimeout(() => {
        msgDiv.remove();
    }, duracion);
}

// Click fuera del modal para cerrar
window.onclick = function(event) {
    const modal = document.getElementById('modalEdicion');
    if (event.target == modal) {
        cerrarModal();
    }
}