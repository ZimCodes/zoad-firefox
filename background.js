/*Updates the settings from the options page to the local storage*/
function updateStorage(msg){
	browser.storage.local.get()
		.then((storage)=>{
			for(const prop in msg){
				if(msg[prop] !== undefined){
					CleanupURLs(storage[prop]);
					let newObj = [
						[prop,msg[prop]]
					];
					browser.storage.local.set(Object.fromEntries(newObj));
					ApplyNewURLs(prop);
				}
			}
		});
}
/*Apply the new resources to the page*/
function ApplyNewURLs(prop){
	if(prop === "imageURL" || prop === "soundURLs"){
		reloadTabs();
	}
}
/*Revoke the old Urls that will no longer be used*/
function CleanupURLs(value){
	if(value === "soundURLs" || value === "imageURL"){
		if(Array.isArray(value)){
			for(let url of value){
				URL.revokeObjectURL(url);
			}
		}else{
			URL.revokeObjectURL(value);
		}
	}
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
	browser.tabs.query({title:"New Tab"})
		.then((tabs)=>{
			for(let tab of tabs){
				browser.tabs.reload(tab.id);
			}
		});
}
/*---Event Listeners---*/
browser.runtime.onMessage.addListener(getProperties);