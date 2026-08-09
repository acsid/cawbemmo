/**
 * Elastic ease-in function.
 *
 * Starts slowly, then accelerates with an elastic (oscillating) motion.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * elasticIn(0); // 0
 * elasticIn(1); // 1
 * ```
 * @group Easing/Elastic/
 */
export declare function elasticIn(v: number): number;
/**
 * Elastic ease-out function.
 *
 * Starts quickly, then decelerates with an elastic (oscillating) overshoot.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * elasticOut(0); // 0
 * elasticOut(1); // 1
 * ```
 * @group Easing/Elastic/
 */
export declare function elasticOut(v: number): number;
/**
 * Elastic ease-in-out function.
 *
 * Combines elastic ease-in and ease-out: oscillates at the start and at the end.
 * Typically used to ease normalized progress values in the range `[0, 1]`.
 * @param v - Normalized progress value (commonly `0` to `1`).
 * @returns The eased value.
 * @example
 * ```ts
 * elasticInOut(0);   // 0
 * elasticInOut(0.5); // 0.5
 * elasticInOut(1);   // 1
 * ```
 * @group Easing/Elastic/
 */
export declare function elasticInOut(v: number): number;
//# sourceMappingURL=ElasticEase.d.ts.map