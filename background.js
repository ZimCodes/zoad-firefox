/// Local Storage to hold global variables
const HOME_URL = "/homepage/index.html";
const tabProps = {
	properties:["status"]
};
/*Creates the 'Zoad Tab Page'*/
function setPage(tabID){
	browser.tabs.update(
		tabID,
		{
			active:true,
			loadReplace:true,
			url:HOME_URL
		}
	);
}
/*Determine if created tab is a Firefox New Tab*/
function newTabCreated(tab){
	const pagesToEffect = tab.url.includes("about:privatebrowsing")
	||tab.url.includes("about:home")
	||tab.url.includes("about:newtab");
	if(pagesToEffect){
		setPage(tab.id);
	}
}/*Determine if updated tab is a Firefox New Tab*/
function newTabUpdated(tabID,changeInfo,tab){
	const pagesToEffect = tab.url.includes("about:privatebrowsing")
		||tab.url.includes("about:home")
		||tab.url.includes("about:newtab");
	if(pagesToEffect){
		setPage(tabID);
	}
}
/*Replace all Firefox's New Tabs with a Zoad Tab*/
function loadAllNewTabs(){
	browser.tabs.query({})
		.then((tabs)=>{
			const newTabs = tabs.filter(tab =>
				tab.url.includes("about:privatebrowsing")
				||tab.url.includes("about:home")
				||tab.url.includes("about:newtab")
				||tab.url.includes(browser.runtime.getURL(HOME_URL))
			);
				if(newTabs.length > 0){
					// Update each new tab with the Zoad Tab
					for(let tab of newTabs){
						browser.tabs.update(tab.id,{
							loadReplace: true,
							url: HOME_URL
						});
					}
				}
		});
}
/*Updates the settings from the options page to the local storage*/
function updateStorage(msg){
	browser.storage.local.get()
		.then((storage)=>{
			for(const prop in msg){
				if(msg[prop] !== undefined && storage[prop] !== msg[prop]){

					if(storage[prop] !== undefined && (prop === "imageURL")){
						URL.revokeObjectURL(storage[prop]);
					}
					if(storage[prop] !== undefined && prop === "soundURLs"){
						for(let url of storage[prop]){
							URL.revokeObjectURL(url);
						}
					}
					let newObj = [
						[prop,msg[prop]]
					];

					browser.storage.local.set(Object.fromEntries(newObj));
					if(prop === "imageURL" || prop === "soundURLs"){
						loadAllNewTabs();
					}
				}
			}
		});
}
/*Retrieves the settings from the options page*/
function getProperties(msg){
	if(!msg.refresh){
		updateStorage(msg)
	}
	reloadTabs();
}
/*Apply new setting changes to all Zoad Tabs*/
function reloadTabs(){
	browser.tabs.query({title:"Zoad Tab"})
		.then((tabs)=>{
			for(let tab of tabs){
				browser.tabs.reload(tab.id);
			}
		});
}
/*---Event Listeners---*/
browser.runtime.onMessage.addListener(getProperties);
browser.tabs.onCreated.addListener(newTabCreated);
browser.tabs.onUpdated.addListener(newTabUpdated,tabProps);