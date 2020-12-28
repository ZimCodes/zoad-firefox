/*EVENT: Apply the selected theme*/
function themeChoice(e){
    if(e.target.value === "off"){
        browser.storage.local.set({currentTheme: undefined});
        browser.theme.reset();
    }
    else{
        browser.storage.local.get("themes")
            .then((storage)=>{
                if(storage.themes){
                    const fileIndex = storage.themes.get("names").indexOf(e.target.value);
                    const json = storage.themes.get("json")[fileIndex];
                    setTheme(json);
                    browser.storage.local.set({currentTheme:json});
                }
            });
    }
}
/*Set the browser theme*/
function setTheme(json){
    browser.theme.update(
        json
    );
}
/*Initialize the options in the popup menu*/
async function initOptions(){
    browser.storage.local.get(["themes","currentTheme"])
        .then((storage)=>{
            const selectTag = document.querySelector("#themes");
            const optTags = [];
            for(const fileName of storage.themes.get("names")) {
                const displayName = fileName.replace(".json","");
                const optTag = document.createElement("option");
                optTag.setAttribute("value", fileName);
                const txtNode = document.createTextNode(displayName);
                optTag.append(txtNode);
                optTags.push(optTag);
            }
            optTags.sort((a,b)=> a.value.localeCompare(b.value));
            optTags.forEach(element=>selectTag.append(element));

            if(storage.currentTheme){
                selectTag.value = storage.currentTheme;
            }
        });
}
/*Initialization*/
initOptions();
/*Event Listeners*/
document.querySelector("#themes").addEventListener('change',themeChoice,true);