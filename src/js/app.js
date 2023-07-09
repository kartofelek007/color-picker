import {ColorPicker} from "./colorpicker/colorpicker.js";

{
    const place = document.querySelector("#test1");
    const cp = new ColorPicker(place, {
        libraryID: "kolory",
        libraryVisible: false,
        inputVisible: false
    });

    cp.onColorSelect.on(color =>  console.log(`colorpicker1:`, color));
    cp.setColorHEX("#0000ff")
}

{
    const place = document.querySelector("#test2");
    const cp = new ColorPicker(place, {
        libraryID: "kolory",
        libraryVisible: true,
        inputVisible: true
    });

    cp.onColorSelect.on(color => console.log(`colorpicker2:`, color));
    cp.setColorObj({r: 255, g: 0, b: 0, a: 0.2});
}