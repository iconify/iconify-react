/**
 * This file is part of the @iconify/react package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import React from 'react';

/**
 * Unique id counter
 *
 * @type {number}
 */
let idCounter = 0;

/**
 * Regex used to split dimensions
 *
 * @type {RegExp}
 * @private
 */
const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;

/**
 * Attributes used for icon
 *
 * @type {string[]}
 */
const iconAttributes = ['width', 'height', 'inline', 'hFlip', 'vFlip', 'flip', 'rotate', 'align', 'color', 'box'];

/**
 * Default attribute values
 *
 * @type {object}
 */
const defaultAttributes = {
    left: 0,
    top: 0,
    width: 16,
    height: 16,
    rotate: 0,
    hFlip: false,
    vFlip: false
};

/**
 * Add missing properties to icon
 *
 * Important: in PHP version of this library this function is part of Collection class: Collection::addMissingAttributes()
 *
 * JavaScript version uses separate file so this function could be used in React and other components without loading
 * entire Collection class.
 *
 * @param {object} data
 * @return {object}
 */
function normalize(data) {
    // Object.create, compatible with IE11
    let item = Object.create(null);
    let key;
    for (key in defaultAttributes) {
        item[key] = defaultAttributes[key];
    }
    for (key in data) {
        item[key] = data[key];
    }

    // Attributes derived from other attributes
    if (item.inlineTop === void 0) {
        item.inlineTop = item.top;
    }
    if (item.inlineHeight === void 0) {
        item.inlineHeight = item.height;
    }
    if (item.verticalAlign === void 0) {
        // -0.143 if icon is designed for 14px height,
        // otherwise assume icon is designed for 16px height
        item.verticalAlign = item.height % 7 === 0 && item.height % 8 !== 0 ? -0.143 : -0.125;
    }
    return item;
}

/**
 * Get preserveAspectRatio attribute value
 *
 * @param {object} align
 * @return {string}
 * @private
 */
function getAlignment(align) {
    let result;
    switch (align.horizontal) {
        case 'left':
            result = 'xMin';
            break;

        case 'right':
            result = 'xMax';
            break;

        default:
            result = 'xMid';
    }
    switch (align.vertical) {
        case 'top':
            result += 'YMin';
            break;

        case 'bottom':
            result += 'YMax';
            break;

        default:
            result += 'YMid';
    }
    result += align.slice ? ' slice' : ' meet';
    return result;
}

/**
 * SVG class
 *
 * @see @iconify/json-tools/src/svg.js
 */
class SVG {
    /**
     * Constructor
     *
     * @param icon Icon data
     *  Use Collection.getIconData() to retrieve icon data
     */
    constructor(icon) {
        this._item = icon;
    }

    /**
     * Get SVG attributes
     *
     * @param {object} props Custom properties (same as query string in Iconify API)
     * @returns {string}
     */
    getAttributes(props) {
        let item = this._item;
        if (typeof props !== 'object') {
            props = Object.create(null);
        }

        // Set data
        let align = {
            horizontal: 'center',
            vertical: 'middle',
            slice: false
        };
        let transform = {
            rotate: item.rotate,
            hFlip: item.hFlip,
            vFlip: item.vFlip
        };
        let style = Object.create(null);

        let attributes = Object.create(null);

        // Get width/height
        let inline = props.inline === true || props.inline === 'true' || props.inline === '1';

        let box = {
            left: item.left,
            top: inline ? item.inlineTop : item.top,
            width: item.width,
            height: inline ? item.inlineHeight : item.height
        };

        // Transformations
        ['hFlip', 'vFlip'].forEach(key => {
            if (props[key] !== void 0 && (props[key] === true || props[key] === 'true' || props[key] === '1')) {
                transform[key] = !transform[key];
            }
        });
        if (props.flip !== void 0) {
            props.flip.toLowerCase().split(/[\s,]+/).forEach(value => {
                switch (value) {
                    case 'horizontal':
                        transform.hFlip = !transform.hFlip;
                        break;

                    case 'vertical':
                        transform.vFlip = !transform.vFlip;
                }
            });
        }
        if (props.rotate !== void 0) {
            let value = props.rotate;
            if (typeof value === 'number') {
                transform.rotate += value;
            } else if (typeof value === 'string') {
                let units = value.replace(/^-?[0-9.]*/, '');
                if (units === '') {
                    value = parseInt(value);
                    if (!isNaN(value)) {
                        transform.rotate += value;
                    }
                } else if (units !== value) {
                    let split = false;
                    switch (units) {
                        case '%':
                            // 25% -> 1, 50% -> 2, ...
                            split = 25;
                            break;

                        case 'deg':
                            // 90deg -> 1, 180deg -> 2, ...
                            split = 90;
                    }
                    if (split) {
                        value = parseInt(value.slice(0, value.length - units.length));
                        if (!isNaN(value)) {
                            transform.rotate += Math.round(value / split);
                        }
                    }
                }
            }
        }

        // Apply transformations to box
        let transformations = [],
            tempValue;
        if (transform.hFlip) {
            if (transform.vFlip) {
                transform.rotate += 2;
            } else {
                // Horizontal flip
                transformations.push('translate(' + (box.width + box.left) + ' ' + (0 - box.top) + ')');
                transformations.push('scale(-1 1)');
                box.top = box.left = 0;
            }
        } else if (transform.vFlip) {
            // Vertical flip
            transformations.push('translate(' + (0 - box.left) + ' ' + (box.height + box.top) + ')');
            transformations.push('scale(1 -1)');
            box.top = box.left = 0;
        }
        switch (transform.rotate % 4) {
            case 1:
                // 90deg
                tempValue = box.height / 2 + box.top;
                transformations.unshift('rotate(90 ' + tempValue + ' ' + tempValue + ')');
                // swap width/height and x/y
                if (box.left !== 0 || box.top !== 0) {
                    tempValue = box.left;
                    box.left = box.top;
                    box.top = tempValue;
                }
                if (box.width !== box.height) {
                    tempValue = box.width;
                    box.width = box.height;
                    box.height = tempValue;
                }
                break;

            case 2:
                // 180deg
                transformations.unshift('rotate(180 ' + (box.width / 2 + box.left) + ' ' + (box.height / 2 + box.top) + ')');
                break;

            case 3:
                // 270deg
                tempValue = box.width / 2 + box.left;
                transformations.unshift('rotate(-90 ' + tempValue + ' ' + tempValue + ')');
                // swap width/height and x/y
                if (box.left !== 0 || box.top !== 0) {
                    tempValue = box.left;
                    box.left = box.top;
                    box.top = tempValue;
                }
                if (box.width !== box.height) {
                    tempValue = box.width;
                    box.width = box.height;
                    box.height = tempValue;
                }
                break;
        }

        // Calculate dimensions
        // Values for width/height: null = default, 'auto' = from svg, false = do not set
        // Default: if both values aren't set, height defaults to '1em', width is calculated from height
        let customWidth = props.width ? props.width : null;
        let customHeight = props.height ? props.height : null;

        let width, height;
        if (customWidth === null && customHeight === null) {
            customHeight = '1em';
        }
        if (customWidth !== null && customHeight !== null) {
            width = customWidth;
            height = customHeight;
        } else if (customWidth !== null) {
            width = customWidth;
            height = SVG.calculateDimension(width, box.height / box.width);
        } else {
            height = customHeight;
            width = SVG.calculateDimension(height, box.width / box.height);
        }

        if (width !== false) {
            attributes.width = width === 'auto' ? box.width : width;
        }
        if (height !== false) {
            attributes.height = height === 'auto' ? box.height : height;
        }

        // Add vertical-align for inline icon
        if (inline && item.verticalAlign !== 0) {
            style['vertical-align'] = item.verticalAlign + 'em';
        }

        // Check custom alignment
        if (props.align !== void 0) {
            props.align.toLowerCase().split(/[\s,]+/).forEach(value => {
                switch (value) {
                    case 'left':
                    case 'right':
                    case 'center':
                        align.horizontal = value;
                        break;

                    case 'top':
                    case 'bottom':
                    case 'middle':
                        align.vertical = value;
                        break;

                    case 'crop':
                        align.slice = true;
                        break;

                    case 'meet':
                        align.slice = false;
                }
            });
        }

        // Generate viewBox and preserveAspectRatio attributes
        attributes.preserveAspectRatio = getAlignment(align);
        attributes.viewBox = box.left + ' ' + box.top + ' ' + box.width + ' ' + box.height;

        // Generate body
        let body = SVG.replaceIDs(item.body);

        if (props.color !== void 0) {
            body = body.replace(/currentColor/g, props.color);
        }
        if (transformations.length) {
            body = '<g transform="' + transformations.join(' ') + '">' + body + '</g>';
        }
        if (props.box === true || props.box === 'true' || props.box === '1') {
            // Add transparent bounding box
            body += '<rect x="' + box.left + '" y="' + box.top + '" width="' + box.width + '" height="' + box.height + '" fill="rgba(0, 0, 0, 0)" />';
        }

        return {
            attributes: attributes,
            body: body,
            style: style
        };
    }

    /**
     * Generate SVG
     *
     * @param {object} props Custom properties (same as query string in Iconify API)
     * @param {boolean} [addExtra] True if extra attributes should be added to SVG.
     *  Due to lack of functions in JavaScript for escaping attributes, it is your job to make sure key and value are both properly escaped. Default value is false.
     * @returns {string}
     */
    getSVG(props, addExtra) {
        let attributes = SVG.splitAttributes(props),
            data = this.getAttributes(attributes.icon);

        let svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';

        // Add extra attributes - assume that their names and values are escaped
        if (addExtra) {
            Object.keys(attributes.node).forEach(attr => {
                svg += ' ' + attr + '="' + attributes.node[attr] + '"';
            });
        }

        // Add SVG attributes
        Object.keys(data.attributes).forEach(attr => {
            svg += ' ' + attr + '="' + data.attributes[attr] + '"';
        });

        // Add style with 360deg transformation to style to prevent subpixel rendering bug
        svg += ' style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);';
        Object.keys(data.style).forEach(attr => {
            svg += ' ' + attr + ': ' + data.style[attr] + ';';
        });
        if (props && props.style !== void 0) {
            svg += props.style;
        }
        svg += '">';

        svg += data.body + '</svg>';

        return svg;
    }

    /**
     * Split attributes
     *
     * @param props
     * @return {{icon: {}, node: {}}}
     */
    static splitAttributes(props) {
        let result = {
            icon: Object.create(null),
            node: Object.create(null)
        };

        Object.keys(props).forEach(name => {
            result[iconAttributes.indexOf(name) === -1 ? 'node' : 'icon'][name] = props[name];
        });

        return result;
    }

    /**
     * Calculate second dimension when only 1 dimension is set
     *
     * @param {string|number} size One dimension (such as width)
     * @param {number} ratio Width/height ratio.
     *      If size == width, ratio = height/width
     *      If size == height, ratio = width/height
     * @param {number} [precision] Floating number precision in result to minimize output. Default = 100
     * @return {string|number|null} Another dimension, null on error
     */
    static calculateDimension(size, ratio, precision) {
        if (ratio === 1) {
            return size;
        }

        precision = precision === void 0 ? 100 : precision;
        if (typeof size === 'number') {
            return Math.ceil(size * ratio * precision) / precision;
        }

        // split code into sets of strings and numbers
        let split = size.split(unitsSplit);
        if (split === null || !split.length) {
            return null;
        }
        let results = [],
            code = split.shift(),
            isNumber = unitsTest.test(code),
            num;

        while (true) {
            if (isNumber) {
                num = parseFloat(code);
                if (isNaN(num)) {
                    results.push(code);
                } else {
                    results.push(Math.ceil(num * ratio * precision) / precision);
                }
            } else {
                results.push(code);
            }

            // next
            code = split.shift();
            if (code === void 0) {
                return results.join('');
            }
            isNumber = !isNumber;
        }
    }

    /**
     * Replace IDs in SVG output with unique IDs
     * Fast replacement without parsing XML, assuming commonly used patterns.
     *
     * @param {string} body
     * @return {string}
     */
    static replaceIDs(body) {
        let regex = /\sid="(\S+)"/g,
            ids = [],
            match, prefix;

        function strReplace(search, replace, subject) {
            let pos = 0;

            while ((pos = subject.indexOf(search, pos)) !== -1) {
                subject = subject.slice(0, pos) + replace + subject.slice(pos + search.length);
                pos += replace.length;
            }

            return subject;
        }

        // Find all IDs
        while (match = regex.exec(body)) {
            ids.push(match[1]);
        }
        if (!ids.length) {
            return body;
        }

        prefix = 'IconifyId-' + Date.now().toString(16) + '-' + (Math.random() * 0x1000000 | 0).toString(16) + '-';

        // Replace with unique ids
        ids.forEach(function (id) {
            let newID = prefix + idCounter;
            idCounter++;
            body = strReplace('="' + id + '"', '="' + newID + '"', body);
            body = strReplace('="#' + id + '"', '="#' + newID + '"', body);
            body = strReplace('(#' + id + ')', '(#' + newID + ')', body);
        });

        return body;
    }
}

/**
 * Create React component with SVG data
 *
 * @param {object} props
 * @param {boolean} inline
 * @return {null|React.Component}
 */
function component(props, inline) {
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
        for (let key in props.style) {
            style[key] = props.style[key];
        }
    }

    // Generate element attributes
    let attributes = {
        xmlns: 'http://www.w3.org/2000/svg',
        focusable: false,
        style: style
    };

    let key;
    for (key in customAttributes) {
        attributes[key] = customAttributes[key];
    }
    for (key in iconData.attributes) {
        attributes[key] = iconData.attributes[key];
    }

    attributes.dangerouslySetInnerHTML = { __html: iconData.body };

    // Generate SVG
    return React.createElement('svg', attributes, null);
}

/**
 * Icon without vertical alignment
 *
 * @param {object} props
 * @return {React.Component}
 * @constructor
 */
export const Icon = props => component(props, false);

/**
 * Icon with vertical alignment
 *
 * @param {object} props
 * @return {React.Component}
 * @constructor
 */
export const InlineIcon = props => component(props, true);

/**
 * Default export
 */
export default Icon;
