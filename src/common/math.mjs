export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

export function clamp(num, min = 0, max = 1) {
    if (min === max) {
        return min;
    }
    if (max < min) {
        return (
            (num <= max) ? max : (
                (num >= min) ? min : num
            )
        );
    }
    return (
        (num <= min) ? min : (
            (num >= max) ? max : num
        )
    );
}

export const invlerp = (start, end, amt) => clamp((amt - start) / (end - start));
export const lerp = (start, end, amt) => clamp((1 - amt) * start + amt * end, start, end);
export const scale = (x, in_min, in_max, out_min, out_max) => clamp((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min, out_min, out_max);
