class MushroomGarden {
    constructor() {
        this.spores = 5;
        this.water = 10;
        this.mushrooms = {};
        this.selectedSlot = null;
        this.mushroomTypes = ['🍄', '🟫', '🔴', '🟡', '🟤'];
        this.gameTime = 0;
        
        this.init();
        this.startGameLoop();
    }

    init() {
        this.updateDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('plantBtn').addEventListener('click', () => this.plantMushroom());
        document.getElementById('waterBtn').addEventListener('click', () => this.waterMushroom());
        document.getElementById('lightBtn').addEventListener('click', () => this.giveSunlight());

        document.querySelectorAll('.soil-patch').forEach(patch => {
            patch.addEventListener('click', (e) => this.selectSlot(e));
        });
    }

    selectSlot(event) {
        // Limpiar selección anterior
        document.querySelectorAll('.soil-patch').forEach(p => p.classList.remove('selected'));
        
        // Seleccionar nuevo slot
        event.target.closest('.soil-patch').classList.add('selected');
        this.selectedSlot = parseInt(event.target.closest('.soil-patch').dataset.slot);
        
        this.updateMushroomInfo();
    }

    plantMushroom() {
        if (this.spores <= 0) {
            alert('¡No tienes esporas suficientes!');
            return;
        }

        if (this.selectedSlot === null) {
            alert('Selecciona un espacio para plantar');
            return;
        }

        if (this.mushrooms[this.selectedSlot]) {
            alert('Ya hay un hongo plantado aquí');
            return;
        }

        this.spores--;
        this.mushrooms[this.selectedSlot] = {
            type: this.mushroomTypes[Math.floor(Math.random() * this.mushroomTypes.length)],
            age: 0,
            stage: 'baby',
            water: 3,
            light: 2,
            lastWatered: this.gameTime,
            lastLighted: this.gameTime,
            health: 100
        };

        this.renderMushroom(this.selectedSlot);
        this.updateDisplay();
        this.updateMushroomInfo();
    }

    waterMushroom() {
        if (this.water <= 0) {
            alert('¡No tienes agua suficiente!');
            return;
        }

        if (this.selectedSlot === null || !this.mushrooms[this.selectedSlot]) {
            alert('Selecciona un hongo para regar');
            return;
        }

        this.water--;
        this.mushrooms[this.selectedSlot].water = Math.min(5, this.mushrooms[this.selectedSlot].water + 2);
        this.mushrooms[this.selectedSlot].lastWatered = this.gameTime;
        
        this.renderMushroom(this.selectedSlot);
        this.updateDisplay();
        this.updateMushroomInfo();
    }

    giveSunlight() {
        if (this.selectedSlot === null || !this.mushrooms[this.selectedSlot]) {
            alert('Selecciona un hongo para dar luz');
            return;
        }

        this.mushrooms[this.selectedSlot].light = Math.min(5, this.mushrooms[this.selectedSlot].light + 2);
        this.mushrooms[this.selectedSlot].lastLighted = this.gameTime;
        
        this.renderMushroom(this.selectedSlot);
        this.updateMushroomInfo();
    }

    renderMushroom(slot) {
        const patch = document.querySelector(`[data-slot="${slot}"]`);
        const mushroom = this.mushrooms[slot];
        
        if (!mushroom) {
            patch.innerHTML = '';
            return;
        }

        let mushroomElement = patch.querySelector('.mushroom');
        if (!mushroomElement) {
            mushroomElement = document.createElement('div');
            mushroomElement.className = 'mushroom';
            patch.appendChild(mushroomElement);
        }

        mushroomElement.textContent = mushroom.type;
        mushroomElement.className = `mushroom ${mushroom.stage}`;

        // Aplicar efectos visuales según estado
        if (mushroom.water < 2) {
            mushroomElement.classList.add('thirsty');
        }
        if (mushroom.light < 2) {
            mushroomElement.classList.add('needs-light');
        }
        if (mushroom.water >= 3 && mushroom.light >= 3) {
            mushroomElement.classList.add('healthy');
        }
    }

    updateMushrooms() {
        Object.keys(this.mushrooms).forEach(slot => {
            const mushroom = this.mushrooms[slot];
            
            // Envejecimiento
            mushroom.age++;
            
            // Consumo de recursos
            if (this.gameTime - mushroom.lastWatered > 300) { // 30 segundos
                mushroom.water = Math.max(0, mushroom.water - 1);
            }
            if (this.gameTime - mushroom.lastLighted > 400) { // 40 segundos
                mushroom.light = Math.max(0, mushroom.light - 1);
            }

            // Evolución de etapas
            if (mushroom.age > 100 && mushroom.stage === 'baby') mushroom.stage = 'young';
            if (mushroom.age > 300 && mushroom.stage === 'young') mushroom.stage = 'adult';
            if (mushroom.age > 600 && mushroom.stage === 'adult') mushroom.stage = 'mature';

            // Producción de esporas (hongos maduros y saludables)
            if (mushroom.stage === 'mature' && mushroom.water >= 3 && mushroom.light >= 3) {
                if (Math.random() < 0.02) { // 2% de probabilidad cada update
                    this.produceSpores(slot);
                }
            }

            this.renderMushroom(slot);
        });

        // Regenerar agua lentamente
        if (this.gameTime % 200 === 0) { // cada 20 segundos
            this.water = Math.min(15, this.water + 1);
        }
    }

    produceSpores(slot) {
        this.spores++;
        
        // Animación visual de esporas
        const patch = document.querySelector(`[data-slot="${slot}"]`);
        const sporeElement = document.createElement('div');
        sporeElement.className = 'spore-animation';
        sporeElement.textContent = '✨';
        sporeElement.style.left = '50%';
        sporeElement.style.top = '50%';
        patch.appendChild(sporeElement);
        
        setTimeout(() => {
            if (sporeElement.parentNode) {
                sporeElement.parentNode.removeChild(sporeElement);
            }
        }, 2000);
        
        this.updateDisplay();
    }

    updateMushroomInfo() {
        const infoDiv = document.getElementById('mushroomInfo');
        
        if (this.selectedSlot === null || !this.mushrooms[this.selectedSlot]) {
            infoDiv.textContent = 'Selecciona un hongo para ver su estado';
            return;
        }

        const mushroom = this.mushrooms[this.selectedSlot];
        infoDiv.innerHTML = `
            <strong>Hongo ${mushroom.type}</strong><br>
            Etapa: ${mushroom.stage}<br>
            Edad: ${mushroom.age}<br>
            Agua: ${'💧'.repeat(mushroom.water)} (${mushroom.water}/5)<br>
            Luz: ${'☀️'.repeat(mushroom.light)} (${mushroom.light}/5)<br>
            Estado: ${this.getMushroomStatus(mushroom)}
        `;
    }

    getMushroomStatus(mushroom) {
        if (mushroom.water < 2) return '🥵 Sediento';
        if (mushroom.light < 2) return '🌑 Necesita luz';
        if (mushroom.water >= 3 && mushroom.light >= 3) return '😊 Saludable';
        return '😐 Normal';
    }

    updateDisplay() {
        document.getElementById('spores').textContent = this.spores;
        document.getElementById('water').textContent = this.water;
        
        // Habilitar/deshabilitar botones
        document.getElementById('plantBtn').disabled = this.spores <= 0;
        document.getElementById('waterBtn').disabled = this.water <= 0;
    }

    startGameLoop() {
        setInterval(() => {
            this.gameTime++;
            this.updateMushrooms();
            this.updateDisplay();
            if (this.selectedSlot !== null) {
                this.updateMushroomInfo();
            }
        }, 100); // Update cada 100ms
    }
}

// Inicializar el juego cuando la página carga
document.addEventListener('DOMContentLoaded', () => {
    new MushroomGarden();
});