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
/*Removes duplicate <head> tags*/
async function removeDuplicates(){
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

