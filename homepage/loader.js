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
                loadBackground(getNewBGImageBlob(storage.bgImage),storage.anchor,storage.canRepeat,storage.bgColor);
            }
           removeDuplicates();
       });
}
/*Refresh Background image blobs to be retrieved*/
function getNewBGImageBlob(bgMap){
    if(bgMap){
        const imageFile = bgMap.get("files")[0];
        bgMap = getCleanBGMap(bgMap);
        if(bgMap.get("urls").length > 0){
            let blobToDelete = bgMap.get("urls").pop();
            URL.revokeObjectURL(blobToDelete);
        }
        let newURLs = [];
        let newImageBlob = URL.createObjectURL(imageFile);
        newURLs.push(newImageBlob);
        bgMap.set("urls",newURLs);
        browser.storage.local.set({"bgImage":bgMap});
        return newImageBlob;
    }
    return "";
}
/*Cleans up versions 2.0.X method of loading background images*/
function getCleanBGMap(bgMap){
    if(bgMap.get("urls").length > 1){
        bgMap.set("urls",[]);
    }
    return bgMap;
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
function loadBackground(bgImageBlob,anchor,repeat,color){
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
    if(bgImageBlob){
        style += `\tbackground-image:url("${bgImageBlob}");\n`
    }
    style += "}";
    const styleNode = document.createTextNode(style);
    styleTag.append(styleNode);
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

