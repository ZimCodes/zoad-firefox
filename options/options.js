
/*Update the homepage*/
function updateHomepage(e){
    switch (e.target.name){
        case 'theme':
            const themeFile = e.target.files[0];
            e.target.style.color = "initial";
            themeFile.text()
                .then((content)=>{
                    const json = JSON.parse(content);
                    browser.storage.local.set({saveThemeFile:json});
                    setTheme(json);
                });
            break;
        case 'stop':
            browser.runtime.sendMessage({stop:e.target.checked});
            break;
        case 'interval':
            browser.runtime.sendMessage({maxInterval:e.target.value});
            break;
        default:
            setFileBlobs(e);
            break;
    }

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
function resetFile(e){
    switch(e.target.value){
        case 'theme':
            browser.storage.local.set({saveThemeFile: undefined});
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
                        if(e.target.value === "soundFX"){
                            browser.runtime.sendMessage({[e.target.value]: undefined});
                        }
                    }

                });
            break;
    }
    document.querySelector(`#${e.target.value}`).style.color = "transparent";
}
/*Initialize settings from the previous session*/
function initOptions(){
    browser.storage.local.get(["saveThemeFile","onTabClose"])
        .then((storage)=>{
            //Reapply previous settings
            if(storage.saveThemeFile){
                setTheme(storage.saveThemeFile);
            }
            if(storage.maxInterval){
                document.querySelector("#interval").value = storage.maxInterval;
            }
            if(storage.onTabClose){
                document.querySelector("#stop").checked = storage.onTabClose;
            }
        });
}
initOptions();

/*---Event Listeners---*/
document.querySelector("#theme").addEventListener('change',updateHomepage,true);
document.querySelector("#doc").addEventListener('change',updateHomepage,true);
document.querySelector("#css").addEventListener('change',updateHomepage,true);
document.querySelector("#images").addEventListener('change',updateHomepage,true);
document.querySelector("#soundFX").addEventListener('change',updateHomepage,true);
document.querySelector("#interval").addEventListener('input',updateHomepage,true);
document.querySelector("#stop").addEventListener('change',updateHomepage,true);
const clearBtns = document.querySelectorAll("button[name='clear']");
for(const btn of clearBtns){
    btn.addEventListener('click',resetFile,true);
}

