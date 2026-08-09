import { PointData } from 'pixi.js';
import { ListData } from '../../data/list/List';
import { NumberList } from '../../data/list/NumberList';
import { Emitter } from '../../Emitter';
import { BaseParticleData, IEmitterParticle } from '../../particle/EmitterParticle';
import { BehaviorOrder } from '../../util/Types';
import { EmitterBehavior, InitBehavior, UpdateBehavior } from '../EmitterBehavior';
/**
 * Type defining the possible movement spaces.
 */
export type MovementSpace = "local" | "global";
/**
 * Type defining the configuration for movement behavior using min/max speeds.
 * @group Behavior/MovementBehavior/
 */
export type MinMaxConfigType = {
    /**
     * Minimum movement speed for X and Y axes.
     */
    minMoveSpeed: PointData;
    /**
     * Maximum movement speed for X and Y axes.
     */
    maxMoveSpeed: PointData;
    /**
     * Movement mode. In `linear` mode particles move at a constant speed, while in
     * `acceleration` mode particles accelerate over time based on initial speed.
     */
    mode?: "linear" | "acceleration";
    /**
     * Space in which movement is applied. In `local` space, movement is relative to the particle's
     * initial direction, while in `global` space movement is applied relative to the container.
     */
    space?: MovementSpace;
};
/**
 * Type defining the configuration for movement behavior using lists.
 * @group Behavior/MovementBehavior/
 */
export type ListConfigType = {
    /**
     * X axis list data defining all properties required for list-based behavior.
     * @see {@link ListData}
     */
    xListData: ListData<number>;
    /**
     * Y axis list data defining all properties required for list-based behavior.
     * If not provided, `xListData` will be used for both axes.
     * @see {@link ListData}
     */
    yListData?: ListData<number>;
    /**
     * Movement mode. In `linear` mode particles move at a constant speed, while in
     * `acceleration` mode particles accelerate over time based on initial speed.
     */
    mode?: "linear" | "acceleration";
    /**
     * Space in which movement is applied. In `local` space, movement is relative to the particle's
     * initial direction, while in `global` space movement is applied relative to the container.
     */
    space?: MovementSpace;
};
/**
 * Type defining the configuration for MovementBehavior.
 */
export type MovementBehaviorConfig = MinMaxConfigType | ListConfigType;
/**
 * Behavior used to control particle movement over their lifetime.
 *
 * This behavior supports two configuration modes, either by specifying minimum and maximum
 * movement speeds for the X and Y axes, or by providing list data to define movement values
 * over the particle's lifetime.
 * @see {@link MinMaxConfigType} for min/max speed configuration options.
 * @see {@link ListConfigType} for list-based configuration options.
 * @template DataType Type describing the data object stored on particles.
 * @template ParticleType Type describing the particle used within the emitter.
 * @group Behavior/MovementBehavior
 * @example
 * ```ts
 * // Configure movement using min/max speeds.
 * movementBehavior.applyConfig({
 *     minMoveSpeed: { x: -50, y: -100 },
 *     maxMoveSpeed: { x: 50, y: 100 },
 *     mode: "linear",
 *     space: "global"
 * });
 *
 * // Configure movement using lists.
 * movementBehavior.applyConfig({
 *     xListData: {
 *         list: [
 *             { time: 0.0, value: 0 },
 *             { time: 1.0, value: 100 }
 *         ]
 *     },
 *     yListData: {
 *         list: [
 *             { time: 0.0, value: 0 },
 *             { time: 1.0, value: -100 }
 *         ]
 *     },
 *     mode: "acceleration",
 *     space: "local"
 * });
 * ```
 */
export declare class MovementBehavior<DataType extends BaseParticleData, ParticleType extends IEmitterParticle<DataType> = IEmitterParticle<DataType>> extends EmitterBehavior<MovementBehaviorConfig, DataType, ParticleType> implements InitBehavior<DataType, ParticleType>, UpdateBehavior<DataType, ParticleType> {
    private readonly _xList;
    private readonly _yList;
    private readonly _maxMoveSpeed;
    private readonly _minMoveSpeed;
    private _mode;
    private _space;
    private _useList;
    /**
     * Creates new instance of MovementBehavior.
     * @param emitter Emitter instance this behavior belongs to.
     */
    constructor(emitter: Emitter<DataType, ParticleType>);
    /**
     * @inheritdoc
     */
    get updateOrder(): BehaviorOrder;
    /**
     * Number list used to interpolate X-axis movement values over particle lifetime.
     *
     * A behavior will always have a list, even when not using list-based configuration,
     * but the list might not be initialized and will be empty in that case.
     */
    get xList(): NumberList;
    /**
     * Number list used to interpolate Y-axis movement values over particle lifetime.
     *
     * A behavior will always have a list, even when not using list-based configuration,
     * but the list might not be initialized and will be empty in that case.
     */
    get yList(): NumberList;
    /**
     * Space in which movement is applied.
     */
    get space(): "local" | "global";
    set space(value: "local" | "global");
    /**
     * Movement mode currently used by the behavior.
     */
    get mode(): "acceleration" | "linear";
    set mode(value: "acceleration" | "linear");
    /**
     * Whether to use list-based movement configuration.
     */
    get useList(): boolean;
    set useList(value: boolean);
    /**
     * Minimum movement speed (used when not using lists).
     */
    get minMoveSpeed(): PointData;
    set minMoveSpeed(value: PointData);
    /**
     * Maximum movement speed (used when not using lists).
     */
    get maxMoveSpeed(): PointData;
    set maxMoveSpeed(value: PointData);
    /**
     * @inheritdoc
     */
    applyConfig(config: MovementBehaviorConfig): void;
    /**
     * @inheritdoc
     */
    getConfig(): MovementBehaviorConfig | undefined;
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
//# sourceMappingURL=MovementBehavior.d.ts.map