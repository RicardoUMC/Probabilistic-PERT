class Nodo {
    constructor(id) {
        this.id = id;
        this.next_id = [];
        this.last_id = [];
        this.anterior = [];
        this.siguiente = [];
    }
}

class Grafo {
    constructor() {
        this.nodos = new Map();
    }

    crearNodo(id) {
        const nuevoNodo = new Nodo(id);
        this.nodos.set(id, nuevoNodo);
        nuevoNodo.next_id = [];
        nuevoNodo.last_id = [];
        return nuevoNodo;
    }

    buscarNodo(id) {
        return this.nodos.get(id);
    }

    agregarElementoArray(nodo, arrayNombre, elemento) {
        nodo[arrayNombre].push(elemento);
    }

    buscarElementoArray(nodo, arrayNombre, elementoId) {
        return nodo[arrayNombre].find((elemento) => elemento.id === elementoId);
    }
}

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
    var grafo = new Grafo();
    var node_id = 0;

    // Recorrer las filas de actividad
    filasActividad.forEach(function (fila) {
        var actividad = {};

        // Obtener los valores de los campos de entrada
        actividad.actividad_id = parseInt(fila.childNodes[0].id);
        actividad.optimista = parseFloat(fila.childNodes[2].value);
        actividad.masProbable = parseFloat(fila.childNodes[3].value);
        actividad.pesimista = parseFloat(fila.childNodes[4].value);
        actividad.promedio = (actividad.optimista + (4 * actividad.masProbable) + actividad.pesimista) / 6;
        actividad.varianza = ((actividad.pesimista - actividad.optimista) / 6) ^ 2;

        // Agregar la actividad al grafo
        if (node_id == 0) {
            grafo.crearNodo(node_id + 1).siguiente.push(actividad);
            // console.log(`Agregado (nodo inicial)[${grafo.buscarNodo(node_id + 1).id}]:`, grafo.buscarNodo(node_id + 1))
            node_id++;
        }

        else {
            precedentes = fila.childNodes[1].value === '' ? [] : fila.childNodes[1].value.split(",");

            if (precedentes.length == 0) {
                grafo.buscarNodo(node_id).siguiente.push(actividad);
                // console.log(`Agregado (nodo existente inicial)[${grafo.buscarNodo(node_id).id}]:`, grafo.buscarNodo(node_id));
            }

            let agregada = false;
            for (let nds = 1; nds <= node_id; nds++) {
                for (const ant_act of grafo.buscarNodo(nds).anterior) {
                    for (const pre_act of precedentes) {
                        if (pre_act == ant_act.actividad_id) {
                            // console.log(`Agregado (nodo existente)[${grafo.buscarNodo(nds).id}]:`, grafo.buscarNodo(nds))
                            grafo.buscarNodo(nds).siguiente.push(actividad);
                            agregada = true;
                        }
                    }
                }
            }

            if (!agregada) {
                grafo.crearNodo(node_id + 1);
                for (let nds = 1; nds <= node_id; nds++) {
                    for (const next_act of grafo.buscarNodo(nds).siguiente) {
                        console.log("Precedentes:",precedentes);
                        for (const pre_act of precedentes) {
                            if (pre_act == next_act.actividad_id) {
                                grafo.buscarNodo(node_id + 1).anterior.push(next_act);
                                grafo.buscarNodo(node_id + 1).siguiente.push(actividad);
                                // console.log(grafo.buscarNodo(nds).id);
                                grafo.buscarNodo(node_id + 1).last_id.push(grafo.buscarNodo(nds).id);
                                console.log(grafo.buscarNodo(node_id + 1).last_id);
                                grafo.buscarNodo(nds).next_id.push(grafo.buscarNodo(node_id + 1).id); 
                            }
                        }
                    }
                }
                console.log(`Agregado (nodo nuevo)[${grafo.buscarNodo(node_id + 1).id}]:`, grafo.buscarNodo(node_id + 1))
                node_id++;
            }
            
        }
    });

    /* for (let nds = 1; nds <= node_id; nds++) {
        console.log(grafo.buscarNodo(nds));
    } */

    // console.log("Actividades:", Array.from(grafo.nodos.values()));

    // Limpiar contenido
    // tabla.innerHTML = "";

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
            actividad.consecuente.forEach(sucesoraId => {
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
            // console.log("Entro");
        }
    }

    var rutaCritica = [];

    // Recorrer nuevamente las actividades y agregar las que tienen duración máxima igual a la duración total
    for (var actividadId in duraciones) {
        if (duraciones[actividadId] === duracionTotal) {
            rutaCritica.push(actividadId);
        }
    }

    // console.log("Ruta crítica:", rutaCritica);
}
