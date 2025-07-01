// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const carpetaMetas = path.join(__dirname, 'public', 'metas');
if (!fs.existsSync(carpetaMetas)) {
  fs.mkdirSync(carpetaMetas, { recursive: true });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/crear-meta', (req, res) => {
  const { nombre, id, modoTiempo, fecha } = req.body;

  if (!nombre) return res.status(400).send('Nombre requerido');

  const nombreArchivo = nombre.trim().toLowerCase().replace(/\s+/g, '-') + '.html';
  const rutaArchivo = path.join(carpetaMetas, nombreArchivo);
  const contenedorId = id || nombre.trim().toLowerCase().replace(/\s+/g, '-');

let tiempoHTML = '';
switch (modoTiempo) {
  case 'fecha':
    tiempoHTML = `
      <div class="tiempo">
        <h1 id="fechaSeleccionada" data-tipo="fecha">${fecha || "Sin fecha"}</h1>
      </div>`;
    break;

  case 'cronometro':
    tiempoHTML = `
      <div class="tiempo">
        <h1 id="fechaSeleccionada" data-tipo="cronometro">00:00:00</h1>
      </div>`;
    break;

  case 'temporizador':
    tiempoHTML = `
      <div class="tiempo">
        <h1 id="fechaSeleccionada" data-tipo="temporizador" data-fecha="${fecha}"></h1>
      </div>`;
    break;

  default:
    tiempoHTML = `<div class="tiempo"><h1>0:00:00</h1></div>`;
}



  const contenidoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="google" content="notranslate">
  <link rel="stylesheet" href="../style.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
  <title>${nombre}</title>
         <link rel="icon" href="https://cdn.glitch.global/563bf8cf-1718-42f4-8799-3ca50c3d64c2/steponelogo.png?v=1750957997438">

</head>
<header>
    <a style="text-decoration: none;" href="../index.html">
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" class="bi bi-x-lg" viewBox="0 0 16 16">
        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
      </svg>
    </a>
    <a href="../logros.html">
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" class="bi bi-list" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
      </svg>
    </a>
  </header>
<body data-meta-id="${contenedorId}">

  ${tiempoHTML}

  <div class="meta">
    <h1 class="meta__titulo">${nombre}</h1>
    <div class="barra">
      <div id="barra${contenedorId}" class="barra__progreso"><span>0%</span></div>
    </div>
  </div>

<section>
  <div id="contenedor-submetas${contenedorId}" class="contenedor-submetas"></div>
  <div id="agrsubmeta" class="agregar"><span> + </span></div>
  <div id="overlaySub" class="overlay oculto">
    <div class="agregarmeta">
      <input id="inpSubmeta" placeholder="Sub meta" type="text" class="agregarmeta-inp" />
      <textarea id="descripcion" class="descripcion" rows="4" cols="50" placeholder="Escribe aquí la descripción..."></textarea>
      <div class="botones">
        <div id="guardarSub" class="btn">Guardar</div>
        <div id="cancelarSub" class="btn rojo">Cancelar</div>
      </div>
    </div>
  </div>
</section>

  <script src="../js.js"></script>
</body>
</html>
`;

  fs.writeFile(rutaArchivo, contenidoHTML, (err) => {
    if (err) return res.status(500).send('Error al crear archivo');

    console.log('✅ Archivo creado con contenido:');
    console.log(contenidoHTML);

    res.send('Página creada correctamente');
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
