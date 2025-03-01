class Jugador {
    constructor() {
        this.element = document.getElementById('turno');
        this.turno = true; // True: Rojo, False: Amarillo
        this.actualizarTurno();
    }

    actualizarTurno() {
        this.element.innerHTML = `Turno de <span style='color: ${this.turno ? '#ff0000' : '#ffff00'};'>${this.turno ? 'Barba Roja' : 'Pata de Palo'}</span>`;
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
    }

    crearTablero() {
        let html = '<table>';
        for (let i = 0; i < this.tamanio; i++) {
            html += '<tr>';
            for (let j = 0; j < this.tamanio; j++) {
                html += `<td id="c${i}${j}"></td>`;
            }
            html += '</tr>';
        }
        html += '</table>';
        this.tablero.innerHTML = html;
        const celdas = document.querySelectorAll('td');
        celdas.forEach(celda => {
            celda.addEventListener('click', (e) => this.handleClick(e));
            celda.addEventListener('dragover', (e) => this.dragOver(e));
            celda.addEventListener('drop', (e) => this.drop(e));
        });
    }

    dragOver(e) {
        e.preventDefault();

    }

    drop(e) {
        e.preventDefault();
        if (this.jugador.turno !== 'Rojo') return;
        const barco = document.querySelector('.dragging');
        const size = parseInt(barco.getAttribute('data-size'));
        const orientation = barco.getAttribute('data-orientation') || 'horizontal';
        const celda = e.target;
        const row = parseInt(celda.id[1]);
        const col = parseInt(celda.id[2]);

        // Check if the ship can be placed
        if (this.canPlaceShip(row, col, size, orientation)) {
            for (let i = 0; i < size; i++) {
                if (orientation === 'horizontal') {
                    document.getElementById(`c${row}${col + i}`).classList.add('ship');
                } else {
                    document.getElementById(`c${row + i}${col}`).classList.add('ship');
                }
            }
            barco.remove();
            this.ships.push({ row, col, size, orientation, hits: 0 });
            this.barcosColocados++;
            if (this.barcosColocados === 6) {
                this.ocultarBarcos();
                this.jugador.cambiarTurno();
            }
        } else {
            alert('No se puede colocar el barco aquí.');
        }
    }

    canPlaceShip(row, col, size, orientation) {
        for (let i = 0; i < size; i++) {
            const cell = orientation === 'horizontal' ? document.getElementById(`c${row}${col + i}`) : document.getElementById(`c${row + i}${col}`);
            if (cell === null || cell.classList.contains('ship')) {
                return false;
            }
        }
        return true;
    }

    ocultarBarcos() {
        const celdas = document.querySelectorAll('.ship');
        celdas.forEach(celda => {
            celda.classList.remove('ship');
            celda.classList.add('hidden-ship');
        });
    }

    handleClick(e) {
        const celda = e.target;
        document.getElementById('clicks').innerText = `LLevas ${this.clicks} disparos.`;
        if (this.jugador.turno === 'Amarillo') {
            if (celda.classList.contains('hidden-ship')) {
                if (celda.classList.contains('ship-hit') || celda.classList.contains('ship-miss')) return;
                this.clicks++;
                celda.classList.add('ship-hit');
                celda.innerHTML = 'X';
                this.markHit(celda);
                this.checkAllShipsSunk();
            } else {
                celda.classList.add('ship-miss');
                celda.innerHTML = 'A';
                mostrarMensaje('💧 Agua 💧');
            }
        }
    }

    markHit(celda) {
        const row = parseInt(celda.id[1]);
        const col = parseInt(celda.id[2]);

        const ship = this.ships.find(ship => {
            if (ship.orientation === 'horizontal') {
                return ship.row === row && col >= ship.col && col < ship.col + ship.size;
            } else {
                return ship.col === col && row >= ship.row && row < ship.row + ship.size;
            }
        });

        if (ship) {
            ship.hits++;
            mostrarMensaje('🩸 TOCADO 🩸');
            if (ship.hits === ship.size) {
                this.markSunkShip(ship);
                mostrarMensaje('💣 TOCADO Y HUNDIDO. HURRA! 💣');
            }
        }
    }

    markSunkShip(ship) {
        for (let i = 0; i < ship.size; i++) {
            const cell = ship.orientation === 'horizontal' ? document.getElementById(`c${ship.row}${ship.col + i}`) : document.getElementById(`c${ship.row + i}${ship.col}`);
            if (cell) {
                cell.classList.add('ship-sunk');
            }
        }
    }

    checkAllShipsSunk() {
        const allSunk = this.ships.every(ship => ship.hits === ship.size);
        if (allSunk) {
            setTimeout(() => {
                alert('¡Todos los barcos han sido hundidos!');
                window.location.reload();
            }, 500);
        }
    }
}

function mostrarMensaje(mensaje) {
    const divMensaje = document.getElementById("mensaje");
    if(divMensaje) {
      divMensaje.innerText = mensaje;
    }
  }

window.onload = () => {
    const jugador = new Jugador();
    const tablero = new Tablero('tablero', 10, jugador);
    tablero.crearTablero();

    const barcos = document.querySelectorAll('.barco');
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            const barco = document.querySelector('.dragging');
            if (!barco) return;
            const currentOrientation = barco.getAttribute('data-orientation') || 'horizontal';
            const newOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
            barco.setAttribute('data-orientation', newOrientation);
            barco.classList.toggle('vertical');
        }
    });
    barcos.forEach(barco => {
        barco.addEventListener('dragstart', () => {
            barco.classList.add('dragging');
        });
        barco.addEventListener('dragend', () => {
            barco.classList.remove('dragging');
        });
    });
}
