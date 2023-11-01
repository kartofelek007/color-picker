import {ColorPicker} from "./colorpicker/colorpicker.js";

if (1 === 1) {
    const place = document.querySelector("#place1");
    const colorPlace = document.querySelector("#color1");
    const cp = new ColorPicker(place, {
        libraryID: "kolory",
        libraryVisible: false,
        inputVisible: false,
        opacityColors: false
    });

    cp.onColorSelect.on(color => {
        console.log(`colorpicker1:`, color);
        colorPlace.style.backgroundColor = `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${color.rgba.a})`;
    });

    cp.setColorHEX("#0000fff7")
}

if (1 === 1) {
    const place = document.querySelector("#place2");
    const colorPlace = document.querySelector("#color2");
    const cp = new ColorPicker(place, {
        libraryID: "kolory",
        libraryVisible: true,
        inputVisible: true
    });

    cp.onColorSelect.on(color => {
        console.log(`colorpicker2:`, color);
        colorPlace.style.backgroundColor = `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${color.rgba.a})`;
    });

    cp.setColorObj({r: 255, g: 0, b: 0, a: 0.2});
}

if (1 === 1) {
    const divColor = document.querySelector(".input-color");
    const place = document.querySelector(".input-color-colorpicker-place");
    const input = document.querySelector("#inputText");
    const inputColor = document.querySelector("#inputTextColor");

    divColor.onclick = (e) => {
        e.stopPropagation();
    }
    document.onclick = e => {
        place.classList.remove("is-show");
    }
    input.onfocus = () => {
        place.classList.add("is-show");
    }

    const cp = new ColorPicker(place, {
        libraryID: "kolory",
        libraryVisible: true,
        inputVisible: false,
    });

    cp.onColorSelect.on(color => {
        console.log(`colorpicker3:`, color);
        input.value = color.hex;
        inputColor.style.background = `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${color.rgba.a})`;
    });

    cp.setColorObj({r: 0, g: 255, b: 0, a: 1});

    input.onkeyup = (e) => {
        if (e.key === "Enter") {
            cp.setColorHEX(input.value);
        }
    }
}