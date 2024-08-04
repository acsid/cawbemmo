require.config({
	baseUrl: ""
	, waitSeconds: 120
	, paths: {
		assign: "/common/assign"
		, text: "/js/dependencies/text.min"
		, html: "/plugins/html"
		, css: "/js/dependencies/css.min"
		, helpers: "/js/misc/helpers"
	}
	, shim: {
		helpers: {
			deps: [
				"assign"
			]
			, exports: "_"
		}
	}
});

require([
	"helpers"
	, "html!templates/userslist"
	, "html!templates/errorslist"
], function (
	glExport
	, userslistTpl
	, errorslistTpl
) {
	const userLevelToString = (level) => {
		if (!level) {
			return "Player";
		}
		if (level <= 9) {
			return "Moderator";
		}
		if (level <= 89) {
			return "Admin";
		}
		return "Owner";
	};
	const buildErrorsList = async () => {
		let uiElm = document.querySelector("#errors-list");
		if (uiElm) {
			uiElm.remove();
		}
		const res = await fetch("/api/rest/errors");
		if (!res.ok) {
			_.log.getErrors.error("Request failed! Status:", res.statusText);
			return;
		}
		const errorsList = await res.json();
		uiElm = document.createElement("div");
		uiElm.innerHTML = errorslistTpl;
		uiElm = uiElm.querySelector("#errors-list");
		const errorTpl = uiElm.querySelector(".error.item");
		for (const errEvent of errorsList) {
			const eventDate = new Date(errEvent.key);
			_.log.getErrors.debug("Adding error", eventDate, errEvent.value);
			const errElm = errorTpl.cloneNode(true);
			errElm.innerHTML = errElm.innerHTML
				.replaceAll("{{date}}", eventDate.toLocaleString())
				.replaceAll("{{error}}", errEvent.value.replaceAll("\u003C", "&lt;").replaceAll("\u003E", "&gt;"));
			errElm.dataset.table = "errors";
			errElm.dataset.key = errEvent.key;
			errElm.id = "errorEntry-" + eventDate.getTime();
			errElm.addEventListener("click", (evt) => showMenu.call(errElm, evt, "error-item"));
			errorTpl.parentNode.appendChild(errElm);
		}
		if (!errorsList.length) {
			errorTpl.parentNode.appendChild(document.createTextNode("No errors..."));
		}
		errorTpl.remove();

		if (uiElm.classList.contains("modal")) {
			buildClose(uiElm, true);
			makeElementDraggable(uiElm);
		}
		const container = document.getElementById("ui-container");
		container.appendChild(uiElm);
	};
	const buildUsersList = async () => {
		let uiElm = document.querySelector("#users-list");
		if (uiElm) {
			uiElm.remove();
		}
		const res = await fetch("/api/rest/users");
		if (!res.ok) {
			_.log.getUsers.error("Request failed! Status:", res.statusText);
			return;
		}
		const users = await res.json();
		uiElm = document.createElement("div");
		uiElm.innerHTML = userslistTpl;
		uiElm = uiElm.querySelector("#users-list");
		const userTpl = uiElm.getElementsByClassName("user")[0];
		for (const user of users) {
			_.log.getUsers.debug("Adding user", user);
			const userElm = userTpl.cloneNode(true);
			userElm.innerHTML = userElm.innerHTML
				.replaceAll("{{username}}", user.username)
				.replaceAll("{{level}}", `[${user.level}] ${userLevelToString(user.level)}`)
				.replaceAll("{{characters}}", JSON.stringify(user.characters));
			userTpl.parentNode.appendChild(userElm);
		}
		userTpl.remove();

		if (uiElm.classList.contains("modal")) {
			buildClose(uiElm, true);
			makeElementDraggable(uiElm);
		}
		const container = document.getElementById("ui-container");
		container.appendChild(uiElm);
	};

	const onConnected = (accountInfo) => {
		_.log.submitLoginForm.info("Connected", accountInfo);

		const loginElm = document.getElementById("login");
		loginElm.style.display = "none";

		const userMenu = document.getElementById("profile-menu");
		userMenu.innerText = `${userLevelToString(accountInfo.level)}/${accountInfo.username} (${accountInfo.level})`;

		window.buildUsersList = buildUsersList;
		window.buildErrorsList = buildErrorsList;

		for (const elmName of [ "top-menu", "ui-container" ]) {
			const elm = document.getElementById(elmName);
			elm.style.display = "block";
		}
	};

	window.submitLoginForm = async (event) => {
		const formData = new FormData(event.target.form);
		const data = {};
		for (const [ key, value ] of formData.entries()) {
			data[key] = value;
		}
		const res = await fetch("/api/auth/login", {
			method: "POST"
			, headers: {
				"Content-Type": "application/json"
			}
			, body: JSON.stringify(data)
		});
		if (!res.ok) {
			_.log.submitLoginForm.info("Request Status: %s - Login failed!", res.statusText);
			return;
		}
		const reply = await res.json();
		onConnected(reply.user);
	};

	// Check if user is currently authentified.
	fetch("/api/auth/self").then(async (res) => {
		if (res.status === 200) {
			return onConnected(await res.json());
		}
		_.log.AdminPanel.info("Not connected!");
		const loginElm = document.getElementById("login");
		loginElm.style.display = "flex";
	}, _.log.AdminPanel.error);
});

function buildClose (uiElm, onClose) {
	const heading = uiElm.querySelector(".heading");
	if (!heading) {
		return;
	}
	const btnClose = document.createElement("div");
	btnClose.classList.add("btn", "btnClose");
	btnClose.innerText = "X";
	heading.appendChild(btnClose);
	if (onClose === true) {
		onClose = removeUiElement
	} else if (!onClose) {
		onClose = toggleUiElement
	}
	btnClose.addEventListener("click", onClose.bind(btnClose, uiElm));
}

function makeElementDraggable (elmnt) {
	if (!elmnt) {
		throw new Error("Element is undefined.");
	}
	let lastX = 0, lastY = 0;
	const elementDrag = function (e) {
		e.preventDefault();
		// calculate the new cursor position:
		const deltaX = lastX - e.clientX;
		const deltaY = lastY - e.clientY;
		lastX = e.clientX;
		lastY = e.clientY;
		// set the element's new position:
		elmnt.style.left = `${elmnt.offsetLeft - deltaX}px`;
		elmnt.style.top = `${elmnt.offsetTop - deltaY}px`;
	};
	const closeDragElement = function () {
		// stop moving when mouse button is released:
		document.removeEventListener("mouseup", closeDragElement);
		document.removeEventListener("mousemove", elementDrag);
	};
	const dragMouseDown = function (e) {
		e.preventDefault();
		// get the mouse cursor position at startup:
		lastX = e.clientX;
		lastY = e.clientY;
		document.addEventListener("mouseup", closeDragElement);
		// call a function whenever the cursor moves:
		document.addEventListener("mousemove", elementDrag);
	};
	let header;
	if (elmnt.id) {
		header = document.getElementById(elmnt.id + "header");
	}
	if (!header) {
		header = elmnt.querySelector(".heading");
	}
	if (header) {
		// if present, the header is where you move the DIV from:
		header.addEventListener("mousedown", dragMouseDown);
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		elmnt.addEventListener("mousedown", dragMouseDown);
	}
}

async function showMenu(event, menuId) {
	const target = event.target;
	let targetId = event.target;
	while (targetId && typeof targetId !== "string") {
		targetId = targetId.id || targetId.parentNode;
	}
	if (!menuId) {
		menuId = targetId;
	}
	const menuElm = document.getElementById(menuId + "-contextmenu");
	menuElm.style.display = "block";
	const offsets = target.getBoundingClientRect();
	const parentOffsets = menuElm.parentElement.getBoundingClientRect();
	menuElm.style.left = (menuElm.parentElement.scrollLeft + _.constrain(event.pageX, offsets.left, offsets.right) - parentOffsets.left) + "px";
	menuElm.style.top = (menuElm.parentElement.scrollTop + _.constrain(event.pageY, offsets.top, offsets.bottom) - parentOffsets.top) + "px";
	let tX = 0, tY = 0;
	if (event.pageX > parentOffsets.left + (parentOffsets.width / 2)) {
		tX = -100;
	}
	if (event.pageY > parentOffsets.top + (parentOffsets.height / 2)) {
		tY = -100;
	}
	menuElm.style.transform = `translate(${tX}%, ${tY}%)`;
	if (targetId) {
		menuElm.dataset.parent = targetId;
	}
	// asyncDelay is to allow document to process current click event.
	await _.asyncDelay(33);
	const hideMenu = (e) => {
		if (e.target === target) {
			//document.addEventListener("click", hideMenu, { once: true });
			return;
		}
		menuElm.style.display = "none";
		delete menuElm.dataset.parent;
	};
	document.addEventListener("click", hideMenu, { once: true });
}

function toggleUiElement(uiElm) {
	if (uiElm.style.display === "none") {
		uiElm.style.display = "block";
		//events.emit("onToggleUi", uiElm);
		return;
	}
	uiElm.style.display = "none";
	//events.emit("onClosedUi", uiElm);
	//TODO Add a way to open Ui element again.
}

function removeUiElement(uiElm) {
	if (!uiElm) {
		throw new Error("uiElm is undefined.");
	}
	uiElm.remove();
	//events.emit("onClosedUi", uiElm);
	//events.emit("onRemovedUi", uiElm);
}

async function deleteEntry(event) {
	const target = event.target;
	const menuElm = target.closest(".contextmenu");
	if (!menuElm.dataset.parent) {
		throw new Error("Element has no data-parent attribute.");
	}
	const parentElm = document.getElementById(menuElm.dataset.parent);
	if (!parentElm) {
		throw new Error("Parent element not found.");
	}
	const srcTable = parentElm.dataset.table;
	if (!srcTable) {
		throw new Error("Element has no data-table attribute.");
	}
	let res;
	switch (srcTable) {
		case "errors":
			res = await fetch("/api/rest/errors", {
				method: "DELETE"
				, headers: {
					"Content-Type": "application/json"
				}
				, body: JSON.stringify({ key: parentElm.dataset.key })
			});
			break;
		default: throw new Error(`Element data-table="${srcTable}" is an unexpected value.`);
	}
	if (!res.ok) {
		_.log.deleteEntry.error("Request failed! Status:", res.statusText);
		return;
	}
	const result = await res.json();
	_.log.deleteEntry.debug("Request completed! Result:", result);
	removeUiElement(parentElm);
}
