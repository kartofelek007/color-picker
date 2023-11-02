import "./css/style.scss";

import {ColorSlider} from "./parts/_color-slider.js";
import {HueSlider} from "./parts/_hue-slider.js";
import {hex2rgba, rgb2hex, rgb2hsl} from "./utility/_functions.js";
import {Signal} from "./utility/_signals.js";
import {ColorLibrary} from "./parts/_color-library.js";
import {OpacitySlider} from "./parts/_opacity-slider.js";
import {testColorName} from "./utility/_colors.js";

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
                opacityColors: true
            }, ...opts
        };

        this.#createElements();

        if (allPickers[this.#options.libraryID] === undefined) allPickers[this.#options.libraryID] = [];
        allPickers[this.#options.libraryID].push(this);

        this.#updateInputValue();
    }

    #makeColorToEmit() {
        const c = {...this.#color};
        if (!this.#options.opacityColors) {
            c.a = 1;
        }
        return {
            rgb : {r: c.r, g: c.g, b: c.b},
            rgba : {r: c.r, g: c.g, b: c.b, a: c.a},
            hsla : rgb2hsl(c.r, c.g, c.b, c.a),
            hex : rgb2hex(c.r, c.g, c.b, c.a),
        }
    }

    #updateInputValue() {
        if (!this.#options.inputVisible) return;
        let opacity = this.#color.a;
        if (!this.#options.opacityColors) {
            opacity = 1;
        }
        const hex = rgb2hex(this.#color.r, this.#color.g, this.#color.b, opacity);
        this.#DOM.input.value = hex.toUpperCase();
        this.#DOM.inputOpacity.value = opacity;
    }

    #createElements() {
        const createColorSlider = () => {
            this.#DOM.colorSlider = new ColorSlider(this.#DOM.el);
            this.#DOM.colorSlider.onColorSelect.on(color => {
                if (this.#options.opacityColors) {
                    color.a = this.#DOM.opacitySlider.getOpacity();
                } else {
                    color.a = 1;
                }
                this.#color = color;
                if (this.#options.opacityColors) {
                    this.#DOM.opacitySlider.setColor(this.#color);
                }
                if (this.#options.inputVisible) {
                    this.#updateInputValue();
                }
                this.emitColorSelect();
            });
        }
        const createInput = () => {
            this.#DOM.input = document.createElement("input");
            this.#DOM.input.classList.add("colorpicker-input");
            this.#DOM.el.append(this.#DOM.input);

            //po wpisaniu koloru do inputa sprawdzam czy jest on w poprawnym formacie
            //i w razie czego aktualizuję kolor w sliderach
            const s = Symbol();
            this.#DOM.input[s] = this.#DOM.input.value;

            this.#DOM.input.onkeyup = e => {
                let val = this.#DOM.input.value;
                if (e.key === "Enter" && val !== "") {
                    let match = testColorName(val);
                    if (match) {
                        this.setColorHEX(`${match.hex}`);
                        this.#DOM.input[s] = match.hex;
                        return;
                    }

                    if (/^#[a-f0-9]{6}$/i.test(val) || /^#[a-f0-9]{8}$/i.test(val)) {
                        this.setColorHEX(`${val}`);
                        this.#DOM.input[s] = val;
                    } else {
                        this.#DOM.input.value = this.#DOM.input[s];
                    }
                }
            }
        }
        const createHueSlider = () => {
            this.#DOM.hueSlider = new HueSlider(this.#DOM.el);
            this.#DOM.hueSlider.onHueSelect.on(color => {
                this.#DOM.colorSlider.setHue(color);
                this.onHueSelect.emit(color);
                this.#color = {...this.#color, ...color};
                if (this.#options.opacityColors) {
                    this.#DOM.opacitySlider.setColor(this.#color);
                }
                if (this.#options.inputVisible) {
                    this.#updateInputValue();
                }
                this.emitColorSelect();
            });
        }
        const createOpacitySlider = () => {
            this.#DOM.opacitySlider = new OpacitySlider(this.#DOM.el);
            this.#DOM.opacitySlider.onOpacitySelect.on(opacity => {
                this.#color.a = opacity;
                this.onOpacitySelect.emit({color: this.#color, opacity});
                if (this.#options.inputVisible) {
                    if (this.#options.opacityColors) {
                        this.#DOM.inputOpacity.value = opacity;
                    }
                    this.#updateInputValue();
                }
                this.emitColorSelect();
            });
        }
        const createInputOpacity = () => {
            this.#DOM.inputOpacity = document.createElement("input");
            this.#DOM.inputOpacity.classList.add("colorpicker-input-opacity");
            this.#DOM.el.append(this.#DOM.inputOpacity);

            //po wpisaniu koloru do inputa sprawdzam czy jest on w poprawnym formacie
            //i w razie czego aktualizuję kolor w sliderach
            this.#DOM.inputOpacity.onkeyup = e => {
                if (e.key === "Enter") {
                    const val = this.#DOM.inputOpacity.value;
                    if (!isNaN(Number(val)) && Number(val) <= 1 && Number(val) >= 0) {
                        this.#color.a = Number(val);
                        this.#DOM.opacitySlider.setOpacity(val);
                        this.#updateInputValue();
                    }
                }
            }
        }
        const createLibrary = () => {
            this.#DOM.library = new ColorLibrary(this.#DOM.el, this.#options.libraryID, this.#DOM.colorSlider, this.#color);
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

        this.#DOM.el = document.createElement("div");
        this.#DOM.el.classList.add("colorpicker");
        this.#DOM.place.append(this.#DOM.el);
        this.#DOM.el.classList.toggle("is-no-opacity", !this.#options.opacityColors);

        //tworzę input
        if (this.#options.inputVisible) {
            createInput();
        }

        if (this.#options.opacityColors && this.#options.inputVisible) {
            createInputOpacity();
        }

        if (this.#options.opacityColors) {
            createOpacitySlider();
        }

        if (this.#options.libraryVisible) {
            createLibrary();
        }

        createHueSlider();
        createColorSlider();
    }

    setColorHEX(color, emit = true) {
        let rgba = hex2rgba(color);
        this.#color = rgba;
        this.#DOM.hueSlider.setColor(rgba, false);
        if (this.#options.opacityColors) {
            this.#DOM.opacitySlider.setColor(rgba, false);
            this.#DOM.opacitySlider.setOpacity(rgba.a, false);
        }
        this.#DOM.colorSlider.setColor(rgba, false);
        if (this.#options.inputVisible) this.#updateInputValue();
        if (emit) this.emitColorSelect();
    }

    setColorObj(color, emit = true) {
        this.#color = color;
        this.#DOM.hueSlider.setColor(color, false);
        if (this.#options.opacityColors) {
            this.#DOM.opacitySlider.setColor(color, false);
            this.#DOM.opacitySlider.setOpacity(color.a, false);
        }
        this.#DOM.colorSlider.setColor(color, false);
        if (this.#options.inputVisible) this.#updateInputValue();
        if (emit) this.emitColorSelect();
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