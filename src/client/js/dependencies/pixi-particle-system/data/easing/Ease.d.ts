import { backIn, backInOut, backOut } from './eases/BackEase';
import { bounceIn, bounceInOut, bounceOut } from './eases/BounceEase';
import { circleIn, circleInOut, circleOut } from './eases/CircleEase';
import { elasticIn, elasticInOut, elasticOut } from './eases/ElasticEase';
import { power2In, power2InOut, power2Out, power3In, power3InOut, power3Out, power4In, power4InOut, power4Out, power5In, power5InOut, power5Out } from './eases/PowerEase';
import { sineIn, sineInOut, sineOut } from './eases/SineEase';
/**
 * Type describing an easing function.
 */
export type EaseFunction = (v: number) => number;
declare const easeToFunctionMap: {
    linear: (v: number) => number;
    "power2.in": typeof power2In;
    "power3.in": typeof power3In;
    "power4.in": typeof power4In;
    "power5.in": typeof power5In;
    "power2.out": typeof power2Out;
    "power3.out": typeof power3Out;
    "power4.out": typeof power4Out;
    "power5.out": typeof power5Out;
    "power2.inout": typeof power2InOut;
    "power3.inout": typeof power3InOut;
    "power4.inout": typeof power4InOut;
    "power5.inout": typeof power5InOut;
    "back.in": typeof backIn;
    "back.out": typeof backOut;
    "back.inout": typeof backInOut;
    "bounce.in": typeof bounceIn;
    "bounce.out": typeof bounceOut;
    "bounce.inout": typeof bounceInOut;
    "circle.in": typeof circleIn;
    "circle.out": typeof circleOut;
    "circle.inout": typeof circleInOut;
    "elastic.in": typeof elasticIn;
    "elastic.out": typeof elasticOut;
    "elastic.inout": typeof elasticInOut;
    "sine.in": typeof sineIn;
    "sine.out": typeof sineOut;
    "sine.inout": typeof sineInOut;
};
/**
 * Type describing all possible easing functions.
 *
 * To see the logic these eases have been based on, and learn more about
 * how each of the eases work, visit Micheal Pohoreski's guide over at
 * their Github: https://github.com/Michaelangel007/easing.
 * @group Easing/
 */
export type Ease = keyof typeof easeToFunctionMap;
/**
 * Get an easing function from all available eases.
 * @param ease Ease to get.
 * @returns Easing function.
 */
export declare function getEaseFunction(ease: Ease): EaseFunction;
export {};
//# sourceMappingURL=Ease.d.ts.map