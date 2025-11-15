//VARIABLES
let contenedorJuegos = document.getElementById("juegos-container");
let linkTienda = "https://www.cheapshark.com/redirect?dealID=";
let botonVerMasDeals = document.getElementById("botonVerDeals");
let botonVerMasGames = document.getElementById("botonVerGames");
let inputNombre = document.getElementById("nombre");
let botonBuscar = document.getElementById("botonBuscar");
let botonLimpiar = document.getElementById("botonLimpiar");
let paginaActual = 1;
let limite = 12;
let validacionResultados;

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
  try {
    const respuesta = await fetch(
      "https://www.cheapshark.com/api/1.0/deals?pageSize=12"
    );
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}

/***********FUNCION CREAR TARJETA EN HTML*************/
function crearTarjetas(juego, esDeal) {
  //VARIABLES DINAMICAS DE FETCH
  let tituloJuego = esDeal ? juego.title : juego.external;
  let precioNormalJuego = juego.normalPrice;
  let precioDescuentoJuego = esDeal ? juego.salePrice : juego.cheapest;
  let enlaceJuego = esDeal ? juego.dealID : juego.cheapestDealID;

  //CREACION ELEMENTOS HTML
  let tarjeta = document.createElement("section");
  let img = document.createElement("img");
  let texto = document.createElement("div");
  let titulo = document.createElement("h2");
  let preciosContainer = document.createElement("div");
  let containerPrecioNormal = document.createElement("div");
  let containerPrecioDescuento = document.createElement("div");
  let precioNormalTitulo = document.createElement("h3");
  let precioDescuentoTitulo = document.createElement("h3");
  let precioNormal = document.createElement("p");
  let precioDescuento = document.createElement("p");
  let enlace = document.createElement("a");
  let precioBaratoContainer = document.createElement("div");
  let precioBaratoTitulo = document.createElement("h3");

  //ASIGNAR VALORES A LOS TEXTOS
  titulo.textContent = tituloJuego;
  precioNormal.textContent = precioNormalJuego;
  precioDescuento.textContent = precioDescuentoJuego;
  enlace.textContent = "Ir a tienda";
  img.alt = tituloJuego;
  precioDescuentoTitulo.textContent = "Precio en Descuento";
  precioNormalTitulo.textContent = "Precio Normal";
  precioBaratoTitulo.textContent = "Precio más barato";
  //ASIGNAR DIRECCIONES A IMG Y A
  enlace.href = linkTienda + enlaceJuego;
  img.src = juego.thumb;
  enlace.target = "blank";

  //APPEND
  texto.appendChild(titulo);
  texto.appendChild(preciosContainer);
  texto.appendChild(enlace);
  tarjeta.appendChild(img);
  tarjeta.appendChild(texto);

  //APPEND DINAMICO ENTRE DEALS Y GAMES
  if (esDeal) {
    preciosContainer.appendChild(containerPrecioNormal);
    preciosContainer.appendChild(containerPrecioDescuento);
    containerPrecioNormal.appendChild(precioNormalTitulo);
    containerPrecioNormal.appendChild(precioNormal);
    containerPrecioDescuento.appendChild(precioDescuentoTitulo);
    containerPrecioDescuento.appendChild(precioDescuento);
  } else {
    preciosContainer.appendChild(precioBaratoContainer);
    precioBaratoContainer.appendChild(precioBaratoTitulo);
    precioBaratoContainer.appendChild(precioDescuento);
  }

  return tarjeta;
}

//FUNCION PARA INSERTAR JUEGOS EN HTML
function insertarJuegos(juegos) {
  contenedorJuegos.replaceChildren();

  juegos.forEach((juego) => {
    const tarjeta = crearTarjetas(juego, true);
    contenedorJuegos.appendChild(tarjeta);
  });
}

//FUNCION PARA CARGAR DATOS DE JUEGOS
async function cargarJuegos() {
  paginaActual = 1;

  let juegos = await obtenerJuegos();

  // Mostrar botón de deals, ocultar de games
  botonVerMasDeals.style.display = "block";
  botonVerMasGames.style.display = "none";

  insertarJuegos(juegos);
}

/************** FUNCION DE BUSQUEDA *************************/
//FETCH DE URL BUSQUEDA
async function buscarJuegos() {
  try {
    let respuestaUsuario = inputNombre.value.trim().toLowerCase();

    const respuesta = await fetch(
      `https://www.cheapshark.com/api/1.0/games?title=${respuestaUsuario}&limit=${limite}`
    );
    const datos = await respuesta.json();
    return datos;
  } catch (error) {}
}

//INSERTAR DATOS BUSQUEDA EN EL HTML
function insertarJuegosBuscados(juegoBuscados) {
  contenedorJuegos.replaceChildren();

  if (!juegoBuscados || juegoBuscados.length === 0) {
    contenedorJuegos.textContent = "Sin resultados";
    return;
  }

  juegoBuscados.forEach((juegoBuscado) => {
    const tarjeta = crearTarjetas(juegoBuscado, false);
    contenedorJuegos.appendChild(tarjeta);
  });
}

//CARGAR BUSQUEDA
async function cargarBuscados() {
  let juegosBuscados = await buscarJuegos();
  limite = 12;

  // Mostrar botón de Games
  botonVerMasDeals.style.display = "none";
  botonVerMasGames.style.display = "block";

  //RESETEO DE VARIABLE DE VALIDACION DE VER MAS
  validacionResultados = juegosBuscados ? juegosBuscados.length : 0;

  insertarJuegosBuscados(juegosBuscados);
}

//CARGAR MAS RESULTADOS
async function cargarMasDeals() {
  paginaActual++;

  const respuesta = await fetch(
    `https://www.cheapshark.com/api/1.0/deals?pageSize=12&pageNumber=${paginaActual}`
  );
  const datos = await respuesta.json();

  // Agregar sin limpiar
  datos.forEach((juego) => {
    const tarjeta = crearTarjetas(juego, true);
    contenedorJuegos.appendChild(tarjeta);
  });
}

async function cargarMasGames() {
  limite += 12;

  let juegosBuscados = await buscarJuegos();
  let mensaje = document.createElement("p");
  let cantidadJuegosActual = juegosBuscados ? juegosBuscados.length : 0;

  if (cantidadJuegosActual === validacionResultados) {
    botonVerMasGames.style.display = "none";
    console.log("No hay más resultados");
    mensaje.textContent = "No resultados";
    contenedorJuegos.parentElement.appendChild(mensaje);
    return;
  }

  validacionResultados = cantidadJuegosActual;
  insertarJuegosBuscados(juegosBuscados);
}

/************ EVENT LISTENERS ************/
//BOTONES DE VER MAS
botonVerMasDeals.addEventListener("click", cargarMasDeals);
botonVerMasGames.addEventListener("click", cargarMasGames);

//BOTONES DE BUSCAR
botonBuscar.addEventListener("click", cargarBuscados);

botonLimpiar.addEventListener("click", () => {
  inputNombre.value = "";
  cargarJuegos();
});

//CARGA DE JUEGOS AL INICIAR
cargarJuegos();
