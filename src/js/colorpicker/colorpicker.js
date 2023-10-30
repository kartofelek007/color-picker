import "./css/style.scss";

import {ColorSlider} from "./_color-slider.js";
import {HueSlider} from "./_hue-slider.js";
import {convertRange, hex2rgba, rgb2hex, rgb2hsl} from "./_functions.js";
import {Signal} from "./_signals.js";
import {ColorLibrary} from "./_color-library.js";
import {OpacitySlider} from "./_opacity-slider.js";

const allPickers = {};

export class ColorPicker {
    #color
    #options
    #DOM

    constructor(place, opts) {
        this.onColorSelect = new Signal();
        this.onLibraryColorsChange = new Signal();
        this.onHueSelect = new Signal();
        this.onOpacitySelect = new Signal();
        this.#DOM = {}
        this.#DOM.place = place;
        this.#color = {r: 255, g: 0, b: 0, a: 1};

        this.#options = {
            ...{
                libraryID: "colors",
                inputVisible: true,
                libraryVisible: true,
            }, ...opts
        };

        this.#createElement();
        this.#updateInputValue();
        this.setColorObj(this.#color)

        if (allPickers[this.#options.libraryID] === undefined) allPickers[this.#options.libraryID] = [];
        allPickers[this.#options.libraryID].push(this);
    }

    #makeColorToEmit() {
        const c = this.#color;
        return {
            rgb : {r: c.r, g: c.g, b: c.b},
            rgba : {r: c.r, g: c.g, b: c.b, a: c.a},
            hsla : rgb2hsl(c.r, c.g, c.b, c.a),
            hex : rgb2hex(c.r, c.g, c.b, c.a),
        }
    }

    #updateInputValue() {
        if (!this.#options.inputVisible) return;
        let opacity = "";
        const hex = rgb2hex(this.#color.r, this.#color.g, this.#color.b, this.#color.a);
        if (this.#color.a !== 1 && this.#color.a !== 0) {
            const opa = parseInt(convertRange(this.#color.a, [0, 1], [0, 255]))
            opacity = Number(opa).toString(16).toUpperCase();
        }
        if (this.#color.a === 0) {
            opacity = "00";
        }
        this.#DOM.input.value = hex + opacity
    }

    #createElement() {
        this.#DOM.el = document.createElement("div");
        this.#DOM.el.classList.add("colorpicker");

        this.#DOM.place.append(this.#DOM.el);

        this.#DOM.hueSlider = new HueSlider(this.#DOM.el);
        this.#DOM.opacitySlider = new OpacitySlider(this.#DOM.el);
        this.#DOM.colorSlider = new ColorSlider(this.#DOM.el);

        //tworzę input
        if (this.#options.inputVisible) {
            this.#createInput();
            this.#createInputOpacity();
        }

        if (this.#options.libraryVisible) {
            this.#createLibrary();
        }

        this.#DOM.hueSlider.onHueSelect.on(color => {
            this.#DOM.colorSlider.setHue(color);
            this.onHueSelect.emit(color);
            this.#color = {...this.#color, ...color};
            this.#DOM.opacitySlider.setColor(this.#color);
        });

        this.#DOM.opacitySlider.onOpacitySelect.on(opacity => {
            this.#color.a = opacity;
            this.onOpacitySelect.emit({color: this.#color, opacity});
            this.#updateInputValue();
            if (this.#options.inputVisible) {
                this.#DOM.inputOpacity.value = opacity;
            }
        });

        this.#DOM.colorSlider.onColorSelect.on(color => {
            color.a = this.#DOM.opacitySlider.getOpacity();
            this.#color = color;
            this.#DOM.opacitySlider.setColor(this.#color);
            this.#updateInputValue()
            this.onColorSelect.emit(this.#makeColorToEmit());
        });
    }

    #createInput() {
        this.#DOM.input = document.createElement("input");
        this.#DOM.input.classList.add("colorpicker-input");
        this.#DOM.el.append(this.#DOM.input);

        //po wpisaniu koloru do inputa sprawdzam czy jest on w poprawnym formacie
        //i w razie czego aktualizuję kolor w sliderach
        const s = Symbol();
        this.#DOM.input[s] = this.#DOM.input.value;

        this.#DOM.input.oninput = e => {
            if (/^#[a-f0-9]*$/i.test(this.#DOM.input.value)) {
                this.#DOM.input[s] = this.#DOM.input.value;
            } else {
                this.#DOM.input.value = this.#DOM.input[s];
            }
        }

        this.#DOM.input.onkeyup = e => {
            if (e.key === "Enter") {
                if (/^#[a-f0-9]{6}$/i.test(this.#DOM.input.value)) {
                    this.setColorHEX(`${this.#DOM.input.value}`);
                    this.#DOM.input[s] = this.#DOM.input.value;
                }

                if (/^#[a-f0-9]{8}$/i.test(this.#DOM.input.value)) {
                    const val = this.#DOM.input.value;
                    const hex = val.substring(0, val.length - 2);
                    const opacity = parseInt(val.substring(val.length - 2), 16);
                    const opa = Number(convertRange(opacity, [0, 255], [0, 1])).toFixed(2);
                    const rgba = hex2rgba(hex, opa)
                    this.setColorObj(rgba);
                    this.#DOM.input[s] = this.#DOM.input.value;
                }
            }
        }
    }

    #createInputOpacity() {
        this.#DOM.inputOpacity = document.createElement("input");
        this.#DOM.inputOpacity.classList.add("colorpicker-input-opacity");
        this.#DOM.el.append(this.#DOM.inputOpacity);

        //po wpisaniu koloru do inputa sprawdzam czy jest on w poprawnym formacie
        //i w razie czego aktualizuję kolor w sliderach
        this.#DOM.inputOpacity.onkeyup = e => {
            if (e.key === "Enter") {
                const val = this.#DOM.inputOpacity.value;
                if (!isNaN(Number(val)) && Number(val) <= 100 && Number(val) >= 0) {
                    this.#color.a = Number(val);
                    this.#DOM.opacitySlider.setOpacity(val);
                    this.#updateInputValue();
                }
            }
        }
    }

    #createLibrary() {
        this.#DOM.library = new ColorLibrary(this.#DOM.el, this.#options.libraryID, this.#DOM.colorSlider, this.#DOM.opacitySlider);
        this.#DOM.library.onColorSelect.on(color => {
            if (this.#options.inputVisible) this.#DOM.input.value = color;
            this.setColorHEX(color);
        });
        this.#DOM.library.onColorsChange.on(colors => {
            this.onLibraryColorsChange.emit(colors);
        });

        this.#DOM.library.onColorsChange.on(colors => {
            this.onLibraryColorsChange.emit(colors);
            allPickers[this.#options.libraryID].forEach(cp => cp.updateLibrary());
        });
    }

    setColorHEX(color) {
        let rgba = hex2rgba(color);
        this.#color = rgba;
        this.#DOM.hueSlider.setColor(rgba);
        this.#DOM.opacitySlider.setColor(rgba);
        this.#DOM.opacitySlider.setOpacity(rgba.a);
        this.#DOM.colorSlider.setColor(rgba);
        if (this.#options.inputVisible) this.#updateInputValue();
        this.emitColorSelect();
    }

    setColorObj(color) {
        this.#color = color;
        this.#DOM.hueSlider.setColor(color);
        this.#DOM.opacitySlider.setColor(color);
        this.#DOM.opacitySlider.setColor(color);
        this.#DOM.opacitySlider.setOpacity(color.a);
        this.#DOM.colorSlider.setColor(color);
        if (this.#options.inputVisible) this.#updateInputValue();
        this.emitColorSelect();
    }

    getCurrentColor() {
        return this.#makeColorToEmit()
    }

    emitColorSelect() {
        this.onColorSelect.emit(this.#makeColorToEmit())
    }

    updateLibrary() {
        if (this.#options.libraryVisible) this.#DOM.library.updateColors();
    }
}