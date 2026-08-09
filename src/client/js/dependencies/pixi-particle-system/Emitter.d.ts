import { ParticleContainer } from 'pixi.js';
import { AlphaBehavior } from './behavior/built-in/AlphaBehavior';
import { ColorBehavior } from './behavior/built-in/ColorBehavior';
import { MovementBehavior } from './behavior/built-in/MovementBehavior';
import { RotationBehavior } from './behavior/built-in/RotationBehavior';
import { ScaleBehavior } from './behavior/built-in/ScaleBehavior';
import { SpawnBehavior } from './behavior/built-in/SpawnBehavior';
import { TextureBehavior } from './behavior/built-in/TextureBehavior';
import { InitBehavior, UpdateBehavior } from './behavior/EmitterBehavior';
import { Ease } from './data/easing/Ease';
import { EmitterConfig } from './EmitterConfig';
import { BaseParticleData, EmitterParticle, IEmitterParticle } from './particle/EmitterParticle';
/**
 * Extra emitter options allowing for custom particles/particle data.
 * @template DataType Type describing the data object stored on particles.
 * @template ParticleType Type describing the particle used within the emitter.
 * @group Emitter/
 */
export type EmitterOptions<DataType extends BaseParticleData = BaseParticleData, ParticleType extends IEmitterParticle<DataType> = IEmitterParticle<DataType>> = {
    /**
     * Creates and returns object containing particle data. By default,
     * uses {@link BaseParticleData} object to store particle data.
     * @returns New particle data object.
     */
    dataFactory?: () => DataType;
    /**
     * Creates and returns new instance of a particle. By default,
     * uses {@link EmitterParticle} as the base particle class.
     * @param data Data used by the particle.
     * @returns New particle instance.
     */
    particleFactory?: (data: DataType) => ParticleType;
    /**
     * Initializes any custom data for the particles. By default,
     * does nothing, as there is no custom data.
     * @param data Data used by the particle.
     */
    customDataInitializer?: (data: DataType) => void;
};
/**
 * Class responsible for spawning and managing particles using various behaviors.
 *
 * Emitter is the core class of the particle system, handling particle creation, updating,
 * and recycling. It utilizes a set of behaviors to define how particles are initialized
 * and updated over their lifetime.
 * @example
 * ```ts
 * const emitter = new Emitter(particleContainer, {
 *   emitterVersion: 0,
 *   minParticleLifetime: 1,
 *   maxParticleLifetime: 3,
 *   spawnInterval: 0.1,
 *   maxParticles: 500,
 *   alphaBehavior: {
 *     mode: "list",
 *     list: [1, 0]
 *   },
 *   scaleBehavior: {
 *     mode: "random",
 *     xList: [0.5, 1],
 *     yList: [0.5, 1]
 *   }
 * });
 *
 * emitter.play();
 * ```
 * @template DataType Type describing the data object stored on particles.
 * @template ParticleType Type describing the particle used within the emitter.
 * @group Emitter
 */
export declare class Emitter<DataType extends BaseParticleData = BaseParticleData, ParticleType extends IEmitterParticle<DataType> = EmitterParticle<DataType>> {
    private readonly _version;
    private readonly _dataFactory;
    private readonly _particleFactory;
    private readonly _customDataInitializer;
    private readonly _parent;
    private readonly _particles;
    private readonly _pooledParticles;
    private readonly _initBehaviors;
    private readonly _updateBehaviors;
    private readonly _alphaBehavior;
    private readonly _colorBehavior;
    private readonly _movementBehavior;
    private readonly _rotationBehavior;
    private readonly _scaleBehavior;
    private readonly _spawnBehavior;
    private readonly _textureBehavior;
    private _ease;
    private _easeFunction;
    private _minLifetime;
    private _maxLifetime;
    private _spawnInterval;
    private _spawnChance;
    private _maxParticles;
    private _addAtBack;
    private _particlesPerWave;
    private _particleCount;
    private _spawnTimer;
    private _emitterLife;
    private _onComplete;
    private _isActive;
    private _isEmitting;
    private _isPaused;
    /**
     * Creates a new Emitter.
     * @param parent Parent ParticleContainer to which particles will be added.
     * @param initialConfig Optional initial configuration for the emitter.
     * @param options Optional factories and initializers for custom particle data and particles.
     */
    constructor(parent: ParticleContainer, initialConfig?: EmitterConfig, options?: EmitterOptions<DataType, ParticleType>);
    /**
     * Current version of the emitter.
     */
    get version(): string;
    /**
     * Parent ParticleContainer of the emitter.
     */
    get parent(): ParticleContainer;
    /**
     * Number of active particles in the emitter.
     */
    get particleCount(): number;
    /**
     * Whether the emitter is currently emitting new particles.
     */
    get isEmitting(): boolean;
    /**
     * Whether the emitter is currently paused.
     */
    get isPaused(): boolean;
    /**
     * Minimum lifetime of particles in seconds.
     */
    get minLifetime(): number;
    set minLifetime(value: number);
    /**
     * Maximum lifetime of particles in seconds.
     */
    get maxLifetime(): number;
    set maxLifetime(value: number);
    /**
     * Interval between particle spawns in seconds.
     */
    get spawnInterval(): number;
    set spawnInterval(value: number);
    /**
     * Chance of spawning a particle (0.0 - 1.0).
     */
    get spawnChance(): number;
    set spawnChance(value: number);
    /**
     * Maximum number of particles allowed in the emitter.
     */
    get maxParticles(): number;
    set maxParticles(value: number);
    /**
     * Whether to add new particles at the back of the container.
     */
    get addAtBack(): boolean;
    set addAtBack(value: boolean);
    /**
     * Number of particles to spawn per wave.
     */
    get particlesPerWave(): number;
    set particlesPerWave(value: number);
    /**
     * Ease applied to particle lifetime.
     */
    get ease(): Ease;
    set ease(value: Ease);
    /**
     * Alpha behavior of the emitter.
     */
    get alphaBehavior(): AlphaBehavior<DataType, ParticleType>;
    /**
     * Color behavior of the emitter.
     */
    get colorBehavior(): ColorBehavior<DataType, ParticleType>;
    /**
     * Movement behavior of the emitter.
     */
    get movementBehavior(): MovementBehavior<DataType, ParticleType>;
    /**
     * Rotation behavior of the emitter.
     */
    get rotationBehavior(): RotationBehavior<DataType, ParticleType>;
    /**
     * Scale behavior of the emitter.
     */
    get scaleBehavior(): ScaleBehavior<DataType, ParticleType>;
    /**
     * Spawn behavior of the emitter.
     */
    get spawnBehavior(): SpawnBehavior<DataType, ParticleType>;
    /**
     * Texture behavior of the emitter.
     */
    get textureBehavior(): TextureBehavior<DataType, ParticleType>;
    /**
     * Applies a configuration to the emitter.
     * @param config Configuration to apply.
     */
    applyConfig(config: EmitterConfig): void;
    /**
     * Retrieves the current configuration for emitter and its behaviors.
     * @returns Current configuration object.
     */
    getConfig(): EmitterConfig;
    /**
     * Starts the emitter and hooks into the shared ticker.
     */
    play(): void;
    /**
     * Pauses the emitter by unhooking from the shared ticker.
     */
    pause(): void;
    /**
     * Resumes the emitter by rehooking into the shared ticker.
     */
    resume(): void;
    /**
     * Stops new particles from spawning, and lets existing particles die naturally.
     * @param instant When true, particles are removed instantly.
     */
    stop(instant?: boolean): void;
    /**
     * Prewarms the emitter by simulating particle spawning and updating for a given time.
     * @param time Time in seconds to prewarm the emitter.
     */
    prewarm(time: number): void;
    /**
     * Checks if a behavior is currently active in the emitter's init behaviors.
     * @param behavior Behavior to check.
     * @returns Whether the behavior is active.
     */
    isBehaviorInitActive(behavior: InitBehavior<DataType, ParticleType>): boolean;
    /**
     * Checks if a behavior is currently active in the emitter's update behaviors.
     * @param behavior Behavior to check.
     * @returns Whether the behavior is active.
     */
    isBehaviorUpdateActive(behavior: UpdateBehavior<DataType, ParticleType>): boolean;
    /**
     * Adds a behavior to the active init behaviors.
     * @param behavior Behavior to add.
     */
    addToActiveInitBehaviors(behavior: InitBehavior<DataType, ParticleType>): void;
    /**
     * Adds a behavior to the active update behaviors.
     * @param behavior Behavior to add.
     */
    addToActiveUpdateBehaviors(behavior: UpdateBehavior<DataType, ParticleType>): void;
    /**
     * Removes a behavior from the active init behaviors.
     * @param behavior Behavior to remove.
     */
    removeFromActiveInitBehaviors(behavior: InitBehavior<DataType, ParticleType>): void;
    /**
     * Removes a behavior from the active update behaviors.
     * @param behavior Behavior to remove.
     */
    removeFromActiveUpdateBehaviors(behavior: UpdateBehavior<DataType, ParticleType>): void;
    /**
     * Updates the emitter.
     * @param ticker Ticker instance.
     */
    private update;
    /**
     * Recycles a particle back into the pool.
     * @param particle Particle to recycle.
     */
    private recycleParticle;
    /**
     * Parses a version string into major/minor/patch components.
     * @param version Version string to parse.
     * @returns Parsed version components.
     */
    private parseVersionString;
    /**
     * Checks compatibility between the emitter version and config version.
     * @param configVersion Config version to check.
     */
    private checkCompatibility;
}
//# sourceMappingURL=Emitter.d.ts.map