//VARIABLES
//let contenedorJuegos = document.getElementById("juegos-container");

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

//FUNCION PARA MAPEAR JUEGOS EN HTML
function mapearDatos(juegos) {
  juegos.map((juego, id) => {
    console.log(juego.title);
  });
}

//FUNCION PARA CARGAR DATOS DE JUEGOS
async function cargarJuegos() {
  let juegos = await obtenerJuegos();
  mapearDatos(juegos);
}

cargarJuegos();
