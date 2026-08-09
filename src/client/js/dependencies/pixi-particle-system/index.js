import { RAD_TO_DEG as _, DEG_TO_RAD as d, Texture as I, Particle as T, Ticker as g } from "pixi.js";
const U = "0.0.0", z = {
  version: U
};
class c extends Error {
  /**
   * Creates a new EmitterError instance.
   * @param message Error message.
   */
  constructor(t) {
    super(`EmitterError: ${t}`), this.name = "EmitterError";
  }
}
const B = 1.70158, L = B * 1.525;
function Y(e) {
  return e * e * (e * (B + 1) - B);
}
function X(e) {
  const t = e - 1;
  return 1 + t * t * (t * (B + 1) + B);
}
function E(e) {
  const t = e - 1, i = e * 2;
  return i < 1 ? e * i * (i * (L + 1) - L) : 1 + 2 * t * t * (2 * t * (L + 1) + L);
}
const M = 7.5625, f = 2.75, k = 1 / f, W = 2 / f, j = 2.5 / f, q = 1.5 / f, $ = 2.25 / f, H = 2.625 / f;
function G(e) {
  return 1 - C(1 - e);
}
function C(e) {
  let t = 0;
  return e < k ? M * e * e : e < W ? (t = e - q, M * t * t + 0.75) : e < j ? (t = e - $, M * t * t + 0.9375) : (t = e - H, M * t * t + 0.984375);
}
function N(e) {
  const t = e * 2;
  return t < 1 ? 0.5 - 0.5 * C(1 - t) : 0.5 + 0.5 * C(t - 1);
}
function J(e) {
  return 1 - Math.sqrt(1 - e * e);
}
function K(e) {
  const t = e - 1;
  return Math.sqrt(1 - t * t);
}
function Q(e) {
  const t = e - 1, i = e * 2;
  return i < 1 ? (1 - Math.sqrt(1 - i * i)) * 0.5 : (Math.sqrt(1 - 4 * t * t) + 1) * 0.5;
}
const F = Math.PI / 6;
function Z(e) {
  const t = e - 1;
  return -Math.pow(2, 10 * t) * Math.sin((t * 40 - 3) * F);
}
function tt(e) {
  return 1 + Math.pow(2, 10 * -e) * Math.sin((-e * 40 - 3) * F);
}
function et(e) {
  const t = 2 * e - 1, i = (80 * t - 9) * Math.PI / 18;
  return t < 0 ? -0.5 * Math.pow(2, 10 * t) * Math.sin(i) : 1 + -0.5 * Math.pow(2, -10 * t) * Math.sin(i);
}
function it(e) {
  return e * e;
}
function st(e) {
  const t = e - 1;
  return 1 - t * t;
}
function rt(e) {
  const t = e - 1, i = e * 2;
  return i < 1 ? e * i : 1 - t * t * 2;
}
function at(e) {
  return e * e * e;
}
function nt(e) {
  const t = e - 1;
  return 1 + t * t * t;
}
function ot(e) {
  const t = e - 1, i = e * 2;
  return i < 1 ? e * i * i : 1 - t * t * t * 4;
}
function ht(e) {
  return e * e * e * e;
}
function ut(e) {
  const t = e - 1;
  return 1 - t * t * t * t;
}
function lt(e) {
  const t = e - 1, i = e * 2;
  return i < 1 ? e * i * i * i : 1 - t * t * t * 8;
}
function ct(e) {
  return e * e * e * e * e;
}
function _t(e) {
  const t = e - 1;
  return 1 + t * t * t * t * t;
}
function dt(e) {
  const t = e - 1, i = e * 2;
  return i < 1 ? e * i * i * i * i : 1 - t * t * t * 16;
}
function mt(e) {
  return 1 - Math.cos(e * Math.PI * 0.5);
}
function pt(e) {
  return Math.sin(e * Math.PI * 0.5);
}
function vt(e) {
  return Math.cos(e * Math.PI);
}
const D = {
  linear: (e) => e,
  // Power Easing
  "power2.in": it,
  "power3.in": at,
  "power4.in": ht,
  "power5.in": ct,
  "power2.out": st,
  "power3.out": nt,
  "power4.out": ut,
  "power5.out": _t,
  "power2.inout": rt,
  "power3.inout": ot,
  "power4.inout": lt,
  "power5.inout": dt,
  // Back Easing
  "back.in": Y,
  "back.out": X,
  "back.inout": E,
  // Bounce Easing
  "bounce.in": G,
  "bounce.out": C,
  "bounce.inout": N,
  // Circle Easing
  "circle.in": J,
  "circle.out": K,
  "circle.inout": Q,
  // Elastic Easing
  "elastic.in": Z,
  "elastic.out": tt,
  "elastic.inout": et,
  // Sine Eases
  "sine.in": mt,
  "sine.out": pt,
  "sine.inout": vt
};
Object.freeze(D);
function A(e) {
  return D[e];
}
function V() {
  throw new c(
    "Interpolate method not set! Did you forget to initialize the List?"
  );
}
class b {
  constructor() {
    this._first = null, this._list = [], this._easeFunction = null, this._isStepped = !1, this.interpolate = () => V();
  }
  /**
   * First node in the list.
   * @throws {EmitterError} If the list has not been initialized.
   */
  get first() {
    if (this._first === null)
      throw new c(
        "List not initialized properly! First is null."
      );
    return this._first;
  }
  /**
   * Gets the list steps.
   */
  get list() {
    return this._list;
  }
  /**
   * Indicates whether the list has been initialized.
   */
  get isInitialized() {
    return this._first !== null;
  }
  /**
   * Indicates whether the list uses stepped interpolation.
   */
  get isStepped() {
    return this._isStepped;
  }
  set isStepped(t) {
    this._isStepped = t;
  }
  /**
   * Initializes the list from data.
   * @param data Data to initialize the list with.
   */
  initialize(t) {
    this.initializeList(t), this._list = t.list, this._isStepped = !!t.isStepped, t.ease ? this._easeFunction = A(t.ease) : this._easeFunction = null;
  }
  /**
   * Resets the list to an uninitialized state.
   */
  reset() {
    this._first = null, this._isStepped = !1, this._easeFunction = null, this.interpolate = () => V();
  }
}
function ft(e) {
  if (this.first === null || this.first.next === null)
    throw new c(
      "PropertyList not initialized properly! First or first.next is null."
    );
  return this._easeFunction && (e = this._easeFunction(e)), e <= 0 ? this.first.value : e >= 1 ? this.first.next.value : (this.first.next.value - this.first.value) * e + this.first.value;
}
function xt(e) {
  this._easeFunction && (e = this._easeFunction(e));
  let t = this.first;
  if (t === null || t.next === null)
    throw new c(
      "PropertyList not initialized properly! First or first.next is null."
    );
  if (e <= t.time) return t.value;
  for (; t.next && e > t.next.time; )
    t = t.next;
  if (!t.next) return t.value;
  const i = t.next, s = i.time - t.time;
  if (s === 0) return t.value;
  const r = (e - t.time) / s;
  return (i.value - t.value) * r + t.value;
}
function gt(e) {
  this._easeFunction && (e = this._easeFunction(e));
  let t = this.first;
  if (t === null)
    throw new c(
      "PropertyList not initialized properly! First is null."
    );
  for (; t.next && e >= t.next.time; )
    t = t.next;
  return t.value;
}
class v extends b {
  /**
   * @inheritdoc
   */
  initialize(t) {
    if (super.initialize(t), this.first.next && this.first.next.time >= 1) {
      this.interpolate = ft;
      return;
    }
    if (this._isStepped) {
      this.interpolate = gt;
      return;
    }
    this.interpolate = xt;
  }
  /**
   * @inheritdoc
   */
  initializeList(t) {
    let i = null, s = null;
    for (const r of t.list) {
      const a = {
        value: r.value,
        time: r.time,
        next: null
      };
      i && (i.next = a, i = a), s || (s = a, i = a);
    }
    this._first = s;
  }
}
class m {
  /**
   * Creates a new instance of the behavior.
   * @param emitter Emitter instance this behavior belongs to.
   */
  constructor(t) {
    this._emitter = t;
  }
  /**
   * Reset the behavior and apply the provided configuration.
   * @param config Behavior configuration.
   */
  applyConfig(t) {
    t && this.reset();
  }
}
class Bt extends m {
  /**
   * Creates new instance of AlphaBehavior.
   * @param emitter Emitter instance this behavior belongs to.
   */
  constructor(t) {
    super(t), this._staticValue = 1, this._mode = "static", this._list = new v();
  }
  /**
   * @inheritdoc
   */
  get updateOrder() {
    return "normal";
  }
  /**
   * Number list used to interpolate alpha values over particle lifetime.
   *
   * A behavior will always have a list, even when not using list-based configuration,
   * but the list might not be initialized and will be empty in that case.
   */
  get list() {
    return this._list;
  }
  /**
   * Mode currently used by the behavior.
   */
  get mode() {
    return this._mode;
  }
  set mode(t) {
    this._mode = t, t === "random" || t === "static" ? this._emitter.removeFromActiveUpdateBehaviors(this) : this._emitter.addToActiveUpdateBehaviors(this);
  }
  /**
   * Alpha value applied to all particles in `static` mode.
   */
  get staticValue() {
    return this._staticValue;
  }
  set staticValue(t) {
    this._staticValue = t;
  }
  /**
   * @inheritdoc
   */
  applyConfig(t) {
    if (super.applyConfig(t), this._emitter.addToActiveInitBehaviors(this), "value" in t) {
      this._staticValue = t.value, this._mode = "static", this._list.reset();
      return;
    }
    this._mode = t.mode, this._list.initialize(t.listData), this._mode === "list" && this._emitter.addToActiveUpdateBehaviors(this);
  }
  /**
   * @inheritdoc
   */
  getConfig() {
    if (!(!this._emitter.isBehaviorInitActive(this) && !this._emitter.isBehaviorUpdateActive(this)))
      return this._mode === "static" ? {
        value: this._staticValue,
        mode: "static"
      } : {
        mode: this._mode,
        listData: {
          list: this._list.list,
          isStepped: this._list.isStepped ? !0 : void 0
        }
      };
  }
  /**
   * @inheritdoc
   */
  init(t) {
    if (this._mode === "static") {
      t.alpha = this._staticValue;
      return;
    }
    if (this._mode === "random") {
      t.alpha = this._list.interpolate(Math.random());
      return;
    }
    t.alpha = this._list.interpolate(0);
  }
  /**
   * @inheritdoc
   */
  update(t) {
    t.alpha = this._list.interpolate(t.data.agePercent);
  }
  /**
   * @inheritdoc
   */
  reset() {
    this._staticValue = 1, this._mode = "static", this._emitter.removeFromActiveInitBehaviors(this), this._emitter.removeFromActiveUpdateBehaviors(this);
  }
}
function l(e, t, i) {
  return e << 16 | t << 8 | i;
}
function R(e, t) {
  t || (t = {}), e.charAt(0) === "#" ? e = e.substr(1) : e.indexOf("0x") === 0 && (e = e.substr(2));
  let i;
  return e.length === 8 && (i = e.substr(0, 2), e = e.substr(2)), t.r = parseInt(e.substr(0, 2), 16), t.g = parseInt(e.substr(2, 2), 16), t.b = parseInt(e.substr(4, 2), 16), i && (t.a = parseInt(i, 16)), t;
}
function P(e) {
  return `#${e.toString(16).padStart(6, "0")}`;
}
function S(e) {
  const t = R(e);
  return l(t.r, t.g, t.b);
}
function wt(e) {
  if (this.first === null || this.first.next === null)
    throw new c(
      "PropertyList not initialized properly! First or first.next is null."
    );
  if (this._easeFunction && (e = this._easeFunction(e)), e <= 0)
    return l(
      this.first.value.r,
      this.first.value.g,
      this.first.value.b
    );
  if (e >= 1)
    return l(
      this.first.next.value.r,
      this.first.next.value.g,
      this.first.next.value.b
    );
  const t = this.first.value, i = this.first.next.value, s = Math.round((i.r - t.r) * e + t.r), r = Math.round((i.g - t.g) * e + t.g), a = Math.round((i.b - t.b) * e + t.b);
  return l(s, r, a);
}
function yt(e) {
  this._easeFunction && (e = this._easeFunction(e));
  let t = this.first;
  if (t === null || t.next === null)
    throw new c(
      "PropertyList not initialized properly! First or first.next is null."
    );
  if (e <= t.time)
    return l(
      t.value.r,
      t.value.g,
      t.value.b
    );
  for (; t.next && e > t.next.time; )
    t = t.next;
  if (!t.next)
    return l(
      t.value.r,
      t.value.g,
      t.value.b
    );
  const i = t.next, s = i.time - t.time;
  if (s === 0)
    return l(
      t.value.r,
      t.value.g,
      t.value.b
    );
  const r = (e - t.time) / s, a = t.value, n = i.value, o = Math.round((n.r - a.r) * r + a.r), h = Math.round((n.g - a.g) * r + a.g), u = Math.round((n.b - a.b) * r + a.b);
  return l(o, h, u);
}
function Lt(e) {
  this._easeFunction && (e = this._easeFunction(e));
  let t = this.first;
  if (t === null || t.next === null)
    throw new c(
      "PropertyList not initialized properly! First or first.next is null."
    );
  for (; t.next && e >= t.next.time; )
    t = t.next;
  const i = t.value;
  return l(i.r, i.g, i.b);
}
class Mt extends b {
  /**
   * @inheritdoc
   */
  initialize(t) {
    if (super.initialize(t), this.first.next && this.first.next.time >= 1) {
      this.interpolate = wt;
      return;
    }
    if (this._isStepped) {
      this.interpolate = Lt;
      return;
    }
    this.interpolate = yt;
  }
  /**
   * @inheritdoc
   */
  initializeList(t) {
    let i = null, s = null;
    for (const r of t.list) {
      const a = {
        value: R(r.value),
        time: r.time,
        next: null
      };
      i && (i.next = a, i = a), s || (s = a, i = a);
    }
    this._first = s;
  }
}
class Ct extends m {
  /**
   * Creates new instance of ColorBehavior.
   * @param emitter Emitter instance this behavior belongs to.
   */
  constructor(t) {
    super(t), this._staticValue = 16777215, this._mode = "static", this._list = new Mt();
  }
  /**
   * @inheritdoc
   */
  get updateOrder() {
    return "normal";
  }
  /**
   * Color list used to interpolate tint values over particle lifetime.
   *
   * A behavior will always have a list, even when not using list-based configuration,
   * but the list might not be initialized and will be empty in that case.
   */
  get list() {
    return this._list;
  }
  /**
   * Mode currently used by the behavior.
   */
  get mode() {
    return this._mode;
  }
  set mode(t) {
    this._mode = t, t === "list" ? this._emitter.addToActiveUpdateBehaviors(this) : this._emitter.removeFromActiveUpdateBehaviors(this);
  }
  /**
   * Tint value applied to all particles in `static` mode.
   */
  get staticValue() {
    return P(this._staticValue);
  }
  set staticValue(t) {
    this._staticValue = S(t);
  }
  /**
   * @inheritdoc
   */
  applyConfig(t) {
    if (super.applyConfig(t), this._emitter.addToActiveInitBehaviors(this), "value" in t) {
      this._staticValue = S(t.value), this._mode = "static", this._list.reset();
      return;
    }
    this._mode = t.mode, this._list.initialize(t.listData), this._mode === "list" && this._emitter.addToActiveUpdateBehaviors(this);
  }
  /**
   * @inheritdoc
   */
  getConfig() {
    if (!(!this._emitter.isBehaviorInitActive(this) && !this._emitter.isBehaviorUpdateActive(this)))
      return this._mode === "static" ? {
        value: P(this._staticValue),
        mode: "static"
      } : {
        mode: this._mode,
        listData: {
          list: this._list.list,
          isStepped: this._list.isStepped ? !0 : void 0
        }
      };
  }
  /**
   * @inheritdoc
   */
  init(t) {
    if (this._mode === "static") {
      t.tint = this._staticValue;
      return;
    }
    if (this._mode === "random") {
      t.tint = this._list.interpolate(Math.random());
      return;
    }
    t.tint = this._list.interpolate(0);
  }
  /**
   * @inheritdoc
   */
  update(t) {
    t.tint = this._list.interpolate(t.data.agePercent);
  }
  /**
   * @inheritdoc
   */
  reset() {
    this._staticValue = 16777215, this._mode = "static", this._emitter.removeFromActiveInitBehaviors(this), this._emitter.removeFromActiveUpdateBehaviors(this);
  }
}
class At extends m {
  /**
   * Creates new instance of MovementBehavior.
   * @param emitter Emitter instance this behavior belongs to.
   */
  constructor(t) {
    super(t), this._maxMoveSpeed = { x: 0, y: 0 }, this._minMoveSpeed = { x: 0, y: 0 }, this._mode = "linear", this._space = "local", this._useList = !1, this._xList = new v(), this._yList = new v();
  }
  /**
   * @inheritdoc
   */
  get updateOrder() {
    return "late";
  }
  /**
   * Number list used to interpolate X-axis movement values over particle lifetime.
   *
   * A behavior will always have a list, even when not using list-based configuration,
   * but the list might not be initialized and will be empty in that case.
   */
  get xList() {
    return this._xList;
  }
  /**
   * Number list used to interpolate Y-axis movement values over particle lifetime.
   *
   * A behavior will always have a list, even when not using list-based configuration,
   * but the list might not be initialized and will be empty in that case.
   */
  get yList() {
    return this._yList;
  }
  /**
   * Space in which movement is applied.
   */
  get space() {
    return this._space;
  }
  set space(t) {
    this._space = t;
  }
  /**
   * Movement mode currently used by the behavior.
   */
  get mode() {
    return this._mode;
  }
  set mode(t) {
    this._mode = t;
  }
  /**
   * Whether to use list-based movement configuration.
   */
  get useList() {
    return this._useList;
  }
  set useList(t) {
    this._useList = t;
  }
  /**
   * Minimum movement speed (used when not using lists).
   */
  get minMoveSpeed() {
    return this._minMoveSpeed;
  }
  set minMoveSpeed(t) {
    this._minMoveSpeed.x = t.x, this._minMoveSpeed.y = t.y;
  }
  /**
   * Maximum movement speed (used when not using lists).
   */
  get maxMoveSpeed() {
    return this._maxMoveSpeed;
  }
  set maxMoveSpeed(t) {
    this._maxMoveSpeed.x = t.x, this._maxMoveSpeed.y = t.y;
  }
  /**
   * @inheritdoc
   */
  applyConfig(t) {
    super.applyConfig(t), "minMoveSpeed" in t && "maxMoveSpeed" in t ? (this._minMoveSpeed.x = t.minMoveSpeed.x, this._minMoveSpeed.y = t.minMoveSpeed.y, this._maxMoveSpeed.x = t.maxMoveSpeed.x, this._maxMoveSpeed.y = t.maxMoveSpeed.y, this._useList = !1) : (this._xList.initialize(t.xListData), this._yList.initialize(t.yListData ?? t.xListData), this._useList = !0), this._mode = t.mode ?? "linear", this._space = t.space ?? "global", this._emitter.addToActiveInitBehaviors(this), this._emitter.addToActiveUpdateBehaviors(this);
  }
  /**
   * @inheritdoc
   */
  getConfig() {
    if (!(!this._emitter.isBehaviorInitActive(this) && !this._emitter.isBehaviorUpdateActive(this)))
      return this._useList ? {
        xListData: {
          list: this._xList.list,
          isStepped: this._xList.isStepped ? !0 : void 0
        },
        yListData: {
          list: this._yList.list,
          isStepped: this._xList.isStepped ? !0 : void 0
        },
        mode: this._mode,
        space: this._space
      } : {
        minMoveSpeed: this._minMoveSpeed,
        maxMoveSpeed: this._maxMoveSpeed,
        mode: this._mode,
        space: this._space
      };
  }
  /**
   * @inheritdoc
   */
  init(t) {
    const i = t.data;
    let s, r;
    if (this._useList ? (s = this._xList.interpolate(0), r = this._yList.interpolate(0)) : (s = Math.random() * (this._maxMoveSpeed.x - this._minMoveSpeed.x) + this._minMoveSpeed.x, r = Math.random() * (this._maxMoveSpeed.y - this._minMoveSpeed.y) + this._minMoveSpeed.y), this._space === "local") {
      const a = i.directionVectorX, n = i.directionVectorY, o = Math.sqrt(a * a + n * n), h = a / o, u = n / o, p = -u, w = h, x = h * r + p * s, y = u * r + w * s;
      i.accelerationX = x, i.accelerationY = y, i.velocityX = x, i.velocityY = y;
      return;
    }
    i.accelerationX = s, i.accelerationY = r, i.velocityX = s, i.velocityY = r;
  }
  /**
   * @inheritdoc
   */
  update(t, i) {
    const s = t.data;
    if (this._mode === "acceleration") {
      let r, a;
      if (this._useList) {
        const n = this._xList.interpolate(s.agePercent), o = this._yList.interpolate(s.agePercent);
        if (this._space === "local") {
          const h = s.directionVectorX, u = s.directionVectorY, p = Math.sqrt(h * h + u * u), w = h / p, x = u / p, y = -x, O = w;
          r = w * o + y * n, a = x * o + O * n;
        } else
          r = n, a = o;
      } else
        r = s.accelerationX, a = s.accelerationY;
      s.velocityX += r * i, s.velocityY += a * i;
    }
    t.x += s.velocityX * i, t.y += s.velocityY * i;
  }
  /**
   * @inheritdoc
   */
  reset() {
    this._mode = "linear", this._space = "global", this._minMoveSpeed.x = 0, this._minMoveSpeed.y = 0, this._maxMoveSpeed.x = 0, this._maxMoveSpeed.y = 0, this._useList = !1, this._emitter.removeFromActiveInitBehaviors(this), this._emitter.removeFromActiveUpdateBehaviors(this);
  }
}
class Vt extends m {
  /**
   * Creates a new RotationBehavior.
   * @param emitter Emitter instance this behavior belongs to.
   */
  constructor(t) {
    super(t), this._mode = "static", this._useDegrees = !1, this._staticValue = 0, this._startRotation = 0, this._acceleration = 0, this._list = new v();
  }
  /**
   * @inheritdoc
   */
  get updateOrder() {
    return "normal";
  }
  /**
   * Number list used to interpolate rotation values over particle lifetime.
   *
   * A behavior will always have a list, even when not using list-based configuration,
   * but the list might not be initialized and will be empty in that case.
   */
  get list() {
    return this._list;
  }
  /**
   * Current mode used by the behavior.
   */
  get mode() {
    return this._mode;
  }
  set mode(t) {
    this._mode = t;
  }
  /**
   * Static rotation value applied to all particles.
   */
  get staticValue() {
    return this._useDegrees ? this._staticValue * _ : this._staticValue;
  }
  set staticValue(t) {
    if (this._useDegrees) {
      this._staticValue = t * d;
      return;
    }
    this._staticValue = t;
  }
  /**
   * Rotation acceleration applied over time (used for acceleration mode).
   */
  get acceleration() {
    return this._useDegrees ? this._acceleration * _ : this._acceleration;
  }
  set acceleration(t) {
    if (this._useDegrees) {
      this._acceleration = t * d;
      return;
    }
    this._acceleration = t;
  }
  /**
   * Initial rotation value for the particle (used for acceleration mode).
   */
  get startRotation() {
    return this._useDegrees ? this._startRotation * _ : this._startRotation;
  }
  set startRotation(t) {
    if (this._useDegrees) {
      this._startRotation = t * d;
      return;
    }
    this._startRotation = t;
  }
  /**
   * @inheritdoc
   */
  applyConfig(t) {
    if (super.applyConfig(t), this._emitter.addToActiveInitBehaviors(this), this._useDegrees = t.useDegrees ?? !1, t.mode === "direction") {
      this._mode = "direction";
      return;
    }
    if (t.mode === "static") {
      this._mode = "static", this._staticValue = this._useDegrees ? t.value * d : t.value, this._list.reset();
      return;
    }
    if (t.mode === "acceleration") {
      this._mode = "acceleration", this._startRotation = this._useDegrees ? t.startRotation * d : t.startRotation, this._acceleration = this._useDegrees ? t.acceleration * d : t.acceleration, this._list.reset(), this._emitter.addToActiveUpdateBehaviors(this);
      return;
    }
    this._mode = t.mode, this._list.initialize({
      ease: t.listData.ease,
      isStepped: t.listData.isStepped,
      list: t.listData.list.map((i) => ({
        time: i.time,
        value: this._useDegrees ? i.value * d : i.value
      }))
    }), this._mode === "list" && this._emitter.addToActiveUpdateBehaviors(this);
  }
  /**
   * @inheritdoc
   */
  getConfig() {
    if (!(!this._emitter.isBehaviorInitActive(this) && !this._emitter.isBehaviorUpdateActive(this)))
      return this._mode === "direction" ? {
        mode: "direction",
        useDegrees: this._useDegrees ? !0 : void 0
      } : this._mode === "static" ? {
        value: this._useDegrees ? this._staticValue * _ : this._staticValue,
        mode: "static",
        useDegrees: this._useDegrees ? !0 : void 0
      } : this._mode === "list" || this._mode === "random" ? {
        mode: this._mode,
        listData: {
          list: this._list.list.map((t) => ({
            time: t.time,
            value: this._useDegrees ? t.value * _ : t.value
          })),
          isStepped: this._list.isStepped ? !0 : void 0
        },
        useDegrees: this._useDegrees ? !0 : void 0
      } : {
        startRotation: this._useDegrees ? this._startRotation * _ : this._startRotation,
        acceleration: this._useDegrees ? this._acceleration * _ : this._acceleration,
        mode: "acceleration",
        useDegrees: this._useDegrees ? !0 : void 0
      };
  }
  /**
   * @inheritdoc
   */
  init(t) {
    if (this._mode === "list") {
      t.rotation = this._list.interpolate(0);
      return;
    }
    if (this._mode === "random") {
      t.rotation = this._list.interpolate(Math.random());
      return;
    }
    if (this._mode === "direction") {
      t.rotation = Math.atan2(
        t.data.directionVectorY,
        t.data.directionVectorX
      );
      return;
    }
    if (this._mode === "static") {
      t.rotation = this._staticValue;
      return;
    }
    t.rotation = this._startRotation;
  }
  /**
   * @inheritdoc
   */
  update(t, i) {
    if (this._mode === "list") {
      t.rotation = this._list.interpolate(
        t.data.agePercent
      );
      return;
    }
    t.rotation += this._acceleration * i;
  }
  /**
   * @inheritdoc
   */
  reset() {
    this._useDegrees = !1, this._staticValue = 0, this._mode = "static", this._emitter.removeFromActiveInitBehaviors(this), this._emitter.removeFromActiveUpdateBehaviors(this);
  }
}
class Pt extends m {
  /**
   * Creates a new ScaleBehavior.
   * @param emitter Emitter instance this behavior belongs to.
   */
  constructor(t) {
    super(t), this._mode = "static", this._staticValue = { x: 1, y: 1 }, this._xList = new v(), this._yList = new v();
  }
  /**
   * @inheritdoc
   */
  get updateOrder() {
    return "normal";
  }
  /**
   * Static scale value applied to all particles.
   */
  get staticValue() {
    return this._staticValue;
  }
  /**
   * Number list used to interpolate X-axis scale values over particle lifetime.
   *
   * A behavior will always have a list, even when not using list-based configuration,
   * but the list might not be initialized and will be empty in that case.
   */
  get xList() {
    return this._xList;
  }
  /**
   * Number list used to interpolate Y-axis scale values over particle lifetime.
   *
   * A behavior will always have a list, even when not using list-based configuration,
   * but the list might not be initialized and will be empty in that case.
   */
  get yList() {
    return this._yList;
  }
  /**
   * Current mode used by the behavior.
   */
  get mode() {
    return this._mode;
  }
  set mode(t) {
    this._mode = t, this._mode === "list" ? this._emitter.addToActiveUpdateBehaviors(this) : this._emitter.removeFromActiveUpdateBehaviors(this);
  }
  /**
   * @inheritdoc
   */
  applyConfig(t) {
    if (super.applyConfig(t), this._emitter.addToActiveInitBehaviors(this), "value" in t) {
      this._mode = "static", this._staticValue = t.value;
      return;
    }
    this._mode = t.mode, this._xList.initialize(t.xListData), this._yList.initialize(
      t.yListData ? t.yListData : t.xListData
    ), this._mode === "list" && this._emitter.addToActiveUpdateBehaviors(this);
  }
  /**
   * @inheritdoc
   */
  getConfig() {
    if (!(!this._emitter.isBehaviorInitActive(this) && !this._emitter.isBehaviorUpdateActive(this)))
      return this._mode === "static" ? {
        value: this._staticValue,
        mode: "static"
      } : {
        xListData: {
          list: this._xList.list,
          isStepped: this._xList.isStepped ? !0 : void 0
        },
        yListData: {
          list: this._yList.list,
          isStepped: this._xList.isStepped ? !0 : void 0
        },
        mode: this._mode
      };
  }
  /**
   * @inheritdoc
   */
  init(t) {
    if (this._mode === "static") {
      t.scaleX = this._staticValue.x, t.scaleY = this._staticValue.y;
      return;
    }
    const i = this._mode === "random" ? Math.random() : 0, s = this._xList.interpolate(i), r = this._yList.interpolate(i);
    t.scaleX = s, t.scaleY = r;
  }
  /**
   * @inheritdoc
   */
  update(t) {
    const i = this._xList.interpolate(t.data.agePercent), s = this._yList.interpolate(t.data.agePercent);
    t.scaleX = i, t.scaleY = s;
  }
  /**
   * @inheritdoc
   */
  reset() {
    this._mode = "static", this._staticValue.x = 1, this._staticValue.y = 1, this._emitter.removeFromActiveInitBehaviors(this), this._emitter.removeFromActiveUpdateBehaviors(this);
  }
}
class St extends m {
  constructor() {
    super(...arguments), this._origin = { x: 0, y: 0 }, this._directionVector = { x: 0, y: 0 }, this._shape = "point", this._width = 0, this._height = 0, this._innerRadius = 0, this._outerRadius = 0;
  }
  /**
   * @inheritdoc
   */
  get updateOrder() {
    return "initial";
  }
  /**
   * Initial direction vector for spawned particles.
   */
  get direction() {
    return this._directionVector;
  }
  set direction(t) {
    this._directionVector.x = t.x, this._directionVector.y = t.y;
  }
  /**
   * Origin (parent-local) position used as the center/offset for particle spawning.
   *
   * This value is added to the shape-generated spawn coordinates in {@link init}.
   * For the `point` shape, particles spawn exactly at this position.
   *
   * This is relative to the parent transform (not a world-space position).
   */
  get origin() {
    return this._origin;
  }
  set origin(t) {
    this._origin.x = t.x, this._origin.y = t.y;
  }
  /**
   * Current spawn shape used by the behavior.
   */
  get shape() {
    return this._shape;
  }
  set shape(t) {
    this._shape = t;
  }
  /**
   * Width of the spawn shape (for rectangle and line shapes).
   */
  get width() {
    return this._width;
  }
  set width(t) {
    this._width = t;
  }
  /**
   * Height of the spawn shape (for rectangle shape).
   */
  get height() {
    return this._height;
  }
  set height(t) {
    this._height = t;
  }
  /**
   * Inner radius of the spawn shape (for circle shape).
   */
  get innerRadius() {
    return this._innerRadius;
  }
  set innerRadius(t) {
    this._innerRadius = t;
  }
  /**
   * Outer radius of the spawn shape (for circle shape).
   */
  get outerRadius() {
    return this._outerRadius;
  }
  set outerRadius(t) {
    this._outerRadius = t;
  }
  /**
   * @inheritdoc
   */
  applyConfig(t) {
    var i, s, r, a;
    if (super.applyConfig(t), this._directionVector.x = ((i = t.direction) == null ? void 0 : i.x) ?? 0, this._directionVector.y = ((s = t.direction) == null ? void 0 : s.y) ?? 1, this._origin.x = ((r = t.origin) == null ? void 0 : r.x) ?? 0, this._origin.y = ((a = t.origin) == null ? void 0 : a.y) ?? 0, t.shape === "point") {
      this._shape = "point";
      return;
    }
    if (t.shape === "line") {
      this._shape = "line", this._width = t.length;
      return;
    }
    if (t.shape === "rectangle") {
      this._shape = "rectangle", this._width = t.width, this._height = t.height ?? t.width;
      return;
    }
    if (t.shape === "circle") {
      this._shape = "circle", this._outerRadius = t.outerRadius, this._innerRadius = t.innerRadius ?? 0;
      return;
    }
  }
  /**
   * @inheritdoc
   */
  getConfig() {
    let t;
    if ((this._origin.x !== 0 || this._origin.y !== 0) && (t = { x: this._origin.x, y: this._origin.y }), this._shape === "point")
      return {
        origin: t,
        shape: "point",
        direction: this._directionVector
      };
    if (this._shape === "line")
      return {
        origin: t,
        shape: "line",
        length: this._width,
        direction: this._directionVector
      };
    if (this._shape === "rectangle")
      return {
        origin: t,
        shape: "rectangle",
        width: this._width,
        height: this._height === this._width ? void 0 : this._height,
        direction: this._directionVector
      };
    if (this._shape === "circle")
      return {
        origin: t,
        shape: "circle",
        outerRadius: this._outerRadius,
        innerRadius: this._innerRadius === this._outerRadius ? void 0 : this._innerRadius,
        direction: this._directionVector
      };
    throw new c("Invalid spawn shape, cannot get config.");
  }
  /**
   * @inheritdoc
   */
  init(t) {
    const i = t.data;
    if (i.directionVectorX = this._directionVector.x, i.directionVectorY = this._directionVector.y, this._shape === "point") {
      t.x = this._origin.x, t.y = this._origin.y;
      return;
    }
    let s = 0, r = 0;
    if (this._shape === "rectangle" && (s = Math.random() * this._width - this._width * 0.5, r = Math.random() * this._height - this._height * 0.5), this._shape === "circle") {
      const a = Math.random() * 2 * Math.PI, n = Math.sqrt(
        this._innerRadius * this._innerRadius + (this._outerRadius * this._outerRadius - this._innerRadius * this._innerRadius) * Math.random()
      );
      s = n * Math.cos(a), r = n * Math.sin(a);
    }
    this._shape === "line" && (s = Math.random() * this._width - this._width * 0.5, r = 0), t.x = s + this._origin.x, t.y = r + this._origin.y;
  }
  /**
   * @inheritdoc
   */
  reset() {
    this._shape = "point", this._width = 0, this._height = 0, this._innerRadius = 0, this._outerRadius = 0, this._origin.x = 0, this._origin.y = 0, this._directionVector.x = 0, this._directionVector.y = 1;
  }
}
class It extends m {
  constructor() {
    super(...arguments), this._textureConfigs = [], this._mode = "static";
  }
  /**
   * @inheritdoc
   */
  get updateOrder() {
    return "initial";
  }
  /**
   * @inheritdoc
   */
  applyConfig(t) {
    super.applyConfig(t), this._textureConfigs = t.textureConfigs, this._mode = t.mode, this._mode === "animated" && this._emitter.addToActiveUpdateBehaviors(this);
  }
  /**
   * @inheritdoc
   */
  getConfig() {
  }
  /**
   * @inheritdoc
   */
  init(t) {
    if (this._textureConfigs.length === 0) {
      t.texture = I.WHITE;
      return;
    }
    const i = this._textureConfigs[Math.floor(Math.random() * this._textureConfigs.length)];
    if (this._mode === "static") {
      t.texture = i.textures[0];
      return;
    }
    if (this._mode === "random") {
      t.texture = i.textures[Math.floor(Math.random() * i.textures.length)];
      return;
    }
    const s = t.data;
    s.textureConfig.textures = i.textures, s.textureConfig.loop = i.loop ?? !1, s.textureConfig.elapsed = 0, s.textureConfig.duration = i.duration ?? t.data.maxLifetime, s.textureConfig.framerate = i.framerate ?? i.textures.length;
    const r = i.textures[0];
    t.texture = r;
  }
  /**
   * @inheritdoc
   */
  update(t, i) {
    const s = t.data.textureConfig;
    s.elapsed += i, s.elapsed >= s.duration && (s.loop ? s.elapsed = s.elapsed % s.duration : s.elapsed = s.duration);
    const r = s.textures.length, a = Math.floor(s.elapsed * s.framerate), n = s.loop ? (a % r + r) % r : Math.min(Math.max(a, 0), r - 1);
    t.texture = s.textures[n];
  }
  /**
   * @inheritdoc
   */
  reset() {
    this._textureConfigs.length = 0, this._mode = "static", this._emitter.removeFromActiveUpdateBehaviors(this);
  }
}
function Ft() {
  return {
    age: 0,
    agePercent: 0,
    maxLifetime: 0,
    oneOverLifetime: 0,
    directionVectorX: 0,
    directionVectorY: 0,
    accelerationX: 0,
    accelerationY: 0,
    velocityX: 0,
    velocityY: 0,
    textureConfig: {
      textures: [],
      duration: 0,
      elapsed: 0,
      framerate: 0,
      loop: !1
    }
  };
}
function Dt(e) {
  e.age = 0, e.agePercent = 0, e.maxLifetime = 0, e.oneOverLifetime = 0, e.directionVectorX = 0, e.directionVectorY = 0, e.accelerationX = 0, e.accelerationY = 0, e.velocityX = 0, e.velocityY = 0, e.textureConfig.textures = [], e.textureConfig.duration = 0, e.textureConfig.elapsed = 0, e.textureConfig.framerate = 0, e.textureConfig.loop = !1;
}
class bt extends T {
  /**
   * Creates a new EmitterParticle instance.
   * @param data Particle data used by emitter behaviors.
   */
  constructor(t) {
    super(I.EMPTY), this.data = t, this.onRecycle();
  }
  /**
   * @inheritdoc
   */
  onFetch() {
    this.alpha = 1;
  }
  /**
   * @inheritdoc
   */
  onRecycle() {
    this.anchorX = 0.5, this.anchorY = 0.5, this.alpha = 0, this.scaleX = 1, this.scaleY = 1, this.rotation = 0, this.tint = "#ffffff", Dt(this.data);
  }
}
class Ot {
  /**
   * Creates a new Emitter.
   * @param parent Parent ParticleContainer to which particles will be added.
   * @param initialConfig Optional initial configuration for the emitter.
   * @param options Optional factories and initializers for custom particle data and particles.
   */
  constructor(t, i, s) {
    this._version = z.version, this._particles = [], this._pooledParticles = [], this._initBehaviors = [], this._updateBehaviors = [], this._ease = "linear", this._easeFunction = null, this._minLifetime = 1, this._maxLifetime = 3, this._spawnInterval = 0.01, this._spawnChance = 1, this._maxParticles = 500, this._addAtBack = !0, this._particlesPerWave = 1, this._particleCount = 0, this._spawnTimer = 0, this._emitterLife = -1, this._onComplete = null, this._isActive = !1, this._isEmitting = !1, this._isPaused = !1, this._parent = t, this._dataFactory = (s == null ? void 0 : s.dataFactory) ?? (() => Ft()), this._particleFactory = (s == null ? void 0 : s.particleFactory) ?? ((r) => new bt(r)), this._customDataInitializer = (s == null ? void 0 : s.customDataInitializer) ?? (() => {
    }), this._alphaBehavior = new Bt(this), this._colorBehavior = new Ct(this), this._movementBehavior = new At(this), this._rotationBehavior = new Vt(this), this._scaleBehavior = new Pt(this), this._spawnBehavior = new St(this), this._textureBehavior = new It(this), this._initBehaviors.push(this._spawnBehavior, this._textureBehavior), i != null && this.applyConfig(i);
  }
  //#region Getters and Setters
  /**
   * Current version of the emitter.
   */
  get version() {
    return this._version;
  }
  /**
   * Parent ParticleContainer of the emitter.
   */
  get parent() {
    return this._parent;
  }
  /**
   * Number of active particles in the emitter.
   */
  get particleCount() {
    return this._particleCount;
  }
  /**
   * Whether the emitter is currently emitting new particles.
   */
  get isEmitting() {
    return this._isEmitting;
  }
  /**
   * Whether the emitter is currently paused.
   */
  get isPaused() {
    return this._isPaused;
  }
  /**
   * Minimum lifetime of particles in seconds.
   */
  get minLifetime() {
    return this._minLifetime;
  }
  set minLifetime(t) {
    this._minLifetime = t;
  }
  /**
   * Maximum lifetime of particles in seconds.
   */
  get maxLifetime() {
    return this._maxLifetime;
  }
  set maxLifetime(t) {
    this._maxLifetime = t;
  }
  /**
   * Interval between particle spawns in seconds.
   */
  get spawnInterval() {
    return this._spawnInterval;
  }
  set spawnInterval(t) {
    this._spawnInterval = t;
  }
  /**
   * Chance of spawning a particle (0.0 - 1.0).
   */
  get spawnChance() {
    return this._spawnChance;
  }
  set spawnChance(t) {
    this._spawnChance = t;
  }
  /**
   * Maximum number of particles allowed in the emitter.
   */
  get maxParticles() {
    return this._maxParticles;
  }
  set maxParticles(t) {
    this._maxParticles = t;
  }
  /**
   * Whether to add new particles at the back of the container.
   */
  get addAtBack() {
    return this._addAtBack;
  }
  set addAtBack(t) {
    this._addAtBack = t;
  }
  /**
   * Number of particles to spawn per wave.
   */
  get particlesPerWave() {
    return this._particlesPerWave;
  }
  set particlesPerWave(t) {
    this._particlesPerWave = t;
  }
  /**
   * Ease applied to particle lifetime.
   */
  get ease() {
    return this._ease;
  }
  set ease(t) {
    this._ease = t, this._easeFunction = A(this._ease);
  }
  /**
   * Alpha behavior of the emitter.
   */
  get alphaBehavior() {
    return this._alphaBehavior;
  }
  /**
   * Color behavior of the emitter.
   */
  get colorBehavior() {
    return this._colorBehavior;
  }
  /**
   * Movement behavior of the emitter.
   */
  get movementBehavior() {
    return this._movementBehavior;
  }
  /**
   * Rotation behavior of the emitter.
   */
  get rotationBehavior() {
    return this._rotationBehavior;
  }
  /**
   * Scale behavior of the emitter.
   */
  get scaleBehavior() {
    return this._scaleBehavior;
  }
  /**
   * Spawn behavior of the emitter.
   */
  get spawnBehavior() {
    return this._spawnBehavior;
  }
  /**
   * Texture behavior of the emitter.
   */
  get textureBehavior() {
    return this._textureBehavior;
  }
  //#endregion
  /**
   * Applies a configuration to the emitter.
   * @param config Configuration to apply.
   */
  applyConfig(t) {
    this.checkCompatibility(t.emitterVersion), this._minLifetime = t.minParticleLifetime ?? 0.2, this._maxLifetime = t.maxParticleLifetime ?? 0.5, this._spawnInterval = t.spawnInterval ?? 0.1, this._spawnChance = t.spawnChance ?? 1, this._maxParticles = t.maxParticles ?? 500, this._addAtBack = t.addAtBack ?? !0, this._particlesPerWave = t.particlesPerWave ?? 1, t.ease ? (this._ease = t.ease, this._easeFunction = A(t.ease)) : (this._ease = "linear", this._easeFunction = null), t.alphaBehavior ? this._alphaBehavior.applyConfig(t.alphaBehavior) : (this.removeFromActiveInitBehaviors(this._alphaBehavior), this.removeFromActiveUpdateBehaviors(this._alphaBehavior)), t.colorBehavior ? this._colorBehavior.applyConfig(t.colorBehavior) : (this.removeFromActiveInitBehaviors(this._colorBehavior), this.removeFromActiveUpdateBehaviors(this._colorBehavior)), t.movementBehavior ? this._movementBehavior.applyConfig(t.movementBehavior) : (this.removeFromActiveInitBehaviors(this._movementBehavior), this.removeFromActiveUpdateBehaviors(this._movementBehavior)), t.rotationBehavior ? this._rotationBehavior.applyConfig(t.rotationBehavior) : (this.removeFromActiveInitBehaviors(this._rotationBehavior), this.removeFromActiveUpdateBehaviors(this._rotationBehavior)), t.scaleBehavior ? this._scaleBehavior.applyConfig(t.scaleBehavior) : (this.removeFromActiveInitBehaviors(this._scaleBehavior), this.removeFromActiveUpdateBehaviors(this._scaleBehavior)), t.spawnBehavior && this._spawnBehavior.applyConfig(t.spawnBehavior), t.textureBehavior && this._textureBehavior.applyConfig(t.textureBehavior);
  }
  /**
   * Retrieves the current configuration for emitter and its behaviors.
   * @returns Current configuration object.
   */
  getConfig() {
    return {
      emitterVersion: this._version,
      minParticleLifetime: this._minLifetime,
      maxParticleLifetime: this._maxLifetime,
      spawnInterval: this._spawnInterval,
      spawnChance: this._spawnChance,
      maxParticles: this._maxParticles,
      addAtBack: this._addAtBack,
      particlesPerWave: this._particlesPerWave,
      alphaBehavior: this._alphaBehavior.getConfig(),
      colorBehavior: this._colorBehavior.getConfig(),
      movementBehavior: this._movementBehavior.getConfig(),
      rotationBehavior: this._rotationBehavior.getConfig(),
      scaleBehavior: this._scaleBehavior.getConfig(),
      spawnBehavior: this._spawnBehavior.getConfig(),
      textureBehavior: this._textureBehavior.getConfig()
    };
  }
  /**
   * Starts the emitter and hooks into the shared ticker.
   */
  play() {
    this._isEmitting = !0, this._isActive || (this._isActive = !0, g.shared.add(this.update, this));
  }
  /**
   * Pauses the emitter by unhooking from the shared ticker.
   */
  pause() {
    !this._isActive || this._isPaused || (this._isPaused = !0, g.shared.remove(this.update, this));
  }
  /**
   * Resumes the emitter by rehooking into the shared ticker.
   */
  resume() {
    !this._isActive || !this._isPaused || (this._isPaused = !1, g.shared.add(this.update, this));
  }
  /**
   * Stops new particles from spawning, and lets existing particles die naturally.
   * @param instant When true, particles are removed instantly.
   */
  stop(t = !1) {
    var i;
    if (this._isActive && (this._isEmitting = !1, t)) {
      g.shared.remove(this.update, this);
      for (const s of this._particles)
        this.recycleParticle(s);
      this._particles.length = 0, this._particleCount = 0, (i = this._onComplete) == null || i.call(this), this._onComplete = null, this._isActive = !1;
      return;
    }
  }
  /**
   * Prewarms the emitter by simulating particle spawning and updating for a given time.
   * @param time Time in seconds to prewarm the emitter.
   */
  prewarm(t) {
    if (this._isEmitting === !0) {
      console.warn(
        "Emitter: Cannot prewarm an emitter that is already playing!"
      );
      return;
    }
    if (t <= 0) {
      console.warn("Emitter: Prewarm time must be greater than zero!");
      return;
    }
    const i = Math.floor(t / this._spawnInterval), s = Math.min(i, this._maxParticles);
    for (let r = 0; r < s; r++) {
      const a = r * this._spawnInterval;
      if (a > this._maxLifetime || Math.random() > this._spawnChance) continue;
      const n = this._minLifetime === this._maxLifetime ? this._maxLifetime : Math.random() * (this._maxLifetime - this._minLifetime);
      if (a >= n) continue;
      let o;
      if (this._pooledParticles.length > 0)
        o = this._pooledParticles.pop(), o.onFetch();
      else {
        const u = this._dataFactory();
        o = this._particleFactory(u);
      }
      this._customDataInitializer(o.data);
      const h = o.data;
      h.maxLifetime = n, h.oneOverLifetime = 1 / n, h.age = a, h.agePercent = a / n;
      for (const u of this._initBehaviors)
        u.init(o);
      for (const u of this._updateBehaviors)
        u.update(o, a);
      if (this._addAtBack ? this._parent.addParticle(o) : this._parent.addParticleAt(o, 0), this._particles.push(o), ++this._particleCount, this._particleCount >= this._maxParticles) break;
    }
    this.play();
  }
  /**
   * Checks if a behavior is currently active in the emitter's init behaviors.
   * @param behavior Behavior to check.
   * @returns Whether the behavior is active.
   */
  isBehaviorInitActive(t) {
    return this._initBehaviors.indexOf(t) !== -1;
  }
  /**
   * Checks if a behavior is currently active in the emitter's update behaviors.
   * @param behavior Behavior to check.
   * @returns Whether the behavior is active.
   */
  isBehaviorUpdateActive(t) {
    return this._updateBehaviors.indexOf(t) !== -1;
  }
  /**
   * Adds a behavior to the active init behaviors.
   * @param behavior Behavior to add.
   */
  addToActiveInitBehaviors(t) {
    this._initBehaviors.push(t), this._initBehaviors.sort((i, s) => {
      const r = i.updateOrder, a = s.updateOrder;
      return r === a ? 0 : r === "initial" ? -1 : a === "initial" ? 1 : r === "normal" && a === "late" ? -1 : r === "late" && a === "normal" ? 1 : 0;
    });
  }
  /**
   * Adds a behavior to the active update behaviors.
   * @param behavior Behavior to add.
   */
  addToActiveUpdateBehaviors(t) {
    this._updateBehaviors.push(t), this._updateBehaviors.sort((i, s) => {
      const r = i.updateOrder, a = s.updateOrder;
      return r === a ? 0 : r === "initial" ? -1 : a === "initial" ? 1 : r === "normal" && a === "late" ? -1 : r === "late" && a === "normal" ? 1 : 0;
    });
  }
  /**
   * Removes a behavior from the active init behaviors.
   * @param behavior Behavior to remove.
   */
  removeFromActiveInitBehaviors(t) {
    const i = this._initBehaviors.indexOf(t);
    i !== -1 && this._initBehaviors.splice(i, 1);
  }
  /**
   * Removes a behavior from the active update behaviors.
   * @param behavior Behavior to remove.
   */
  removeFromActiveUpdateBehaviors(t) {
    const i = this._updateBehaviors.indexOf(t);
    i !== -1 && this._updateBehaviors.splice(i, 1);
  }
  /**
   * Updates the emitter.
   * @param ticker Ticker instance.
   */
  update(t) {
    var s;
    const i = t.elapsedMS * 1e-3;
    for (let r = this._particles.length - 1; r >= 0; r--) {
      const a = this._particles[r], n = a.data;
      if (n.age += i, n.agePercent = n.age / n.maxLifetime, n.age > n.maxLifetime || n.age < 0)
        this._particles[r] = this._particles[this._particles.length - 1], this._particles.pop(), this._particleCount--, this.recycleParticle(a);
      else {
        let o = a.data.age * a.data.oneOverLifetime;
        this._easeFunction && (o = this._easeFunction(o)), a.data.agePercent = o;
        for (const h of this._updateBehaviors)
          h.update(a, i);
      }
    }
    if (this._isEmitting)
      for (this._spawnTimer -= i < 0 ? 0 : i; this._spawnTimer <= 0; ) {
        if (this._emitterLife >= 0 && (this._emitterLife -= this._spawnInterval, this._emitterLife <= 0)) {
          this._spawnTimer = 0, this._emitterLife = 0, this._isEmitting = !1;
          break;
        }
        if (this._particleCount >= this._maxParticles) {
          this._spawnTimer += this._spawnInterval;
          continue;
        }
        const r = [];
        for (let a = 0; a < this._particlesPerWave; a++) {
          if (Math.random() > this._spawnChance) continue;
          let n;
          if (this._minLifetime === this._maxLifetime ? n = this._maxLifetime : n = Math.random() * (this._maxLifetime - this._minLifetime) + this._minLifetime, -this._spawnTimer >= n)
            continue;
          let o;
          if (this._pooledParticles.length > 0)
            o = this._pooledParticles.pop(), o.onFetch();
          else {
            const p = this._dataFactory();
            o = this._particleFactory(p);
          }
          this._customDataInitializer(o.data);
          const h = o.data;
          h.maxLifetime = n, h.oneOverLifetime = 1 / n;
          let u = o.data.age * o.data.oneOverLifetime;
          this._easeFunction && (u = this._easeFunction(u)), this._addAtBack ? this._parent.addParticleAt(o, 0) : this._parent.addParticle(o), r.push(o), ++this._particleCount;
        }
        for (const a of r) {
          for (const n of this._initBehaviors)
            n.init(a);
          for (const n of this._updateBehaviors)
            n.update(a, -this._spawnTimer);
        }
        this._particles.push(...r), this._spawnTimer += this._spawnInterval;
      }
    this._parent.update(), !this._isEmitting && this._particleCount === 0 && ((s = this._onComplete) == null || s.call(this), this._onComplete = null, g.shared.remove(this.update, this), this._isPaused = !1, this._isActive = !1);
  }
  /**
   * Recycles a particle back into the pool.
   * @param particle Particle to recycle.
   */
  recycleParticle(t) {
    this._parent.removeParticle(t), t.onRecycle(), this._pooledParticles.push(t);
  }
  /**
   * Parses a version string into major/minor/patch components.
   * @param version Version string to parse.
   * @returns Parsed version components.
   */
  parseVersionString(t) {
    const i = t.split(".").map((s) => parseInt(s, 10));
    return {
      major: i[0] || 0,
      minor: i[1] || 0,
      patch: i[2] || 0
    };
  }
  /**
   * Checks compatibility between the emitter version and config version.
   * @param configVersion Config version to check.
   */
  checkCompatibility(t) {
    if (this._version === "dev") return;
    const i = this.parseVersionString(this._version), s = this.parseVersionString(t);
    if (i.major !== s.major) {
      console.error(
        `Emitter config major version (${s.major}) does not match emitter major version (${i.major}).`,
        "This will most likely result in unexpected behavior, or outright failure."
      );
      return;
    }
    i.minor !== s.minor && console.warn(
      `Emitter config minor version (${s.minor}) does not match emitter minor version (${i.minor}).`,
      "This may result in unexpected behavior."
    );
  }
}
export {
  Bt as AlphaBehavior,
  Ct as ColorBehavior,
  Mt as ColorList,
  Ot as Emitter,
  m as EmitterBehavior,
  c as EmitterError,
  bt as EmitterParticle,
  b as List,
  At as MovementBehavior,
  v as NumberList,
  Vt as RotationBehavior,
  Pt as ScaleBehavior,
  St as SpawnBehavior,
  It as TextureBehavior,
  R as convertHexToRGB,
  S as convertHexToUint,
  l as convertRgbToUint,
  P as convertUintToHex,
  Ft as createBaseParticleData,
  V as defaultInterpolateFunction,
  A as getEaseFunction,
  Dt as resetBaseParticleData
};
//# sourceMappingURL=index.js.map
