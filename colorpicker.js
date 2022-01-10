import { HueSlider } from "./hue.js";
import { ColorCanvas } from "./colorcanvas.js";
import { rgb2hex, clamp, disableSelect } from "./functions.js";
import { PubSub } from "./pubsub.js";
import { Library } from "./library.js";

function parseHex(value) {
    const reg = /^#[a-fA-F0-9]{6}$/
    return reg.test(value);
}

export class ColorPicker {
    constructor(place, opts, initColor = "#ff0000") {
        this.place = place;

        this.options = {...{
            initColor : "#ff0000",
            showLibrary : false,
            showButtonOK : false,
            dynamic : false
        }, ...opts};

        this.el = document.createElement("div");
        this.el.classList.add("color");

        this.color = this.options.initColor;
        this.onButtonClick = new PubSub();
        this.onColorSelect = new PubSub();
        place.append(this.el);

        this.hue = new HueSlider(this.el);
        this.canvas = new ColorCanvas(this.el, this.color);

        this.input = document.createElement("input");
        this.input.classList.add("color-input");
        this.el.append(this.input);

        this.input.addEventListener("keyup", e => {
            if (e.key === "Enter") {
                if (parseHex(this.input.value)) {
                    console.log(this.input.value);
                    this.setColor(`${this.input.value}`);
                }
            }
        })

        if (this.options.showButtonOK) {
            this.button = document.createElement("button");
            this.button.classList.add("color-btn");
            this.button.textContent = "OK";
            this.button.type = "button";
            this.el.append(this.button);

            this.button.addEventListener("click", e => {
                this.onButtonClick.emit(this.color);
            })
        }

        this.hue.onHueSelect.on(color => {
            this.canvas.setBgGradient(rgb2hex(color.r, color.g, color.b));
            this.canvas.updatePickerColor();
        })

        this.canvas.onColorSelect.on(color => {
            const hex = rgb2hex(color.r, color.g, color.b);
            this.color = hex;
            this.input.value = hex;
            if (this.options.dynamic) this.onColorSelect.emit(this.color);
        })

        if (this.options.showLibrary) {
            this.library = new Library(this.el, this.canvas);
            this.library.onColorSelect.on(color => {
                this.input.value = color;
                this.setColor(color);
            })
        }

        this.setColor(this.color);
    }

    getElement() {
        return this.el;
    }

    setColor(color) {
        this.color = color;
        this.hue.setColor(color);
        this.canvas.setColor(color);
        this.input.value = color;
        this.onColorSelect.emit(color);
    }
}