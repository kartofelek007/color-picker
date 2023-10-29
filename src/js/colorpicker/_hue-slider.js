import {clamp, rgb2hsl} from "./_functions.js";
import {Signal} from "./_signals.js";

export class HueSlider {
    #dragged
    #cursorPos
    #DOM

    constructor(place) {
        this.onHueSelect = new Signal();

        this.#DOM = {}

        this.#DOM.place = place; //miejsce, do którego wrzucimy element
        this.#dragged = false; //czy rozpoczęto przeciąganie suwaka
        this.#cursorPos = {x: 0, y: 0}; //pozycja wskaźnika

        this.#createElement(); //tworzymy wszystkie elementy
        this.#setBgGradient(); //ustawiamy gradient dla tła suwaka
        this.#bindEvents(); //podpinamy zdarzenia
    }

    #createElement() {
        this.#DOM.el = document.createElement("div");
        this.#DOM.el.classList.add("colorpicker-hue");

        //gradientowe tło
        this.#DOM.canvas = document.createElement("canvas");
        this.#DOM.canvas.classList.add("colorpicker-hue-canvas");
        this.#DOM.el.append(this.#DOM.canvas);

        //wskaźnik
        this.#DOM.dragEl = document.createElement("div");
        this.#DOM.dragEl.classList.add("colorpicker-hue-drag");
        this.#DOM.el.append(this.#DOM.dragEl);

        this.#DOM.place.append(this.#DOM.el);

        //ustawiamy szerokość i pobieramy kontekst canvasu
        this.#DOM.canvas.width = this.#DOM.canvas.offsetWidth;
        this.#DOM.canvas.height = this.#DOM.canvas.offsetHeight;
        this.#DOM.ctx = this.#DOM.canvas.getContext("2d");
    }

    #setBgGradient() {
        const gradient = this.#DOM.ctx.createLinearGradient(0, 0, 0, this.#DOM.canvas.height);
        gradient.addColorStop(0, "red");
        gradient.addColorStop(0.17, "yellow");
        gradient.addColorStop(0.33, "lime");
        gradient.addColorStop(0.5, "cyan");
        gradient.addColorStop(0.66, "blue");
        gradient.addColorStop(0.83, "magenta");
        gradient.addColorStop(1, "red");
        this.#DOM.ctx.fillStyle = gradient;
        this.#DOM.ctx.fillRect(0, 0, this.#DOM.canvas.width, this.#DOM.canvas.height);
    }

    #bindEvents() {
        this.#DOM.canvas.addEventListener("mousedown", e => {
            this.#dragged = true;
            this.#drag(e);
        });

        document.addEventListener("mousemove", e => {
            if (this.#dragged) this.#drag(e);
        });

        document.addEventListener("mouseup", e => {
            this.#dragged = false;
        });
    }

    #drag(e) {
        const g = this.#DOM.canvas.getBoundingClientRect();

        let y = clamp(e.pageY - (g.top + window.scrollY), 0, g.height);

        this.#cursorPos.y = Math.abs(y);

        if (this.#cursorPos.y > this.#DOM.canvas.height - 1) {
            this.#cursorPos.y = this.#DOM.canvas.height - 1;
        }

        this.#cursorPos.x = g.width / 2;

        const color = this.getColor();

        this.#DOM.dragEl.style.top = `${y}px`;
        this.#DOM.dragEl.style.background = color.rgb;
        this.onHueSelect.emit(color);
    }

    setColor(color) {
        const hslColor = rgb2hsl(color.r, color.g, color.b);

        const hue = hslColor.h * 360;
        const percent = hue / 360 * 100;

        this.#cursorPos.y = Math.round(this.#DOM.canvas.height * percent / 100);
        this.#DOM.dragEl.style.top = `${this.#cursorPos.y}px`;

        const colorGet = this.getColor();
        this.#DOM.dragEl.style.background = colorGet.rgb;
        this.onHueSelect.emit(colorGet);
    }

    getColor() {
        const pixel = this.#DOM.ctx.getImageData(0, this.#cursorPos.y, 1, 1).data;
        const rgb = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        return {
            rgb: rgb,
            r: pixel[0],
            g: pixel[1],
            b: pixel[2]
        };
    }
}