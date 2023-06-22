class Nodo {
    constructor(id) {
        this.id = id;
        this.next_id = [];
        this.last_id = [];
        this.anterior = [];
        this.siguiente = [];
        this.TTT = 0;
        this.TIP = 0;
    }
}

class Grafo {
    constructor() {
        this.nodos = new Map();
    }

    crearNodo(id) {
        const nuevoNodo = new Nodo(id);
        this.nodos.set(id, nuevoNodo);
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

        precedentes = fila.childNodes[1].value === '' ? [] : fila.childNodes[1].value.split(",");

        // Agregar la actividad al grafo
        if (node_id == 0) {
            var nodo = grafo.crearNodo(node_id + 1);
            actividad.last_node = 1;
            grafo.agregarElementoArray(nodo, 'siguiente', actividad);
            node_id++;
        } else if (precedentes.length == 0) {
            var nodo = grafo.buscarNodo(node_id);
            actividad.last_node = 1;
            grafo.agregarElementoArray(nodo, 'siguiente', actividad);
        } else {
            // Revisa si ya hay un nodo existente
            var agregada = false;

            for (let nds = 1; nds <= node_id; nds++) {
                const nodoActual = grafo.buscarNodo(nds);

                for (const ant_act of nodoActual.anterior) {
                    precedentes.forEach(pre_act => {
                        if (pre_act == ant_act.actividad_id) {
                            actividad.last_node = nds;
                            grafo.agregarElementoArray(nodoActual, 'siguiente', actividad);
                            agregada = true;
                        }
                    });
                }
            }

            // Si no, crea un nuevo nodo
            if (!agregada) {
                const nuevoNodo = grafo.crearNodo(node_id + 1);
                actividad.last_node = node_id + 1;
                grafo.agregarElementoArray(nuevoNodo, 'siguiente', actividad);

                for (let nds = 1; nds <= node_id; nds++) {
                    var nodo = grafo.buscarNodo(nds);

                    for (const next_act of nodo.siguiente) {
                        precedentes.forEach(pre_act => {
                            if (pre_act == next_act.actividad_id) {
                                next_act.next_node = node_id + 1;
                                grafo.agregarElementoArray(nuevoNodo, 'anterior', next_act);
                                grafo.agregarElementoArray(nuevoNodo, 'last_id', nodo.id);
                                grafo.agregarElementoArray(nodo, 'next_id', nuevoNodo.id);
                            }
                        });
                    }
                }

                nuevoNodo.anterior = nuevoNodo.anterior.filter((valor, indice, arreglo) => arreglo.indexOf(valor) === indice);
                nuevoNodo.last_id = nuevoNodo.last_id.filter((valor, indice, arreglo) => arreglo.indexOf(valor) === indice);
                nodo.next_id = nodo.next_id.filter((valor, indice, arreglo) => arreglo.indexOf(valor) === indice);

                node_id++;
            }

        }
    });

    // Convertir filasActividad en un arreglo
    var filasActividadArray = Array.from(filasActividad);

    // Obtener todas las actividades ingresadas
    const actividadesIngresadas = filasActividadArray.map(fila => parseInt(fila.childNodes[0].id));

    // Encontrar las actividades que no han sido agregadas como "anterior"
    const actividadesFaltantes = actividadesIngresadas.filter(actividad => {
        // Revisar nodo por nodo para encontrar actividades faltantes
        for (let nds = 1; nds <= node_id; nds++) {
            var nodo_aux = grafo.buscarNodo(nds);

            for (const ant_act of nodo_aux.anterior) {
                if (ant_act.actividad_id === actividad) {
                    return false;
                }
            }
        }
        return true;
    });

    // Revisar nodo por nodo para encontrar actividades faltantes
    if (actividadesFaltantes.length > 0) {

        // Agregar un último nodo con las actividades faltantes
        const nuevoNodo = grafo.crearNodo(node_id + 1);

        for (let nds = 1; nds <= node_id; nds++) {
            var nodo = grafo.buscarNodo(nds);

            for (const act_id of actividadesFaltantes) {
                for (const act_nodo of nodo.siguiente) {
                    if (act_id == act_nodo.actividad_id) {
                        act_nodo.next_node = node_id + 1;
                        grafo.agregarElementoArray(nuevoNodo, 'anterior', act_nodo);
                        grafo.agregarElementoArray(nuevoNodo, 'last_id', nodo.id);
                        grafo.agregarElementoArray(nodo, 'next_id', nuevoNodo.id);
                    }
                }
            }
        }

        nuevoNodo.anterior = nuevoNodo.anterior.filter((valor, indice, arreglo) => arreglo.indexOf(valor) === indice);
        nuevoNodo.last_id = nuevoNodo.last_id.filter((valor, indice, arreglo) => arreglo.indexOf(valor) === indice);
        nodo.next_id = nodo.next_id.filter((valor, indice, arreglo) => arreglo.indexOf(valor) === indice);

        node_id++;
    }

    console.log("[Nodos]");
    for (let nds = 1; nds <= node_id; nds++) {
        console.log(grafo.buscarNodo(nds));
    }

    // Limpiar contenido
    // tabla.innerHTML = "";

    // Llamar a la función "prob_pert" pasándole el grafo
    prob_pert(grafo);
}

function prob_pert(grafo) {
    // Calcular TIP (tiempo de inicio más próximo)
    for (let nds = 1; nds <= grafo.nodos.size; nds++) {
        const nodo = grafo.buscarNodo(nds);

        if (nodo.siguiente.length > 0) {
            let tipMaximo = 0;
            for (const anterior of nodo.last_id) {
                const anteriorNodo = grafo.buscarNodo(anterior);
                const tipAnterior = anteriorNodo.TIP + anteriorNodo.promedio;
                if (tipAnterior > tipMaximo) {
                    tipMaximo = tipAnterior;
                }
            }
            nodo.TIP = tipMaximo;
        }

    }

    // Calcular TTT (tiempo de terminación más tardía)
    for (let nds = grafo.nodos.size; nds >= 1; nds--) {
        const nodo = grafo.buscarNodo(nds);
        let tttMinimo = nodo.TIP;
        for (const siguiente of nodo.siguiente) {
            const siguienteNodo = grafo.buscarNodo(siguiente.actividad_id);
            const tttSiguiente = siguienteNodo.TTT - siguienteNodo.promedio;
            if (!tttMinimo || tttSiguiente < tttMinimo) {
                tttMinimo = tttSiguiente;
            }
        }
        nodo.TTT = tttMinimo;
    }

    // Encontrar la duración total del proyecto
    const duracionTotal = grafo.buscarNodo(1).TIP;

    // Encontrar la ruta crítica
    const rutaCritica = [];
    let nodoActual = grafo.buscarNodo(1);
    while (nodoActual) {
        rutaCritica.push(nodoActual.id);
        let duracionMaxima = -Infinity;
        let siguienteCritico = null;
        for (const siguiente of nodoActual.siguiente) {
            const siguienteNodo = grafo.buscarNodo(siguiente.actividad_id);
            const duracionSiguiente = siguienteNodo.promedio;
            const duracionTotal = duracionSiguiente + siguienteNodo.TTT - siguienteNodo.TIP;
            if (duracionTotal > duracionMaxima) {
                duracionMaxima = duracionTotal;
                siguienteCritico = siguiente.actividad_id;
            }
        }
        if (siguienteCritico) {
            nodoActual = grafo.buscarNodo(siguienteCritico);
        } else {
            nodoActual = null;
        }
    }

    // Mostrar los resultados por consola
    console.log("Duración total del proyecto: " + duracionTotal);
    console.log("Ruta crítica: " + rutaCritica.join(" -> "));
}
