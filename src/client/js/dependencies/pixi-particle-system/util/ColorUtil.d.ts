import { RGBAColor } from './Types';
/**
 * Combines separate color components (0-255) into a single uint color.
 * @param r The red value of the color
 * @param g The green value of the color
 * @param b The blue value of the color
 * @returns The color in the form of `0xRRGGBB`
 */
export declare function convertRgbToUint(r: number, g: number, b: number): number;
/**
 * Converts a hex string from "#AARRGGBB", "#RRGGBB", "0xAARRGGBB", "0xRRGGBB",
 * "AARRGGBB", or "RRGGBB" to an object of ints of 0-255, as
 * {r, g, b, (a)}.
 * @param color The input color string.
 * @param output An object to put the output in. If omitted, a new object is created.
 * @returns The object with r, g, and b properties, possibly with an a property.
 */
export declare function convertHexToRGB(color: string, output?: RGBAColor): RGBAColor;
/**
 * Converts a uint color (0xRRGGBB) to a hex string ("#RRGGBB").
 * @param color The color in the form of `0xRRGGBB`
 * @returns The color as a hex string.
 */
export declare function convertUintToHex(color: number): string;
/**
 * Converts a hex string ("#RRGGBB") to a uint color (0xRRGGBB).
 * @param color The color as a hex string.
 * @returns The color in the form of `0xRRGGBB`
 */
export declare function convertHexToUint(color: string): number;
//# sourceMappingURL=ColorUtil.d.ts.map