function generarTabla() {
    var cantidad = parseInt(document.getElementById("cantidad-actividades").value);
    var tabla = document.getElementById("tabla-actividades");

    // Limpiar contenido previo
    tabla.innerHTML = "";

    // Crear encabezado de la tabla
    var encabezado = "<div class='tabla-encabezado'><h3>Actividad</h3><h3>Actividades precedentes</h3><h3>Tiempo optimista</h3><h3>Tiempo más probable</h3><h3>Tiempo pesimista</h3></div>";
    tabla.innerHTML += encabezado;

    // Crear filas de actividades
    for (var i = 0; i < cantidad; i++) {
        var fila = "<div class='fila-actividad' id=" + (i + 1) + "><p>Actividad " + (i + 1) + "</p><input type='text' placeholder='Actividades precedentes' value='1'><input type='number' placeholder='Tiempo optimista' value='1'><input type='number' placeholder='Tiempo más probable' value='1'><input type='number' placeholder='Tiempo pesimista' value='1'></div>";
        tabla.innerHTML += fila;
    }

    // Agregar botón "Calcular PERT"
    tabla.innerHTML += "<div id='calcular - pert'><button onclick = 'calcularPERT()'> Calcular PERT</button></div >";
}

function calcularPERT() {
    var tabla = document.getElementById("tabla-actividades");
    var filasActividad = tabla.querySelectorAll(".fila-actividad");

    // Array para almacenar la información de las actividades
    var actividades = [];

    // Recorrer las filas de actividad
    filasActividad.forEach(function(fila) {
        var actividad = {};

        // Obtener los valores de los campos de entrada
        // actividad.nombre = fila.childNodes[0].value;
        actividad.precedentes = fila.childNodes[1].value;
        actividad.optimista = parseFloat(fila.childNodes[2].value);
        actividad.masProbable = parseFloat(fila.childNodes[3].value);
        actividad.pesimista = parseFloat(fila.childNodes[4].value);

        // Agregar la actividad al array
        actividades.push(actividad);
    });

    console.log("Actividades:",actividades);

    // Limpiar contenido
    tabla.innerHTML = "";

    // Llamar a la función "prob_pert" pasándole el array de actividades
    // prob_pert(actividades);
}
