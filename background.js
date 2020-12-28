/*Global Variables*/
let curInterval = 1;//The current increment for sound effect is played
/*EVENT: Updates the settings from the options page to the local storage*/
function updateStorage(msg){
	browser.storage.local.get()
		.then((storage)=>{
			for(const prop in msg){
				if(msg[prop] && prop !== "maxInterval" && prop !== "stop"){
					cleanupURLs(storage[prop]);
					parseDocString(msg[prop],prop);
					if(prop === "images" || prop === "css"){
						parseCSS(msg[prop],prop,storage);
					}else{
						browser.storage.local.set({[prop]:msg[prop]});
					}
				}else if(prop === "maxInterval"){
					//Initialize interval
					curInterval = 0;
					browser.storage.local.set({[prop]:msg[prop]});
				}else if(prop === "soundFX" && !msg[prop]){
					playSound();
				}else if(prop === "stop"){
					browser.storage.local.set({onTabClose:msg[prop]});
					setRemoveSound(msg[prop]);
				}else if(prop === "images" && !msg[prop]){
					resetCSS(storage);
				}
			}
			reloadTabs();
		});
}
/*Revert the stylesheet back to its original form*/
async function resetCSS(storage){
	if(storage.css){
		const cssMap = storage.css;
		const txtArr = [];
		cssMap.set("text",undefined);
		for(const file of cssMap.get("files")){
			let txt = await file.text();
			txtArr.push(txt);
		}
		cssMap.set("text",txtArr);
		browser.storage.local.set({css:cssMap});
	}
}
/*Retrieve CSS file in text form*/
async function parseCSS(docMap,prop,storage){
	const files = docMap.get("files");
	let textArr = [];
	
	if(prop === "css"){
		for(const file of files){
			let txt = await file.text();
			if(storage.images){
				textArr.push(replaceURLs(storage.images,file,txt));
			}else{
				textArr.push(txt);
			}
		}
		docMap.set("text",textArr);
		browser.storage.local.set({[prop]:docMap});
	}
	else if(prop === "images" && storage.css){
		for(const file of storage.css.get("files")){
			let txt = await file.text();
			textArr.push(replaceURLs(docMap,file,txt));
		}
		browser.storage.local.set({[prop]:docMap});
		
		let tempMap = storage.css;
		tempMap.set("text",textArr);
		browser.storage.local.set({css:tempMap});
		
	}else if(prop === "css"){
		browser.storage.local.set({[prop]:docMap});
	}

}
/*Replace links in url functions with new link from extension*/
function replaceURLs(imagesMap,cssFile,cssText){
	for(let i = 0; i < imagesMap.get("files").length; i++){
		const name = imagesMap.get("files")[i].name;
		cssText = cssText.replace(name,imagesMap.get("urls")[i]);
	}
	return cssText;
}
/*Parse the HTML file and remove everything except the body*/
function parseDocString(docMap,prop){
	if(prop === "doc"){
		const file = docMap.get("files")[0];
		file.text()
			.then((text)=>{
				let newMap = docMap.set("text",getBodyText(text));
				browser.storage.local.set({[prop]:newMap});
			});
	}
}
/*Gets html <body> content */
function getBodyText(htmlText){
	const bodyLoc = htmlText.indexOf("<body");
	htmlText = htmlText.substring(bodyLoc);
	return removeHtmlTag(htmlText);
}
/*Removes the </html> tag */
function removeHtmlTag(htmlText){
	return htmlText.replace("</html>","");
}
/*Revoke the old Urls that will no longer be used*/
function cleanupURLs(map){
	if(map){
		for(let url of map.get("urls")){
			URL.revokeObjectURL(url);
		}
	}
}
/*Initialize file blobs & event listeners*/
function initContent(){
	browser.storage.local.get(["css","images","soundFX","onTabClose"])
		.then((storage)=>{
			for(let [prop,value] of Object.entries(storage)){
				if(prop === "onTabClose"){
					setRemoveSound(value);
				}else{
					refreshBlobs(prop,value,storage);
				}
			}
		});
}
/*Refresh the file blobs and their respective URLs*/
function refreshBlobs(prop,map,storage){
	if(map){
		let newURLs = [];
		for(const url of map.get("urls")){
			URL.revokeObjectURL(url);
		}
		for(const file of map.get("files")){
			newURLs.push(URL.createObjectURL(file));
		}
		map.set("urls",newURLs);
		browser.storage.local.set({[prop]:map});

		if(prop === "images"){
			/*Reapply new image locations to CSS files*/
			parseCSS(map,"images",storage);
		}
	}
}
/*Apply new setting changes to all Zoad Tabs*/
function reloadTabs(){
	browser.tabs.query({title:"New Tab"})
		.then((tabs)=>{
			for(let tab of tabs){
				browser.tabs.reload(tab.id);
			}
		});
}
/*EVENT: Play the sound effect when a new tab has been created*/
function playSound(tab){
	browser.storage.local.get(["soundFX","maxInterval","currentInterval","isRandom"])
		.then((storage)=>{
			curInterval += 1;
			stopSound();
			/*Play a new sound effect if none is currently playing*/
			if(storage.soundFX){
				if(!storage.maxInterval || curInterval >= storage.maxInterval){
					const sfxMap = storage.soundFX;
					const audioTag = document.createElement("audio");
					audioTag.src = getSoundEffect(sfxMap);
					audioTag.setAttribute("autoplay","true");
					document.body.append(audioTag);
					audioTag.addEventListener('ended',endOfSound,true);
					if(curInterval !== 1){
						curInterval = 1;
					}
				}

			}
		});
}
/*Set the Event listener for stopping the sound effect when a tab is closed*/
function setRemoveSound(onTabClose){
	if(onTabClose){
		if(!browser.tabs.onRemoved.hasListener(stopSound)){
			browser.tabs.onRemoved.addListener(stopSound);
		}
	}else{
		if(browser.tabs.onRemoved.hasListener(stopSound)){
			browser.tabs.onRemoved.removeListener(stopSound);
		}
	}
}
/*Cleans up the completed sound effect*/
function endOfSound(e){
	e.target.removeEventListener('ended',endOfSound,true);
	e.target.parentNode.removeChild(e.target);
}
/*Stop the sound effect from playing*/
function stopSound(tabId,removeInfo){
	const curAudioTag = document.querySelector("audio");
	if(curAudioTag){
		curAudioTag.parentNode.removeChild(curAudioTag);
	}
}
/*Get a random sound effect*/
function getSoundEffect(sfxMap){
	const urls = sfxMap.get("urls");
	if(urls.length > 1){
		let index = getRandom(0,urls.length);
		return urls[index];
	}
	return urls[0];
}
/*Get random integer (exclusive)*/
function getRandom(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
/*Initialize Functions*/
initContent();
/*---Event Listeners---*/
browser.runtime.onMessage.addListener(updateStorage);
browser.tabs.onCreated.addListener(playSound);
