/**
 * This file is part of the @iconify/react package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ComponentType } from 'react';

export interface IconifyIcon {
    // mandatory icon object
    icon: object;

    // should not have any children
    children?: never;

    // optional properties passed to node
    id?: string;
    className?: string;
    style?: object;

    // optional properties for icon
    color?: string;
    inline?: boolean | string;
    box?: boolean | string;

    // dimensions and alignment
    width?: number | string;
    height?: number | string;
    align?: string;

    // transformations
    hFlip?: boolean;
    vFlip?: boolean;
    flip?: string;
    rotate?: number | string;
}

declare const Icon: ComponentType<IconifyIcon>;
declare const InlineIcon: ComponentType<IconifyIcon>;

export default Icon;
export { Icon, InlineIcon };
