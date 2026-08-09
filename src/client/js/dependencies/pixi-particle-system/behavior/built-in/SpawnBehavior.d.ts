import { PointData } from 'pixi.js';
import { BaseParticleData, IEmitterParticle } from '../../particle/EmitterParticle';
import { BehaviorOrder } from '../../util/Types';
import { EmitterBehavior, InitBehavior } from '../EmitterBehavior';
/**
 * Type defining the possible spawn shapes for SpawnBehavior.
 *
 * - `point`: Particles spawn from a single point at the origin position.
 * - `line`: Particles spawn along a line centered at the origin position.
 * - `rectangle`: Particles spawn within a rectangle centered at the origin position.
 * - `circle`: Particles spawn within a circle centered at the origin position.
 * @group Behavior/SpawnBehavior/
 */
export type SpawnShape = "point" | "line" | "rectangle" | "circle";
/**
 * Type defining the point spawn configuration.
 * @group Behavior/SpawnBehavior/
 */
export type PointConfig = {
    /**
     * Particles spawn from single point at the origin position.
     */
    shape: "point";
};
/**
 * Type defining the line spawn configuration.
 * @group Behavior/SpawnBehavior/
 */
export type LineConfig = {
    /**
     * Particles spawn along a line centered at the origin position.
     */
    shape: "line";
    /**
     * Length of the line along which particles will spawn.
     */
    length: number;
};
/**
 * Type defining the rectangle spawn configuration.
 * @group Behavior/SpawnBehavior/
 */
export type RectangleConfig = {
    /**
     * Particles spawn within a rectangle centered at the origin position.
     */
    shape: "rectangle";
    /**
     * Width of the rectangle.
     */
    width: number;
    /**
     * Height of the rectangle. If not provided, the height will be equal to the width.
     */
    height?: number;
};
/**
 * Type defining the circle spawn configuration.
 * @group Behavior/SpawnBehavior/
 */
export type CircleConfig = {
    /**
     * Particles spawn within a circle centered at the origin position.
     */
    shape: "circle";
    /**
     * Outer radius of the circle.
     */
    outerRadius: number;
    /**
     * Inner radius of the circle. If not provided, the inner radius will be 0.
     */
    innerRadius?: number;
};
/**
 * Type defining the configuration for SpawnBehavior.
 */
export type SpawnBehaviorConfig = {
    /**
     * Direction in which the particles will be moving.
     */
    direction?: PointData;
    /**
     * Origin (parent-local) position used as the center/offset for particle spawning.
     *
     * This value is added to the shape-generated spawn coordinates in {@link init}.
     * For the `point` shape, particles spawn exactly at this position.
     *
     * This is relative to the parent transform (not a world-space position).
     */
    origin?: PointData;
} & (PointConfig | LineConfig | RectangleConfig | CircleConfig);
/**
 * Behavior used to control the spawning shape and initial direction of particles.
 *
 * Behavior supports four shapes, a `point` shape where particles spawn from a single point,
 * a `line` shape where particles spawn along a line,
 * a `rectangle` shape where particles spawn within a rectangle area,
 * and a `circle` shape where particles spawn within a circular area.
 * @see {@link SpawnBehaviorConfig} for configuration options.
 * @template DataType Type describing the data object stored on particles.
 * @template ParticleType Type describing the particle used within the emitter.
 * @group Behavior/SpawnBehavior
 * @example
 * ```ts
 * // Spawn particles from a point with an initial upward direction.
 * spawnBehavior.applyConfig({
 *     shape: "point",
 *     direction: { x: 0, y: -1 }
 * });
 * ```
 * @example
 * ```ts
 * // Spawn particles along a horizontal line of
 * //  length 200 with no initial direction.
 * spawnBehavior.applyConfig({
 *     shape: "line",
 *     length: 200,
 *     direction: { x: 0, y: 0 }
 * });
 * ```
 * @example
 * ```ts
 * // Spawn particles within a rectangle of width 100 and
 * //  height 50 with an initial rightward direction.
 * spawnBehavior.applyConfig({
 *     shape: "rectangle",
 *     width: 100,
 *     height: 50,
 *     direction: { x: 1, y: 0 }
 * });
 * ```
 * @example
 * ```ts
 * // Spawn particles within a circle of outer radius 75 and
 * //  inner radius 25 with no initial direction.
 * spawnBehavior.applyConfig({
 *     shape: "circle",
 *     outerRadius: 75,
 *     innerRadius: 25,
 *     direction: { x: 0, y: 0 }
 * });
 * ```
 */
export declare class SpawnBehavior<DataType extends BaseParticleData = BaseParticleData, ParticleType extends IEmitterParticle<DataType> = IEmitterParticle<DataType>> extends EmitterBehavior<SpawnBehaviorConfig, DataType, ParticleType> implements InitBehavior<DataType, ParticleType> {
    private readonly _origin;
    private readonly _directionVector;
    private _shape;
    private _width;
    private _height;
    private _innerRadius;
    private _outerRadius;
    /**
     * @inheritdoc
     */
    get updateOrder(): BehaviorOrder;
    /**
     * Initial direction vector for spawned particles.
     */
    get direction(): PointData;
    set direction(value: PointData);
    /**
     * Origin (parent-local) position used as the center/offset for particle spawning.
     *
     * This value is added to the shape-generated spawn coordinates in {@link init}.
     * For the `point` shape, particles spawn exactly at this position.
     *
     * This is relative to the parent transform (not a world-space position).
     */
    get origin(): PointData;
    set origin(value: PointData);
    /**
     * Current spawn shape used by the behavior.
     */
    get shape(): SpawnShape;
    set shape(value: SpawnShape);
    /**
     * Width of the spawn shape (for rectangle and line shapes).
     */
    get width(): number;
    set width(value: number);
    /**
     * Height of the spawn shape (for rectangle shape).
     */
    get height(): number;
    set height(value: number);
    /**
     * Inner radius of the spawn shape (for circle shape).
     */
    get innerRadius(): number;
    set innerRadius(value: number);
    /**
     * Outer radius of the spawn shape (for circle shape).
     */
    get outerRadius(): number;
    set outerRadius(value: number);
    /**
     * @inheritdoc
     */
    applyConfig(config: SpawnBehaviorConfig): void;
    /**
     * @inheritdoc
     */
    getConfig(): SpawnBehaviorConfig;
    /**
     * @inheritdoc
     */
    init(particle: ParticleType): void;
    /**
     * @inheritdoc
     */
    protected reset(): void;
}
//# sourceMappingURL=SpawnBehavior.d.ts.map