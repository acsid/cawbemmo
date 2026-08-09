import {
	Color
	, Filter
	, GlProgram
	, UniformGroup
	, defaultFilterVert
} from "pixi.js";

const fragment = `
	in vec2 vTextureCoord;

	out vec4 finalColor;

	uniform sampler2D uTexture;

	uniform float uAlpha;
	uniform vec2 uThickness;
	uniform vec4 uColor;
	// uKnockout is provided as f32 (0/1) by the JS side; UniformGroup has no bool
	// type, so the GLSL treats it as a float and compares against 0.5.
	uniform float uKnockout;

	const float DOUBLE_PI = 2. * 3.14159265358979323846264;
	const float ANGLE_STEP = $angleStep$;

	float outlineMaxAlphaAtPos(vec2 pos) {
		if (uThickness.x == 0. || uThickness.y == 0.) {
			return 0.;
		}

		vec4 displacedColor;
		vec2 displacedPos;
		float maxAlpha = 0.;

		for (float angle = 0.; angle <= DOUBLE_PI; angle += ANGLE_STEP) {
			displacedPos.x = vTextureCoord.x + uThickness.x * cos(angle);
			displacedPos.y = vTextureCoord.y + uThickness.y * sin(angle);
			// uInputSize.zw is 1/inputSize, converting pixel offsets to UV space.
			displacedColor = texture(uTexture, displacedPos);
			maxAlpha = max(maxAlpha, displacedColor.a);
		}

		return maxAlpha;
	}

	void main() {
		vec4 sourceColor = texture(uTexture, vTextureCoord);
		// uKnockout is a float (0/1): when > 0.5 the source content is hidden,
		// leaving only the outline.
		vec4 contentColor = sourceColor * (1.0 - step(0.5, uKnockout));
		float outlineAlpha = uAlpha * outlineMaxAlphaAtPos(vTextureCoord.xy) * (1.-sourceColor.a);
		vec4 outlineColor = vec4(vec3(uColor) * outlineAlpha, outlineAlpha);
		finalColor = contentColor + outlineColor;
	}
`;

export default class OutlineFilter extends Filter {
	constructor ({ thickness = 5, color = 0xFFFFFF, quality = 0.1, alpha = 1.0, knockout = false }) {
		const angleStep = Math.PI / 2;

		const glProgram = GlProgram.from({
			vertex: defaultFilterVert
			, fragment: fragment.replace("$angleStep$", angleStep)
			, name: "outline-filter"
		});

		// v8: uniforms live in a UniformGroup attached via resources, not on
		// this.uniforms. The thickness is expressed in UV units (pixels / input size)
		// at apply() time.
		const outlineUniforms = new UniformGroup({
			uThickness: { value: new Float32Array([thickness, thickness]), type: "vec2<f32>" }
			, uColor: { value: new Float32Array([1, 1, 1, 1]), type: "vec4<f32>" }
			, uAlpha: { value: alpha, type: "f32" }
			, uKnockout: { value: knockout ? 1 : 0, type: "f32" }
		});

		super({
			glProgram
			, resources: {
				outlineUniforms
			}
		});

		// The filter needs to sample outside the sprite's edge (by `thickness`
		// pixels) to draw the outline. padding grows the sampled area so the
		// displaced samples are not clipped.
		this.padding = thickness;

		Object.assign(this, { thickness, color, quality, alpha, knockout });
	}

	apply (filterManager, input, output, clear) {
		const uniforms = this.resources.outlineUniforms.uniforms;
		// v8: Texture exposes .frame (a Rectangle) directly; the old _frame
		// private property is gone. Thickness is converted to UV units.
		const frame = input.frame;
		uniforms.uThickness[0] = this.thickness / frame.width;
		uniforms.uThickness[1] = this.thickness / frame.height;
		uniforms.uAlpha = this.alpha;
		uniforms.uKnockout = this.knockout ? 1 : 0;

		// v8 Color replaces the removed PIXI.utils.hex2rgb/rgb2hex helpers.
		const [r, g, b] = new Color(this.color).toArray();
		uniforms.uColor[0] = r;
		uniforms.uColor[1] = g;
		uniforms.uColor[2] = b;

		filterManager.applyFilter(this, input, output, clear);
	}

	get alpha () {
		return this._alpha;
	}
	set alpha (value) {
		this._alpha = value;
	}

	get color () {
		return this._color;
	}
	set color (value) {
		this._color = value;
	}

	get knockout () {
		return this._knockout;
	}
	set knockout (value) {
		this._knockout = value;
	}

	get thickness () {
		return this._thickness;
	}
	set thickness (value) {
		this._thickness = value;
		this.padding = value;
	}
}
