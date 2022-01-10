import { PubSub } from "./pubsub.js";
import { rgb2hex, rgb2hsl, clamp, disableSelect, hex2rgb } from "./functions.js";

export class HueSlider {
    constructor(place) {
        this.place = place;
        this.dragged = false;
        this.onHueSelect = new PubSub();
        this.cursorPos = {x : 0, y : 0};
        this.createElement();
        this.setBgGradient();
        this.bindEvents();
        this.color = this.getColor();
    }

    createElement() {
        this.el = document.createElement("div");
        this.el.classList.add("color-hue");

        this.canvas = document.createElement("canvas");
        this.canvas.classList.add("color-hue-canvas");
        this.el.append(this.canvas);

        this.dragEl = document.createElement("div");
        this.dragEl.classList.add("color-hue-drag");
        this.el.append(this.dragEl);

        this.place.append(this.el);

        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.ctx = this.canvas.getContext("2d");
    }

    setBgGradient() {
        const gradientHue = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradientHue.addColorStop(0, 'red');
        gradientHue.addColorStop(0.17, '#ff0');
        gradientHue.addColorStop(0.33, 'lime');
        gradientHue.addColorStop(0.5, 'cyan');
        gradientHue.addColorStop(0.66, 'blue');
        gradientHue.addColorStop(0.83, '#f0f');
        gradientHue.addColorStop(1, 'red');
        this.ctx.fillStyle = gradientHue;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setColor(color) {
        this.hueColor = color;
        const colorRGB = hex2rgb(color);
        const hslColor = rgb2hsl(colorRGB.r, colorRGB.g, colorRGB.b);
        const hue = hslColor[0] * 360;
        const percent = hue / 360 * 100;

        this.cursorPos.x = Math.round(this.canvas.width * percent / 100);
        this.dragEl.style.left = `${this.cursorPos.x}px`;
        this.color = this.getColor();
        this.dragEl.style.background = this.color.rgb;
        this.onHueSelect.emit(this.color);
    }

    getColor() {
        const pixel = this.ctx.getImageData(this.cursorPos.x, this.cursorPos.y, 1,1).data;   // Read pixel Color
        const rgb = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        return {
            rgb : rgb,
            r : pixel[0],
            g : pixel[1],
            b : pixel[2]
        };
    }

    drag(e) {
        const g = this.canvas.getBoundingClientRect();
        let x = clamp(e.pageX - g.left, 0, g.width);  // Get X coordinate
        let y = clamp(e.pageY - g.top, 0, g.height);

        this.cursorPos.x = Math.abs(x);
        if (this.cursorPos.x > this.canvas.width - 1) {
            this.cursorPos.x = this.canvas.width - 1;
        }

        this.cursorPos.y = g.height / 2;

        const color = this.getColor();

        this.dragEl.style.left = `${x}px`;
        this.dragEl.style.background = color.rgb;
        this.onHueSelect.emit(color);
    }

    bindEvents() {
        this.canvas.addEventListener('mousedown', e => {
            this.dragged = true;
            this.drag(e);
            disableSelect(true);
        });
        document.addEventListener("mousemove", e => {
            if (this.dragged) this.drag(e);
        })
        document.addEventListener("mouseup", e => {
            this.dragged = false;
            disableSelect(false);
        })
    }
}