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
        var fila = "<div class='fila-actividad'><p  id=" + (i + 1) + ">Actividad " + (i + 1) + "</p><input type='text' placeholder='Actividades precedentes' value='1'><input type='number' placeholder='Tiempo optimista' value='1'><input type='number' placeholder='Tiempo más probable' value='1'><input type='number' placeholder='Tiempo pesimista' value='1'></div>";
        tabla.innerHTML += fila;
    }

    // Agregar botón "Calcular PERT"
    tabla.innerHTML += "<div id='calcular - pert'><button onclick = 'calcularPERT()'> Calcular PERT</button></div >";
}

function calcularPERT() {
    var tabla = document.getElementById("tabla-actividades");
    var filasActividad = tabla.querySelectorAll(".fila-actividad");

    // Objeto para almacenar las actividades como un grafo
    var grafo = {};

    // Recorrer las filas de actividad
    filasActividad.forEach(function(fila) {
        var actividad = {};

        // Obtener los valores de los campos de entrada
        actividad.id = fila.childNodes[0].id;
        if (fila.childNodes[1].value === '') actividad.precedentes = null;
        else actividad.precedentes = fila.childNodes[1].value.split(",");
        actividad.optimista = parseFloat(fila.childNodes[2].value);
        actividad.masProbable = parseFloat(fila.childNodes[3].value);
        actividad.pesimista = parseFloat(fila.childNodes[4].value);
        actividad.promedio = (actividad.optimista + (4 * actividad.masProbable) + actividad.pesimista) / 6;
        actividad.consecuente = null;
        actividad.TIP = 0;
        actividad.TTT = 0;

        // Agregar la actividad al grafo
        grafo[actividad.id] = actividad;

        // Verificar si la actividad tiene precedentes
        if (actividad.precedentes) {
            var precedentes = actividad.precedentes;

            // Agregar la actividad actual como sucesora de cada precedente
            precedentes.forEach( precedente => {
                precedente = precedente.trim();

                // Verificar si el precedente existe en el grafo
                if (grafo[precedente]) {
                    // Agregar la actividad actual como sucesora del precedente
                    if (!grafo[precedente].consecuente) {
                        grafo[precedente].consecuente = [];
                    }
                    grafo[precedente].consecuente.push(actividad.id);
                }
            });
        }
    });

    console.log("Actividades:",grafo);

    // Limpiar contenido
    tabla.innerHTML = "";

    // Llamar a la función "prob_pert" pasándole el grafo
    prob_pert(grafo);
}

function prob_pert(grafo) {
    // Crear un objeto para almacenar las duraciones de las actividades
    var duraciones = {};

    // Calcular la duración máxima de cada actividad recursivamente
    function calcularDuracionMaxima(actividadId) {
        // Verificar si ya se ha calculado la duración máxima para esta actividad
        if (duraciones[actividadId] !== undefined) {
            return duraciones[actividadId];
        }

        var actividad = grafo[actividadId];
        var duracionMaxima = 0;

        // Verificar si la actividad tiene sucesoras
        if (actividad.consecuente) {
            actividad.consecuente.forEach( sucesoraId => {
                // Calcular la duración máxima de la sucesora
                var duracionSucesora = calcularDuracionMaxima(sucesoraId);

                // Actualizar la duración máxima si la duración de la sucesora es mayor
                if (duracionSucesora > duracionMaxima) {
                    duracionMaxima = duracionSucesora;
                }
            });
        }

        // Calcular la duración máxima de la actividad actual
        duracionMaxima += actividad.promedio;

        // Guardar la duración máxima en el objeto duraciones
        duraciones[actividadId] = duracionMaxima;

        return duracionMaxima;
    }

    // Calcular la duración máxima para cada actividad del grafo
    for (var actividadId in grafo) {
        dura = calcularDuracionMaxima(actividadId);
        // console.log("Duración:",dura);
    }

    // Encontrar las actividades que tienen duración máxima igual a la duración total del proyecto
    var duracionTotal = 0;
    for (var actividadId in duraciones) {
        if (duraciones[actividadId] > duracionTotal) {
            duracionTotal = duraciones[actividadId];
            console.log("Entro");
        }
    }

    var rutaCritica = [];

    // Recorrer nuevamente las actividades y agregar las que tienen duración máxima igual a la duración total
    for (var actividadId in duraciones) {
        if (duraciones[actividadId] === duracionTotal) {
            rutaCritica.push(actividadId);
        }
    }

    console.log("Ruta crítica:", rutaCritica);
}
