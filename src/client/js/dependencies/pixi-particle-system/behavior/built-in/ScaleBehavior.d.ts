import { PointData } from 'pixi.js';
import { NumberList } from '../../data/list/NumberList';
import { Emitter } from '../../Emitter';
import { BaseParticleData, IEmitterParticle } from '../../particle/EmitterParticle';
import { BehaviorOrder, BehaviorStaticConfig, BehaviorXYListConfig } from '../../util/Types';
import { EmitterBehavior, InitBehavior, UpdateBehavior } from '../EmitterBehavior';
/**
 * Type defining the configuration for ScaleBehavior.
 */
export type ScaleBehaviorConfig = BehaviorStaticConfig<PointData> | BehaviorXYListConfig<number>;
/**
 * Behavior used to control the scale of particles over their lifetime.
 *
 * Behavior supports three modes, a `static` mode where a single value is applied to all particles,
 * a `list` mode where values are interpolated over the particle's lifetime based on provided lists,
 * and a `random` mode where random values from the lists are applied to the particle upon initialization.
 * @see {@link BehaviorStaticConfig} for static configuration options.
 * @see {@link BehaviorXYListConfig} for list configuration options.
 * @template DataType Type describing the data object stored on particles.
 * @template ParticleType Type describing the particle used within the emitter.
 * @group Behavior/ScaleBehavior
 * @example
 * ```ts
 * // Apply a static scale of 2x on both axes to all particles.
 * scaleBehavior.applyConfig({
 *     value: { x: 2, y: 2 }
 * });
 *
 * // Interpolate particle scale from 0.5x to 1.5x on X axis and 1.0x to 2.0x on Y axis over lifetime.
 * scaleBehavior.applyConfig({
 *    xListData: [
 *         { time: 0.0, value: 0.5 },
 *         { time: 1.0, value: 1.5 }
 *    ],
 *    yListData: [
 *         { time: 0.0, value: 1.0 },
 *         { time: 1.0, value: 2.0 }
 *    ],
 *   mode: "list"
 * });
 *
 * // Assign a random scale between 1.0x and 3.0x on X axis and between 0.5x and 2.5x on Y axis.
 * scaleBehavior.applyConfig({
 *    xListData: [
 *         { time: 0.0, value: 1.0 },
 *         { time: 1.0, value: 3.0 }
 *    ],
 *    yListData: [
 *         { time: 0.0, value: 0.5 },
 *         { time: 1.0, value: 2.5 }
 *    ],
 *   mode: "random"
 * });
 * ```
 */
export declare class ScaleBehavior<DataType extends BaseParticleData, ParticleType extends IEmitterParticle<DataType> = IEmitterParticle<DataType>> extends EmitterBehavior<ScaleBehaviorConfig, DataType, ParticleType> implements InitBehavior<DataType, ParticleType>, UpdateBehavior<DataType, ParticleType> {
    private readonly _xList;
    private readonly _yList;
    private _mode;
    private _staticValue;
    /**
     * Creates a new ScaleBehavior.
     * @param emitter Emitter instance this behavior belongs to.
     */
    constructor(emitter: Emitter<DataType, ParticleType>);
    /**
     * @inheritdoc
     */
    get updateOrder(): BehaviorOrder;
    /**
     * Static scale value applied to all particles.
     */
    get staticValue(): PointData;
    /**
     * Number list used to interpolate X-axis scale values over particle lifetime.
     *
     * A behavior will always have a list, even when not using list-based configuration,
     * but the list might not be initialized and will be empty in that case.
     */
    get xList(): NumberList;
    /**
     * Number list used to interpolate Y-axis scale values over particle lifetime.
     *
     * A behavior will always have a list, even when not using list-based configuration,
     * but the list might not be initialized and will be empty in that case.
     */
    get yList(): NumberList;
    /**
     * Current mode used by the behavior.
     */
    get mode(): "static" | "list" | "random";
    set mode(value: "static" | "list" | "random");
    /**
     * @inheritdoc
     */
    applyConfig(config: ScaleBehaviorConfig): void;
    /**
     * @inheritdoc
     */
    getConfig(): ScaleBehaviorConfig | undefined;
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
//# sourceMappingURL=ScaleBehavior.d.ts.map