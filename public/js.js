window.addEventListener("load", () => {
  // ========= METAS =========
  const btnAgregar = document.getElementById("agregar");
  const overlay = document.getElementById("overlay");
  const inputMeta = document.getElementById("inpagr");
  const btnGuardar = document.getElementById("guardar");
  const btnCancelar = document.getElementById("cancelar");
  const contenedorMetas = document.getElementById("contenedor-metas");

  const esIndex = btnAgregar && overlay && inputMeta && btnGuardar && btnCancelar && contenedorMetas;

  if (esIndex) {
    function guardarMetas() {
      const metas = [];
      document.querySelectorAll(".meta").forEach((el) => {
        const titulo = el.querySelector(".meta__titulo").textContent;
        const barraId = el.querySelector(".barra__progreso").id;
        metas.push({ titulo, id: barraId });
      });
      localStorage.setItem("metas", JSON.stringify(metas));
    }

    function crearMetaEnlace(texto, barraId) {
      const link = document.createElement("a");
      const nombreArchivo = "metas/" + texto.toLowerCase().replace(/\s+/g, '-') + ".html";
      link.href = nombreArchivo;
      link.style.textDecoration = "none";

      const divMeta = document.createElement("div");
      divMeta.className = "meta";
      divMeta.innerHTML = `
        <h1 class="meta__titulo">${texto}</h1>
        <div class="barra">
          <div class="barra__progreso" id="${barraId}"><span>0%</span></div>
        </div>
        <div class="submeta-eliminar">x</div>
      `;

      const btnEliminar = divMeta.querySelector(".submeta-eliminar");
      btnEliminar.addEventListener("click", (e) => {
        e.preventDefault();
        link.remove();

        let metas = JSON.parse(localStorage.getItem("metas")) || [];
        metas = metas.filter(m => m.id !== barraId);
        localStorage.setItem("metas", JSON.stringify(metas));
      });

      link.appendChild(divMeta);
      contenedorMetas.appendChild(link);

      const progreso = localStorage.getItem("progreso_" + barraId);
      if (progreso !== null) {
        const barra = divMeta.querySelector(".barra__progreso");
        if (barra) {
          barra.style.width = `${progreso}%`;
          barra.querySelector("span").textContent = `${progreso}%`;
        }
      }
    }

    function cargarMetas() {
      const metasGuardadas = JSON.parse(localStorage.getItem("metas")) || [];
      metasGuardadas.forEach(({ titulo, id }) => {
        crearMetaEnlace(titulo, id);
      });
    }

    btnAgregar.addEventListener("click", () => {
      overlay.classList.remove("oculto");
      inputMeta.focus();
    });

    btnCancelar.addEventListener("click", () => {
      inputMeta.value = "";
      overlay.classList.add("oculto");
    });

    btnGuardar.addEventListener("click", () => {
      const texto = inputMeta.value.trim();
      if (!texto || !modoTiempo) return;

      const barraId = `barra${Date.now()}`;
      const fechaInput = inputFecha?.value || null;
      crearMetaEnlace(texto, barraId);

      const metas = JSON.parse(localStorage.getItem("metas")) || [];
      metas.push({
        titulo: texto,
        id: barraId,
        modoTiempo,
        fecha: fechaInput
      });
      localStorage.setItem("metas", JSON.stringify(metas));



      cargarMetas();
    });


    // ========= SUBMETAS POR META =========
    const btnAgregarSub = document.getElementById("agrsubmeta");
    const overlaySub = document.getElementById("overlaySub");
    const inputSubmeta = document.getElementById("inpSubmeta");
    const inputDesc = document.getElementById("descripcion");
    const btnGuardarSub = document.getElementById("guardarSub");
    const btnCancelarSub = document.getElementById("cancelarSub");

    const metaId = document.body.getAttribute("data-meta-id") || "default";
    const contenedorSubmetas = document.querySelector(`#contenedor-submetas${metaId}`);

    if (
      btnAgregarSub && overlaySub &&
      inputSubmeta && inputDesc &&
      btnGuardarSub && btnCancelarSub &&
      contenedorSubmetas
    ) {
      function actualizarProgreso() {
        const checks = contenedorSubmetas.querySelectorAll(".submeta-check");
        const completados = contenedorSubmetas.querySelectorAll(".submeta-check:checked");
        const porcentaje = checks.length === 0 ? 0 : Math.round((completados.length / checks.length) * 100);
        const barra = document.getElementById("barra" + metaId);
        if (barra) {
          barra.style.width = `${porcentaje}%`;
          barra.querySelector("span").textContent = `${porcentaje}%`;
        }

        localStorage.setItem("progreso_" + metaId, porcentaje);


        const nombreMeta = document.querySelector(".meta__titulo")?.textContent || "Meta completada";
        let logros = JSON.parse(localStorage.getItem("logros")) || [];

        if (porcentaje === 100 && !logros.includes(nombreMeta)) {
          logros.push(nombreMeta);
          localStorage.setItem("logros", JSON.stringify(logros));

          const logro = document.createElement("div");
          logro.className = "meta";
          logro.setAttribute("data-logro", nombreMeta);
          logro.innerHTML = `
          <h1 class="meta__titulo">${nombreMeta}</h1>
          <img class="imgIcono"
            src="https://static.vecteezy.com/system/resources/thumbnails/013/209/450/small/laurel-wreath-a-symbol-of-the-winner-wheat-ears-or-rice-sign-silhouette-for-logo-apps-website-pictogram-art-illustration-or-graphic-design-element-format-in-png.png"
            alt="">
        `;
          document.getElementById("contenedor-logros")?.appendChild(logro);
        }

        if (porcentaje < 100 && logros.includes(nombreMeta)) {
          logros = logros.filter(m => m !== nombreMeta);
          localStorage.setItem("logros", JSON.stringify(logros));

          document.querySelectorAll(`[data-logro="${nombreMeta}"]`).forEach(el => el.remove());
        }
      }

      function crearSubmeta(titulo, descripcion, completado = false) {
        const submeta = document.createElement("div");
        submeta.className = "submeta";
        submeta.innerHTML = `
        <input class="submeta-check" type="checkbox" ${completado ? "checked" : ""}>
        <div class="${completado ? "submeta-titulocompl" : "submeta-titulo"}">
          <span>${titulo}</span>
        </div>
        <div class="submeta-eliminar">x</div>
      `;

        const checkbox = submeta.querySelector(".submeta-check");
        const tituloDiv = submeta.querySelector(".submeta-titulo") || submeta.querySelector(".submeta-titulocompl");
        const btnEliminar = submeta.querySelector(".submeta-eliminar");

        checkbox.addEventListener("change", () => {
          tituloDiv.className = checkbox.checked ? "submeta-titulocompl" : "submeta-titulo";
          guardarSubmetas();
          actualizarProgreso();
        });

        btnEliminar.addEventListener("click", () => {
          submeta.remove();
          guardarSubmetas();
          actualizarProgreso();
        });

        contenedorSubmetas.appendChild(submeta);
      }

      function guardarSubmetas() {
        const submetas = [];
        contenedorSubmetas.querySelectorAll(".submeta").forEach((el) => {
          const titulo = el.querySelector("span").textContent;
          const completado = el.querySelector(".submeta-check").checked;
          submetas.push({ titulo, completado });
        });
        localStorage.setItem("submetas_" + metaId, JSON.stringify(submetas));
      }

      function cargarSubmetas() {
        const datos = JSON.parse(localStorage.getItem("submetas_" + metaId)) || [];
        datos.forEach(({ titulo, completado }) => {
          crearSubmeta(titulo, "", completado);
        });
        actualizarProgreso();
      }

      btnAgregarSub.addEventListener("click", () => {
        overlaySub.classList.remove("oculto");
        inputSubmeta.focus();
      });

      btnCancelarSub.addEventListener("click", () => {
        inputSubmeta.value = "";
        inputDesc.value = "";
        overlaySub.classList.add("oculto");
      });

      btnGuardarSub.addEventListener("click", () => {
        const titulo = inputSubmeta.value.trim();
        if (!titulo) return;
        crearSubmeta(titulo, inputDesc.value.trim(), false);
        guardarSubmetas();
        actualizarProgreso();
        inputSubmeta.value = "";
        inputDesc.value = "";
        overlaySub.classList.add("oculto");
      });

      cargarSubmetas();
    }

    // ========= ACTUALIZAR BARRAS EN INDEX AL CARGAR =========
    const barras = document.querySelectorAll(".barra__progreso");
    barras.forEach((barra) => {
      const id = barra.id;
      const progreso = localStorage.getItem("progreso_" + id);
      if (progreso !== null) {
        barra.style.width = `${progreso}%`;
        barra.querySelector("span").textContent = `${progreso}%`;
      }
    });




    // ========= CARGA DE LOGROS =========
    {
      const logros = JSON.parse(localStorage.getItem("logros")) || [];
      const contenedor = document.getElementById("contenedor-logros");
      if (contenedor && logros.length > 0) {
        logros.forEach((nombreMeta) => {
          const logro = document.createElement("div");
          logro.className = "meta";
          logro.setAttribute("data-logro", nombreMeta);
          logro.innerHTML = `
          <h1 class="meta__titulo">${nombreMeta}</h1>
          <img class="imgIcono"
            src="https://static.vecteezy.com/system/resources/thumbnails/013/209/450/small/laurel-wreath-a-symbol-of-the-winner-wheat-ears-or-rice-sign-silhouette-for-logo-apps-website-pictogram-art-illustration-or-graphic-design-element-format-in-png.png"
            alt="">
        `;
          contenedor.appendChild(logro);
        });
      }
    }

    // ========= TEMPORIZADOR, CRONÓMETRO Y FECHA =========
    const btnCalendario = document.getElementById("btnCalendario");
    const btnCrono = document.getElementById("btncrono");
    const btnTemporizador = document.getElementById("btnTemporizador");
    const inputFecha = document.getElementById("inputFecha");
    const divFecha = document.getElementById("fechaSeleccionada");
    const guardar = document.getElementById("guardar");

    let modoTiempo = null;
    let intervalo = null;
    let inicio = null;
    let fechaSeleccionada = null;

    function resetearTemporizador() {
      clearInterval(intervalo);
      modoTiempo = null;
      inicio = null;
      fechaSeleccionada = null;
      divFecha.textContent = "";
      divFecha.classList.remove("tiempo");
      inputFecha.value = "";
    }

    btnCalendario?.addEventListener("click", () => {
      resetearTemporizador();
      modoTiempo = "fecha";
      inputFecha?.showPicker?.() || inputFecha?.click();
    });

    btnCrono?.addEventListener("click", () => {
      resetearTemporizador();
      modoTiempo = "cronometro";
      divFecha.textContent = "00:00:00";
      divFecha.classList.add("tiempo");
    });

    btnTemporizador?.addEventListener("click", () => {
      resetearTemporizador();
      modoTiempo = "temporizador";
      inputFecha?.showPicker?.() || inputFecha?.click();
    });

    inputFecha?.addEventListener("change", () => {
      const seleccion = new Date(inputFecha.value);
      if (modoTiempo === "temporizador") {
        const ahora = new Date();
        if (seleccion <= ahora) {
          fechaSeleccionada = null;
          divFecha.textContent = "Fecha inválida";
        } else {
          fechaSeleccionada = seleccion;
          actualizarTemporizador();
        }
      } else {
        divFecha.textContent = inputFecha.value;
      }
      divFecha.classList.add("tiempo");
    });

    guardar?.addEventListener("click", () => {
      clearInterval(intervalo);

      if (modoTiempo === "cronometro") {
        inicio = Date.now();
        intervalo = setInterval(() => {
          const ahora = Date.now();
          const transcurrido = ahora - inicio;
          const segundos = Math.floor(transcurrido / 1000) % 60;
          const minutos = Math.floor(transcurrido / (1000 * 60)) % 60;
          const horas = Math.floor(transcurrido / (1000 * 60 * 60));
          divFecha.textContent = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        }, 1000);
      }

      if (modoTiempo === "temporizador" && fechaSeleccionada) {
        intervalo = setInterval(actualizarTemporizador, 1000);
      }

      // NO resetear aquí para no borrar lo iniciado
      // resetearTemporizador();
    });

    btnCancelar?.addEventListener("click", resetearTemporizador);

    function actualizarTemporizador() {
      const ahora = new Date();
      const restante = fechaSeleccionada - ahora;
      if (restante <= 0) {
        clearInterval(intervalo);
        divFecha.textContent = "¡Tiempo terminado!";
        return;
      }
      const dias = Math.floor(restante / (1000 * 60 * 60 * 24));
      const horas = Math.floor((restante / (1000 * 60 * 60)) % 24);
      const minutos = Math.floor((restante / (1000 * 60)) % 60);
      const segundos = Math.floor((restante / 1000) % 60);
      divFecha.textContent = `${dias} d ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }



    // === AUTO-INICIAR CRONÓMETRO O TEMPORIZADOR SI YA EXISTE EN LA PÁGINA ===
    const textoTiempo = document.getElementById("fechaSeleccionada");
    if (textoTiempo) {
      const tipo = textoTiempo.getAttribute("data-tipo");

      if (tipo === "cronometro") {
        let inicio = Date.now();
        setInterval(() => {
          const ahora = Date.now();
          const transcurrido = ahora - inicio;
          const segundos = Math.floor(transcurrido / 1000) % 60;
          const minutos = Math.floor(transcurrido / (1000 * 60)) % 60;
          const horas = Math.floor(transcurrido / (1000 * 60 * 60));
          textoTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        }, 1000);
      }

      if (tipo === "temporizador") {
        const fechaFinal = new Date(textoTiempo.getAttribute("data-fecha"));
        const actualizar = () => {
          const ahora = new Date();
          const restante = fechaFinal - ahora;
          if (restante <= 0) {
            textoTiempo.textContent = "¡Tiempo terminado!";
            return;
          }
          const dias = Math.floor(restante / (1000 * 60 * 60 * 24));
          const horas = Math.floor((restante / (1000 * 60 * 60)) % 24);
          const minutos = Math.floor((restante / (1000 * 60)) % 60);
          const segundos = Math.floor((restante / 1000) % 60);
          textoTiempo.textContent = `${dias} d ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        };
        actualizar();
        setInterval(actualizar, 1000);
      }
    }
  }
})

