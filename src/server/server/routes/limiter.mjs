import { isIPv6 } from "node:net";
import { Address6 } from "ip-address";

const ipKeyGenerator = function (ip, ipv6Subnet = 56) {
	if (ipv6Subnet && isIPv6(ip)) {
		return `${new Address6(`${ip}/${ipv6Subnet}`).startAddress().correctForm()}/${ipv6Subnet}`;
	}
	return ip;
};

const ClientsLimiter = class {
	constructor (windowMs, limit) {
		this.windowMs = windowMs;
		this.limit = limit;
		this.current = new Map();
	}
	clear () {
		this.previous = this.current;
		this.current = new Map();
	}
	getKey (req) {
		return ipKeyGenerator(req.ip);
	}
	getClient (req) {
		const key = this.getKey(req);
		let client = this.current.get(key);
		if (client) {
			return client;
		}
		if (this.previous) {
			client = this.previous.get(key);
		}
		if (client) {
			this.previous.delete(key);
		} else {
			client = {
				totalHits: 0
				, lastHitTime: Date.now()
			};
		}
		this.current.set(key, client);
		return client;
	}
	resetClient (client, now = Date.now()) {
		client.totalHits = 0;
		client.lastHitTime = now;
		return client;
	}
	getNextRetryTime (client, now = Date.now()) {
		if (client.totalHits < this.limit) {
			return now;
		}
		const tSpan = this.windowMs / this.limit;
		return Math.max(now
			, client.lastHitTime + Math.ceil(tSpan * (1 + client.totalHits - this.limit))
		);
	}
	async onRequest (client, now = Date.now()) {
		const lastHitElapsedTime = now - client.lastHitTime;
		if (lastHitElapsedTime >= this.windowMs) {
			this.resetClient(client, now);
		} else {
			client.totalHits -= Math.floor(this.limit * (lastHitElapsedTime / this.windowMs));
		}
		client.lastHitTime = now;
		if (client.totalHits <= 0) {
			client.totalHits = 1;
		} else {
			client.totalHits++;
		}
		return client;
	}
};

const create = (windowMs, limit) => {
	const limiter = new ClientsLimiter(windowMs, limit);
	let lastClear = Date.now();
	return async (req, res, next) => {
		const now = Date.now();
		if (lastClear - now > windowMs) {
			lastClear = now;
			limiter.clear();
		}
		const client = limiter.getClient(req);
		await limiter.onRequest(client, now);
		if (client.totalHits > limit) {
			if (!res.headersSent) {
				const resetSeconds = 1 + Math.ceil((limiter.getNextRetryTime(client, now) - now) / 1000);
				res.setHeader("Retry-After", resetSeconds.toString());
			}
			return res.status(429).json({ message: "Too Many Requests" });
		}
		return next();
	};
};

export default {
	create
};
