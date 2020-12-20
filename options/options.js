const themeInput = document.querySelector("#theme");
const backgroundInput = document.querySelector("#background");
const backgroundColorInput = document.querySelector("#background-color");
const textLogoInput = document.querySelector("#text-logo");
const logoInput = document.querySelector("#logo");
const searchInput = document.querySelector("#searchbar");
const sizeInput = document.querySelectorAll("input[name='size']");
const soundInput = document.querySelector("#soundFX");
const clearBtns = document.querySelectorAll("button[name='clear']");

function updateHomepage(e){
    switch (e.target.name){
        case 'theme':
            const themeFile = e.target.files[0];
            themeFile.text()
                .then((content)=>{
                    const json = JSON.parse(content);
                    browser.theme.update(
                        json
                    )
                });
            break;
        case 'background':
            const imageFile = e.target.files[0];
            e.target.style.color = "initial";
            browser.runtime.sendMessage({imageURL: URL.createObjectURL(imageFile)});
            break;
        case 'background-color':
            const color = e.target.value;
            browser.runtime.sendMessage({bgColor:color});
            break;
        case 'logo':
            browser.runtime.sendMessage({logo:e.target.checked});
            break;
        case 'text-logo':
            browser.runtime.sendMessage({textLogo:e.target.checked});
            break;
        case 'searchbar':
            browser.runtime.sendMessage({searchbar:e.target.checked});
            break;
        case 'size':
            browser.runtime.sendMessage({size:e.target.value});
            break;
        case'soundFX':
            const soundFile = e.target.files[0];
            e.target.style.color = "initial";
            browser.runtime.sendMessage({soundURL:URL.createObjectURL(soundFile)});
            break;
    }
}
function resetFile(e){
    switch(e.target.value){
        case 'theme':
            browser.theme.reset();
            break;
        case 'background':
            browser.storage.local.get("imageURL")
                .then((url)=>{
                    URL.revokeObjectURL(url);
                    browser.storage.local.set({imageURL:undefined});
                    browser.runtime.sendMessage({refresh:true});
                });
            break;
        case 'soundFX':
            browser.storage.local.get("soundURL")
                .then((url)=>{
                    URL.revokeObjectURL(url);
                    browser.storage.local.set({soundURL:undefined});
                    browser.runtime.sendMessage({refresh:true});
                });
            break;
    }
    document.querySelector(`#${e.target.value}`).style.color = "transparent";
}
function initOptions(){
    browser.storage.local.get(["searchbar","textLogo","logo","bgColor"])
        .then((storage)=>{
            backgroundColorInput.value = storage.bgColor;
            textLogoInput.checked = storage.textLogo;
            logoInput.checked = storage.logo;
            searchInput.checked = storage.searchbar;
            for(const size of sizeInput){
                if(size.value === storage.size){
                    size.checked = true;
                }
            }
        });
}
initOptions();
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
