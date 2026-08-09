/**
 * Circular ease-in function.
 *
 * Starts slowly and accelerates toward the end following a circular curve.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * circleIn(0);   // 0
 * circleIn(0.5); // ~0.134
 * circleIn(1);   // 1
 * ```
 * @group Easing/Circle/
 */
export declare function circleIn(v: number): number;
/**
 * Circular ease-out function.
 *
 * Starts quickly and decelerates toward the end following a circular curve.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * circleOut(0);   // 0
 * circleOut(0.5); // ~0.866
 * circleOut(1);   // 1
 * ```
 * @group Easing/Circle/
 */
export declare function circleOut(v: number): number;
/**
 * Circular ease-in-out function.
 *
 * Accelerates during the first half, then decelerates during the second half,
 * following a circular curve.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * circleInOut(0);   // 0
 * circleInOut(0.5); // 0.5
 * circleInOut(1);   // 1
 * ```
 * @group Easing/Circle/
 */
export declare function circleInOut(v: number): number;
//# sourceMappingURL=CircleEase.d.ts.map