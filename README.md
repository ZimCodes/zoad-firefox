
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
All themes added to the loader can accessed through the popup menu. 

The popup menu shows all of your loaded themes conveniently in one place. You could use this menu to switch between any of your loaded themes.

### CSS

Zoad supports the usage of `url()`. Just load the images & Zoad will apply the appropriate links to each `url()`.

### Sound Effects

Zoad supports any audio the `<audio>` supports. Since the only limitation is the amount your local storage space can hold, Zoad will allow you to load any file size & amount. *Go crazy at your own risk*.

## Installation 

## License
Zoad is licensed under the MIT License.

See the [MIT](https://github.com/ZimCodes/zoad-firefox/blob/main/LICENSE) License for more details.
