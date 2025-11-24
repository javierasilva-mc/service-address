async function enviarDireccion() {
    const msgBox = document.getElementById("msg");
    const btn = document.getElementById("btn-crear");
    const btnText = btn.querySelector(".btn-text");
    const btnLoader = btn.querySelector(".btn-loader");

    // Validación: verificar que haya seleccionado una dirección
    if (!window.direccionProcesada) {
        msgBox.innerHTML = "⚠️ Primero selecciona una dirección del autocompletado";
        msgBox.className = "msg warning";
        return;
    }

    // Validación: verificar campos obligatorios
    const { street, comuna, region } = window.direccionProcesada;
    if (!street || !comuna || !region) {
        msgBox.innerHTML = "⚠️ La dirección seleccionada no tiene información completa. Intenta con otra dirección.";
        msgBox.className = "msg warning";
        return;
    }

    // Obtener información complementaria (street2)
    const complemento = document.getElementById("complemento").value.trim();

    // Agregar el complemento al objeto que se envía
    const dataToSend = {
        ...window.direccionProcesada,
        street2: complemento // Aquí va la info complementaria (depto, edificio, etc.)
    };

    // Deshabilitar botón y mostrar loading
    btn.disabled = true;
    btnText.classList.add("hidden");
    btnLoader.classList.add("active");
    
    msgBox.innerHTML = "🔄 Validando y creando en Odoo...";
    msgBox.className = "msg loading";

    try {
        const res = await fetch("https://validar-direccion-odoo.javiera-silva-6f7.workers.dev/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend)
        });

        const data = await res.json();

        if (data.status === "ok") {
            // Éxito
            msgBox.innerHTML = `✅ <strong>¡Dirección creada exitosamente!</strong><br>ID en Odoo: ${data.id}`;
            msgBox.className = "msg success";

            // Limpiar formulario después de 3 segundos
            setTimeout(() => {
                document.getElementById("direccion").value = "";
                document.getElementById("complemento").value = "";
                document.getElementById("direccion-info").classList.add("hidden");
                document.getElementById("complemento-wrapper").classList.add("hidden");
                document.getElementById("map-preview").classList.add("hidden");
                window.direccionProcesada = null;
                msgBox.innerHTML = "";
                msgBox.className = "msg";
            }, 3000);
        } else {
            // Error del servidor
            let errorMsg = "❌ <strong>Error al crear la dirección</strong><br>";
            
            if (data.error) {
                errorMsg += data.error;
            }
            
            // Si hay detalles adicionales del error de Odoo
            if (data.odoo_error) {
                errorMsg += `<br><small>Detalles: ${JSON.stringify(data.odoo_error)}</small>`;
            }

            msgBox.innerHTML = errorMsg;
            msgBox.className = "msg error";
        }
    } catch (e) {
        // Error de conexión
        msgBox.innerHTML = `❌ <strong>Error de conexión</strong><br>No se pudo conectar con el servidor. Verifica tu conexión a internet.`;
        msgBox.className = "msg error";
        console.error("Error:", e);
    } finally {
        // Restaurar botón
        btn.disabled = false;
        btnText.classList.remove("hidden");
        btnLoader.classList.remove("active");
    }
}

// Permitir enviar con Enter
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("direccion");
    const complemento = document.getElementById("complemento");
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && window.direccionProcesada) {
            // Si presiona Enter en el input principal, pasar al complemento
            e.preventDefault();
            complemento.focus();
        }
    });

    complemento.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && window.direccionProcesada) {
            // Si presiona Enter en el complemento, enviar
            e.preventDefault();
            enviarDireccion();
        }
    });
});