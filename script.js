class Jugador {
    constructor() {
        this.element = document.getElementById("turno");
        this.turno = true; // True: Rojo, False: Amarillo
        this.actualizarTurno();
    }

    actualizarTurno() {
        this.element.innerHTML = `Turno de <span style='color: ${
            this.turno ? "#ff0000" : "#ffff00"
        };'>${this.turno ? "Barba Roja" : "Pata de Palo"}</span>`;
    }

    cambiarTurno() {
        this.turno = !this.turno;
        this.actualizarTurno();
    }
}

class Tablero {
    constructor(id, tamanio, jugador) {
        this.tablero = document.getElementById(id);
        this.tamanio = tamanio;
        this.ships = [];
        this.barcosColocados = 0;
        this.jugador = jugador;
        this.clicks = 0;
        this.casillas_tocadas = 0;
        this.barcos_hundidos = 0;
        this.fallos = 0;
    }

    crearTablero() {
        let html = "<table>";
        for (let i = 0; i < this.tamanio; i++) {
            html += "<tr>";
            for (let j = 0; j < this.tamanio; j++) {
                html += `<td id="c${i}${j}"></td>`;
            }
            html += "</tr>";
        }
        html += "</table>";
        this.tablero.innerHTML = html;
        const celdas = document.querySelectorAll("td");
        celdas.forEach((celda) => {
            celda.addEventListener("click", (e) => this.handleClick(e));
            celda.addEventListener("dragover", (e) => this.dragOver(e));
            celda.addEventListener("drop", (e) => this.drop(e));
        });
    }

    dragOver(e) {
        e.preventDefault();
    }

    drop(e) {
        e.preventDefault();
        if (!this.jugador.turno) return;
        const barco = document.querySelector(".dragging");
        const size = parseInt(barco.getAttribute("data-size"));
        const orientation =
            barco.getAttribute("data-orientation") || "horizontal";
        const celda = e.target;
        const row = parseInt(celda.id[1]);
        const col = parseInt(celda.id[2]);

        // Check if the ship can be placed
        if (this.canPlaceShip(row, col, size, orientation)) {
            for (let i = 0; i < size; i++) {
                if (orientation === "horizontal") {
                    document
                        .getElementById(`c${row}${col + i}`)
                        .classList.add("ship");
                } else {
                    document
                        .getElementById(`c${row + i}${col}`)
                        .classList.add("ship");
                }
            }
            barco.remove();
            this.ships.push({ row, col, size, orientation, hits: 0 });
            this.barcosColocados++;
            if (this.barcosColocados === 6) {
                this.ocultarBarcos();
                this.jugador.cambiarTurno();
                this.actualizarInfo();
            }
        } else {
            alert("No se puede colocar el barco aquí.");
        }
    }

    canPlaceShip(row, col, size, orientation) {
        for (let i = 0; i < size; i++) {
            const cell =
                orientation === "horizontal"
                    ? document.getElementById(`c${row}${col + i}`)
                    : document.getElementById(`c${row + i}${col}`);
            if (cell === null || cell.classList.contains("ship")) {
                return false;
            }
        }
        return true;
    }

    ocultarBarcos() {
        const celdas = document.querySelectorAll(".ship");
        celdas.forEach((celda) => {
            celda.classList.remove("ship");
            celda.classList.add("hidden-ship");
        });
    }

    handleClick(e) {
        const celda = e.target;
        if (this.jugador.turno) return;
        if (celda.classList.contains("ship-hit")) return;
        if (celda.classList.contains("ship-miss")) return;
        if (celda.classList.contains("hidden-ship")) {
            this.clicks++;
            document.getElementById(
                "clicks"
            ).innerText = `Llevas ${this.clicks} disparos.`;
            celda.classList.add("ship-hit");
            celda.innerHTML = "X";
            this.markHit(celda);
            this.checkAllShipsSunk();
        } else {
            celda.classList.add("ship-miss");
            this.clicks++;
            this.fallos++;
            celda.innerHTML = "A";
            mostrarMensaje("💧 Agua 💧");
        }
        this.actualizarInfo();
    }

    markHit(celda) {
        const row = parseInt(celda.id[1]);
        const col = parseInt(celda.id[2]);

        const ship = this.ships.find((ship) => {
            if (ship.orientation === "horizontal") {
                return (
                    ship.row === row &&
                    col >= ship.col &&
                    col < ship.col + ship.size
                );
            } else {
                return (
                    ship.col === col &&
                    row >= ship.row &&
                    row < ship.row + ship.size
                );
            }
        });

        if (ship) {
            ship.hits++;
            this.casillas_tocadas++;
            mostrarMensaje("🩸 Tocado 🩸");
            if (ship.hits === ship.size) {
                this.markSunkShip(ship);
                this.barcos_hundidos++;
                mostrarMensaje("💣 Tocado y hundido. ¡Hurra! 💣");
            }
        }
    }

    markSunkShip(ship) {
        for (let i = 0; i < ship.size; i++) {
            const cell =
                ship.orientation === "horizontal"
                    ? document.getElementById(`c${ship.row}${ship.col + i}`)
                    : document.getElementById(`c${ship.row + i}${ship.col}`);
            if (cell) {
                cell.classList.add("ship-sunk");
            }
        }
    }

    checkAllShipsSunk() {
        const allSunk = this.ships.every((ship) => ship.hits === ship.size);
        if (allSunk) {
            // Timeout para que siga actualizando el tablero en pantalla
            setTimeout(() => {
                let msg = "¡Todos los barcos han sido hundidos!\n\n";
                msg += "Disparos: " + this.clicks + "\n";
                msg += "Barcos hundidos: " + this.barcos_hundidos + "\n";
                msg += "Fallos: " + this.fallos + "\n";
                msg +=
                    "Puntería: " +
                    ((this.casillas_tocadas / this.clicks) * 100).toFixed(2) +
                    "%\n";
                msg += "¡Gracias por jugar! ¡Hasta la próxima!\n";
                alert(msg);
                window.location.reload();
            }, 200);
        }
    }

    actualizarInfo() {
        document.getElementById(
            "clicks"
        ).innerText = `Llevas ${this.clicks} disparos.`;
        document.getElementById("info-batalla").innerText =
            `Barcos tocados: ${this.casillas_tocadas}` +
            ` | Barcos hundidos: ${this.barcos_hundidos}/6` +
            ` | Fallos: ${this.fallos}` +
            ` | Puntería: ${(
                (this.casillas_tocadas / this.clicks) *
                100
            ).toFixed(2)}%`;
    }
}

function mostrarMensaje(mensaje) {
    const divMensaje = document.getElementById("mensaje");
    if (divMensaje) {
        divMensaje.innerText = mensaje;
    }
}

window.onload = () => {
    const jugador = new Jugador();
    const tablero = new Tablero("tablero", 10, jugador);
    const barcos = document.querySelectorAll(".barco");

    tablero.crearTablero();

    document.addEventListener("dblclick", (e) => {
        const barco = e.target.closest(".barco");
        if (!barco) return;
        const currentOrientation =
            barco.getAttribute("data-orientation") || "horizontal";
        const newOrientation =
            currentOrientation === "horizontal" ? "vertical" : "horizontal";
        barco.setAttribute("data-orientation", newOrientation);
        barco.classList.toggle("vertical");
    });

    barcos.forEach((barco) => {
        barco.addEventListener("dragstart", () => {
            barco.classList.add("dragging");
        });
        barco.addEventListener("dragend", () => {
            barco.classList.remove("dragging");
        });
    });
};
