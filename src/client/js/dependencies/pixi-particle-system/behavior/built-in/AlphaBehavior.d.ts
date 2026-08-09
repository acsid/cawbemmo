import { NumberList } from '../../data/list/NumberList';
import { Emitter } from '../../Emitter';
import { BaseParticleData, IEmitterParticle } from '../../particle/EmitterParticle';
import { BehaviorOrder, BehaviorSingleListConfig, BehaviorStaticConfig } from '../../util/Types';
import { EmitterBehavior, InitBehavior, UpdateBehavior } from '../EmitterBehavior';
/**
 * Type defining the configuration for AlphaBehavior.
 */
export type AlphaBehaviorConfig = BehaviorStaticConfig<number> | BehaviorSingleListConfig<number>;
/**
 * Behavior used to control the transparency of particles over their lifetime.
 *
 * Behavior supports three modes, a `static` mode where a single value is applied to all particles,
 * a `list` mode where values are interpolated over the particle's lifetime based on a provided list,
 * and a `random` mode where a random value from the list is applied to the particle upon initialization.
 * @see {@link BehaviorStaticConfig} for static configuration options.
 * @see {@link BehaviorSingleListConfig} for list configuration options.
 * @template DataType Type describing the data object stored on particles.
 * @template ParticleType Type describing the particle used within the emitter.
 * @group Behavior/AlphaBehavior
 * @example
 * ```ts
 * // Apply a static alpha value of 0.5 to all particles.
 * alphaBehavior.applyConfig({
 *     value: 0.5
 * });
 *
 * // Interpolate particle alpha from 0.0 to 1.0 over lifetime.
 * alphaBehavior.applyConfig({
 *    listData: [
 *         { time: 0.0, value: 0.0 },
 *         { time: 1.0, value: 1.0 }
 *    ],
 *   mode: "list"
 * });
 *
 * // Assign a random alpha value between 0.2 and 0.8.
 * alphaBehavior.applyConfig({
 *    listData: [
 *         { time: 0.0, value: 0.2 },
 *         { time: 1.0, value: 0.8 }
 *    ],
 *   mode: "random"
 * });
 * ```
 */
export declare class AlphaBehavior<DataType extends BaseParticleData = BaseParticleData, ParticleType extends IEmitterParticle<DataType> = IEmitterParticle<DataType>> extends EmitterBehavior<AlphaBehaviorConfig, DataType, ParticleType> implements InitBehavior<DataType, ParticleType>, UpdateBehavior<DataType, ParticleType> {
    private readonly _list;
    private _staticValue;
    private _mode;
    /**
     * Creates new instance of AlphaBehavior.
     * @param emitter Emitter instance this behavior belongs to.
     */
    constructor(emitter: Emitter<DataType, ParticleType>);
    /**
     * @inheritdoc
     */
    get updateOrder(): BehaviorOrder;
    /**
     * Number list used to interpolate alpha values over particle lifetime.
     *
     * A behavior will always have a list, even when not using list-based configuration,
     * but the list might not be initialized and will be empty in that case.
     */
    get list(): NumberList;
    /**
     * Mode currently used by the behavior.
     */
    get mode(): "static" | "list" | "random";
    set mode(value: "static" | "list" | "random");
    /**
     * Alpha value applied to all particles in `static` mode.
     */
    get staticValue(): number;
    set staticValue(value: number);
    /**
     * @inheritdoc
     */
    applyConfig(config: AlphaBehaviorConfig): void;
    /**
     * @inheritdoc
     */
    getConfig(): AlphaBehaviorConfig | undefined;
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
//# sourceMappingURL=AlphaBehavior.d.ts.map