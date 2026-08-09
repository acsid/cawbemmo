/**
 * Quadratic ease-in function (power of 2).
 *
 * Starts slowly and accelerates toward the end by squaring the input value.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value `v²`.
 * @example
 * ```ts
 * power2In(0);   // 0
 * power2In(0.5); // 0.25
 * power2In(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power2In(v: number): number;
/**
 * Quadratic ease-out function (power of 2).
 *
 * Starts quickly and decelerates toward the end.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * power2Out(0);   // 0
 * power2Out(0.5); // 0.75
 * power2Out(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power2Out(v: number): number;
/**
 * Quadratic ease-in-out function (power of 2).
 *
 * Accelerates during the first half, then decelerates during the second half.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * power2InOut(0);   // 0
 * power2InOut(0.5); // 0.5
 * power2InOut(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power2InOut(v: number): number;
/**
 * Cubic ease-in function (power of 3).
 *
 * Starts slowly and accelerates toward the end by cubing the input value.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value `v³`.
 * @example
 * ```ts
 * power3In(0);   // 0
 * power3In(0.5); // 0.125
 * power3In(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power3In(v: number): number;
/**
 * Cubic ease-out function (power of 3).
 *
 * Starts quickly and decelerates toward the end.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * power3Out(0);   // 0
 * power3Out(0.5); // 0.875
 * power3Out(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power3Out(v: number): number;
/**
 * Cubic ease-in-out function (power of 3).
 *
 * Accelerates during the first half, then decelerates during the second half.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * power3InOut(0);   // 0
 * power3InOut(0.5); // 0.5
 * power3InOut(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power3InOut(v: number): number;
/**
 * Quartic ease-in function (power of 4).
 *
 * Starts slowly and accelerates toward the end by raising the input value to the 4th power.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value `v⁴`.
 * @example
 * ```ts
 * power4In(0);   // 0
 * power4In(0.5); // 0.0625
 * power4In(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power4In(v: number): number;
/**
 * Quartic ease-out function (power of 4).
 *
 * Starts quickly and decelerates toward the end.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * power4Out(0);   // 0
 * power4Out(0.5); // 0.9375
 * power4Out(1);   // 1
 * ```
 */
export declare function power4Out(v: number): number;
/**
 * Quartic ease-in-out function (power of 4).
 *
 * Accelerates during the first half, then decelerates during the second half.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * power4InOut(0);   // 0
 * power4InOut(0.5); // 0.5
 * power4InOut(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power4InOut(v: number): number;
/**
 * Quintic ease-in function (power of 5).
 *
 * Starts slowly and accelerates toward the end by raising the input value to the 5th power.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value `v⁵`.
 * @example
 * ```ts
 * power5In(0);   // 0
 * power5In(0.5); // 0.03125
 * power5In(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power5In(v: number): number;
/**
 * Quintic ease-out function (power of 5).
 *
 * Starts quickly and decelerates toward the end.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * power5Out(0);   // 0
 * power5Out(0.5); // 0.96875
 * power5Out(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power5Out(v: number): number;
/**
 * Quintic ease-in-out function (power of 5).
 *
 * Accelerates during the first half, then decelerates during the second half.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * power5InOut(0);   // 0
 * power5InOut(0.5); // 0.5
 * power5InOut(1);   // 1
 * ```
 * @group Easing/Power/
 */
export declare function power5InOut(v: number): number;
//# sourceMappingURL=PowerEase.d.ts.map