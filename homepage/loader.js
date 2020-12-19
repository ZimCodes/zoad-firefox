function updateHomepage(){
    modifyImage();
}
/*Adds Waifu to custom New Tab Page*/
function modifyImage(){
   browser.storage.local.get()
       .then((storage)=>{
            const style = document.createTextNode("body:before {\n" +
                "\tcontent: \"\";\n" +
                "\tz-index: -1;\n" +
                "\tposition: fixed;\n" +
                "\ttop: 0;\n" +
                "\tleft: 0;\n" +
                `\tbackground: ${storage.bgColor} no-repeat url(${storage.imageURL}) center;\n` +
                `\tbackground-size: ${storage.size};\n` +
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
        if(Object.keys(storage).includes("logo")) {
            logoTag.style.display = storage.logo ? "inline-block" : "none";
        }
        if(Object.keys(storage).includes("textLogo")) {
            textTag.style.display = storage.textLogo ? "inline-block" : "none";
        }
        if(Object.keys(storage).includes("searchbar")){
            searchTag.style.display = storage.searchbar ? "flex":"none";
        }
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

