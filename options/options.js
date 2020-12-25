const themeInput = document.querySelector("#theme");
const backgroundInput = document.querySelector("#background");
const backgroundColorInput = document.querySelector("#background-color");
const textLogoInput = document.querySelector("#text-logo");
const logoInput = document.querySelector("#logo");
const searchInput = document.querySelector("#searchbar");
const sizeInput = document.querySelectorAll("input[name='size']");
const soundInput = document.querySelector("#soundFX");
const clearBtns = document.querySelectorAll("button[name='clear']");
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
        case 'background':
            setFileBlobs(e,{imageURL:"",saveImageFile:""});
            break;
        case 'background-color':
            browser.runtime.sendMessage({bgColor:e.target.value});
            break;
        case 'logo':
            browser.runtime.sendMessage({logo:e.target.checked});
            break;
        case 'text-logo':
            browser.runtime.sendMessage({textLogo:e.target.checked});
            break;
        case 'searchbar':
            console.log("No Searchbar: "+e.target.checked);
            browser.runtime.sendMessage({searchbar:e.target.checked});
            break;
        case 'size':
            browser.runtime.sendMessage({size:e.target.value});
            break;
        case'soundFX':
            setFileBlobsMultiple(e,{soundURLs:[],saveSoundFiles:[]});
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
function setFileBlobs(e,fileStorage){
    const file = e.target.files[0];
    e.target.style.color = "initial";//show file name in options page
    browser.runtime.sendMessage(getFileBlobs(file,fileStorage));
}
/*Set the File Blobs' pairs for saving and using with multiple files*/
function setFileBlobsMultiple(e,fileStorage){
    const fileList = e.target.files;
    e.target.style.color = "initial";//show file name in options page
    browser.runtime.sendMessage(getFileBlobsMultiple(fileList,fileStorage));
}
/*Get a copy of the file blob & URL*/
function getFileBlobs(file,fileStorage){
    if(file){
        const saveFile = new File([file], file.name,
            {
                type:file.type,
                lastModified:file.lastModified
            });

        for(let prop in fileStorage){
            if(prop.includes("URL")){
                fileStorage[prop] = URL.createObjectURL(saveFile);
            }else{
                fileStorage[prop] = saveFile;
            }
        }
        return fileStorage;
    }
}
/*Get a copy of the file blob & URL*/
function getFileBlobsMultiple(fileList,fileStorage){
    if(fileList){
        for(let file of fileList){
            const saveFile = new File([file], file.name,
                {
                    type:file.type,
                    lastModified:file.lastModified
                });

            for(let prop in fileStorage){
                if(prop.includes("URLs")){
                    fileStorage[prop].push(URL.createObjectURL(saveFile));
                }else{
                    fileStorage[prop].push(saveFile);
                }
            }
        }

        return fileStorage;
    }
}
/*OnClick remove the entered file*/
function resetFile(e){
    switch(e.target.value){
        case 'theme':
            browser.theme.reset();
            break;
        case 'background':
            browser.storage.local.get("imageURL")
                .then((url)=>{
                    URL.revokeObjectURL(url);
                    browser.storage.local.set({imageURL:undefined,saveImageFile:undefined});
                    browser.runtime.sendMessage({refresh:true});
                });
            break;
        case 'soundFX':
            browser.storage.local.get("soundURLs")
                .then((storage)=>{
                    for(let url of storage.soundURLs){
                        URL.revokeObjectURL(url);
                    }
                    browser.storage.local.set({soundURLs:undefined,saveSoundFiles:undefined});
                    browser.runtime.sendMessage({refresh:true});
                });
            break;
    }
    document.querySelector(`#${e.target.value}`).style.color = "transparent";
}
/*Initialize settings from the previous session*/
function initOptions(){
    browser.storage.local.get(["searchbar","textLogo","logo","bgColor","saveImageFile","saveSoundFiles","saveThemeFile"])
        .then((storage)=>{
            //Reapply previous settings to options page
            backgroundColorInput.value = storage.bgColor;//set background color
            textLogoInput.checked = storage.textLogo;//set textlogo
            logoInput.checked = storage.logo;//set logo
            searchInput.checked = storage.searchbar;//set searchbar
            if(storage.saveImageFile){
                browser.storage.local.set(getFileBlobs(storage.saveImageFile,{imageURL:"", saveImageFile:""}));
                //backgroundInput.style.color = "initial";
            }
            if(storage.saveSoundFiles){
                browser.storage.local.set(getFileBlobsMultiple(storage.saveSoundFiles,{soundURLs:[], saveSoundFiles:[]}));
                //soundInput.style.color = "initial";
            }
            if(storage.saveThemeFile){
                setTheme(storage.saveThemeFile);
            }

        });
}
initOptions();

/*---Event Listeners---*/
themeInput.addEventListener('change',updateHomepage,true);
backgroundInput.addEventListener('change',updateHomepage,true);
backgroundColorInput.addEventListener('change',updateHomepage,true);
textLogoInput.addEventListener('change',updateHomepage,true);
logoInput.addEventListener('change',updateHomepage,true);
searchInput.addEventListener('change',updateHomepage,true);
for(const size of sizeInput){
    size.addEventListener('change',updateHomepage,true);
}
for(const btn of clearBtns){
    btn.addEventListener('click',resetFile,true);
}
soundInput.addEventListener('change',updateHomepage,true);
