import { Particle, Texture } from 'pixi.js';
/**
 * Base data structure for emitter particles.
 * @group EmitterParticle/
 */
export type BaseParticleData = {
    /**
     * Maximum lifetime of the particle in milliseconds.
     */
    maxLifetime: number;
    /**
     * Current age of the particle in milliseconds.
     */
    age: number;
    /**
     * Age percent of the particle's lifetime (0.0 to 1.0).
     */
    agePercent: number;
    /**
     * One over the lifetime of the particle (1.0 / maxLifetime).
     */
    oneOverLifetime: number;
    /**
     * Direction vector components of the particle.
     */
    directionVectorX: number;
    /**
     * Direction vector Y component of the particle.
     */
    directionVectorY: number;
    /**
     * Acceleration components of the particle.
     */
    accelerationX: number;
    /**
     * Acceleration Y component of the particle.
     */
    accelerationY: number;
    /**
     * Velocity components of the particle.
     */
    velocityX: number;
    /**
     *
     */
    velocityY: number;
    /**
     * Texture animation configuration for the particle.
     */
    textureConfig: {
        /**
         * Array of textures used for the particle.
         */
        textures: Texture[];
        /**
         * Duration of the texture animation in milliseconds.
         */
        duration: number;
        /**
         * Elapsed time of the texture animation in milliseconds.
         */
        elapsed: number;
        /**
         * Frame rate of the texture animation (frames per second).
         */
        framerate: number;
        /**
         * Whether the texture animation should loop.
         */
        loop: boolean;
    };
};
/**
 * Base interface for particles used by the Emitter.
 * @template DataType Type describing the data object stored on particles.
 * @group EmitterParticle/
 */
export interface IEmitterParticle<DataType extends BaseParticleData = BaseParticleData> extends Particle {
    /**
     * Particle data used by emitter behaviors.
     * @see {@link BaseParticleData} for the structure of the data.
     */
    data: DataType;
    /**
     * Invoked when particle is fetched from pool.
     */
    onFetch(): void;
    /**
     * Invoked when particle is returned to pool.
     */
    onRecycle(): void;
}
/**
 * Creates a new instance of BaseParticleData with default values.
 * @returns A new BaseParticleData object with default values.
 * @group EmitterParticle/
 */
export declare function createBaseParticleData(): BaseParticleData;
/**
 * Resets the base particle data.
 * @param data Data to reset.
 * @group EmitterParticle/
 */
export declare function resetBaseParticleData(data: BaseParticleData): void;
/**
 * Default implementation of a particle used by the Emitter.
 * @template DataType Type describing the particle data structure. Any custom data structure must extend {@link BaseParticleData}.
 * Any custom data will also need to be manually reset, as the default particle will only reset the base data.
 * @group EmitterParticle
 */
export declare class EmitterParticle<DataType extends BaseParticleData = BaseParticleData> extends Particle implements IEmitterParticle<DataType> {
    data: DataType;
    /**
     * Creates a new EmitterParticle instance.
     * @param data Particle data used by emitter behaviors.
     */
    constructor(data: DataType);
    /**
     * @inheritdoc
     */
    onFetch(): void;
    /**
     * @inheritdoc
     */
    onRecycle(): void;
}
//# sourceMappingURL=EmitterParticle.d.ts.map