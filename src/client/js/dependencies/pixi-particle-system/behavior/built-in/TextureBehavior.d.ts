import { Texture } from 'pixi.js';
import { BaseParticleData, IEmitterParticle } from '../../particle/EmitterParticle';
import { BehaviorMode, BehaviorOrder } from '../../util/Types';
import { EmitterBehavior, InitBehavior, UpdateBehavior } from '../EmitterBehavior';
/**
 * Type defining the configuration mode for TextureBehavior.
 */
type TextureBehaviorMode = Extract<BehaviorMode, "static" | "random" | "animated">;
/**
 * Type defining the texture animation configuration for particles.
 * @group Behavior/TextureBehavior/
 */
export type TextureConfig = {
    textures: Texture[];
    duration?: number;
    framerate?: number;
    loop?: boolean;
};
/**
 * Type defining the configuration for TextureBehavior.
 * @group Behavior/TextureBehavior/
 */
export type TextureBehaviorConfig = {
    textureConfigs: TextureConfig[];
    mode: TextureBehaviorMode;
};
/**
 * Behavior used to control the texture of particles over their lifetime.
 *
 * Behavior supports three modes, a `static` mode where a single texture is applied to all particles,
 * a `random` mode where a random texture from the provided textures is applied to the particle upon initialization,
 * and an `animated` mode where textures are animated over the particle's lifetime based on the provided configuration.
 * @see {@link TextureBehaviorConfig} for configuration options.
 * @template DataType Type describing the data object stored on particles.
 * @template ParticleType Type describing the particle used within the emitter.
 * @group Behavior/TextureBehavior
 * @example
 * ```ts
 * // Apply a static texture to all particles.
 * textureBehavior.applyConfig({
 *     textureConfigs: [
 *         { textures: [PIXI.Texture.from("particle.png")] }
 *     ],
 *     mode: "static"
 * });
 * ```
 */
export declare class TextureBehavior<DataType extends BaseParticleData, ParticleType extends IEmitterParticle<DataType> = IEmitterParticle<DataType>> extends EmitterBehavior<TextureBehaviorConfig, DataType, ParticleType> implements InitBehavior<DataType, ParticleType>, UpdateBehavior<DataType, ParticleType> {
    private _textureConfigs;
    private _mode;
    /**
     * @inheritdoc
     */
    get updateOrder(): BehaviorOrder;
    /**
     * @inheritdoc
     */
    applyConfig(config: TextureBehaviorConfig): void;
    /**
     * @inheritdoc
     */
    getConfig(): TextureBehaviorConfig | undefined;
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
//# sourceMappingURL=TextureBehavior.d.ts.map