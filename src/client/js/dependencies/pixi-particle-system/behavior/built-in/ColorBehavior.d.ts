import { ColorList } from '../../data/list/ColorList';
import { Emitter } from '../../Emitter';
import { BaseParticleData, IEmitterParticle } from '../../particle/EmitterParticle';
import { BehaviorOrder, BehaviorSingleListConfig, BehaviorStaticConfig } from '../../util/Types';
import { EmitterBehavior, InitBehavior, UpdateBehavior } from '../EmitterBehavior';
/**
 * Type defining the configuration for ColorBehavior.
 */
export type ColorBehaviorConfig = BehaviorStaticConfig<string> | BehaviorSingleListConfig<string>;
/**
 * Behavior used to control the color tint of particles over their lifetime.
 *
 * Behavior supports three modes, a `static` mode where a single value is applied to all particles,
 * a `list` mode where values are interpolated over the particle's lifetime based on a provided list,
 * and a `random` mode where a random value from the list is applied to the particle upon initialization.
 * @see {@link BehaviorStaticConfig} for static configuration options.
 * @see {@link BehaviorSingleListConfig} for list configuration options.
 * @template DataType Type describing the data object stored on particles.
 * @template ParticleType Type describing the particle used within the emitter.
 * @group Behavior/ColorBehavior
 * @example
 * ```ts
 * // Apply a static tint to all particles.
 * alphaBehavior.applyConfig({
 *     value: "#ff00ff"
 * });
 *
 * // Interpolate particle tint from white to black over lifetime.
 * alphaBehavior.applyConfig({
 *    listData: [
 *         { time: 0.0, value: "#ffffff" },
 *         { time: 1.0, value: "#000000" }
 *    ],
 *   mode: "list"
 * });
 *
 * // Assign a random tint value between the two stops.
 * alphaBehavior.applyConfig({
 *    listData: [
 *         { time: 0.0, value: "#ff00ff" },
 *         { time: 1.0, value: "#00ff00" }
 *    ],
 *   mode: "random"
 * });
 * ```
 */
export declare class ColorBehavior<DataType extends BaseParticleData, ParticleType extends IEmitterParticle<DataType> = IEmitterParticle<DataType>> extends EmitterBehavior<ColorBehaviorConfig, DataType, ParticleType> implements InitBehavior<DataType, ParticleType>, UpdateBehavior<DataType, ParticleType> {
    private readonly _list;
    private _staticValue;
    private _mode;
    /**
     * Creates new instance of ColorBehavior.
     * @param emitter Emitter instance this behavior belongs to.
     */
    constructor(emitter: Emitter<DataType, ParticleType>);
    /**
     * @inheritdoc
     */
    get updateOrder(): BehaviorOrder;
    /**
     * Color list used to interpolate tint values over particle lifetime.
     *
     * A behavior will always have a list, even when not using list-based configuration,
     * but the list might not be initialized and will be empty in that case.
     */
    get list(): ColorList;
    /**
     * Mode currently used by the behavior.
     */
    get mode(): "static" | "list" | "random";
    set mode(value: "static" | "list" | "random");
    /**
     * Tint value applied to all particles in `static` mode.
     */
    get staticValue(): string;
    set staticValue(value: string);
    /**
     * @inheritdoc
     */
    applyConfig(config: ColorBehaviorConfig): void;
    /**
     * @inheritdoc
     */
    getConfig(): ColorBehaviorConfig | undefined;
    /**
     * @inheritdoc
     */
    init(particle: ParticleType): void;
    /**
     * @inheritdoc
     */
    update(particle: ParticleType): void;
    /**
     * @inheritdoc
     */
    protected reset(): void;
}
//# sourceMappingURL=ColorBehavior.d.ts.map