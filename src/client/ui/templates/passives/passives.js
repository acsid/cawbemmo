import events from "/js/system/events.js";
import client from "/js/system/client.js";
import locale from "/js/locale/index.js";
import input from "/js/input.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/passives/template.html", { raw: true });

let zoom = 1;

const constants = {
	lineWidth: 5
	, blockSize: 20
	, gridSize: 30
	, scrollSpeed: 0.75
};

const performAction = client.componentProxy.player.performAction;

const percentageStats = [
	"addCritChance"
	, "addCritMultiplier"
	, "addAttackCritChance"
	, "addAttackCritMultiplier"
	, "addSpellCritChance"
	, "addSpellCritMultiplier"
	, "sprintChance"
	, "xpIncrease"
	, "blockAttackChance"
	, "blockSpellChance"
	, "dodgeAttackChance"
	, "dodgeSpellChance"
	, "attackSpeed"
	, "castSpeed"
	, "itemQuantity"
	, "magicFind"
	, "catchChance"
	, "catchSpeed"
	, "fishRarity"
	, "fishWeight"
	, "fishItems"
];

export default {
	modal: true
	, hasClose: true

	, canvas: null
	, size: {}
	, ctx: null

	, currentZoom: 1
	, pos: { x: 0, y: 0 }

	, panOrigin: null

	, data: {
		nodes: null
		, links: null
	}

	, hoverNode: null

	, handlerResize: null

	, beforeRender: function () {
		this.tpl = locale.getLocalizedMessage(locale.dictionary, template);
	}
	, postRender: async function () {
		try {
			await _.asyncDelay(2500); // Fails if runs too early...
			const temp = await performAction({
				cpn: "passives", method: "getTree"
				, data: {}
			});
			this.data.nodes = temp.nodes;
			this.data.links = temp.links.map((l) => {
				return {
					from: { id: l.from }
					, to: { id: l.to }
				};
			});
		} catch (error) {
			_.log.passives.getTree.error(error);
		}

		//We need to be able to determine the size of elements
		this.el.css({
			visibility: "hidden"
			, display: "block"
		});

		this.handlerResize = this.onResize.bind(this);
		window.addEventListener("resize", this.handlerResize);

		this.canvas = this.find(".canvas")[0];
		this.size.w = this.canvas.width = this.find(".bottom").width() * zoom;
		this.size.h = this.canvas.height = this.find(".bottom").height() * zoom;
		this.ctx = this.canvas.getContext("2d");

		//Reset styles after determining size
		this.el.css({
			visibility: "visible"
			, display: "none"
		});

		this.ctx.lineWidth = constants.lineWidth;

		$(this.canvas).on("contextmenu", () => false);
		this.find(".btnReset").on("click", this.events.onReset.bind(this));

		this.onEvent("onGetPassives", this.events.onGetPassives.bind(this));
		this.onEvent("onGetPassivePoints", this.events.onGetPassivePoints.bind(this));
		this.onEvent("onShowPassives", this.toggle.bind(this));

		this.onEvent("keydown", this.events.onKeyDown.bind(this));
		this.el
			.on("gamepad", this.events.keydown.bind(this))
			.on("keydown", this.events.keydown.bind(this));
		this.find(".bottom")
			.on("mousedown", this.events.onPanStart.bind(this))
			.on("mousemove", this.events.onPan.bind(this))
			.on("mouseup", this.events.onPanEnd.bind(this))
			.on("touchstart", this.events.onPanStart.bind(this))
			.on("touchmove", this.events.onPan.bind(this))
			.on("touchend", this.events.onPanEnd.bind(this))
			.on("touchcancel", this.events.onPanEnd.bind(this));
	}

	, beforeDestroy: function () {
		window.removeEventListener("resize", this.handlerResize);
	}

	, onResize: function () {
		if (isMobile || !this.shown) {
			return;
		}

		this.size.w = this.canvas.width = this.find(".bottom").width() * zoom;
		this.size.h = this.canvas.height = this.find(".bottom").height() * zoom;

		this.ctx.lineWidth = constants.lineWidth;

		this.renderNodes();
	}

	, renderNodes: function () {
		if (!this.shown) {
			return;
		}

		this.renderers.clear.call(this);

		let links = this.data.links;
		let nodes = this.data.nodes;

		links.forEach((l) => {
			let linked = (
				nodes.find((n) => n.id === l.from.id).selected
				&& nodes.find((n) => n.id === l.to.id).selected
			);
			this.renderers.line.call(this, l.from, l.to, linked);
		});

		nodes.forEach((n) => this.renderers.node.call(this, n, n.pos.x, n.pos.y));
	}

	, onAfterShow: async function () {
		if (!this.data.nodes) {
			const temp = await performAction({
				cpn: "passives", method: "getTree"
				, data: {}
			});
			this.data.nodes = temp.nodes;
			this.data.links = temp.links.map((l) => {
				return {
					from: { id: l.from }
					, to: { id: l.to }
				};
			});
		}

		//Calculate midpoint
		const pClass = window.player.class;
		const start = this.data.nodes.find((n) => n.spiritStart === pClass);
		if (!start) {
			throw new Error(`Passive start node of ${pClass} is missing!`);
		}

		this.pos.x = start.pos.x * constants.gridSize;
		this.pos.y = start.pos.y * constants.gridSize;

		this.pos.x -= Math.floor(this.canvas.width / 2);
		this.pos.y -= Math.floor(this.canvas.height / 2);

		this.onResize();
		this.renderNodes();

		events.emit("onHideTooltip", this.el[0]);
		this.tooltipId = null;
	}

	, beforeHide: function () {
		events.emit("onHideTooltip", this.el[0]);
		this.tooltipId = null;
	}

	, renderers: {
		clear: function () {
			this.ctx.clearRect(0, 0, this.size.w, this.size.h);
		}

		, node: function (node) {
			let color = (node.color >= 0) ? (node.color + 1) : -1;
			if ((!node.stats || Object.keys(node.stats).length === 0) && !node.spiritStart) {
				color = 0;
			}

			if (node.spiritStart) {
				color = 8;
				node.size = 1;
			}

			this.ctx.fillStyle = ([
				"#69696e"
				, "#c0c3cf"
				, "#3fa7dd"
				, "#4ac441"
				, "#d43346"
				, "#a24eff"
				, "#faac45"
				, "#44cb95"
				, "#fafcfc"
			])[color];
			let size = ([
				constants.blockSize
				, constants.blockSize * 2
				, constants.blockSize * 3
			])[node.size];
			let x = (node.pos.x * constants.gridSize) - ((size - constants.blockSize) / 2) - this.pos.x;
			let y = (node.pos.y * constants.gridSize) - ((size - constants.blockSize) / 2) - this.pos.y;

			let linked = this.data.links.some((l) => {
				if (l.from.id !== node.id && l.to.id !== node.id) {
					return false;
				}
				return this.data.nodes.some((n) => (n.id === l.from.id || n.id === l.to.id) && n.selected);
			});

			if (!linked) {
				this.ctx.globalAlpha = 0.25;
			}

			this.ctx.fillRect(x, y, size, size);

			if (linked) {
				this.ctx.strokeStyle = ([
					"#69696e"
					, "#69696e"
					, "#42548d"
					, "#386646"
					, "#763b3b"
					, "#533399"
					, "#d07840"
					, "#3f8d6d"
					, "#fafcfc"
				])[color];
				this.ctx.strokeRect(x, y, size, size);

				if (node.selected) {
					this.ctx.strokeStyle = "#fafcfc";
					this.ctx.strokeRect(x, y, size, size);
				}
			}

			if (!linked) {
				this.ctx.globalAlpha = 1;
			}
		}

		, line: function (fromNode, toNode, linked) {
			let ctx = this.ctx;
			let halfSize = constants.blockSize / 2;

			fromNode = this.data.nodes.find((n) => n.id === fromNode.id);

			toNode = this.data.nodes.find((n) => n.id === toNode.id);

			let fromX = (fromNode.pos.x * constants.gridSize) + halfSize - this.pos.x;
			let fromY = (fromNode.pos.y * constants.gridSize) + halfSize - this.pos.y;

			let toX = (toNode.pos.x * constants.gridSize) + halfSize - this.pos.x;
			let toY = (toNode.pos.y * constants.gridSize) + halfSize - this.pos.y;

			if ((!linked) && (!fromNode.selected) && (!toNode.selected)) {
				this.ctx.globalAlpha = 0.25;
			}

			ctx.strokeStyle = linked ? "#fafcfc" : "#69696e";
			ctx.beginPath();
			ctx.moveTo(fromX, fromY);
			ctx.lineTo(toX, toY);
			ctx.closePath();
			ctx.stroke();

			if (!linked && !fromNode.selected && !toNode.selected) {
				this.ctx.globalAlpha = 1;
			}
		}
	}

	, events: {
		onKeyDown: function (e) {
			if (e.key === "p") {
				this.toggle();
			}
		}
		, keydown: function (e) {
			//const key = input.convertKeyCode(e);
			const rawX = input.getAxis("horizontal");
			const rawY = input.getAxis("vertical");

			const scrollSpeed = constants.gridSize * constants.scrollSpeed / this.currentZoom;
			this.pos.x += rawX * scrollSpeed;
			this.pos.y += rawY * scrollSpeed;

			this.renderNodes();
		}
		, onMouseMove: function (e) {
			const cell = {
				x: Math.floor((this.pos.x + e.offsetX) / constants.gridSize)
				, y: Math.floor((this.pos.y + e.offsetY) / constants.gridSize)
			};
			const node = this.data.nodes.find((n) => n.pos.x === cell.x && n.pos.y === cell.y);
			if (node === this.hoverNode) {
				return;
			}
			this.hoverNode = node;
			if (node) {
				let text = Object.keys(node.stats)
					.map((s) => {
						let statName = locale.translate("stats", s);
						let statValue = node.stats[s];
						if (s.includes("CritChance")) {
							statValue /= 20;
						}
						let negative = ((statValue + "")[0] === "-");
						if (percentageStats.includes(s)) {
							statValue += "%";
						}
						return `${negative ? "" : "+"}${statValue} ${statName}`;
					})
					.join("<br/>");

				if (node.spiritStart === window.player.class) {
					text = locale.translate("passives", "nodes", "myStart");
				} else if (node.spiritStart) {
					text = locale.translate("passives", "nodes", "spiritStart", { spirit: node.spiritStart });
				}

				const tooltipPos = {
					x: (e.clientX + 15) / zoom
					, y: e.clientY / zoom
				};
				events.emit("onShowTooltip", text, this.el[0], tooltipPos);
				this.tooltipId = node.id;
			} else {
				events.emit("onHideTooltip", this.el[0]);
				this.tooltipId = null;
			}
		}

		, onPanStart: function (e) {
			if (isMobile) {
				let cell = {
					x: Math.floor((this.pos.x + e.offsetX) / constants.gridSize)
					, y: Math.floor((this.pos.y + e.offsetY) / constants.gridSize)
				};

				const node = this.data.nodes.find((n) => n.pos.x === cell.x && n.pos.y === cell.y);
				if (this.hoverNode && node && node.id !== this.hoverNode.id) {
					this.events.onMouseMove.call(this, e);
					return;
				}
				if (!node) {
					this.hoverNode = null;
				}
			}

			if (this.hoverNode) {
				this.events.onTryClickNode.call(this, this.hoverNode);
				return;
			}

			this.events.onMouseMove.call(this, e);

			this.panOrigin = {
				x: e.clientX * zoom
				, y: e.clientY * zoom
			};
		}

		, onPan: function (e) {
			if (!this.panOrigin) {
				this.events.onMouseMove.call(this, e);
				return;
			}
			let scrollSpeed = constants.scrollSpeed / this.currentZoom;

			const rawX = e.clientX * zoom;
			const rawY = e.clientY * zoom;

			this.pos.x += (this.panOrigin.x - rawX) * scrollSpeed;
			this.pos.y += (this.panOrigin.y - rawY) * scrollSpeed;

			this.panOrigin = { x: rawX, y: rawY };

			this.renderNodes();
		}

		, onPanEnd: function (e) {
			this.panOrigin = null;
		}

		, onTryClickNode: function (node) {
			if (node.spiritStart || node.selected) {
				return;
			} else if (isMobile && this.tooltipId !== node.id) {
				return;
			}
			const canReachNode = this.data.links.some((l) => {
				return ((l.to.id === node.id || l.from.id === node.id)
					&& this.data.nodes.some((n) => (n.id === l.from.id || n.id === l.to.id) && n.selected)
				);
			});
			if (!canReachNode) {
				return;
			}
			events.emit("onTryTickPassiveNode", { tick: !node.selected });
			client.request({
				cpn: "player", method: "performAction"
				, data: {
					cpn: "passives", method: node.selected ? "untickNode" : "tickNode"
					, data: {
						nodeId: node.id
					}
				}
			});
		}

		, onGetPassives: function (selected) {
			this.data.nodes.forEach((n) => {
				n.selected = selected.some((s) => s === n.id);
			});
			this.renderNodes();
		}

		, onGetPassivePoints: function (points) {
			const pointsTxt = locale.translate("passives", "points", { points });
			this.find(".points")
				.html(pointsTxt);
		}

		, onReset: function () {
			client.request({
				cpn: "player", method: "performAction"
				, data: {
					cpn: "passives", method: "untickNode"
					, data: {}
				}
			});
		}
	}
};
