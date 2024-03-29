import {Signal} from "../utility/_signals.js";
import {rgb2hex} from "../utility/_functions.js";

export class ColorLibrary {
    #libraryID
    #DOM
    #colors
    #colorsDiv

    constructor(place, libraryID, colorPicker, currentColor) {
        this.onColorSelect = new Signal();
        this.onColorsChange = new Signal();
        this.#DOM = {}
        this.#DOM.colorPicker = colorPicker;
        this.currentColor = currentColor;
        this.#libraryID = libraryID;
        this.#DOM.place = place;
        this.#colors = [];
        this.#readColorsFromStorage();
        this.#createElement();
    }

    #readColorsFromStorage() {
        if (localStorage.getItem(`colorPicker-${this.#libraryID}`)) this.#colors = JSON.parse(localStorage.getItem(`colorPicker-${this.#libraryID}`));
    }

    #createElement() {
        this.#DOM.el = document.createElement("div");
        this.#DOM.el.classList.add("colorpicker-library");

        const btnAdd = document.createElement("button");
        btnAdd.classList.add("colorpicker-library-add");
        btnAdd.type = "button";
        btnAdd.textContent = "+";
        this.#DOM.el.append(btnAdd);

        btnAdd.addEventListener("click", () => {
            const color = this.#DOM.colorPicker.getColor();
            const opacity = this.currentColor * 255;
            const hex = rgb2hex(color.r, color.g, color.b, opacity);
            this.addColor(hex);
        });

        this.#colorsDiv = document.createElement("div");
        this.#colorsDiv.classList.add("colorpicker-library-colors");
        this.#DOM.el.append(this.#colorsDiv);
        this.#DOM.place.append(this.#DOM.el);
        this.#createColors();
    }

    #createColors() {
        this.#colorsDiv.textContent = "";
        this.#colors.forEach(color => {
            this.#createColorElement(color)
        });
    }

    #createColorElement(color) {
        const el = document.createElement("div");
        el.classList.add("colorpicker-library-el");
        el.addEventListener("click", () => {
            this.onColorSelect.emit(color);
        });

        const inside = document.createElement("div");
        inside.classList.add("colorpicker-library-el-inside");
        inside.style.backgroundColor = color;
        el.append(inside);

        const elDel = document.createElement("button");
        elDel.classList.add("colorpicker-library-el-delete");
        elDel.type = "button";
        elDel.textContent = "usuń";
        el.append(elDel);

        elDel.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();

            const elements = [...this.#colorsDiv.querySelectorAll(".colorpicker-library-el")];
            const index = elements.indexOf(el);
            if (index !== -1) {
                this.#deleteColor(index);
            }
        });

        this.#colorsDiv.append(el);
    }

    #deleteColor(index) {
        this.#colors.splice(index, 1);
        localStorage.setItem(`colorPicker-${this.#libraryID}`, JSON.stringify(this.#colors));
        this.onColorsChange.emit(this.#colors);
        this.#createColors();
    }

    addColor(color) {
        this.#colors.push(color);
        localStorage.setItem(`colorPicker-${this.#libraryID}`, JSON.stringify(this.#colors));
        this.#createColors();
        this.onColorsChange.emit(this.#colors);
    }

    updateColors() {
        if (localStorage.getItem(`colorPicker-${this.#libraryID}`)) {
            this.#colors = JSON.parse(localStorage.getItem(`colorPicker-${this.#libraryID}`));
        }
        this.#createColors();
    }
}