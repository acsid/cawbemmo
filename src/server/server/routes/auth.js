const bcrypt = require("bcrypt-nodejs");
const express = require("express");
const jwt = require("jsonwebtoken");

const util = require("util");
const bCompare = util.promisify(bcrypt.compare);
const jVerify = util.promisify(jwt.verify);

let jwtSecret = require("crypto").randomBytes(35).toString("hex");

const createRouter = (options) => {
	if (options?.secret) {
		jwtSecret = options.secret;
	}
	if (typeof jwtSecret !== "string") {
		throw new Error("options.secret must be a string.");
	}
	const router = express.Router();
	router.route("/self").get(async (req, res) => {
		const token = req.cookies.jwt
		if (!token) {
			return res.status(204).send();
		}
		try {
			const decodedToken = await jVerify(token, jwtSecret);
			if (!decodedToken.level) {
				return res.status(204);
			}
			const accountInfo = await io.getAsync({
				key: decodedToken.username
				, table: "accountInfo"
				, noDefault: true
			});
			accountInfo.username = decodedToken.username;
			return res.status(200).json(accountInfo);
		} catch (err) {
			if (err.message !== "invalid signature") {
				_.log.routes.auth.error(err);
			}
			res.cookie("jwt", "", { maxAge: "1" });
			return res.status(204).send();
		}
	});
	router.route("/login").post(async (req, res, next) => {
		const { username, password } = req.body
		if (!username || !password) {
			return res.status(400).jsonp({
				message: "Login not successful"
				, error: "Username or Password not present"
			});
		}
		try {
			const storedPassword = await io.getAsync({
				key: username
				, table: "login"
				, noParse: true
			});
			if (!storedPassword) {
				res.status(401).jsonp({
					message: "Login not successful"
					, error: "User not found"
				});
			}
			const compareResult = await bCompare(password, storedPassword);
			if (!compareResult) {
				res.status(401).jsonp({
					message: "Login not successful"
					, error: "User not found"
				});
			} else {
				const accountInfo = await io.getAsync({
					key: username
					, table: "accountInfo"
					, noDefault: true
				}) || {
					loginStreak: 0
					, level: 0
				};
				const maxAge = 3 * 60 * 60;
				const token = jwt.sign(
					{
						username
						, level: accountInfo.level
					}
					, jwtSecret
					, {
						// 3hrs in sec
						expiresIn: maxAge
					}
				);
				res.cookie("jwt", token, {
					// Flags the cookie to be accessible only by the web server.
					httpOnly: true
					// 3hrs in ms
					, maxAge: maxAge * 1000
				});
				res.status(200).jsonp({
					message: "Login successful"
					, user: {
						username
						, ...accountInfo
					}
					, jwt: token
					, expiresIn: maxAge
				});
			}
		} catch (err) {
			return res.status(400).jsonp({
				message: "An error occurred"
				, error: err.message
			});
		}
	});
	router.route("/logout").get((req, res) => {
		res.cookie("jwt", "", { maxAge: "1" });
		if (req.query.redirect) {
			return res.redirect(req.query.redirect);
		}
		return res.redirect("/");
	});
	router.route("/token").get(async (req, res) => {
		const token = req.cookies.jwt;
		if (!token) {
			return res.status(401).json({ message: "Not authorized, jwt token not available" });
		}
		try {
			const decodedToken = await jVerify(token, jwtSecret);
			if (decodedToken.level < reqLevel) {
				return res.status(401).json({ message: "Not authorized" });
			}
			const maxAge = 3 * 60 * 60;
			const token = jwt.sign(
				{
					username: decodedToken.username
					, level: decodedToken.level
				}
				, jwtSecret
				, {
					// 3hrs in sec
					expiresIn: maxAge
				}
			);
			if (req.query.refresh) {
				res.cookie("jwt", token, {
					// Flags the cookie to be accessible only by the web server.
					httpOnly: true
					// 3hrs in ms
					, maxAge: maxAge * 1000
				});
			}
			res.status(200).jsonp({
				jwt: token
				, expiresIn: maxAge
			});
		} catch (err) {
			if (err.message !== "invalid signature") {
				_.log.routes.auth.error(err);
			}
			res.cookie("jwt", "", { maxAge: "1" });
			return res.status(401).json({ message: "Not authorized" });
		}
	});
	router.route("/register").post(async (req, res, next) => {
		const { username, password } = req.body
		if (!username || !password) {
			return res.status(400).jsonp({
				message: "Username or Password not present"
			})
		}
		if (password.length < 6) {
			return res.status(400).jsonp({ message: "Password less than 6 characters" })
		}
		try {
			throw new Error("Not implemented...");
			const user = await User.create({
				username,
				password,
			});
			res.status(200).jsonp({
				message: "User successfully created"
				, user
			});
		} catch (err) {
			res.status(401).jsonp({
				message: "User creation failed"
				, error: err.mesage
			})
		}
	});
	return router;
};

const createAuth = (reqLevel) => {
	return async (req, res, next) => {
		const token = req.cookies.jwt;
		if (!token) {
			return res.status(401).json({ message: "Not authorized, jwt token not available" });
		}
		try {
			const decodedToken = await jVerify(token, jwtSecret);
			if (decodedToken.level < reqLevel) {
				return res.status(401).json({ message: "Not authorized" });
			}
			next();
		} catch (err) {
			if (err.message !== "invalid signature") {
				_.log.routes.auth.error(err);
			}
			res.cookie("jwt", "", { maxAge: "1" });
			return res.status(401).json({ message: "Not authorized" });
		}
	};
};

module.exports = {
	createRouter
	, createAuth
};
