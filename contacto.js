// ==================== VALIDACIÓN DE RUT ====================

/**
 * Formatea un RUT chileno al formato XXXXXXXX-X
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
 * También valida que el cuerpo tenga entre 7 y 8 dígitos
 * @param {string} rut - RUT a validar (con o sin formato)
 * @returns {object} { valid: boolean, error: string | null }
 */
function validarRut(rut) {
    // Limpiar RUT
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    
    if (valor.length < 2) {
        return { valid: false, error: null }; // Aún escribiendo
    }
    
    let cuerpo = valor.slice(0, -1);
    let dvIngresado = valor.slice(-1);
    
    // Validar que el cuerpo sea numérico
    if (!/^\d+$/.test(cuerpo)) {
        return { valid: false, error: "El RUT debe contener solo números" };
    }
    
    // Validar longitud del cuerpo (7-8 dígitos)
    if (cuerpo.length < 7) {
        return { valid: false, error: "RUT muy corto (mínimo 7 dígitos)" };
    }
    
    if (cuerpo.length > 8) {
        return { valid: false, error: "RUT muy largo (máximo 8 dígitos)" };
    }
    
    // Validar que no sean todos los dígitos iguales (ej: 11111111, 77777777)
    if (/^(\d)\1+$/.test(cuerpo)) {
        return { valid: false, error: "RUT inválido (números repetidos)" };
    }
    
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
    
    if (dvIngresado !== dvEsperado) {
        return { valid: false, error: "Dígito verificador incorrecto" };
    }
    
    return { valid: true, error: null };
}

/**
 * Limpia un RUT dejando solo números y K
 * @param {string} rut 
 * @returns {string}
 */
function limpiarRut(rut) {
    return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

// ==================== VALIDACIÓN DE EMAIL ====================

/**
 * Valida formato de email
 * @param {string} email 
 * @returns {object} { valid: boolean, error: string | null }
 */
function validarEmail(email) {
    if (!email || email.trim() === '') {
        return { valid: false, error: null }; // Vacío, sin error
    }
    
    const emailTrimmed = email.trim();
    
    // Regex para validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(emailTrimmed)) {
        // Dar feedback más específico
        if (!emailTrimmed.includes('@')) {
            return { valid: false, error: "Falta el símbolo @" };
        }
        if (!emailTrimmed.includes('.')) {
            return { valid: false, error: "Falta el dominio (ej: .com, .cl)" };
        }
        return { valid: false, error: "Formato de email inválido" };
    }
    
    return { valid: true, error: null };
}

// ==================== VALIDACIÓN DE TELÉFONO ====================

/**
 * Formatea teléfono a solo 9 dígitos
 * @param {string} telefono 
 * @returns {string}
 */
function formatearTelefono(telefono) {
    // Solo permitir dígitos, máximo 9
    return telefono.replace(/\D/g, '').slice(0, 9);
}

/**
 * Valida teléfono chileno (9 dígitos)
 * @param {string} telefono 
 * @returns {object} { valid: boolean, error: string | null }
 */
function validarTelefono(telefono) {
    const soloDigitos = telefono.replace(/\D/g, '');
    
    if (soloDigitos.length === 0) {
        return { valid: false, error: null }; // Vacío, sin error
    }
    
    if (soloDigitos.length < 9) {
        return { valid: false, error: `Faltan ${9 - soloDigitos.length} dígitos` };
    }
    
    if (soloDigitos.length === 9) {
        return { valid: true, error: null };
    }
    
    return { valid: false, error: "Máximo 9 dígitos" };
}

// ==================== EVENTOS DEL FORMULARIO ====================

document.addEventListener("DOMContentLoaded", () => {
    initRutValidation();
    initEmailValidation();
    initTelefonoValidation();
    initResumenListeners();
    initKeyboardNavigation();
});

function initRutValidation() {
    const rutInput = document.getElementById("rut");
    const rutHint = document.getElementById("rut-hint");
    
    if (!rutInput) return;
    
    rutInput.addEventListener("input", (e) => {
        let valor = e.target.value;
        let limpio = limpiarRut(valor);
        
        // Formatear si tiene al menos 2 caracteres
        if (limpio.length >= 2) {
            e.target.value = formatearRut(limpio);
        }
        
        // Validar
        const resultado = validarRut(limpio);
        
        if (limpio.length >= 8) { // Mínimo para validar (7 dígitos + DV)
            if (resultado.valid) {
                rutInput.classList.remove("invalid");
                rutInput.classList.add("valid");
                rutHint.textContent = "✓ RUT válido";
                rutHint.classList.remove("invalid");
                rutHint.classList.add("valid");
            } else {
                rutInput.classList.remove("valid");
                rutInput.classList.add("invalid");
                rutHint.textContent = `✗ ${resultado.error || "RUT inválido"}`;
                rutHint.classList.remove("valid");
                rutHint.classList.add("invalid");
            }
        } else if (limpio.length > 0) {
            // Escribiendo pero aún no completo
            rutInput.classList.remove("valid", "invalid");
            rutHint.textContent = `Ingresando... (${limpio.length}/8-9 caracteres)`;
            rutHint.classList.remove("valid", "invalid");
        } else {
            rutInput.classList.remove("valid", "invalid");
            rutHint.textContent = "Ingresa el RUT sin puntos";
            rutHint.classList.remove("valid", "invalid");
        }
        
        actualizarResumen();
    });
    
    rutInput.addEventListener("blur", () => {
        if (rutInput.value.trim() === "") {
            rutInput.classList.remove("valid", "invalid");
            rutHint.textContent = "Ingresa el RUT sin puntos";
            rutHint.classList.remove("valid", "invalid");
        }
    });
}

function initEmailValidation() {
    const emailInput = document.getElementById("email");
    const emailHint = getOrCreateHint(emailInput, "email-hint");
    
    if (!emailInput) return;
    
    emailInput.addEventListener("input", () => {
        const valor = emailInput.value;
        const resultado = validarEmail(valor);
        
        if (valor.trim() === "") {
            emailInput.classList.remove("valid", "invalid");
            emailHint.textContent = "";
            emailHint.classList.remove("valid", "invalid");
        } else if (resultado.valid) {
            emailInput.classList.remove("invalid");
            emailInput.classList.add("valid");
            emailHint.textContent = "✓ Email válido";
            emailHint.classList.remove("invalid");
            emailHint.classList.add("valid");
        } else if (resultado.error) {
            emailInput.classList.remove("valid");
            emailInput.classList.add("invalid");
            emailHint.textContent = `✗ ${resultado.error}`;
            emailHint.classList.remove("valid");
            emailHint.classList.add("invalid");
        }
        
        actualizarResumen();
    });
    
    emailInput.addEventListener("blur", () => {
        if (emailInput.value.trim() === "") {
            emailInput.classList.remove("valid", "invalid");
            emailHint.textContent = "";
            emailHint.classList.remove("valid", "invalid");
        }
    });
}

function initTelefonoValidation() {
    const telefonoInput = document.getElementById("telefono");
    const telefonoHint = getOrCreateHint(telefonoInput, "telefono-hint");
    
    if (!telefonoInput) return;
    
    telefonoInput.addEventListener("input", (e) => {
        // Formatear: solo dígitos, máximo 9
        const formateado = formatearTelefono(e.target.value);
        e.target.value = formateado;
        
        const resultado = validarTelefono(formateado);
        
        if (formateado === "") {
            telefonoInput.classList.remove("valid", "invalid");
            telefonoHint.textContent = "";
            telefonoHint.classList.remove("valid", "invalid");
        } else if (resultado.valid) {
            telefonoInput.classList.remove("invalid");
            telefonoInput.classList.add("valid");
            telefonoHint.textContent = "✓ Teléfono válido";
            telefonoHint.classList.remove("invalid");
            telefonoHint.classList.add("valid");
        } else if (resultado.error) {
            telefonoInput.classList.remove("valid");
            telefonoInput.classList.add("invalid");
            telefonoHint.textContent = `✗ ${resultado.error}`;
            telefonoHint.classList.remove("valid");
            telefonoHint.classList.add("invalid");
        }
        
        actualizarResumen();
    });
    
    telefonoInput.addEventListener("blur", () => {
        if (telefonoInput.value.trim() === "") {
            telefonoInput.classList.remove("valid", "invalid");
            telefonoHint.textContent = "";
            telefonoHint.classList.remove("valid", "invalid");
        }
    });
}

/**
 * Obtiene o crea un elemento hint debajo de un input
 */
function getOrCreateHint(input, hintId) {
    let hint = document.getElementById(hintId);
    
    if (!hint) {
        hint = document.createElement("p");
        hint.id = hintId;
        hint.className = "field-hint";
        
        // Insertar después del input-wrapper
        const wrapper = input.closest(".input-wrapper") || input.closest(".form-group");
        if (wrapper) {
            wrapper.parentNode.insertBefore(hint, wrapper.nextSibling);
        }
    }
    
    return hint;
}

function initResumenListeners() {
    const camposResumen = ["unidad-negocio", "complemento-contacto"];
    camposResumen.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener("input", actualizarResumen);
            elem.addEventListener("change", actualizarResumen);
        }
    });
}

function initKeyboardNavigation() {
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
}

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
    
    // Mostrar resumen solo si hay RUT válido y unidad de negocio
    const rutLimpio = limpiarRut(rut);
    const rutValidacion = validarRut(rutLimpio);
    
    if (rutValidacion.valid && unidadSelect?.value) {
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
        
        if (email && validarEmail(email).valid) {
            html += `
                <div class="resumen-row">
                    <span class="resumen-label">Email</span>
                    <span class="resumen-value">${email}</span>
                </div>
            `;
        }
        
        if (telefono && validarTelefono(telefono).valid) {
            html += `
                <div class="resumen-row">
                    <span class="resumen-label">Teléfono</span>
                    <span class="resumen-value">+56 ${telefono}</span>
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
    const rutValidacion = validarRut(rut);
    if (!rutValidacion.valid) {
        msgBox.innerHTML = `⚠️ ${rutValidacion.error || "Ingresa un RUT válido"}`;
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
    const emailValidacion = validarEmail(email);
    if (!email) {
        msgBox.innerHTML = "⚠️ Ingresa un email";
        msgBox.className = "msg warning";
        emailInput?.focus();
        return;
    }
    if (!emailValidacion.valid) {
        msgBox.innerHTML = `⚠️ ${emailValidacion.error}`;
        msgBox.className = "msg warning";
        emailInput?.focus();
        return;
    }
    
    // Validar teléfono
    const telefonoValidacion = validarTelefono(telefono);
    if (!telefono) {
        msgBox.innerHTML = "⚠️ Ingresa un número de teléfono";
        msgBox.className = "msg warning";
        telefonoInput?.focus();
        return;
    }
    if (!telefonoValidacion.valid) {
        msgBox.innerHTML = `⚠️ El teléfono debe tener 9 dígitos`;
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
            // ÉXITO - Mostrar pantalla de confirmación
            mostrarResultado({
                tipo: "success",
                rut: formatearRut(rut),
                nombre: data.nombre || unidadNombre,
                email: email,
                telefono: telefono,
                direccion: window.direccionContactoProcesada.formatted,
                contactId: data.contact_id,
                serviceAddressId: data.service_address_id,
                scoringStatus: data.scoring_status || "approved",
                isMock: data.equifax_mock || false
            });
            
        } else {
            // ERROR
            if (data.step === "verificando_rut_duplicado" && data.partner_id) {
                // RUT ya existe
                mostrarResultado({
                    tipo: "error_duplicado",
                    rut: formatearRut(rut),
                    partnerName: data.partner_name,
                    partnerId: data.partner_id,
                    error: data.error
                });
            } else {
                // Otro error
                mostrarResultado({
                    tipo: "error",
                    rut: formatearRut(rut),
                    error: data.error,
                    step: data.step,
                    odooError: data.odoo_error
                });
            }
        }
    } catch (e) {
        // Error de conexión
        mostrarResultado({
            tipo: "error",
            rut: formatearRut(rut),
            error: "No se pudo conectar con el servidor. Verifica tu conexión a internet."
        });
        console.error("Error:", e);
    } finally {
        btn.disabled = false;
        btnText.classList.remove("hidden");
        btnLoader.classList.remove("active");
        msgBox.innerHTML = "";
        msgBox.className = "msg";
    }
}

// ==================== MOSTRAR RESULTADO ====================

function mostrarResultado(data) {
    const formCard = document.getElementById("form-contacto");
    const resultadoCard = document.getElementById("resultado-contacto");
    const resultadoContent = document.getElementById("resultado-content");
    
    let html = '';
    
    if (data.tipo === "success") {
        // Determinar badge de estado
        let badgeClass = "approved";
        let badgeText = "✓ Aprobado";
        
        if (data.scoringStatus === "discarded") {
            badgeClass = "rejected";
            badgeText = "✗ Descartado";
        } else if (data.scoringStatus === "to_review") {
            badgeClass = "review";
            badgeText = "⏳ En revisión";
        }
        
        html = `
            <div class="resultado-container">
                <div class="resultado-icon success">✓</div>
                <h2 class="resultado-title">¡Contacto creado exitosamente!</h2>
                <p class="resultado-subtitle">El contacto ha sido registrado en Odoo correctamente.</p>
                
                <div class="resultado-details">
                    <div class="resultado-detail-row">
                        <span class="resultado-detail-label">RUT</span>
                        <span class="resultado-detail-value">${data.rut}</span>
                    </div>
                    <div class="resultado-detail-row">
                        <span class="resultado-detail-label">Email</span>
                        <span class="resultado-detail-value">${data.email}</span>
                    </div>
                    <div class="resultado-detail-row">
                        <span class="resultado-detail-label">Teléfono</span>
                        <span class="resultado-detail-value">+56 ${data.telefono}</span>
                    </div>
                    <div class="resultado-detail-row">
                        <span class="resultado-detail-label">Dirección</span>
                        <span class="resultado-detail-value">${data.direccion}</span>
                    </div>
                    <div class="resultado-detail-row">
                        <span class="resultado-detail-label">ID Contacto</span>
                        <span class="resultado-detail-value">#${data.contactId}</span>
                    </div>
                    <div class="resultado-detail-row">
                        <span class="resultado-detail-label">Evaluación Comercial</span>
                        <span class="resultado-detail-value">
                            <span class="resultado-badge ${badgeClass}">${badgeText}</span>
                        </span>
                    </div>
                    ${data.isMock ? `
                    <div class="resultado-detail-row">
                        <span class="resultado-detail-label">Modo</span>
                        <span class="resultado-detail-value">
                            <span class="resultado-badge mock">🔧 Desarrollo</span>
                        </span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="resultado-actions">
                    <button class="btn-primary-small" onclick="volverAFormulario()">
                        Crear otro contacto
                    </button>
                </div>
            </div>
        `;
    } else if (data.tipo === "error_duplicado") {
        html = `
            <div class="resultado-container">
                <div class="resultado-icon warning">⚠️</div>
                <h2 class="resultado-title">RUT ya registrado</h2>
                <p class="resultado-subtitle">Este RUT ya existe como contacto en Odoo.</p>
                
                <div class="error-rut-existente">
                    <div class="error-title">
                        <span>ℹ️</span> Información del contacto existente
                    </div>
                    <div class="error-detail">
                        <strong>RUT:</strong> ${data.rut}<br>
                        <strong>Nombre:</strong> ${data.partnerName}<br>
                        <strong>ID:</strong> #${data.partnerId}
                    </div>
                </div>
                
                <div class="resultado-actions">
                    <button class="btn-primary-small" onclick="volverAFormulario()">
                        Ingresar otro contacto
                    </button>
                </div>
            </div>
        `;
    } else {
        // Error genérico
        html = `
            <div class="resultado-container">
                <div class="resultado-icon error">✗</div>
                <h2 class="resultado-title">Error al crear contacto</h2>
                <p class="resultado-subtitle">${data.error || "Ocurrió un error inesperado"}</p>
                
                ${data.step ? `
                <div class="error-rut-existente">
                    <div class="error-title">
                        <span>🔍</span> Detalles del error
                    </div>
                    <div class="error-detail">
                        <strong>Paso:</strong> ${data.step}<br>
                        ${data.odooError ? `<strong>Detalle:</strong> ${JSON.stringify(data.odooError)}` : ''}
                    </div>
                </div>
                ` : ''}
                
                <div class="resultado-actions">
                    <button class="btn-secondary" onclick="volverAFormulario(true)">
                        Volver a intentar
                    </button>
                    <button class="btn-primary-small" onclick="volverAFormulario()">
                        Nuevo contacto
                    </button>
                </div>
            </div>
        `;
    }
    
    resultadoContent.innerHTML = html;
    
    // Ocultar formulario, mostrar resultado
    formCard.classList.add("hidden");
    resultadoCard.classList.remove("hidden");
}

// ==================== VOLVER A FORMULARIO ====================

function volverAFormulario(mantenerDatos = false) {
    const formCard = document.getElementById("form-contacto");
    const resultadoCard = document.getElementById("resultado-contacto");
    
    // Mostrar formulario, ocultar resultado
    resultadoCard.classList.add("hidden");
    formCard.classList.remove("hidden");
    
    // Limpiar si no se mantienen datos
    if (!mantenerDatos) {
        limpiarFormularioContacto();
    }
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limpiarFormularioContacto() {
    // Limpiar inputs
    document.getElementById("rut").value = "";
    document.getElementById("unidad-negocio").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("direccion-contacto").value = "";
    document.getElementById("complemento-contacto").value = "";
    
    // Limpiar estados de RUT
    const rutInput = document.getElementById("rut");
    const rutHint = document.getElementById("rut-hint");
    rutInput.classList.remove("valid", "invalid");
    rutHint.textContent = "Ingresa el RUT sin puntos";
    rutHint.classList.remove("valid", "invalid");
    
    // Limpiar estados de Email
    const emailInput = document.getElementById("email");
    const emailHint = document.getElementById("email-hint");
    emailInput.classList.remove("valid", "invalid");
    if (emailHint) {
        emailHint.textContent = "";
        emailHint.classList.remove("valid", "invalid");
    }
    
    // Limpiar estados de Teléfono
    const telefonoInput = document.getElementById("telefono");
    const telefonoHint = document.getElementById("telefono-hint");
    telefonoInput.classList.remove("valid", "invalid");
    if (telefonoHint) {
        telefonoHint.textContent = "";
        telefonoHint.classList.remove("valid", "invalid");
    }
    
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