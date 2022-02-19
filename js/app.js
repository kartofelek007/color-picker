import { ColorPicker } from "./colorpicker.js";

const c = [];

{
    const div = document.querySelector("#test1");
    const cp = new ColorPicker(div, {
        initColor : "#ff00ff",
        showLibrary : true,
        showButtonOK : false,
        dynamic : true,
        libraryID : "myColorsA"
    });
    c.push(cp);

    cp.onColorSelect.on(color => {
        console.log(color);
    })

    cp.onButtonClick.on(color => {
        console.log(color)
    })

    cp.onColorsUpdate.on(colors => {
        console.log(colors);
        c.forEach(cp => cp.updateLibrary())
    })
}

{
    const div = document.querySelector("#test2");
    const cp = new ColorPicker(div, {
        initColor : "#ff0000",
        showLibrary : true,
        showButtonOK : true,
        dynamic : true,
        libraryID : "myColorsA"
    });
    c.push(cp);

    cp.onColorSelect.on(color => {
        console.log(color);
    })

    cp.onButtonClick.on(color => {
        console.log(color)
    })

    cp.onColorsUpdate.on(colors => {
        console.log(colors);
        c.forEach(cp => cp.updateLibrary())
    })

}

{
    const div = document.querySelector("#test3");
    const cp = new ColorPicker(div, {
        initColor : "#ffff00",
        showLibrary : true,
        showButtonOK : true,
        dynamic : true,
        libraryID : "myColorsB"
    });
    c.push(cp);

    cp.onColorSelect.on(color => {
        console.log(color);
    })

    cp.onButtonClick.on(color => {
        console.log(color)
    })

    cp.onColorsUpdate.on(colors => {
        console.log(colors);
        c.forEach(cp => cp.updateLibrary())
    })

}

{
    const div = document.querySelector("#test4");
    const cp = new ColorPicker(div, {
        initColor : "#0000ff",
        showLibrary : false,
        showButtonOK : true,
        dynamic : true,
        libraryID : "myColorsB"
    });
    c.push(cp);

    cp.onColorSelect.on(color => {
        console.log(color);
    })

    cp.onButtonClick.on(color => {
        console.log(color)
    })

    cp.onColorsUpdate.on(colors => {
        console.log(colors);
        c.forEach(cp => cp.updateLibrary())
    })

}
