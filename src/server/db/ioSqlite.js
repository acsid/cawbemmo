const util = require("util");
const tableNames = require("./tableNames");

const PROMISIFY_FUNCTIONS = [ "all", "get", "run" ];

module.exports = {
	asyncDB: {}
	, db: null
	, file: "../../data/storage.db"

	, buffer: []
	, processing: []

	, tables: {}

	, init: async function (cbReady) {
		const sqlite = require("sqlite3").verbose();
		this.db = new sqlite.Database(this.file, this.onDbCreated.bind(this, cbReady));
		for (const fName of PROMISIFY_FUNCTIONS) {
			this.asyncDB[fName] = _.retry(
				util.promisify(this.db[fName].bind(this.db))
				// Amount of retries allowed.
				, 3
				// onError
				, (e) => {
					// Log errors.
					_.log.ioSQL.error(e);
					// Retry after a small delay.
					return _.asyncDelay(10);
				}
			);
		}
	}
	, onDbCreated: function (cbReady) {
		const db = this.db;
		const scope = this;
		db.serialize(function () {
			for (let t of tableNames) {
				db.run(`CREATE TABLE ${t} (key VARCHAR(50), value TEXT)`
					, scope.onTableCreated.bind(scope, t, null)
				);
			}
			scope.open = true;
			cbReady();
		}, this);
	}

	, createTable: async function (tableName) {
		const scope = this;
		return new Promise((res) => {
			this.db.run(`CREATE TABLE ${tableName} (key VARCHAR(50), value TEXT)`
				, scope.onTableCreated.bind(scope, tableName, res)
			);
		});
	}
	, onTableCreated: async function (table, callback, err, result) {
		if (err) {
			if (!err.message?.includes(`table ${table} already exists`)) {
				_.log.ioSQL.error("Table '%s' creation error: %o", table, args);
			}
		} else {
			_.log.ioSQL.notice("New table '%s' created.", table);
		}
		if (result) {
			_.log.ioSQL.onTableCreated.trace(result);
		}
		if (callback) {
			callback(args);
		}
	}

	//ent, field
	, get: function (options) {
		const key = options.ent;
		const table = options.field;

		options.query = `SELECT * FROM ${table} WHERE key = '${key}' LIMIT 1`;

		this.db.get(options.query, this.done.bind(this, options));
	}

	, getAsync: async function (options) {
		const collate = options.ignoreCase ? "COLLATE NOCASE" : "";
		const query = `SELECT * FROM ${options.table} WHERE key = '${options.key}' ${collate} LIMIT 1`;
		let res = await this.asyncDB.get(query);
		if (res) {
			res = res.value;
			if (options.clean) {
				res = res
					.replaceAll("`", "'")
					.replace(/''+/g, "'");
			}
			if (!options.noParse) {
				res = JSON.parse(res);
			}
		} else if (!options.noParse && !options.noDefault) {
			res = options.isArray ? [] : {};
		}
		return res;
	}

	, getAllAsync: async function (options) {
		let res = await this.asyncDB.all(`SELECT * FROM ${options.table}`);
		if (res) {
			if (options.clean) {
				for (const r of res) {
					r.value = r.value
						.replaceAll("`", "'")
						.replace(/''+/g, "'");
				}
			}
			if (!options.noParse) {
				if (!res) {
					res = options.isArray ? [] : {};
				} else {
					for (const r of res) {
						r.value = JSON.parse(r.value);
					}
				}
			}
		} else if (!options.noParse && !options.noDefault) {
			res = options.isArray ? [] : {};
		}
		return res;
	}

	, delete: function (options) {
		let key = options.ent;
		let table = options.field;

		options.query = `DELETE FROM ${table} WHERE key = '${key}'`;

		this.db.run(options.query, this.done.bind(this, options));
	}

	, deleteAsync: function (options) {
		return this.asyncDB.run(`DELETE FROM ${options.table} WHERE key = '${options.key}'`);
	}

	//ent, field, value
	, set: function (options) {
		let key = options.ent;
		let table = options.field;

		this.db.get(`SELECT 1 FROM ${table} where key = '${key}'`, this.doesExist.bind(this, options));
	}
	, doesExist: function (options, err, result) {
		let key = options.ent;
		let table = options.field;

		let query = `INSERT INTO ${table} (key, value) VALUES('${key}', '${options.value}')`;
		if (result) {
			query = `UPDATE ${table} SET value = '${options.value}' WHERE key = '${key}'`;
		}
		this.db.run(query, this.done.bind(this, options));
	}

	, setAsync: async function (options) {
		let table = options.table;
		let key = options.key;
		let value = options.value;

		if (options.serialize) {
			value = JSON.stringify(value);
		}
		if (value.replaceAll) {
			// Is a string. Clean single quotes.
			value = value.replaceAll("'", "`");
		}
		let exists = await this.asyncDB.get(`SELECT * FROM ${table} WHERE key = '${key}' LIMIT 1`);

		let query = `INSERT INTO ${table} (key, value) VALUES('${key}', '${value}')`;
		if (exists) {
			query = `UPDATE ${table} SET value = '${value}' WHERE key = '${key}'`;
		}
		await this.asyncDB.run(query);
	}

	, done: function (options, err, result) {
		if (err) {
			_.log.ioSQL.error(err);
		}
		if (options.callback) {
			options.callback(result?.value || null);
		}
	}
};
