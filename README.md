
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

## How To Use
**All settings are found in the options page.*

For loading images in css using the `url()` function, it must **NOT** contain a directory in the URL.

### Example:

#### Invalid

```css
body{
    background: url("flowers/myimage.png");
}
```

#### Valid

```css
body{
    url("myimage.png");
}
```

## Installation 

## License
Zoad is licensed under the MIT License.

See the [MIT](https://github.com/ZimCodes/zoad-firefox/blob/main/LICENSE) License for more details.
