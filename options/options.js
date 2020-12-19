const themeInput = document.querySelector("#theme");
const backgroundInput = document.querySelector("#background");
const backgroundColorInput = document.querySelector("#background-color");
const textLogoInput = document.querySelector("#text-logo");
const logoInput = document.querySelector("#logo");
const searchInput = document.querySelector("#searchbar");
const sizeInput = document.querySelectorAll("input[name='size']");
const soundInput = document.querySelector("#soundFX");
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
            for(const size of sizeInput){
                if(size.checked){
                    browser.runtime.sendMessage({size:size.value});
                    break;
                }
            }
            break;
        case'soundFX':
            const soundFile = e.target.files[0];
            browser.runtime.sendMessage({soundURL:URL.createObjectURL(soundFile)});
            break;
    }
}
function initOptions(){
    browser.storage.local.set({imageURL: ""});
    browser.storage.local.get(["searchbar","textLogo","logo","bgColor"])
        .then((storage)=>{
            backgroundColorInput.value = storage.bgColor;
            textLogoInput.checked = storage.textLogo;
            logoInput.checked = storage.logo;
            searchInput.checked = storage.searchbar;

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
soundInput.addEventListener('change',updateHomepage,true);
