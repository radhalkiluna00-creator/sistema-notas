document.addEventListener("DOMContentLoaded", function () {

    const formRegistro = document.getElementById('formRegistro');

    // =========================
    // REGISTRO
    // =========================
    if (formRegistro) {
        formRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const rol = document.getElementById('regRol').value;
            const materia = document.getElementById('regMateria').value;
            const pass = document.getElementById('regPass').value;

            if (rol === "maestro" && materia.trim() === "") {
                alert("⚠️ Debes escribir la asignatura");
                return;
            }

            if (pass.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres");
                return;
            }

            const datosUsuario = {
                nombre: document.getElementById('regNombre').value,
                rol: rol,
                asignatura: (rol === "maestro") ? materia : null,
                pass: pass
            };

            localStorage.setItem('usuarioRegistrado', JSON.stringify(datosUsuario));

            alert('✅ Registro exitoso como ' + rol);
            window.location.href = "index.html"; 
        });
    }

    // =========================
    // MOSTRAR / OCULTAR MATERIA
    // =========================
    const selectRol = document.getElementById('regRol');

    if (selectRol) {
        selectRol.addEventListener('change', verificarRol);
        verificarRol();
    }

    function verificarRol() {
        const rol = document.getElementById('regRol').value;
        const campo = document.getElementById('campoAsignatura');

        if (!campo) return;

        campo.style.display = (rol === "maestro") ? "block" : "none";

        if (rol !== "maestro") {
            document.getElementById('regMateria').value = "";
        }
    }

    // =========================
    // SESIÓN
    // =========================
    const usuario = JSON.parse(localStorage.getItem('usuarioRegistrado'));

    if (!usuario && !formRegistro) {
       window.location.href = "login.html";

        return;
    }

    const nombreUser = document.getElementById('nombreUser');
    if (nombreUser && usuario) nombreUser.innerText = "👤 " + usuario.nombre;

    // =========================
    // ROLES
    // =========================
    const seccionMaestro = document.getElementById('seccionMaestro');
    const inputMateria = document.getElementById('materiaNombre');
    const rolTag = document.getElementById('rolTag');
    const buscadorContenedor = document.getElementById('contenedorBuscador'); // ✅ ARREGLADO

    if (usuario) {
        if (usuario.rol === "maestro") {
            if (seccionMaestro) seccionMaestro.style.display = "block";
            if (rolTag) rolTag.innerText = "MAESTRO";
            if (inputMateria) {
                inputMateria.value = usuario.asignatura || "Materia General";
                inputMateria.disabled = true;
            }
            if (buscadorContenedor) buscadorContenedor.style.display = "none";
        } else {
            if (rolTag) rolTag.innerText = "ESTUDIANTE";
            if (buscadorContenedor) buscadorContenedor.style.display = "block";
        }
    }

    // =========================
    // BUSCADOR
    // =========================
    const inputBusqueda = document.getElementById('inputBusqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', function(e) {
            dibujarTabla(e.target.value.toLowerCase());
        });
    }

    dibujarTabla();
});

// =========================
// FUNCIONES
// =========================

function guardarNuevaNota() {
    const usuario = JSON.parse(localStorage.getItem('usuarioRegistrado'));
    if (!usuario) return;

    const notaInput = document.getElementById('materiaNota');
    const nota = parseInt(notaInput.value);

    if (isNaN(nota) || nota < 0 || nota > 100) {
        alert("Nota inválida (0-100)");
        return;
    }

    let notasSistema = JSON.parse(localStorage.getItem('notasSistema')) || [];

    const index = notasSistema.findIndex(n => n.materia === usuario.asignatura);

    if (index !== -1) {
        notasSistema[index].nota = nota;
    } else {
        notasSistema.push({
            materia: usuario.asignatura,
            nota: nota,
            maestro: usuario.nombre
        });
    }

    localStorage.setItem('notasSistema', JSON.stringify(notasSistema));
    notaInput.value = "";
    alert("✅ Nota guardada");

    dibujarTabla();
}

function dibujarTabla(filtro = "") {
    const cuerpoTabla = document.getElementById("tabla-cuerpo");
    if (!cuerpoTabla) return;

    const notas = JSON.parse(localStorage.getItem('notasSistema')) || [];

    const filtradas = notas.filter(n => 
        n.materia.toLowerCase().includes(filtro)
    );

    if (filtradas.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay datos</td></tr>`;
        return;
    }

    let html = "";

    filtradas.forEach(item => {
        const aprobado = item.nota >= 70;
        const estado = aprobado ? "Aprobado" : "Reprobado";
        const clase = aprobado ? "aprobado" : "reprobado";

        html += `
        <tr>
            <td>${item.materia}</td>
            <td>${item.nota}</td>
            <td class="${clase}">${estado}</td>
            <td>Prof. ${item.maestro}</td>
        </tr>`;
    });

    cuerpoTabla.innerHTML = html;
}

function cerrarSesion() {
    localStorage.removeItem('usuarioRegistrado');
    window.location.href = "registro.html";
}
