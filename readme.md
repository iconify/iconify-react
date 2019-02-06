# Iconify for React

Iconify is a modern open source SVG alternative to glyph fonts. It is a unified framework, aimed to offer all popular icon sets with one easy to use syntax: Font Awesome, Material Design Icons, Jam Icons and several emoji sets: Noto Emoji, Twemoji, EmojiOne, Firefox OS Emoji.

You can use over 30,000 icons without installing multiple dependencies. It can also be used with custom and premium icon sets. No fonts, no massive packages.

Iconify for React generates separate files for each icon, so when compiling your application only icons you use in project will be bundled. That means you can use FontAwesome, MDI, Vaadin, EmojiOne and other icons on same page without loading massive amounts of data.

## Installation

If you are using NPM:
```
npm install @iconify/react
```

If you are using Yarn:
```
yarn add @iconify/react
```

Package does not include icons. Icons will be generated during installation.

## Updating

Unfortunately NPM and Yarn do not re-run installation script when updating dependencies. This makes it impossible to automatically keep icons up to date.

To re-build icons you can either re-install @iconify/react (uninstall it then install it again) or run this after updating dependencies:
```
node node_modules/@iconify/react/build
```

## Usage

```
import { Icon, InlineIcon } from "@iconify/react";
import home from "@iconify/react/mdi-light/home";
import faceWithMonocle from "@iconify/react/twemoji/face-with-monocle";
```
```
<Icon icon={home} />
<p>This is some text with <InlineIcon icon={faceWithMonocle} /></p>
```

## Icon and InlineIcon

Both components are the same, the only difference is InlineIcon has negative vertical alignment, so it behaves like glyph.

Use Icon for decorations, InlineIcon if you are migrating from glyph font.

## Properties

You can pass any custom properties to Icon and InlineIcon.

Custom properties:
* icon - required property, value is icon data.
* width, height - width and/or height of icon. If one attribute is set, other attribute will be calculated using width/height ratio of icon. Default value is "1em".
* hFlip, vFlip - boolean attributes. You can use them to flip icon vertically or horizontally
* flip - string attribute, same as hFlip and vFlip. Value is "horizontal", "vertical" or "horizontal,vertical"
* rotate - rotate icon. Value is number 0-3 (1 = 90deg, 2 = 180deg, 3 = 270deg) or string "90deg", "180deg", "270deg"
* color - icon color, usable only for colorless icons. By default colorless icons use currentColor, so you can set color using stylesheet by setting text color. This property can override it.
* align - icon alignment. It matters only when width and height are both set and width/height ratio doesn't match icon ratio. Value is a string that includes any of these values separated by comma: horizontal alignment: "left", "center", "right", vertical alignment: "top", "middle", "bottom", slice: "meet", "slice". Example: align="left,middle,slice". Default value is "center,middle,meet"

## TypeScript

Iconify for React is compatible with TypeScript. By default build script generates .d.ts files for each icon. See build script command line options below.

If you are using TypeScript, only attributes "id", "className" and "style" are passed to node. If you want to pass other custom attributes, edit icon.d.ts file (or suggest a change by opening issue on @iconify/react repository).

## Icons list

See [Iconify icon sets page](https://iconify.design/icon-sets/) for list of available icons.

## Importing icons

Import format for each icon is "@iconify/react/{prefix}/{icon}" where {prefix} is collection prefix, {icon} is icon name.

Import imports JSON data for icon, to render it use Icon or InlineIcon component.

Each icon is split in its own file, so only icons that you import are compiled when you build React application.

You can use any name for imported icon. For example:
```
import notCat from "@iconify/react/noto-v1/dog";
```

## Build script

You can use build script with custom icon sets that have been converted to [Iconify JSON format](https://iconify.design/docs/json-icon-format/).

Add your own JSON files to directory "json", run build script from command line:

```
node node_modules/@iconify/react/build --source json --target icons --typescript
```
where "json" is directory where JSON files are, "icons" is directory where components will be exported.

There are more command line options:

* --skip foo,bar: list of prefixes to ignore.
* --filter foo,bar: list of prefixes to include. If set, all other prefixes will be ignored
* --file json/custom.json: file to parse
* --files json/custom.json,json/custom2.json: list of additional files to parse, separated by comma.
* --package @iconify/json: parse JSON files in installed package. Use in combination with --dir if files are in sub-directory (see package.json for example).
* --source json: directory where JSON files are located.
* --dir json: sub-directory where JSON files are located, used in combination with --package (see package.json for example).
* --target icons: directory where to save components. Build script will also create sub-directories with prefixes, so for example fa-home will be in icons/fa/home.js
* --typescript: export .d.ts files for each icon. This option doubles amount of files, but it is needed if you are using React with TypeScript. Enabled by default.
* --no-typescript: do not export .d.ts files. Use this if you are not using TypeScript to reduce amount of exported files.
* --no-cleanup: prevent build script from deleting old files. By default everything in target directory is removed to clean up old build data, this will prevent clean up.
* --silent: prevent build script from logging export process.
* --ignore-prefix: do not validate prefixes. By default build script requires filenames to match prefixes, so for example "fa-solid" should be in "fa-solid.json", adding this to command line will prevent that check.
* --ignore-errors: do not stop on error. This applies only to invalid json files. Script will throw errors even with --ignore-errors when there are bad command line parameters.

Examples:
```node node_modules/@iconify/react/build --source json --target icons
node node_modules/@iconify/react/build --module @iconify/json --dir json --target iconify-icons --filter fa-brands,logos,brandico
node node_modules/@iconify/react/build --module @iconify/json --dir json --target iconify-icons --skip fa-brands,logos,brandico --silent
```

## License

React component is released with MIT license.

© 2019 Vjacheslav Trushkin

See [Iconify icon sets page](https://iconify.design/icon-sets/) for list of collections and their licenses.
