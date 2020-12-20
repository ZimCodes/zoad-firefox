function updateHomepage(){
    modifyImage();
}
/*Adds Waifu to custom New Tab Page*/
function modifyImage(){
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
function removeFirefox(storage){
    const logoTag = document.querySelector(".logo-and-wordmark .logo");
    const textTag = document.querySelector(".logo-and-wordmark .wordmark");
    const searchTag = document.querySelector(".search-inner-wrapper");
    logoTag.style.display = storage.logo||!Object.keys(storage).includes("logo") ? "none": "inline-block";
    textTag.style.display = storage.textLogo||!Object.keys(storage).includes("textLogo") ? "none": "inline-block";
    searchTag.style.display = storage.searchbar||!Object.keys(storage).includes("searchbar") ? "none":"flex";

}
function playSound(storage){
    let audioTag = document.createElement("audio");
    audioTag.src = storage.soundURL;
    audioTag.setAttribute("autoplay","true");
    document.body.append(audioTag);
    audioTag.addEventListener('ended',endSound,true);
}
function endSound(e){
    e.target.removeEventListener('ended',endSound,true);
    e.target.parentNode.removeChild(e.target);
}
updateHomepage();

