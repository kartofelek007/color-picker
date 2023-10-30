import {ColorPicker} from "./colorpicker/colorpicker.js";

{
    const place = document.querySelector("#place1");
    const colorPlace = document.querySelector("#color1");
    const cp = new ColorPicker(place, {
        libraryID: "kolory",
        libraryVisible: false,
        inputVisible: false
    });

    cp.onColorSelect.on(color => {
        console.log(`colorpicker1:`, color);
        colorPlace.style.backgroundColor = `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${color.rgba.a})`;
    });
    cp.setColorHEX("#0000fff7")
}

{
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