const serverConfig = require("../config/serverConfig");
const tableNames = require("./tableNames");

const r = require("rethinkdbdash")({
	host: serverConfig.dbHost
	, port: serverConfig.dbPort
	, db: serverConfig.dbName
	, user: serverConfig.dbUser
	, password: serverConfig.dpPass
});

module.exports = {
	staticCon: null

	, init: async function (cbReady) {
		await this.create();
		this.open = true;
		cbReady();
	}

	, create: async function () {
		try {
			await r.dbCreate(serverConfig.dbName).run();
		} catch (e) {
			_.log.ioDB.error(e);
		}
		for (const table of tableNames) {
			try {
				await r.tableCreate(table).run();
			} catch (e) {
				if (!e.message.includes("already exists")) {
					_.log.ioDB.error(e);
				}
			}
		}

		//Create indices used for case-insensitive checks
		if (!(await r.table("login").indexList()).includes("idLowerCase")) {
			await r.table("login").indexCreate("idLowerCase", r.row("id").downcase());
			_.log.ioDB.debug("Created index: idLowerCase on table: login");
		}

		if (!(await r.table("character").indexList()).includes("idLowerCase")) {
			await r.table("character").indexCreate("idLowerCase", r.row("id").downcase());
			_.log.ioDB.debug("Created index: idLowerCase on table: character");
		}
	}

	, createTable: async function (tableName) {
		try {
			await r.tableCreate(tableName).run();
		} catch (e) {
			if (!e.message.includes("already exists")) {
				_.log.ioDB.error(e);
			}
		}
	}

	, getAsyncIgnoreCase: async function (table, key) {
		const res = await r.table(table)
			.getAll(key.toLowerCase(), { index: "idLowerCase" })
			.run();
		return res[0];
	}

	, getAsync: async function ({
		table,
		key,
		isArray,
		noDefault,
		ignoreCase
	}) {
		let res = null;
		if (ignoreCase) {
			res = await this.getAsyncIgnoreCase(table, key);
		} else {
			res = await r.table(table).get(key).run();
		}
		if (res) {
			return res.value;
		} else if (isArray && !noDefault) {
			return [];
		}
		return res;
	}

	, getFilterAsync: async function (
		{ table, noDefault, filter, limit, offset, orderAsc, orderDesc }
	) {
		let res = r.table(table).filter(filter);
		if (orderAsc) {
			res = res.orderBy(orderAsc);
		}
		if (orderDesc) {
			res = res.orderBy(r.desc(orderDesc));
		}
		if (offset) {
			res = res.skip(offset);
		}
		if (limit) {
			res = res.limit(limit);
		}
		await res.run();
		if (res) {
			return res;
		}
		if (!noDefault) {
			return [];
		}
		return null;
	}

	, getAllAsync: async function ({
		table,
		isArray,
		noDefault
	}) {
		const res = await r.table(table).run();
		if (res) {
			return res;
		}
		if (isArray && !noDefault) {
			return [];
		}
		return res;
	}

	, setAsync: async function ({
		table,
		key: id,
		value,
		conflict = "update"
	}) {
		try {
			await r.table(table)
				.insert({
					id
					, value
				}, {
					conflict
				})
				.run();
		} catch (e) {
			await this.logError({
				sourceModule: "ioRethink"
				, sourceMethod: "setAsync"
				, error: e
				, info: {
					table
					, key: id
					, value: JSON.stringify(value)
				}
			});
		}
	}

	, setFlat: async function ({
		table,
		value,
		conflict = "update"
	}) {
		try {
			await r.table(table).insert(value, { conflict }).run();
		} catch (e) {
			await this.logError({
				sourceModule: "ioRethink"
				, sourceMethod: "setFlat"
				, error: e
				, info: {
					table
					, value: JSON.stringify(value)
				}
			});
		}
	}

	, deleteAsync: async function ({
		key,
		table
	}) {
		await r.table(table)
			.get(key)
			.delete()
			.run();
	}

	, deleteFilterAsync: async function ({
		table,
		filter
	}) {
		await r.table(table)
			.filter(filter)
			.delete()
			.run();
	}

	, subscribe: function (table) {
		return r.table(table)
			.changes()
			.run();
	}

	, append: async function ({
		table,
		key,
		value,
		field
	}) {
		try {
			await r.table(table)
				.get(key)
				.update((row) => {
					return r.branch(
						row("value").typeOf().eq("ARRAY"),
						{
							[field]: row("value").setUnion(value)
						},
						{
							[field]: value
						}
					);
				})
				.run();
		} catch (e) {
			await this.logError({
				sourceModule: "ioRethink"
				, sourceMethod: "append"
				, error: e
				, info: {
					table
					, key
					, field
					, value: JSON.stringify(value)
				}
			});
		}
	}

	, exists: async function ({
		table,
		key
	}) {
		let res = await r.table(table)
			.get(key)
			.run();

		return Boolean(res);
	}

	, logError: async function ({ sourceModule, sourceMethod, error, info }) {
		_.log.ioDB.fatal(error);
		try {
			await this.setAsync({
				table: "error"
				, value: {
					date: new Date()
					, sourceModule
					, sourceMethod
					, error: error.toString()
					, stack: error.stack.toString()
					, info
				}
			});
		} catch (e) {
			_.log.ioDB.critical(e);
		}
		if (process.send) {
			process.send({
				event: "onCrashed"
			});
		} else {
			process.exit();
		}
		throw error;
	}
};
