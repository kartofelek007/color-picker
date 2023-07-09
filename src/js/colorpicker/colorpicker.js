import "./css/style.scss";

import {ColorSlider} from "./_color-slider.js";
import {HueSlider} from "./_hue-slider.js";
import {hex2rgba, rgb2hex} from "./_functions.js";
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
        this.#color = "#FF0000";

        this.#options = {
            ...{
                libraryID: "colors",
                inputVisible : true,
                libraryVisible : true,
            }, ...opts
        };

        this.#createElement();
        this.setColorHEX(this.#color);

        if (allPickers[this.#options.libraryID] === undefined) allPickers[this.#options.libraryID] = [];
        allPickers[this.#options.libraryID].push(this);
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
        }

        if (this.#options.libraryVisible) {
            this.#createLibrary();
        }

        this.#DOM.hueSlider.onHueSelect.on(color => {
            this.#DOM.colorSlider.setColor(color);
            this.onHueSelect.emit(color);
        });

        this.#DOM.opacitySlider.onOpacitySelect.on(opacity => {
            this.#color.a = opacity;
            this.onOpacitySelect.emit({color: this.#color, opacity});
            this.onColorSelect.emit(this.#color);
        });

        this.#DOM.colorSlider.onColorSelect.on(color => {
            const hex = rgb2hex(color.r, color.g, color.b);
            color.a = this.#DOM.opacitySlider.getOpacity();
            this.#color = color;
            if (this.#options.inputVisible) this.#DOM.input.value = hex;
            this.onColorSelect.emit(color);
        });
    }

    #createInput() {
        this.#DOM.input = document.createElement("input");
        this.#DOM.input.classList.add("colorpicker-input");
        this.#DOM.el.append(this.#DOM.input);

        //po wpisaniu koloru do inputa sprawdzam czy jest on w poprawnym formacie
        //i w razie czego aktualizuję kolor w sliderach
        this.#DOM.input.addEventListener("keyup", e => {
            if (e.key === "Enter") {
                if (/^#[a-fA-F0-9]{6}$/.test(this.#DOM.input.value)) {
                    this.setColorHEX(`${this.#DOM.input.value}`);
                }

                if (/^#[a-fA-F0-9]{8}$/.test(this.#DOM.input.value)) {
                    const val = this.#DOM.input.value;
                    const hex = val.substring(0, val.length - 2);
                    const opacity = parseInt(val.substring(val.length - 2), 16);
                    const rgba = hex2rgba(hex, opacity)
                    this.setColorObj(rgba);
                }
            }
        });
    }

    #createLibrary() {
        this.#DOM.library = new ColorLibrary(this.#DOM.el, this.#options.libraryID, this.#DOM.colorSlider);
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
        const rgba = hex2rgba(color);
        this.#color = rgba;
        this.#DOM.hueSlider.setColor(rgba);
        this.#DOM.opacitySlider.setOpacity(1);
        this.#DOM.colorSlider.setColor(rgba);
        if (this.#options.inputVisible) this.#DOM.input.value = color;
    }

    setColorObj(color) {
        this.#color = color;
        this.#DOM.hueSlider.setColor(color);
        this.#DOM.opacitySlider.setColor(color);
        this.#DOM.opacitySlider.setOpacity(color.a);
        this.#DOM.colorSlider.setColor(color);
        if (this.#options.inputVisible) this.#DOM.input.value = rgb2hex(color.r, color.g, color.b);
    }

    updateLibrary() {
        if (this.#options.libraryVisible) this.#DOM.library.updateColors();
    }
}