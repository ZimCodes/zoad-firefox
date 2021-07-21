/*Global Variables*/
const domParser = new DOMParser();//loads HTML document;Also replaces 'outerHTML'
/*Apply the settings to the homepage*/
function applySettings(){
   browser.storage.local.get()
       .then((storage)=>{
            if(storage.doc){
                loadHTML(storage.doc);
            }
            if(storage.css){
                loadCSS(storage.css);
            }
            if(storage.bgImage || storage.bgColor){
                loadBackground(storage.bgImage,storage.anchor,storage.canRepeat,storage.bgColor);
            }
           removeDuplicates();
       });
}
function loadHTML(docMap){
    const bodyTag = document.body;
    const parsed = domParser.parseFromString(docMap.get("text"),"text/html");
    document.querySelector("html").replaceChild(parsed.body,bodyTag);
}
function loadCSS(cssMap){
    const styleTag = document.querySelector('style');
    for(const txt of cssMap.get("text")){
        styleTag.append(txt);
    }
}
function loadBackground(bgMap,anchor,repeat,color){
    const styleTag = document.querySelector("style");
    const backgroundAnchor = anchor ? anchor : 'cover';
    const backgroundRepeat = repeat ? 'repeat' : 'no-repeat';
    const backgroundColor = color ? color : '#ffffff';
    let style = "body:before {\n" +
        "\tcontent: \"\";\n" +
        "\tz-index: -1;\n" +
        "\tposition: fixed;\n" +
        "\ttop: 0;\n" +
        "\tleft: 0;\n" +
        `\tbackground-color: ${backgroundColor};\n` +
        `\tbackground-repeat: ${backgroundRepeat};\n` +
        `\tbackground-size: ${backgroundAnchor};\n` +
        "\twidth: 100vw;\n" +
        "\theight: 100vh;\n";
    if(bgMap){
        let urlAmount = bgMap.get("urls").length;
        let urlChoice = getRandom(1,urlAmount);
        style += `\tbackground-image:url("${bgMap.get("urls")[urlChoice]}");\n`
    }
    style += "}";
    const styleNode = document.createTextNode(style);
    styleTag.append(styleNode);
}
/*Get random integer (exclusive)*/
function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
/*Removes duplicate <head> tags*/
function removeDuplicates(){
    const headTags = document.querySelectorAll("head");
    if(headTags.length > 1){
        for(const tag of headTags){
            if(!tag.hasChildNodes()){
                tag.parentNode.removeChild(tag);
            }
        }
    }
}
applySettings();

