module.exports = {
	level: 9
	, get: async (req, res) => {
		if (!req.query.msg || typeof req.query.msg !== "string") {
			return res.status(400).json({ message: "Not successful", error: "Message is missing." });
		}
		cons.emit("event", {
			event: "onGetMessages"
			, data: {
				messages: [{
					class: "color-blueA"
					, message: config.msg
					, type: "chat"
				}]
			}
		});
		res.jsonp({
			success: true
		});
	}
};
