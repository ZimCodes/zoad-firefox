/*Apply the settings to the homepage*/
function applySettings(){
   browser.storage.local.get()
       .then((storage)=>{
           const imageURLProp = storage.imageURL ? "url("+storage.imageURL+")" : "";
           const bgColorProp = storage.bgColor ? storage.bgColor : "white";
           const sizeProp = storage.size ? storage.size : "cover" ;
            const style = document.createTextNode("body:before {\n" +
                "\tcontent: \"\";\n" +
                "\tz-index: -1;\n" +
                "\tposition: fixed;\n" +
                "\ttop: 0;\n" +
                "\tleft: 0;\n" +
                `\tbackground: ${bgColorProp} no-repeat ${imageURLProp} center;\n` +
                `\tbackground-size: ${sizeProp};\n` +
                "\twidth: 100vw;\n" +
                "\theight: 100vh;\n" +
                "}");
            const styleTag = document.createElement("style");
            styleTag.append(style);
            document.head.append(styleTag);
            playSound(storage);
            removeFirefox(storage);
       });
}
/*Removes the firefox assets from the homepage*/
function removeFirefox(storage){
    const logoTag = document.querySelector(".logo-and-wordmark .logo");
    const textTag = document.querySelector(".logo-and-wordmark .wordmark");
    const searchTag = document.querySelector(".search-inner-wrapper");
    logoTag.style.display = storage.logo && Object.keys(storage).includes("logo") ? "none":"inline-block";
    textTag.style.display = storage.textLogo && Object.keys(storage).includes("textLogo") ? "none":"inline-block";
    searchTag.style.display = storage.searchbar && Object.keys(storage).includes("searchbar") ? "none":"flex";

}
/*Play the sound effect*/
function playSound(storage){
    let audioTag = document.createElement("audio");
    if(storage.soundURLs){
        audioTag.src = getSoundEffect(storage);
    }
    audioTag.setAttribute("autoplay","true");
    document.body.append(audioTag);
    audioTag.addEventListener('ended',endSound,true);
}
/*Cleans up the completed sound effect*/
function endSound(e){
    e.target.removeEventListener('ended',endSound,true);
    e.target.parentNode.removeChild(e.target);
}
/*Get random integer (exclusive)*/
function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
function getSoundEffect(storage){
    if(storage.soundURLs.length > 1){
        let index = getRandom(0,storage.soundURLs.length);
        return storage.soundURLs[index];
    }
    return storage.soundURLs[0];
}
applySettings();

