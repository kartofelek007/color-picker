import { PubSub } from "./pubsub.js";
import { rgb2hex } from "./functions.js";

export class Library {
    constructor(place, colorPicker) {
        this.colorPicker = colorPicker;
        this.place = place;
        this.onColorSelect = new PubSub();
        this.colors = [];
        if (localStorage.getItem("colors")) this.colors = JSON.parse(localStorage.getItem("colors"));
        this.colorIndex = this.colors.length;
        this.createElement();
    }

    createElement() {
        this.el = document.createElement("div");
        this.el.classList.add("color-library");

        const btnAdd = document.createElement("button");
        btnAdd.classList.add("color-library-add");
        btnAdd.type = "button";
        btnAdd.textContent = "+";
        this.el.append(btnAdd);

        btnAdd.addEventListener("click", e => {
            const color = this.colorPicker.getColor();
            const hex = rgb2hex(color.r, color.g, color.b);
            this.addColor(hex);
            this.createColors();
        });

        this.colorsDiv = document.createElement("div");
        this.colorsDiv.classList.add("color-library-colors");
        this.el.append(this.colorsDiv);

        this.place.append(this.el);
        this.createColors();
    }

    createColors() {
        this.colorsDiv.textContent = "";
        this.colors.forEach(color => {
            this.createColorElement(color.color, color.index);
        })
    }

    deleteColor(indexToDelete) {
        const index = this.colors.findIndex(ob => ob.index === indexToDelete);
        if (index) {
            this.colors.splice(index, 1);
        }
        this.createColors();
    }

    addColor(color) {
        this.colorIndex++;
        this.colors.push({index : this.colorIndex, color});
        console.log(JSON.stringify(this.colors));
        localStorage.setItem("colors", JSON.stringify(this.colors));
    }

    createColorElement(color, index = null) {
        if (index === null) {
            index = ++this.colorIndex;
        }

        const el = document.createElement("div");
        el.dataset.index = index;
        el.classList.add("color-library-el");
        el.style.background = color;
        el.addEventListener("click", e => {
            this.onColorSelect.emit(color);
        })

        const elDel = document.createElement("button");
        elDel.classList.add("color-library-el-delete");
        elDel.type = "button";
        elDel.textContent = "usuń";
        el.append(elDel);

        elDel.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            this.deleteColor(index)
        })

        this.colorsDiv.append(el);
    }
}