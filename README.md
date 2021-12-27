
# zoad-firefox
*Zoad* is a firefox extension for loading custom themes to your Firefox homepage.

<p align="center"><img width="50%" src="./zoad-logo.svg" alt="Zoad Logo"/></p>

## Load Features
Zoad allows you to load various files:
- [Browser Theme](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme)
- HTML Document
- CSS Stylesheets
- Images
- Sound Effects

## More Info
**All settings are found in the options page.*

### HTML
For the HTML Document, only the `<body>` is loaded. *All tags outside of `<body>` are ignored.*

### Themes
All themes added to the loader can be accessed through the popup menu. 

The popup menu shows all of your loaded themes conveniently in one place. You could use this menu to switch between any of your loaded themes.

Need a theme? Check out this [alternative theme pack](https://github.com/ZimCodes/doki-theme-web/archive/refs/heads/alt-themes.zip) for the doki-theme-firefox edition. 

### CSS

Zoad supports the usage of `url()`. Just load the images & Zoad will apply the appropriate images to each `url()`.

### Background Options

Zoad supports loading an image as a background. You can even change the background color of the homepage.

### Sound Effects

Zoad supports [common audio formats](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers) listed on MDN. With the _unlimitedStorage_ permission, Zoad will allow you to load any file size & amount on your local storage. So, load as much as your local storage can handle.

*Want to know more about the permissions? Take a look at the [PERMISSIONS](https://github.com/ZimCodes/zoad-firefox/blob/main/PERMISSION.md) file.

## Installation 
Zoad is available for installation at [Mozilla's Addon Store](https://addons.mozilla.org/en-US/firefox/addon/zoad-custom-loader).

## License
Zoad is licensed under the MIT License.

See the [MIT](https://github.com/ZimCodes/zoad-firefox/blob/main/LICENSE) License for more details.
