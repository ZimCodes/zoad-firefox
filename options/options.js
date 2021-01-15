/*Update the homepage*/
function updateHomepage(e){
    switch (e.target.name){
        case 'themes':
            browser.storage.local.get("themes")
                .then((storage)=>{
                    let files = e.target.files;
                    e.target.style.color = "initial";
                    if(storage.themes){
                        const newMap = storage.themes;
                        for(const file of files){
                            if(!storage.themes.get("names").includes(file.name)){
                                file.text()
                                    .then((content)=>{
                                        newMap.get("names").push(file.name);
                                        newMap.get("json").push(JSON.parse(content));
                                        browser.storage.local.set({themes:newMap});
                                    });
                            }
                        }
                    }else{
                        let newMap = new Map();
                        let jsonArr = [];
                        let nameArr = [];
                        for(const file of files){
                            if(!nameArr.includes(file.name)){
                                file.text().then((content)=>{
                                    nameArr.push(file.name);
                                    jsonArr.push(JSON.parse(content));
                                    newMap.set("names",nameArr);
                                    newMap.set("json",jsonArr);
                                    browser.storage.local.set({themes:newMap});
                                });
                            }
                        }
                    }
                });
            break;
        case 'stop':
            browser.runtime.sendMessage({stop:e.target.checked});
            break;
        case 'interval':
            browser.runtime.sendMessage({maxInterval:e.target.value});
            break;
        case 'anchor':
            browser.storage.local.set({anchor:e.target.value});
            reloadTabs();
            break;
        case 'repeat':
            browser.storage.local.set({canRepeat:e.target.checked});
            reloadTabs();
            break;
        case 'bgColor':
            browser.storage.local.set({bgColor:e.target.value});
            reloadTabs();
            break;
        default:
            setFileBlobs(e);
            break;
    }
    loadStats();
}
/*Apply the theme for the browser window*/
function setTheme(json){
    browser.theme.update(
        json
    )
}
/*Set the File Blob pairs, for saving and for using*/
function setFileBlobs(e){
    const files = e.target.files;
    e.target.style.color = "initial";//show file name in options page
    browser.runtime.sendMessage(getFileBlobs(e.target.name,files));
}
/*Get a copy of the file blobs & URLs*/
function getFileBlobs(storageName,filelist){
    if(filelist){
        let saveFiles = [];
        let saveURLs = [];
        let fileMap = new Map();
        for(const file of filelist){
            const saveFile = new File([file],
                file.name,
                {
                    type:file.type,
                    lastModified:file.lastModified
                });
            saveFiles.push(saveFile);
            saveURLs.push(URL.createObjectURL(saveFile));
        }
        fileMap.set("urls",saveURLs);
        fileMap.set("files",saveFiles);
        return {[storageName]: fileMap};
    }
}
/*OnClick remove the entered file*/
async function resetFile(e){
    switch(e.target.value){
        case 'themes':
            browser.storage.local.set({themes: undefined,currentTheme:undefined});
            browser.theme.reset();
            break;
        default:
            browser.storage.local.get(e.target.value)
                .then((saveFiles)=>{
                    if(saveFiles[e.target.value]){
                        for(let url of saveFiles[e.target.value].get("urls")){
                            URL.revokeObjectURL(url);
                        }
                        browser.storage.local.set({[e.target.value]: undefined});
                        if(e.target.value === "soundFX" || e.target.value === "images"){
                            browser.runtime.sendMessage({[e.target.value]: undefined});
                        }
                    }

                });
            break;
    }
    document.querySelector(`#${e.target.value}`).style.color = "transparent";
    reloadTabs();
    loadStats();
}
/*Apply new setting changes to all Zoad Tabs*/
async function reloadTabs(){
    browser.tabs.query({title:"New Tab"})
        .then((tabs)=>{
            for(let tab of tabs){
                browser.tabs.reload(tab.id);
            }
        });
}
/*Loads the current amount of items loaded.
* Warning: Late Updating
* */
async function loadStats(){
    browser.storage.local.get(["themes","doc","css","images","soundFX","bgColor","bgImage","anchor","canRepeat"])
        .then((storage)=>{
            const dataTag = document.querySelector("#data");
            let dataTxt = "";
            for(const [prop,map] of Object.entries(storage)){
                switch(prop){
                    case 'themes':
                        dataTxt += `${prop}: ${map.get("names").length}|`;
                        break;
                    case 'bgColor':
                        dataTxt += `${prop}: ${map}|`;
                        break;
                    case 'anchor':
                        dataTxt += `${prop}: ${map}|`;
                        break;
                    case 'canRepeat':
                        dataTxt += `${prop}: ${map}|`;
                        break;
                    default:
                        dataTxt += `${prop}: ${map.get("files").length}|`;
                        break;
                }
            }
            const txtNode = document.createTextNode(dataTxt);
            dataTag.replaceChildren();
            dataTag.append(txtNode);
        });
}
/*Initialize settings from the previous session*/
function initOptions(){
    browser.storage.local.get(["currentTheme","onTabClose","maxInterval","canRepeat","anchor","bgColor"])
        .then((storage)=>{
            //Reapply previous settings
            if(storage.currentTheme){
                setTheme(storage.currentTheme);
            }
            if(storage.maxInterval){
                document.querySelector("#interval").value = storage.maxInterval;
            }
            if(storage.anchor){
                const anchorTypes = document.querySelectorAll("input[name='anchor']");
                for(const anchor of anchorTypes){
                    if(anchor.value === storage.anchor){
                        anchor.checked = true;
                    }
                }
            }
            if(storage.bgColor){
                document.querySelector("#bgColor").value = storage.bgColor;
            }
            document.querySelector("#stop").checked = !!storage.onTabClose;
            document.querySelector("#repeat").checked = !!storage.canRepeat;
            loadStats();
        });
}
initOptions();

/*---Event Listeners---*/
document.querySelector("#themes").addEventListener('change',updateHomepage,true);
document.querySelector("#doc").addEventListener('change',updateHomepage,true);
document.querySelector("#css").addEventListener('change',updateHomepage,true);
document.querySelector("#images").addEventListener('change',updateHomepage,true);
document.querySelector("#soundFX").addEventListener('change',updateHomepage,true);
document.querySelector("#interval").addEventListener('input',updateHomepage,true);
document.querySelector("#stop").addEventListener('change',updateHomepage,true);
document.querySelector("#bgImage").addEventListener('change',updateHomepage,true);
document.querySelector("#repeat").addEventListener('change',updateHomepage,true);
document.querySelector("#bgColor").addEventListener('change',updateHomepage,true);
const clearBtns = document.querySelectorAll("button[name='clear']");
for(const btn of clearBtns){
    btn.addEventListener('click',resetFile,true);
}
const anchorTypes = document.querySelectorAll("input[name='anchor']");
for(const anchor of anchorTypes){
    anchor.addEventListener('change',updateHomepage,true);
}

