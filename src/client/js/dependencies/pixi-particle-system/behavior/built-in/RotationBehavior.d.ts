import { NumberList } from '../../data/list/NumberList';
import { Emitter } from '../../Emitter';
import { BaseParticleData, IEmitterParticle } from '../../particle/EmitterParticle';
import { BehaviorOrder, BehaviorSingleListConfig, BehaviorStaticConfig } from '../../util/Types';
import { EmitterBehavior, InitBehavior, UpdateBehavior } from '../EmitterBehavior';
/**
 * Type describing the modes in which RotationBehavior can operate.
 */
type RotationBehaviorMode = "static" | "list" | "random" | "random" | "acceleration" | "direction";
/**
 * Type defining the configuration for direction mode.
 * @group Behavior/RotationBehavior/
 */
export type DirectionConfigType = {
    /**
     * Particles will have their rotation set on initialization based on their movement direction.
     */
    mode: "direction";
};
/**
 * Type defining the configuration for acceleration mode.
 * @group Behavior/RotationBehavior/
 */
export type AccelerationConfigType = {
    /**
     * Initial rotation value for the particle.
     */
    startRotation: number;
    /**
     * Rotation acceleration applied over time.
     */
    acceleration: number;
    /**
     * Acceleration mode will rotate particles over time based on the acceleration value.
     */
    mode: "acceleration";
};
/**
 * Type defining the configuration for RotationBehavior.
 */
export type RotationBehaviorConfig = {
    useDegrees?: boolean;
} & (DirectionConfigType | BehaviorStaticConfig<number> | BehaviorSingleListConfig<number> | AccelerationConfigType);
/**
 * Behavior used to control the rotation of particles over their lifetime.
 *
 * Behavior supports four modes, a `static` mode where a single value is applied to all particles,
 * a `list` mode where values are interpolated over the particle's lifetime based on a provided list,
 * a `direction` mode where the rotation is set based on the particle's movement direction,
 * and an `acceleration` mode where the rotation changes over time based on an acceleration value.
 * @see {@link DirectionConfigType} for direction configuration options.
 * @see {@link AccelerationConfigType} for acceleration configuration options.
 * @see {@link BehaviorStaticConfig} for static configuration options.
 * @see {@link BehaviorSingleListConfig} for list configuration options.
 * @template DataType Type describing the data object stored on particles.
 * @template ParticleType Type describing the particle used within the emitter.
 * @group Behavior/RotationBehavior
 * @example
 * ```ts
 * // Apply a static rotation of 45 degrees to all particles.
 * rotationBehavior.applyConfig({
 *     mode: "static",
 *     value: Math.PI / 4
 * });
 *
 * // Interpolate particle rotation from 0 to 360 degrees over lifetime.
 * rotationBehavior.applyConfig({
 *    listData: [
 *         { time: 0.0, value: 0 },
 *         { time: 1.0, value: Math.PI * 2 }
 *    ],
 *   mode: "list"
 * });
 * ```
 */
export declare class RotationBehavior<DataType extends BaseParticleData, ParticleType extends IEmitterParticle<DataType> = IEmitterParticle<DataType>> extends EmitterBehavior<RotationBehaviorConfig, DataType, ParticleType> implements InitBehavior<DataType, ParticleType>, UpdateBehavior<DataType, ParticleType> {
    private readonly _list;
    private _mode;
    private _useDegrees;
    private _staticValue;
    private _startRotation;
    private _acceleration;
    /**
     * Creates a new RotationBehavior.
     * @param emitter Emitter instance this behavior belongs to.
     */
    constructor(emitter: Emitter<DataType, ParticleType>);
    /**
     * @inheritdoc
     */
    get updateOrder(): BehaviorOrder;
    /**
     * Number list used to interpolate rotation values over particle lifetime.
     *
     * A behavior will always have a list, even when not using list-based configuration,
     * but the list might not be initialized and will be empty in that case.
     */
    get list(): NumberList;
    /**
     * Current mode used by the behavior.
     */
    get mode(): RotationBehaviorMode;
    set mode(value: RotationBehaviorMode);
    /**
     * Static rotation value applied to all particles.
     */
    get staticValue(): number;
    set staticValue(value: number);
    /**
     * Rotation acceleration applied over time (used for acceleration mode).
     */
    get acceleration(): number;
    set acceleration(value: number);
    /**
     * Initial rotation value for the particle (used for acceleration mode).
     */
    get startRotation(): number;
    set startRotation(value: number);
    /**
     * @inheritdoc
     */
    applyConfig(config: RotationBehaviorConfig): void;
    /**
     * @inheritdoc
     */
    getConfig(): RotationBehaviorConfig | undefined;
    /**
     * @inheritdoc
     */
    init(particle: ParticleType): void;
    /**
     * @inheritdoc
     */
    update(particle: ParticleType, deltaTime: number): void;
    /**
     * @inheritdoc
     */
    protected reset(): void;
}
export {};
//# sourceMappingURL=RotationBehavior.d.ts.map