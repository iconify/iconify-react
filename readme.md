# Iconify for React

This is a development version. Proper readme will be here later

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
* align - icon alignment. It matters only when width and height are both set and width/height ratio doesn't match icon ratio. Value is a string that includes any of these values separated by comma: horizontal alignement: "left", "center", "right", vertical alignment: "top", "middle", "bottom", slice: "meet", "slice". Example: align="left,middle,slice". Default value is "center,middle,meet"

## Icons list

See [Iconify icon sets page](https://iconify.design/icon-sets/) for list of available icons.

Import format for each icon is "@iconify/react/{prefix}/{icon}" where {prefix} is collection prefix, {icon} is icon name.
Import imports JSON data for icon, to render it use Icon or InlineIcon component.

Each icon is split in its own file, so only icons that you import are compiled when you build React application.

## License

React component is released with MIT license.

© 2019 Vjacheslav Trushkin

See [Iconify icon sets page](https://iconify.design/icon-sets/) for list of collections and their licenses.
