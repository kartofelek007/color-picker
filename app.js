import { ColorPicker } from "./colorpicker.js";

const div = document.querySelector("#test");
const cp = new ColorPicker(div, {
    initColor : "#ffff00",
    showLibrary : true,
    showButtonOK : true,
    dynamic : true
});

cp.onColorSelect.on(color => {
    console.log(color);
})

cp.onButtonClick.on(color => {
    console.log(color)
})


