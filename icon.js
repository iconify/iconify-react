/**
 * This file is part of the @iconify/react package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import React from 'react';
import SVG from '@iconify/json-tools/src/svg';
import normalize from '@iconify/json-tools/src/normalize';

const component = (props, inline) => {
    if (typeof props.icon !== 'object') {
        return null;
    }

    // Split properties into SVG properties and icon properties
    let split = SVG.splitAttributes(props),
        iconProps = split.icon,
        customAttributes = split.node;

    delete customAttributes.icon;

    // Set default inline value
    if (iconProps.inline === void 0) {
        iconProps.inline = inline;
    }

    // Get SVG data
    let svg = new SVG(normalize(props.icon));
    let iconData = svg.getAttributes(iconProps);

    // Set style
    let style = {
        transform: 'rotate(360deg)'
    };

    if (iconData.style['vertical-align'] !== void 0) {
        style.verticalAlign = iconData.style['vertical-align'];
    }
    if (props.style !== void 0) {
        style = Object.assign(style, props.style);
    }

    // Generate element attributes
    let attributes = Object.assign({
        xmlns: 'http://www.w3.org/2000/svg',
        focusable: false,
        style: style
    }, customAttributes, iconData.attributes);

    attributes.dangerouslySetInnerHTML = {__html: iconData.body};

    // Generate SVG
    return React.createElement('svg', attributes, null);
};

export const Icon = props => component(props, false);
export const InlineIcon = props => component(props, true);

export default Icon;
