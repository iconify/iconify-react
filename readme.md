This repository contains old version 1 of Iconify for React.

The latest version has been moved to Iconify monorepo: https://github.com/iconify/iconify/tree/master/packages/react

# Iconify for React

Iconify is a modern open source SVG alternative to glyph fonts. It is a unified framework, aimed to offer all popular icon sets with one easy to use syntax: Font Awesome, Material Design Icons, Jam Icons and several emoji sets: Noto Emoji, Twemoji, EmojiOne, Firefox OS Emoji.

You can use over 40,000 icons without installing multiple dependencies. It can also be used with custom and premium icon sets. No fonts, no massive packages.

Iconify for React generates separate files for each icon, so when compiling your application only icons you use in project will be bundled. That means you can use FontAwesome, MDI, Vaadin, EmojiOne and other icons on same page without loading massive amounts of data.

## Installation

If you are using NPM:

```bash
npm install @iconify/react
```

If you are using Yarn:

```bash
yarn add @iconify/react
```

This package does not include icons. Icons are split into separate packages that available at NPM. See below.

## Usage

Install `@iconify/react` and packages for selected icon sets. Import Icon and/or InlineIcon from `@iconify/react` and icon data for icon you want to use:

```typescript
import { Icon, InlineIcon } from "@iconify/react";
import home from "@iconify/icons-mdi-light/home";
import faceWithMonocle from "@iconify/icons-twemoji/face-with-monocle";
```

Then use Icon or InlineIcon component with icon data as "icon" parameter:

```html
<Icon icon={home} />
<p>This is some text with <InlineIcon icon={faceWithMonocle} /></p>
```

## Icon and InlineIcon

Both components are the same, the only difference is InlineIcon has negative vertical alignment, so it behaves like a glyph.

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

Iconify for React is compatible with TypeScript.

If you are using TypeScript, only attributes "id", "className" and "style" are passed to node. If you want to pass other custom attributes, edit dist/icon.d.ts file (or suggest a change by opening issue on @iconify/react repository).

## Icon Packages

As of version 1.1.0 this package no longer includes icons. There are over 40k icons, each in its own file. That takes a lot of disc space. Because of that icons were moved to multiple separate packages, one package per icon set.

You can find all available icons at https://iconify.design/icon-sets/

Browse or search icons, click any icon and you will see a "React" tab that will give you exact code for the React component.

Import format for each icon is "@iconify/icon-{prefix}/{icon}" where {prefix} is collection prefix, and {icon} is the icon name.

Usage examples for a few popular icon packages:

### Material Design Icons

Package: https://www.npmjs.com/package/@iconify/icons-mdi

Icons list: https://iconify.design/icon-sets/mdi/

Installation:

```bash
npm install @iconify/icons-mdi
```

Usage:

```typescript
import { Icon, InlineIcon } from "@iconify/react";
import home from "@iconify/icons-mdi/home";
import accountCheck from "@iconify/icons-mdi/account-check";
```

```html
<Icon icon={home} />
<p>This is some text with <InlineIcon icon={accountCheck} /></p>
```

### Simple Icons (big collection of logos)

Package: https://www.npmjs.com/package/@iconify/icons-simple-icons

Icons list: https://iconify.design/icon-sets/simple-icons/

Installation:

```bash
npm install @iconify/icons-simple-icons
```

Usage:

```typescript
import { Icon, InlineIcon } from "@iconify/react";
import behanceIcon from "@iconify/icons-simple-icons/behance";
import mozillafirefoxIcon from "@iconify/icons-simple-icons/mozillafirefox";
```

```html
<Icon icon={behanceIcon} />
<p>Mozilla Firefox <InlineIcon icon={mozillafirefoxIcon} /> is the best browser!</p>
```

### Font Awesome 5 Solid

Package: https://www.npmjs.com/package/@iconify/icons-fa-solid

Icons list: https://iconify.design/icon-sets/fa-solid/

Installation:

```bash
npm install @iconify/icons-fa-solid
```

Usage:

```typescript
import { Icon, InlineIcon } from "@iconify/react";
import toggleOn from "@iconify/icons-fa-solid/toggle-on";
import chartBar from "@iconify/icons-fa-solid/chart-bar";
```

```html
<Icon icon={chartBar} />
<p><InlineIcon icon={toggleOn} /> Click to toggle</p>
```

### Noto Emoji

Package: https://www.npmjs.com/package/@iconify/icons-noto

Icons list: https://iconify.design/icon-sets/noto/

Installation:

```bash
npm install @iconify/icons-noto
```

Usage:

```typescript
import { Icon, InlineIcon } from "@iconify/react";
import greenApple from "@iconify/icons-noto/green-apple";
import huggingFace from "@iconify/icons-noto/hugging-face";
```

```html
<Icon icon={greenApple} />
<p>Its time for hugs <InlineIcon icon={huggingFace} />!</p>
```

### Other icon sets

There are over 50 icon sets. This readme shows only few examples. See [Iconify icon sets](http://iconify.design/icon-sets/) for a full list of available icon sets. Click any icon to see code.

## License

React component is released with MIT license.

© 2019 Vjacheslav Trushkin

See [Iconify icon sets page](https://iconify.design/icon-sets/) for list of collections and their licenses.
