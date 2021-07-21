/*Global Variables*/
let curOpenInterval = 0;//The current increment for opening sound effect is played
let curCloseInterval = 0;//The current increment for closing sound effect is played
let curOpenMaxInterval = 0;//The current maxInterval before playing opening sound effect
let curCloseMaxInterval = 0;//The current maxInterval before playing closing sound effect
/*EVENT: Updates the settings from the options page to the local storage*/
function updateStorage(msg){
	browser.storage.local.get()
		.then((storage)=>{
			for(const prop in msg){
				if(msg[prop] && !prop.endsWith("Interval") && prop !== "stop"){
					cleanupURLs(storage[prop]);
					parseDocString(msg[prop],prop);
					if(prop === "images" || prop === "css"){
						parseCSS(msg[prop],prop,storage);
					}else{
						browser.storage.local.set({[prop]:msg[prop]});
					}
				}else if(prop.endsWith("Interval")){
					//Initialize interval
					if(prop === "maxCloseInterval"){
						curCloseInterval = 0;
						curCloseMaxInterval = msg[prop] === 0 ? 0 : getRandom(msg[prop] * 0.5, (msg[prop] * 1.5) + 1);
					}else{
						curOpenInterval = 0;
						curOpenMaxInterval = msg[prop] === 0 ? 0 : getRandom(msg[prop] * 0.5, (msg[prop] * 1.5) + 1);
					}
					browser.storage.local.set({[prop]:msg[prop]});
				}else if(prop.endsWith("FX") && !msg[prop]){
					playSound();
				}else if(prop === "stop"){
					browser.storage.local.set({onTabClose:msg[prop]});
					setRemoveSound(msg[prop],storage.closeFX);
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
				textArr.push(replaceURLs(storage.images,txt));
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
			textArr.push(replaceURLs(docMap,txt));
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
function replaceURLs(imagesMap,cssText){
	for(let i = 0; i < imagesMap.get("files").length; i++){
		const name = imagesMap.get("files")[i].name;
		const url = imagesMap.get("urls")[i];
		cssText = getNewCSS(name,url,cssText);
	}
	return cssText;
}
/*Get a new copy of css with the new image urls added to each url() function*/
function getNewCSS(imageName,imageURL,cssText){
	let content = cssText;
	let fileLocIndex = 1;//Location of filename found inside of a url()
	while(fileLocIndex !== -1){
		fileLocIndex = content.indexOf(imageName);
		if(fileLocIndex !== -1){
			if(content[fileLocIndex - 1] === "/"){
				const leftOpenIndex = openParenthesis(content,fileLocIndex);//open parenthesis
				const rightCloseIndex = closeParenthesis(content,fileLocIndex);//close parenthesis
				const url = content.slice(leftOpenIndex,rightCloseIndex);//Retrieve contents inside of url()
				content = content.replaceAll(url,`"${imageURL}"`);//replace content with image
			}else{
				//Just replace image normally
				content = content.replaceAll(imageName,imageURL);
			}
		}
	}
	return content;
}
//Grab the open parenthesis of url function
function openParenthesis(content,fileLocIndex){
	let pointer = fileLocIndex - 1;
	while(true){
		if(content[pointer] === '('){
			pointer += 1;
			break;
		}
		pointer -= 1;
	}
	return pointer;//open parenthesis
}
//Grab the closed parenthesis of url function
function closeParenthesis(content,fileLocIndex){
	let pointer = fileLocIndex;
	while(true){
		if(content[pointer] === ')'){
			pointer -= 1;
			break;
		}
		pointer += 1;
	}
	return pointer + 1;
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
	browser.storage.local.get(["css","images","openFX","closeFX","soundFX","onTabClose","bgImage","currentTheme"])
		.then((storage)=>{
			for(let [prop,value] of Object.entries(storage)){
				if(prop === "onTabClose"){
					setRemoveSound(value,storage.closeFX);
				}else if(prop === "soundFX" && storage.soundFX){
					/*Cleans up old versions 1.X.X placement of sound fx*/
					browser.storage.local.remove("soundFX");
				}else{
					refreshBlobs(prop,value,storage);
				}
			}
		});
}
/*Initialize current custom theme*/
function initTheme(){
	browser.storage.local.get(["currentTheme"]).then((storage)=>{
		setTheme(storage.currentTheme);
	});
}
/*Initialize Extension*/
function initZoad(){

	initTheme();
	initContent();
	//Reapply refreshed blobs on startup
	reloadTabs();
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
			// Adds more clean file urls to the bgimage
			if(prop === "bgImage"){
				for(let i = 0; i < 4;i++){
					newURLs.push(URL.createObjectURL(file));
				}
			}
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
/*Apply the theme for the browser window*/
function setTheme(json){
	if(json === undefined) return;
	browser.theme.update(
		json
	)
}
/*EVENT: Play the sound effect when a new tab has been created*/
function playSound(tab){
	browser.storage.local.get(["openFX","closeFX","maxOpenInterval","maxCloseInterval","volume"])
		.then((storage)=>{
			if(storage.maxOpenInterval){
				curOpenInterval += 1;
			}
			if(storage.maxCloseInterval){
				curCloseInterval += 1;
			}
			stopSound();
			// Assigns the sound effect type to be played at this time (opening or closing sfx)
			let sfxMap = typeof tab === "object" ? storage.openFX : storage.closeFX;
			let sfxType = typeof tab === "object" ? "open" : "close";
			/*Play a new sound effect if none is currently playing
			* Or the maximum new tabs have been reached*/
			if(!sfxMap) return;
			if(sfxType === "open"){
				if(!storage.maxOpenInterval || curOpenInterval >= curOpenMaxInterval){
					setAudioTag(storage.volume,sfxMap);
					if(storage.maxOpenInterval > 0){
						curOpenMaxInterval = getRandom(storage.maxOpenInterval *0.5,(storage.maxOpenInterval *1.5) +1)
					}
					/*Reset current iteration*/
					if(curOpenInterval !== 0){
						curOpenInterval = 0;
					}
				}
			}else{
				if(!storage.maxCloseInterval || curCloseInterval >= curCloseMaxInterval){
					setAudioTag(storage.volume,sfxMap);
					if(storage.maxCloseInterval > 0){
						curCloseMaxInterval = getRandom(storage.maxCloseInterval *0.5,(storage.maxCloseInterval *1.5) +1)
					}
					/*Reset current iteration*/
					if(curCloseInterval !== 0){
						curCloseInterval = 0;
					}
				}
			}
		});
}
/*Set the audio tag to play a random sound effect*/
function setAudioTag(volume,sfxMap){
	const audioTag = document.createElement("audio");
	audioTag.src = getSoundEffect(sfxMap);
	audioTag.volume = volume;
	audioTag.setAttribute("autoplay","true");
	document.body.append(audioTag);
	audioTag.addEventListener('ended',endOfSound,true);
}
/*Set the Event listener for stopping the sound effect when a tab is closed
* Deactivates if close sound effect has been assigned*/
function setRemoveSound(onTabClose,closeFX){
	if(onTabClose && !closeFX){
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
/*Stop the sound effect if currently playing*/
function stopSound(){
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
/*This is a fix. When user opens a link from an app, the browser opens and attempts to navigate to the link.
* Instead of heading to the link, the user is redirected to a blank page (about:blank).
* This function  takes the user back to their Zoad homepage*/
function navigateHome(){
	browser.tabs.query({url:"about:blank"}).then((tabs)=>{
		if(tabs.length === 0) return;
		browser.tabs.update(
			tabs[0].id,
			{url: browser.runtime.getURL("homepage/index.html") }
		);
	});
}
/*Initialize Functions*/
initZoad();
/*---Event Listeners---*/
browser.runtime.onMessage.addListener(updateStorage);
browser.tabs.onCreated.addListener(playSound);
browser.tabs.onRemoved.addListener(playSound)
/*Fixes to a problem*/
setTimeout(navigateHome,1800);