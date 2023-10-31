import {clamp, rgb2hex, rgb2hsb} from "./_functions.js";
import {Signal} from "./_signals.js";

export class ColorSlider {
    #dragged
    #cursorPos
    #DOM
    #color

    constructor(place) {
        this.onColorSelect = new Signal();

        this.#DOM = {};

        this.#DOM.place = place;
        this.#dragged = false;
        this.#cursorPos = {x: 0, y: 0};
        this.#createElement();
        this.#setBgGradient({r: 255, g: 0, b: 0, a: 1});
        this.#bindEvents();
    }

    #createElement() {
        this.#DOM.el = document.createElement("div");
        this.#DOM.el.classList.add("colorpicker-color");

        this.#DOM.canvas = document.createElement("canvas");
        this.#DOM.canvas.classList.add("colorpicker-color-canvas");
        this.#DOM.el.append(this.#DOM.canvas);

        this.#DOM.dragEl = document.createElement("div");
        this.#DOM.dragEl.classList.add("colorpicker-color-drag");
        this.#DOM.el.append(this.#DOM.dragEl);

        this.#DOM.place.append(this.#DOM.el);

        this.#DOM.canvas.width = this.#DOM.canvas.offsetWidth;
        this.#DOM.canvas.height = this.#DOM.canvas.offsetHeight;
        this.#DOM.ctx = this.#DOM.canvas.getContext("2d");
    }

    #setBgGradient(color) {
        this.#DOM.ctx.fillStyle = rgb2hex(color.r, color.g, color.b); // wpierw nakładamy odpowiedni kolor

        // potem pionowy gradient, od białego do przezroczystego
        this.#DOM.ctx.fillRect(0, 0, this.#DOM.canvas.width, this.#DOM.canvas.height);

        let gradientH = this.#DOM.ctx.createLinearGradient(0, 0, this.#DOM.canvas.width, 0);
        gradientH.addColorStop(0.01, "#fff");
        gradientH.addColorStop(0.99, "rgba(255,255,255, 0)");

        this.#DOM.ctx.fillStyle = gradientH;
        this.#DOM.ctx.fillRect(0, 0, this.#DOM.canvas.width, this.#DOM.canvas.height);

        // potem pionowy gradient, od przezroczystości do czarnego
        let gradientV = this.#DOM.ctx.createLinearGradient(0, 0, 0, this.#DOM.canvas.height);
        gradientV.addColorStop(0.1, "rgba(0,0,0,0)");
        gradientV.addColorStop(0.99, "#000");
        this.#DOM.ctx.fillStyle = gradientV;
        this.#DOM.ctx.fillRect(0, 0, this.#DOM.canvas.width, this.#DOM.canvas.height);
    }

    #updatePickerColor() {
        this.#color = this.getColor();
        this.#DOM.dragEl.style.left = `${this.#cursorPos.x}px`;
        this.#DOM.dragEl.style.top = `${this.#cursorPos.y}px`;
        this.#DOM.dragEl.style.background = this.#color.rgb;
        this.onColorSelect.emit(this.#color);
    }

    #drag(e) {
        const g = this.#DOM.canvas.getBoundingClientRect();

        let x = clamp(e.pageX - (g.left + window.scrollX), 0, g.width);
        let y = clamp(e.pageY - (g.top + window.scrollY), 0, g.height);

        this.#cursorPos.y = Math.abs(y);
        this.#cursorPos.x = Math.abs(x);

        if (this.#cursorPos.x > this.#DOM.canvas.width - 1) {
            this.#cursorPos.x = this.#DOM.canvas.width - 1;
        }

        this.#color = this.getColor();
        this.#updatePickerColor();
    }

    #bindEvents() {
        this.#DOM.canvas.addEventListener("mousedown", e => {
            this.#dragged = true;
            this.#drag(e);
        });

        document.addEventListener("mousemove", e => {
            if (this.#dragged) this.#drag(e);
        });

        document.addEventListener("mouseup", () => {
            this.#dragged = false;
        });
    }

    setColor(color, emit = true) {
        this.#setBgGradient(color);
        const hsb = rgb2hsb(color);
        const x = clamp(Math.ceil(hsb.s / (100 / this.#DOM.canvas.width)), 0, this.#DOM.canvas.width - 1);
        const y = clamp(this.#DOM.canvas.height - Math.ceil(hsb.b / (100 / this.#DOM.canvas.height)), 0, this.#DOM.canvas.height);
        this.#cursorPos = {x, y};
        if (emit) this.#updatePickerColor();
    }

    setHue(color, emit = true) {
        this.#setBgGradient(color);
        if (emit) this.#updatePickerColor();
    }

    getColor() {
        const pixel = this.#DOM.ctx.getImageData(this.#cursorPos.x, this.#cursorPos.y, 1, 1).data;
        const rgb = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        return {
            rgb: rgb,
            r: pixel[0],
            g: pixel[1],
            b: pixel[2]
        };
    }
}