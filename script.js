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

    prob_pert() {
        // Calcular TIP (tiempo de inicio más próximo)
        for (let nds = 1; nds <= this.nodos.size; nds++) {
            const nodo = this.buscarNodo(nds);

            if (nodo.anterior.length > 0) {
                let tipMaximo = 0;
                for (const anterior of nodo.anterior) {
                    const anteriorNodo = this.buscarNodo(anterior.last_node);
                    const tipAnterior = anteriorNodo.TIP + anterior.promedio;
                    if (tipAnterior > tipMaximo) {
                        tipMaximo = tipAnterior;
                    }
                }
                nodo.TIP = tipMaximo;
            }

        }

        // Calcular TTT (tiempo de terminación más tardía)
        for (let nds = this.nodos.size; nds >= 1; nds--) {
            const nodo = this.buscarNodo(nds);

            if (nodo.siguiente.length > 0) {
                let tttMinimo = Infinity;
                for (const siguiente of nodo.siguiente) {
                    const siguienteNodo = this.buscarNodo(siguiente.next_node);
                    const tttSiguiente = siguienteNodo.TTT - siguiente.promedio;
                    if (tttSiguiente < tttMinimo) {
                        tttMinimo = tttSiguiente;
                    }
                }
                nodo.TTT = tttMinimo;
            } else nodo.TTT = nodo.TIP;
        }
    }

    rutaCritica() {
        // Encontrar la ruta crítica
        const rutaCritica = [];
        let nodoActual = this.buscarNodo(1);
        while (nodoActual) {
            // rutaCritica.push(nodoActual.id);
            let siguienteCritico = null;

            for (const siguiente of nodoActual.siguiente) {
                const siguienteNodo = this.buscarNodo(siguiente.next_node);
                if (siguienteNodo.TIP === siguienteNodo.TTT) {
                    rutaCritica.push(siguiente);
                    siguienteCritico = siguienteNodo.id;
                    break;
                }
            }

            if (siguienteCritico) {
                nodoActual = this.buscarNodo(siguienteCritico);
            } else {
                nodoActual = null;
            }
        }

        return rutaCritica;
    }
}

function generarTabla() {
    reset();
    var cantidad = parseInt(document.getElementById("cantidad-actividades").value);
    var tabla = document.getElementById("tabla-actividades");

    // Limpiar contenido previo
    tabla.innerHTML = "";

    // Crear encabezado de la tabla
    var encabezado = "<div class='tabla-encabezado'><h3>Actividad</h3><h3>Actividades precedentes</h3><h3>Tiempo optimista</h3><h3>Tiempo más probable</h3><h3>Tiempo pesimista</h3><h3>Tiempo promedio</h3><h3>Varianza</h3></div>";
    tabla.innerHTML += encabezado;

    // Crear filas de actividades
    for (var i = 0; i < cantidad; i++) {
        var fila = "<div class='fila-actividad'><p  id=" + (i + 1) + ">Actividad " + (i + 1) + "</p><input type='text' placeholder='Actividades precedentes'><input type='number' placeholder='Tiempo optimista'><input type='number' placeholder='Tiempo más probable'><input type='number' placeholder='Tiempo pesimista'><p></p><p></p></div>";
        tabla.innerHTML += fila;
    }

    // Agregar botón "Calcular PERT"
    tabla.innerHTML += "<div class='button-container'><button onclick = 'calcularPERT()'> Calcular PERT</button></div >";
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
        fila.childNodes[5].textContent = actividad.promedio;
        actividad.varianza = ((actividad.pesimista - actividad.optimista) / 6) ** 2;
        fila.childNodes[6].textContent = actividad.varianza;

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
    
    // Llamar a la función "prob_pert" pasándole el grafo
    grafo.prob_pert();

    // Encontrar la duración total del proyecto
    const duracionTotal = grafo.buscarNodo(grafo.nodos.size).TIP;

    // Encontrar la ruta crítica y array de actividades
    const rutaCritica = grafo.rutaCritica();
    const rutaCriticaArray = []
    rutaCritica.forEach(actividad => {
        rutaCriticaArray.push(actividad.actividad_id)
    });
    
    // Cálculo de la varianza del proyecto
    let varianzaProyecto = 0;
    rutaCritica.forEach(actividad => {
        varianzaProyecto += actividad.varianza;
    });
    
    // Cálculo de la desviación estandar del proyecto
    let desviacionProyecto = varianzaProyecto ** (1/2);

    
    // Seleccionar el elemento resultado del PERT
    const resultado = document.getElementById("resultado");

    const duracionContent = `<div class="result-content"><h4>Duración total del proyecto:</h4><p>${duracionTotal} semanas.</p></div>`;
    const rutaCriticaContent = `<div class="result-content"><h4>Ruta crítica:</h4><p>A${rutaCriticaArray.join(" => A")}</p></div>`;
    const varianzaContent = `<div class="result-content"><h4>Varianza del proyecto:</h4><p>${varianzaProyecto}</p></div>`;
    const desviacionContent = `<div class="result-content"><h4>Desviación estandar del proyecto:</h4><p>${desviacionProyecto}</p></div>`;
    const resetButton = "<div class='button-container'><button onclick = 'reset()'>Reiniciar</button></div >";
   
    resultado.innerHTML = duracionContent + rutaCriticaContent + varianzaContent + desviacionContent + resetButton;
    
    console.log("[Nodos]");
    for (let nds = 1; nds <= node_id; nds++) {
        console.log(`Nodo [${nds}]:`, grafo.buscarNodo(nds));
        console.log("TIP:", grafo.buscarNodo(nds).TIP);
        console.log("TTT:", grafo.buscarNodo(nds).TTT);
    }

}

function reset() {
    document.getElementById('tabla-actividades').innerHTML = "";
    document.getElementById('resultado').innerHTML = "";
}