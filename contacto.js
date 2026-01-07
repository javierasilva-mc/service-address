// ==================== VALIDACIÓN DE RUT ====================

/**
 * Formatea un RUT chileno al formato XX.XXX.XXX-X o X.XXX.XXX-X
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado
 */
function formatearRut(rut) {
    // Eliminar todo excepto números y K
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    
    if (valor.length < 2) return valor;
    
    // Separar cuerpo y dígito verificador
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);
    
    // Formatear con guión
    return `${cuerpo}-${dv}`;
}

/**
 * Valida un RUT chileno usando el algoritmo módulo 11
 * @param {string} rut - RUT a validar (con o sin formato)
 * @returns {boolean} true si es válido
 */
function validarRut(rut) {
    // Limpiar RUT
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    
    if (valor.length < 2) return false;
    
    let cuerpo = valor.slice(0, -1);
    let dvIngresado = valor.slice(-1);
    
    // Validar que el cuerpo sea numérico
    if (!/^\d+$/.test(cuerpo)) return false;
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    let resto = suma % 11;
    let dvCalculado = 11 - resto;
    
    let dvEsperado;
    if (dvCalculado === 11) {
        dvEsperado = '0';
    } else if (dvCalculado === 10) {
        dvEsperado = 'K';
    } else {
        dvEsperado = dvCalculado.toString();
    }
    
    return dvIngresado === dvEsperado;
}

/**
 * Limpia un RUT dejando solo números y K
 * @param {string} rut 
 * @returns {string}
 */
function limpiarRut(rut) {
    return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

// ==================== EVENTOS DEL FORMULARIO ====================

document.addEventListener("DOMContentLoaded", () => {
    const rutInput = document.getElementById("rut");
    const rutHint = document.getElementById("rut-hint");
    const rutValidation = document.getElementById("rut-validation");
    
    if (rutInput) {
        // Formatear RUT mientras escribe
        rutInput.addEventListener("input", (e) => {
            let valor = e.target.value;
            let limpio = limpiarRut(valor);
            
            // Formatear si tiene al menos 2 caracteres
            if (limpio.length >= 2) {
                e.target.value = formatearRut(limpio);
            }
            
            // Validar si tiene longitud mínima (7 dígitos + DV)
            if (limpio.length >= 8) {
                if (validarRut(limpio)) {
                    rutInput.classList.remove("invalid");
                    rutInput.classList.add("valid");
                    rutHint.textContent = "✓ RUT válido";
                    rutHint.classList.remove("invalid");
                    rutHint.classList.add("valid");
                    rutValidation.classList.add("hidden");
                } else {
                    rutInput.classList.remove("valid");
                    rutInput.classList.add("invalid");
                    rutHint.textContent = "✗ RUT inválido";
                    rutHint.classList.remove("valid");
                    rutHint.classList.add("invalid");
                }
            } else {
                rutInput.classList.remove("valid", "invalid");
                rutHint.textContent = "Ingresa el RUT sin puntos";
                rutHint.classList.remove("valid", "invalid");
            }
            
            actualizarResumen();
        });
        
        // Limpiar al perder foco si está vacío
        rutInput.addEventListener("blur", () => {
            if (rutInput.value.trim() === "") {
                rutInput.classList.remove("valid", "invalid");
                rutHint.textContent = "Ingresa el RUT sin puntos";
                rutHint.classList.remove("valid", "invalid");
            }
        });
    }
    
    // Eventos para actualizar resumen
    const camposResumen = ["rut", "unidad-negocio", "email", "telefono"];
    camposResumen.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener("input", actualizarResumen);
            elem.addEventListener("change", actualizarResumen);
        }
    });
    
    // Enter para navegar entre campos
    const email = document.getElementById("email");
    const telefono = document.getElementById("telefono");
    const direccionContacto = document.getElementById("direccion-contacto");
    
    if (email) {
        email.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                telefono?.focus();
            }
        });
    }
    
    if (telefono) {
        telefono.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                direccionContacto?.focus();
            }
        });
    }
});

// ==================== RESUMEN ====================

function actualizarResumen() {
    const resumenCard = document.getElementById("resumen-contacto");
    const resumenContent = document.getElementById("resumen-content");
    
    const rut = document.getElementById("rut")?.value || "";
    const unidadSelect = document.getElementById("unidad-negocio");
    const unidad = unidadSelect?.options[unidadSelect.selectedIndex]?.text || "";
    const email = document.getElementById("email")?.value || "";
    const telefono = document.getElementById("telefono")?.value || "";
    const direccion = window.direccionContactoProcesada?.formatted || "";
    const complemento = document.getElementById("complemento-contacto")?.value || "";
    
    // Mostrar resumen solo si hay al menos RUT y unidad de negocio
    const rutLimpio = limpiarRut(rut);
    if (rutLimpio.length >= 8 && validarRut(rutLimpio) && unidadSelect?.value) {
        resumenCard.classList.remove("hidden");
        
        let html = `
            <div class="resumen-row">
                <span class="resumen-label">RUT</span>
                <span class="resumen-value">${formatearRut(rutLimpio)}</span>
            </div>
            <div class="resumen-row">
                <span class="resumen-label">Tipo</span>
                <span class="resumen-value">${unidad}</span>
            </div>
        `;
        
        if (email) {
            html += `
                <div class="resumen-row">
                    <span class="resumen-label">Email</span>
                    <span class="resumen-value">${email}</span>
                </div>
            `;
        }
        
        if (telefono) {
            html += `
                <div class="resumen-row">
                    <span class="resumen-label">Teléfono</span>
                    <span class="resumen-value">${telefono}</span>
                </div>
            `;
        }
        
        if (direccion) {
            let direccionMostrar = direccion;
            if (complemento) {
                direccionMostrar += `, ${complemento}`;
            }
            html += `
                <div class="resumen-row">
                    <span class="resumen-label">Dirección</span>
                    <span class="resumen-value">${direccionMostrar}</span>
                </div>
            `;
        }
        
        resumenContent.innerHTML = html;
    } else {
        resumenCard.classList.add("hidden");
    }
}

// ==================== CREAR CONTACTO ====================

async function crearContacto() {
    const msgBox = document.getElementById("msg-contacto");
    const btn = document.getElementById("btn-crear-contacto");
    const btnText = btn.querySelector(".btn-text");
    const btnLoader = btn.querySelector(".btn-loader");
    
    // Obtener valores
    const rutInput = document.getElementById("rut");
    const unidadSelect = document.getElementById("unidad-negocio");
    const emailInput = document.getElementById("email");
    const telefonoInput = document.getElementById("telefono");
    const complementoInput = document.getElementById("complemento-contacto");
    
    const rut = limpiarRut(rutInput?.value || "");
    const unidadId = unidadSelect?.value;
    const unidadNombre = unidadSelect?.options[unidadSelect.selectedIndex]?.text || "";
    const email = emailInput?.value?.trim() || "";
    const telefono = telefonoInput?.value?.trim() || "";
    const complemento = complementoInput?.value?.trim() || "";
    
    // ==================== VALIDACIONES ====================
    
    // Validar RUT
    if (!rut || rut.length < 8) {
        msgBox.innerHTML = "⚠️ Ingresa un RUT válido";
        msgBox.className = "msg warning";
        rutInput?.focus();
        return;
    }
    
    if (!validarRut(rut)) {
        msgBox.innerHTML = "⚠️ El RUT ingresado no es válido (dígito verificador incorrecto)";
        msgBox.className = "msg warning";
        rutInput?.focus();
        return;
    }
    
    // Validar unidad de negocio
    if (!unidadId) {
        msgBox.innerHTML = "⚠️ Selecciona una unidad de negocio";
        msgBox.className = "msg warning";
        unidadSelect?.focus();
        return;
    }
    
    // Validar email
    if (!email) {
        msgBox.innerHTML = "⚠️ Ingresa un email";
        msgBox.className = "msg warning";
        emailInput?.focus();
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        msgBox.innerHTML = "⚠️ El email ingresado no tiene un formato válido";
        msgBox.className = "msg warning";
        emailInput?.focus();
        return;
    }
    
    // Validar teléfono
    if (!telefono) {
        msgBox.innerHTML = "⚠️ Ingresa un número de teléfono";
        msgBox.className = "msg warning";
        telefonoInput?.focus();
        return;
    }
    
    // Validar dirección
    if (!window.direccionContactoProcesada) {
        msgBox.innerHTML = "⚠️ Selecciona una dirección del autocompletado";
        msgBox.className = "msg warning";
        document.getElementById("direccion-contacto")?.focus();
        return;
    }
    
    const { street, number, comuna, region, postal } = window.direccionContactoProcesada;
    if (!street || !comuna || !region) {
        msgBox.innerHTML = "⚠️ La dirección seleccionada no tiene información completa. Intenta con otra dirección.";
        msgBox.className = "msg warning";
        return;
    }
    
    // ==================== PREPARAR DATOS ====================
    
    const dataToSend = {
        rut: formatearRut(rut),
        unidad_negocio_id: parseInt(unidadId),
        unidad_negocio_nombre: unidadNombre,
        email: email,
        telefono: telefono,
        direccion: {
            street: street,
            number: number || "",
            comuna: comuna,
            region: region,
            postal: postal || "",
            street2: complemento,
            formatted: window.direccionContactoProcesada.formatted
        }
    };
    
    // ==================== ENVIAR ====================
    
    btn.disabled = true;
    btnText.classList.add("hidden");
    btnLoader.classList.add("active");
    
    msgBox.innerHTML = "🔄 Validando RUT y creando contacto en Odoo...";
    msgBox.className = "msg loading";
    
    try {
        const res = await fetch("https://validar-direccion-odoo.javiera-silva-6f7.workers.dev/crear-contacto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend)
        });
        
        const data = await res.json();
        
        if (data.status === "ok") {
            let successMsg = `✅ <strong>¡Contacto creado exitosamente!</strong><br>`;
            successMsg += `<small>`;
            successMsg += `Contacto ID: ${data.contact_id}<br>`;
            successMsg += `Dirección servicio ID: ${data.service_address_partner_id}<br>`;
            successMsg += `Service Address ID: ${data.service_address_id}`;
            successMsg += `</small>`;
            
            if (data.equifax_mock) {
                successMsg += `<br><small style="color: #d97706;">⚠️ Datos de Equifax simulados (modo desarrollo)</small>`;
            }
            
            msgBox.innerHTML = successMsg;
            msgBox.className = "msg success";
            
            // Limpiar formulario después de 4 segundos
            setTimeout(() => {
                limpiarFormularioContacto();
            }, 4000);
            
        } else {
            let errorMsg = "❌ <strong>Error al crear el contacto</strong><br>";
            
            if (data.error) {
                errorMsg += data.error;
            }
            
            if (data.step) {
                errorMsg += `<br><small>Paso: ${data.step}</small>`;
            }
            
            if (data.odoo_error) {
                errorMsg += `<br><small>Detalles: ${JSON.stringify(data.odoo_error)}</small>`;
            }
            
            msgBox.innerHTML = errorMsg;
            msgBox.className = "msg error";
        }
    } catch (e) {
        msgBox.innerHTML = `❌ <strong>Error de conexión</strong><br>No se pudo conectar con el servidor. Verifica tu conexión a internet.`;
        msgBox.className = "msg error";
        console.error("Error:", e);
    } finally {
        btn.disabled = false;
        btnText.classList.remove("hidden");
        btnLoader.classList.remove("active");
    }
}

function limpiarFormularioContacto() {
    // Limpiar inputs
    document.getElementById("rut").value = "";
    document.getElementById("unidad-negocio").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("direccion-contacto").value = "";
    document.getElementById("complemento-contacto").value = "";
    
    // Limpiar estados
    const rutInput = document.getElementById("rut");
    const rutHint = document.getElementById("rut-hint");
    rutInput.classList.remove("valid", "invalid");
    rutHint.textContent = "Ingresa el RUT sin puntos";
    rutHint.classList.remove("valid", "invalid");
    
    // Ocultar elementos
    document.getElementById("direccion-contacto-info").classList.add("hidden");
    document.getElementById("complemento-contacto-wrapper").classList.add("hidden");
    document.getElementById("map-preview-contacto").classList.add("hidden");
    document.getElementById("resumen-contacto").classList.add("hidden");
    
    // Limpiar variable global
    window.direccionContactoProcesada = null;
    
    // Limpiar mensaje
    const msgBox = document.getElementById("msg-contacto");
    msgBox.innerHTML = "";
    msgBox.className = "msg";
}