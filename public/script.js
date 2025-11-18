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
const spinnerOverlay = document.getElementById("spinner-overlay");
const spinnerError = document.getElementById("spinner-error");
//VARIABLES DE ESTADO
let paginaActual = 1;
let limite = 12;
let validacionResultados;
let juegosActuales = [];
//VARAIBLES DE LINKS
let linkTienda = "https://www.cheapshark.com/redirect?dealID=";
//GESTION BOTON DE BUSCAR
botonBuscar.disabled = true;
/*********************************************************** */

/*********************************
 * FUNCIONES DE SPINNER
 *********************************/
//FUNCION MOSTRAR SPINNER
let spinnerMinTimeout;
function mostrarSpinner() {
  //QUITAR CLASE QUE OCULATABA SPINNER
  spinnerOverlay.classList.remove("hidden");
  //OCULTAR MENSAJE DE ERROR
  spinnerError.classList.add("hidden");
  spinnerError.textContent = "";
}

//FUNCION OCULTAR SPINNER
function ocultarSpinner() {
  setTimeout(() => {
    spinnerOverlay.classList.add("hidden");
    spinnerError.classList.add("hidden");
    spinnerError.textContent = "";
  }, 2000);
}

//FUNCION MOSTRAR ERROR EN SPINNER
function mostrarErrorSpinner(mensaje) {
  spinnerOverlay.classList.remove("hidden");
  spinnerError.classList.remove("hidden");
  spinnerError.textContent = mensaje;
}
/******************************************* */

/*********************************
 * FUNCIONES DE FETCH
 *********************************/
//FETCH DE 12 VIDEOJUEGOS
async function obtenerJuegos() {
  //SPINNER CARGA INICIAL
  mostrarSpinner();
  try {
    const respuesta = await fetch(
      "https://www.cheapshark.com/api/1.0/deals?pageSize=12"
    );
    const datos = await respuesta.json();
    //OCULTAR SPINEER DESPUES DE QUE SE HAYAN OBTENIDO LOS DATOS
    ocultarSpinner();
    return datos;
  } catch (error) {
    mostrarErrorSpinner("Error al cargar los juegos");
    setTimeout(ocultarSpinner, 2500);
    console.error(error);
    return [];
  }
}

//FUNCION PARA HACER FETCHS DE TIENDAS PARA EL SELECT
async function poblarSelectTiendas() {
  try {
    const respuesta = await fetch("https://www.cheapshark.com/api/1.0/stores");
    const tiendas = await respuesta.json();

    //POBLAR SELECT CON LOS DATOS OBTENIDOS DEL FECTH
    tiendas.forEach((tienda) => {
      const option = document.createElement("option");
      option.value = tienda.storeID;
      option.textContent = tienda.storeName;
      selectTienda.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
}

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
    mostrarErrorSpinner("Error al buscar juegos.");
    setTimeout(ocultarSpinner, 2500);
    console.error(error);
    return [];
  }
}

/********************************** */

/*********************************
 * FUNCION CREAR ELEMENTOS EN HTML
 * *******************************/
// FUNCION PARA CREAR EL MODAL
function crearModal(juego, esDeal) {
  // CREACION DE VARIABLES PARA DIFERENCIAR ENDPOINTS
  const tituloJuego = esDeal ? juego.title : juego.external;
  const precioNormalJuego = juego.normalPrice;
  const precioDescuentoJuego = esDeal ? juego.salePrice : juego.cheapest;
  const enlaceJuego = esDeal ? juego.dealID : juego.cheapestDealID;
  const imagenJuego = juego.thumb;

  //LIMPIAR CUALQUIER MODAL PREVIO ANTES DE CREAR EL NUEVO
  const modalesExistentes = modalContainer.querySelectorAll(".modal");
  modalesExistentes.forEach((m) => m.remove());

  //CREACION DE ELEMENTOS HTML
  const modal = document.createElement("div");
  const modalContent = document.createElement("div");
  const titulo = document.createElement("h2");
  const img = document.createElement("img");
  const precioNormal = document.createElement("p");
  const precioDescuento = document.createElement("p");
  const link = document.createElement("a");

  // ASIGNACION DE VALORES A ELEMENTOS
  titulo.textContent = tituloJuego;
  img.src = imagenJuego;
  img.alt = tituloJuego;
  precioNormal.textContent = `Precio Normal: ${precioNormalJuego}`;
  precioDescuento.textContent = `Precio en Oferta: ${precioDescuentoJuego}`;
  link.textContent = "Ir a tienda";
  link.href = linkTienda + enlaceJuego;
  link.target = "_blank";

  // ASIGNACION DE ESTILOS
  modal.className =
    "w-[90%] max-w-[400px] flex flex-col flex-nowrap justify-center items-center bg-[rgb(37,132,255)] h-[90%] max-h-[400px] rounded-[20px] text-center text-white font-bold modal";
  img.className =
    "w-full object-contain bg-orange-500 rounded-[20px] h-[200px] my-[10px]";
  modalContent.className =
    "w-full h-full flex flex-col flex-nowrap justify-around items-center p-5";
  link.className =
    "bg-orange-500 text-white p-[10px] text-[18px] rounded-[10px] cursor-pointer mt-3";

  //APPEND DE ELEMENTOS AL MODAL
  modalContent.appendChild(titulo);
  modalContent.appendChild(img);
  modalContent.appendChild(precioNormal);
  modalContent.appendChild(precioDescuento);
  modalContent.appendChild(link);
  modal.appendChild(modalContent);

  //AGREGAR MODAL AL CONTENEDOR
  modalContainer.appendChild(modal);

  //CUANDO SE MUESTRA EL MODAL SE DAN ESTILOS AL CONTENEDOR
  modalContainer.classList.remove("hidden");
  modalContainer.classList.add("flex");
  if (botonCerrarModal) botonCerrarModal.hidden = false;
}

// FUNCION PARA CREAR LAS TARJETAS DE JUEGOS
function crearTarjeta(juego, esDeal) {
  //CREACION DE VARIABLES PARA LOS DOS ENDPOINTS
  const tituloJuego = esDeal ? juego.title : juego.external;
  const imagenJuego = juego.thumb;

  //CREACION DE ELEMENTOS HTML
  const tarjeta = document.createElement("section");
  const img = document.createElement("img");
  const titulo = document.createElement("h2");
  const boton = document.createElement("button");

  //ASIGNACION DE VALORES A ELEMENTOS
  img.src = imagenJuego;
  img.alt = tituloJuego;
  titulo.textContent = tituloJuego;
  boton.textContent = "Ver detalle";

  //ASIGNACION DE ESTILOS
  tarjeta.className =
    "bg-[rgb(12,101,235)] rounded-[10px] flex flex-col flex-nowrap items-center justify-start text-center gap-[10px]";
  img.className = "bg-[rgb(209,153,0)] h-[60%] object-contain w-full";
  titulo.className = "text-white font-bold mt-3";
  boton.className =
    "bg-[rgb(209,153,0)] text-white p-[10px] rounded-xl cursor-pointer mt-auto w-[80%] mb-2 font-bold";

  //ASIGNACION DE EVENTOS PARA MOSTRAR MODAL
  boton.addEventListener("click", function () {
    crearModal(juego, esDeal);
  });

  // APPEND DE ELEMENTO A TARJETA DE JUEGO
  tarjeta.appendChild(img);
  tarjeta.appendChild(titulo);
  tarjeta.appendChild(boton);

  //RETORNAR TARJETA
  return tarjeta;
}
/********************************************** */

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

    //REEMPLAZAR EL ARRAY DE JUEGOS CON LOS NUEVOS DATOS
    juegosActuales = datos;

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

// CERRAR EL MODAL
if (botonCerrarModal) {
  botonCerrarModal.addEventListener("click", () => {
    // CERRAR EL MODAL AL HACER CLICK EN BOTON X DEL CONTENEDOR
    const modalesAbiertos = modalContainer.querySelectorAll(".modal");
    modalesAbiertos.forEach((m) => m.remove());
    // OCULTAR CONTENEDOR Y BOTON
    modalContainer.classList.remove("flex");
    modalContainer.classList.add("hidden");
  });
}

//EVENTO PARA ACTIVAR BOTON DE BUSQUEDA
inputNombre.addEventListener("input", () => {
  //SI HAY MAS DE UNA LETRA EN EL INPUT NOMBRE SE ACTIVA EL BOTON
  if (inputNombre.value.trim().toLowerCase().length > 0) {
    botonBuscar.disabled = false;
  } else {
    botonBuscar.disabled = true;
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
