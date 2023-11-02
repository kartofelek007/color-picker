import {clamp, normalize} from "../utility/_functions.js";
import {Signal} from "../utility/_signals.js";

export class OpacitySlider {
    #dragged
    #color
    #cursorPos
    #DOM

    constructor(place, color = {r: 0, g: 0, b: 0, a: 0}) {
        this.onOpacitySelect = new Signal();

        this.#DOM = {}
        this.#DOM.place = place; //miejsce, do którego wrzucimy element
        this.#dragged = false; //czy rozpoczęto przeciąganie suwaka
        this.#color = color;
        this.#cursorPos = {x: 0, y: 0}; //pozycja wskaźnika

        this.#createElement(); //tworzymy wszystkie elementy
        this.#setBgGradient(); //ustawiamy gradient dla tła suwaka
        this.#bindEvents(); //podpinamy zdarzenia
    }

    #createElement() {
        this.#DOM.el = document.createElement("div");
        this.#DOM.el.classList.add("colorpicker-opacity");

        //gradientowe tło
        this.#DOM.canvas = document.createElement("canvas");
        this.#DOM.canvas.classList.add("colorpicker-opacity-canvas");
        this.#DOM.el.append(this.#DOM.canvas);

        //wskaźnik
        this.#DOM.dragEl = document.createElement("div");
        this.#DOM.dragEl.classList.add("colorpicker-opacity-drag");
        this.#DOM.el.append(this.#DOM.dragEl);

        this.#DOM.place.append(this.#DOM.el);

        //ustawiamy szerokość i pobieramy kontekst canvasu
        this.#DOM.canvas.width = this.#DOM.canvas.offsetWidth;
        this.#DOM.canvas.height = this.#DOM.canvas.offsetHeight;
        this.#DOM.ctx = this.#DOM.canvas.getContext("2d");
    }

    #setBgGradient() {
        this.#DOM.ctx.clearRect(0, 0, this.#DOM.canvas.width, this.#DOM.canvas.height);
        const gradient = this.#DOM.ctx.createLinearGradient(0, 0, 0, this.#DOM.canvas.height);
        gradient.addColorStop(0, `rgba(${this.#color.r}, ${this.#color.g}, ${this.#color.b}, 1)`);
        gradient.addColorStop(1, `rgba(${this.#color.r}, ${this.#color.g}, ${this.#color.b}, 0)`);
        this.#DOM.ctx.fillStyle = gradient;
        this.#DOM.ctx.fillRect(0, 0, this.#DOM.canvas.width, this.#DOM.canvas.height);
    }

    #bindEvents() {
        this.#DOM.canvas.addEventListener("mousedown", e => {
            this.#dragged = true;
            this.#drag(e);
            this.#DOM.dragEl.classList.add("is-active");
        });

        document.addEventListener("mousemove", e => {
            if (this.#dragged) this.#drag(e);
        });

        document.addEventListener("mouseup", e => {
            this.#dragged = false;
            this.#DOM.dragEl.classList.remove("is-active");
        });
    }

    #drag(e) {
        const g = this.#DOM.canvas.getBoundingClientRect();

        let y = clamp(e.pageY - (g.top + window.scrollY), 0, g.height);
        this.#cursorPos.y = Math.abs(y);
        this.#cursorPos.x = g.width / 2;

        const opacity = this.getOpacity();

        this.#DOM.dragEl.style.top = `${y}px`;
        this.onOpacitySelect.emit(opacity);
    }

    setColor(color, emit = true) {
        this.#color = color;
        this.#setBgGradient();
        this.setOpacity(color.a, emit);
    }

    setOpacity(opacity, emit = true) {
        opacity = normalize(opacity * 100, 100, 0);
        this.#cursorPos.y = Math.round(this.#DOM.canvas.height - this.#DOM.canvas.height * opacity);
        this.#DOM.dragEl.style.top = `${this.#cursorPos.y}px`;
        if (emit) this.onOpacitySelect.emit(opacity);
    }

    getOpacity() {
        return +Number(1 - Number(normalize(this.#cursorPos.y, this.#DOM.canvas.height, 0))).toFixed(2);
    }
}