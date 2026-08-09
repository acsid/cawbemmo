/**
 * Back ease-in function.
 *
 * Starts by moving slightly backward, then accelerates forward.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * backIn(0);   // 0
 * backIn(0.5); // ~-0.0877
 * backIn(1);   // 1
 * ```
 * @group Easing/Back/
 */
export declare function backIn(v: number): number;
/**
 * Back ease-out function.
 *
 * Starts quickly and overshoots slightly past the end before settling.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * backOut(0);   // 0
 * backOut(0.5); // ~1.0877
 * backOut(1);   // 1
 * ```
 * @group Easing/Back/
 */
export declare function backOut(v: number): number;
/**
 * Back ease-in-out function.
 *
 * Combines ease-in and ease-out with a slight overshoot at both ends.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * backInOut(0);   // 0
 * backInOut(0.5); // 0.5
 * backInOut(1);   // 1
 * ```
 * @group Easing/Back/
 */
export declare function backInOut(v: number): number;
//# sourceMappingURL=BackEase.d.ts.map