/************************
 * VARIABLES
 * **********************/
//VARIABLES DE ELEMENTOS HTML
let contenedorJuegos = document.getElementById("juegos-container");
let modalContainer = document.getElementById("modalContainer");
let botonVerMasDeals = document.getElementById("botonVerDeals");
let botonVerMasGames = document.getElementById("botonVerGames");
let inputNombre = document.getElementById("nombre");
let botonBuscar = document.getElementById("botonBuscar");
let botonLimpiar = document.getElementById("botonLimpiar");
let criterio = document.getElementById("selectPrecio");
let botonCerrarModal = document.getElementById("modalCloseBtn");
const selectTienda = document.getElementById("selectTienda");
//VARIABLES DE ESTADO
let paginaActual = 1;
let limite = 12;
let validacionResultados;
let juegosActuales = [];
//VARAIBLES DE LINKS
let linkTienda = "https://www.cheapshark.com/redirect?dealID=";
/*********************************************************** */

// addEventListener: cerrar el modal cuando se presione el botón global
if (botonCerrarModal) {
  botonCerrarModal.addEventListener("click", () => {
    // Buscar y remover sólo el modal (no el botón que vive en el contenedor)
    const modalAbierto = modalContainer.querySelector(".modal");
    if (modalAbierto) modalAbierto.remove();
    // Ocultar el contenedor y el botón
    modalContainer.style.display = "none";
    botonCerrarModal.hidden = true;
  });
}

//SELECT DE TIENDAS

//FUNCION PARA OBTENER TIENDAS Y POBLAR SELECT
async function poblarSelectTiendas() {
  try {
    const respuesta = await fetch("https://www.cheapshark.com/api/1.0/stores");
    const tiendas = await respuesta.json();
    tiendas.forEach((tienda) => {
      const option = document.createElement("option");
      option.value = tienda.storeID;
      option.textContent = tienda.storeName;
      selectTienda.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar tiendas:", error);
  }
}

//LLAMAR AL INICIAR

//SPINNER OVERLAY Y ERROR
const spinnerOverlay = document.getElementById("spinner-overlay"); //Overlay centrado
const spinnerError = document.getElementById("spinner-error"); //Mensaje de error

//FUNCION MOSTRAR SPINNER
//FUNCION MOSTRAR SPINNER (mantener visible mínimo 3 segundos)
let spinnerMinTimeout;
function mostrarSpinner() {
  spinnerOverlay.classList.remove("hidden");
  spinnerError.classList.add("hidden");
  spinnerError.textContent = "";
  // Inicia temporizador mínimo
  spinnerMinTimeout = Date.now();
}

//FUNCION OCULTAR SPINNER
//FUNCION OCULTAR SPINNER (espera mínimo 3 segundos)
function ocultarSpinner() {
  const elapsed = Date.now() - spinnerMinTimeout;
  const minTime = 3000;
  if (elapsed < minTime) {
    setTimeout(() => {
      spinnerOverlay.classList.add("hidden");
      spinnerError.classList.add("hidden");
      spinnerError.textContent = "";
    }, minTime - elapsed);
  } else {
    spinnerOverlay.classList.add("hidden");
    spinnerError.classList.add("hidden");
    spinnerError.textContent = "";
  }
}

//FUNCION MOSTRAR ERROR EN SPINNER
function mostrarErrorSpinner(mensaje) {
  spinnerOverlay.classList.remove("hidden");
  spinnerError.classList.remove("hidden");
  spinnerError.textContent = mensaje;
}

//GESTION BOTON DE BUSCAR
botonBuscar.disabled = true;

inputNombre.addEventListener("input", () => {
  if (inputNombre.value.trim().toLowerCase().length > 0) {
    botonBuscar.disabled = false;
  } else {
    botonBuscar.disabled = true;
  }
});

//FETCH DE 12 VIDEOJUEGOS
async function obtenerJuegos() {
  //SPINNER CARGA INICIAL
  mostrarSpinner();
  try {
    const respuesta = await fetch(
      "https://www.cheapshark.com/api/1.0/deals?pageSize=12"
    );
    const datos = await respuesta.json();
    ocultarSpinner();
    return datos;
  } catch (error) {
    mostrarErrorSpinner("Error al cargar los juegos. Intenta de nuevo.");
    setTimeout(ocultarSpinner, 2500);
    console.error(error);
    return [];
  }
}

/***********FUNCION CREAR TARJETA EN HTML*************/

// FUNCION PARA CREAR EL MODAL DE DETALLE USANDO SOLO createElement Y ORDEN LÓGICO
function crearModal(juego, esDeal) {
  // 1. CREACION DE VARIABLES
  const tituloJuego = esDeal ? juego.title : juego.external;
  const precioNormalJuego = juego.normalPrice;
  const precioDescuentoJuego = esDeal ? juego.salePrice : juego.cheapest;
  const enlaceJuego = esDeal ? juego.dealID : juego.cheapestDealID;
  const imagenJuego = juego.thumb;

  // 2. CREACION DE ELEMENTOS
  const modal = document.createElement("div");
  const modalContent = document.createElement("div");
  const titulo = document.createElement("h2");
  const img = document.createElement("img");
  const precioNormal = document.createElement("p");
  const precioDescuento = document.createElement("p");
  const link = document.createElement("a");

  // 3. ASIGNACION DE VALORES
  titulo.textContent = tituloJuego;
  img.src = imagenJuego;
  img.alt = tituloJuego;
  precioNormal.textContent = `Precio Normal: ${precioNormalJuego}`;
  precioDescuento.textContent = `Precio en Oferta: ${precioDescuentoJuego}`;
  link.textContent = "Ir a tienda";
  link.href = linkTienda + enlaceJuego;
  link.target = "_blank";

  // 4. ASIGNACION DE ESTILOS
  modal.className = "modal";

  // 5. ASIGNACION DE EVENTOS
  // Cerrar al hacer click fuera del modalContent
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      // Remover el modal y ocultar el contenedor y el botón
      modal.remove();
      if (botonCerrarModal) botonCerrarModal.hidden = true;
      modalContainer.style.display = "none";
    }
  });

  // 6. ARMADO DEL MODAL
  modalContent.appendChild(titulo);
  modalContent.appendChild(img);
  modalContent.appendChild(precioNormal);
  modalContent.appendChild(precioDescuento);
  modalContent.appendChild(link);
  modal.appendChild(modalContent);

  // 7. AGREGAR MODAL AL modalContainer
  modalContainer.appendChild(modal);

  // Mostrar el contenedor y el botón global de cerrar cuando el modal está abierto
  modalContainer.style.display = "flex";
  if (botonCerrarModal) botonCerrarModal.hidden = false;
}

//FUNCION CREAR TARJETA PRINCIPAL

// FUNCION PARA CREAR UNA TARJETA DE JUEGO DE FORMA ORDENADA Y LÓGICA
function crearTarjeta(juego, esDeal) {
  // 1. CREACION DE VARIABLES
  const tituloJuego = esDeal ? juego.title : juego.external;
  const imagenJuego = juego.thumb;

  // 2. CREACION DE ELEMENTOS
  const tarjeta = document.createElement("section");
  const img = document.createElement("img");
  const titulo = document.createElement("h2");
  const boton = document.createElement("button");

  // 3. ASIGNACION DE VALORES
  img.src = imagenJuego;
  img.alt = tituloJuego;
  titulo.textContent = tituloJuego;
  boton.textContent = "Ver detalle";

  // 4. ASIGNACION DE ESTILOS
  tarjeta.className =
    "flex flex-col items-center border rounded-lg p-4 m-2 bg-white shadow";
  img.className = "w-32 h-32 object-contain mb-2";
  titulo.className = "text-lg font-bold mb-2 text-center";
  boton.className =
    "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition";

  // 5. ASIGNACION DE EVENTOS
  boton.addEventListener("click", function () {
    crearModal(juego, esDeal);
  });

  // 6. ARMADO DE LA TARJETA
  tarjeta.appendChild(img);
  tarjeta.appendChild(titulo);
  tarjeta.appendChild(boton);

  // 7. RETORNO DEL ELEMENTO
  return tarjeta;
}

//FUNCION PARA INSERTAR JUEGOS EN HTML
function insertarJuegos(juegos) {
  //LIMPIAR HTML CONTENEDOR
  contenedorJuegos.replaceChildren();
  //OBTENER VALOR DE SELECT ACTUALIZADO
  let valorSelect = criterio.value;
  let tiendaSeleccionada = selectTienda.value;
  //FILTRAR POR TIENDA SI SE SELECCIONA UNA
  let juegosFiltrados = tiendaSeleccionada
    ? juegos.filter((j) => j.storeID == tiendaSeleccionada)
    : juegos;
  //ORDENAR JUEGOS
  const juegosOrdenados = ordenarJuegos(juegosFiltrados, valorSelect);
  //LOG DEL ARREGLO
  console.log(juegosOrdenados);
  //SI NO HAY JUEGOS, MOSTRAR MENSAJE
  if (juegosOrdenados.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.textContent = "Sin juegos encontrados";
    mensaje.className = "text-center text-gray-500 mt-4";
    contenedorJuegos.appendChild(mensaje);
    return;
  }
  //CREAR TARJETAS PRINCIPALES
  juegosOrdenados.forEach((juego) => {
    const tarjeta = crearTarjeta(juego, true);
    contenedorJuegos.appendChild(tarjeta);
  });
}

//FUNCION PARA CARGAR DATOS DE JUEGOS
async function cargarJuegos() {
  paginaActual = 1;
  mostrarSpinner();
  let juegos = await obtenerJuegos();
  // Mostrar botón de deals, ocultar de games
  botonVerMasDeals.style.display = "block";
  botonVerMasGames.style.display = "none";
  setTimeout(() => {
    ocultarSpinner();
    insertarJuegos(juegos);
  }, 2000);
}

/************** FUNCION DE BUSQUEDA *************************/
//FETCH DE URL BUSQUEDA
async function buscarJuegos() {
  //SPINNER BUSQUEDA
  mostrarSpinner();
  try {
    let respuestaUsuario = inputNombre.value.trim().toLowerCase();
    const respuesta = await fetch(
      `https://www.cheapshark.com/api/1.0/games?title=${respuestaUsuario}&limit=${limite}`
    );
    const datos = await respuesta.json();
    ocultarSpinner();
    return datos;
  } catch (error) {
    mostrarErrorSpinner("Error al buscar juegos. Intenta de nuevo.");
    setTimeout(ocultarSpinner, 2500);
    console.error(error);
    return [];
  }
}

//INSERTAR DATOS BUSQUEDA EN EL HTML
function insertarJuegosBuscados(juegoBuscados) {
  //LIMPIAR CONTENEDOR HTML
  contenedorJuegos.replaceChildren();

  //REVISAR SI SE DEVUELVE UN ARRAY VACIO
  if (!juegoBuscados || juegoBuscados.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.textContent = "Sin juegos encontrados";
    mensaje.className = "text-center text-gray-500 mt-4";
    contenedorJuegos.appendChild(mensaje);
    return;
  }

  //OBTENER VALOR ACTUALIZADOS DEL SELECT
  const valorSelect = criterio.value;
  let tiendaSeleccionada = selectTienda.value;
  //FILTRAR POR TIENDA SI SE SELECCIONA UNA
  let juegosFiltrados = tiendaSeleccionada
    ? juegoBuscados.filter((j) => j.storeID == tiendaSeleccionada)
    : juegoBuscados;
  //ORDENAR JUEGOS
  let juegosOrdenados = ordenarJuegos(juegosFiltrados, valorSelect);

  //LOG DEL ARREGLO
  console.log(juegosOrdenados);
  //SI NO HAY JUEGOS, MOSTRAR MENSAJE
  if (juegosOrdenados.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.textContent = "Sin juegos encontrados";
    mensaje.className = "text-center text-gray-500 mt-4";
    contenedorJuegos.appendChild(mensaje);
    return;
  }
  //CREAR TARJETAS PRINCIPALES
  juegosOrdenados.forEach((juegoBuscado) => {
    const tarjeta = crearTarjeta(juegoBuscado, false);
    contenedorJuegos.appendChild(tarjeta);
  });
}

//CARGAR BUSQUEDA
async function cargarBuscados() {
  mostrarSpinner();
  let juegosBuscados = await buscarJuegos();
  limite = 12;
  // Mostrar botón de Games
  botonVerMasDeals.style.display = "none";
  botonVerMasGames.style.display = "block";
  //RESETEO DE VARIABLE DE VALIDACION DE VER MAS
  validacionResultados = juegosBuscados ? juegosBuscados.length : 0;
  setTimeout(() => {
    ocultarSpinner();
    insertarJuegosBuscados(juegosBuscados);
  }, 2000);
}

/***********
 * ORDENAMIENTO POR PRECIOS
 ***********/
function ordenarJuegos(juegos, criterio) {
  //CREAR COPIA DE ARRAY ORIGINAL
  if (!criterio) return juegos.slice();

  //APLICAR FILTROS CON SORT
  return juegos.slice().sort((a, b) => {
    const parseSafe = (v) => {
      const n = parseFloat(v);
      return Number.isNaN(n) ? Infinity : n;
    };
    const precioA =
      criterio === "normal"
        ? parseSafe(a.normalPrice ?? a.cheapest)
        : parseSafe(a.salePrice ?? a.cheapest);
    const precioB =
      criterio === "normal"
        ? parseSafe(b.normalPrice ?? b.cheapest)
        : parseSafe(b.salePrice ?? b.cheapest);
    return precioA - precioB;
  });
}
/***************************************** */

/******************************************
 * FUNCIONES DE CARGAR ELEMENTOS CON BOTON VER MAS
 ******************************************/
//CARGAR MAS RESULTADOS DEALS
async function cargarMasDeals() {
  //SPINNER VER MAS DEALS
  mostrarSpinner();
  try {
    //AUMENTAR 1 A VARIABLE GLOBAL DE PAGINA
    paginaActual++;

    //FETCH A ENDPOINT DE DEALS PAGINADO
    const respuesta = await fetch(
      `https://www.cheapshark.com/api/1.0/deals?pageSize=12&pageNumber=${paginaActual}`
    );
    const datos = await respuesta.json();

    //SUMAR ARRAY NUEVO CON EL ARRAY VIEJO DE JUEGOS
    juegosActuales = juegosActuales.concat(datos);

    //MOSTRAR EL SPINNER 2SG, ORDENAR JUEGOS Y MOSTRARLOS
    setTimeout(() => {
      ocultarSpinner();
      insertarJuegos(juegosActuales);
    }, 2000);
  } catch (error) {
    mostrarErrorSpinner("Error al cargar más juegos");
    //OCULTARA EL SPINNER EN CASO DE ERROR
    setTimeout(ocultarSpinner, 2500);
    console.error(error);
  }
}
//CARGAR MAS RESULTADOS DE ENDPOINT GAMES
async function cargarMasGames() {
  //SPINNER VER MAS GAMES
  mostrarSpinner();
  try {
    //AUMENTAR 12 JUEGOS AL LIMITE ORIGINAL DE LA VARIABLE GLOBAL
    limite += 12;

    //USAR EL FETCH A ENDPOINT BUSCAR JUEGOS
    let juegosBuscados = await buscarJuegos();

    //CREAR MENSAJE DE LIMITE ALCANZADO
    let mensaje = document.createElement("p");
    let cantidadJuegosActual = juegosBuscados ? juegosBuscados.length : 0;

    //SI LA CANTIDAD ACTUAL ES IGUAL AL ARRAY RECIBIDA YA NO HABRA MAS JUEGOS
    if (cantidadJuegosActual === validacionResultados) {
      botonVerMasGames.style.display = "none";
      console.log("No hay más resultados");
      mensaje.textContent = "No resultados";
      contenedorJuegos.parentElement.appendChild(mensaje);
      ocultarSpinner();
      return;
    }
    validacionResultados = cantidadJuegosActual;

    //MOSTRAR SPINNER 2SG, ORDENAR E INSERTAR RESULTADOS AL HTML
    setTimeout(() => {
      ocultarSpinner();
      insertarJuegosBuscados(juegosBuscados);
    }, 2000);
  } catch (error) {
    mostrarErrorSpinner("Error al cargar más juegos buscados.");
    setTimeout(ocultarSpinner, 2500);
    console.error(error);
  }
}
/*************************************************************** */

/**************
 * EVENT LISTENERS
 *************/
//BOTONES DE VER MAS
botonVerMasDeals.addEventListener("click", cargarMasDeals);
botonVerMasGames.addEventListener("click", cargarMasGames);

//BOTONES DE BUSCAR
botonBuscar.addEventListener("click", cargarBuscados);

//EVENTO SELECT FILTRADO POR TIENDA
selectTienda.addEventListener("change", () => {
  if (inputNombre.value.trim().length > 0) {
    buscarJuegos().then(insertarJuegosBuscados);
  } else {
    obtenerJuegos().then(insertarJuegos);
  }
});

//EVENTO DE ESCUCHAR CAMBIOS EN EL SELECT DE PRECIOS
criterio.addEventListener("change", () => {
  //REVISA SI LOS JUEGOS CARGADOS SON DE BUSQUEDA O NORMALES
  if (inputNombre.value.trim().length > 0) {
    buscarJuegos().then(insertarJuegosBuscados);
  } else {
    obtenerJuegos().then(insertarJuegos);
  }
});

//BOTON LIMPIA BUSQUEDA
botonLimpiar.addEventListener("click", () => {
  //RESETEAR NOMBRE
  inputNombre.value = "";
  //RESETEAR PRECIO
  criterio.value = "";
  //RESETEAR TIENDA
  selectTienda.value = "";
  cargarJuegos();
});
/********************************************** */

/******************************************
 *CARGA DE JUEGOS Y TIENDAS AL INICIAR WEB
 ******************************************/
cargarJuegos();
poblarSelectTiendas();
