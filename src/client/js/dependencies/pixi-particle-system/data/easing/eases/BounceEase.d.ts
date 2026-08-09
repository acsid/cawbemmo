/**
 * Bounce ease-in function.
 *
 * Starts with small bounces and builds to larger bounces toward the end.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * bounceIn(0); // 0
 * bounceIn(1); // 1
 * ```
 * @group Easing/Bounce/
 */
export declare function bounceIn(v: number): number;
/**
 * Bounce ease-out function.
 *
 * Starts quickly, then bounces (overshooting and settling) toward the end.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * bounceOut(0); // 0
 * bounceOut(1); // 1
 * ```
 * @group Easing/Bounce/
 */
export declare function bounceOut(v: number): number;
/**
 * Bounce ease-in-out function.
 *
 * Combines bounce ease-in and ease-out: bounces at the start and at the end.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * bounceInOut(0);   // 0
 * bounceInOut(0.5); // 0.5
 * bounceInOut(1);   // 1
 * ```
 * @group Easing/Bounce/
 */
export declare function bounceInOut(v: number): number;
//# sourceMappingURL=BounceEase.d.ts.map