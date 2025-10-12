module.exports = {
	level: 9
	, get: async (req, res) => {
		// Wait for all zones to clear queues.
		await atlas.returnWhenZonesIdle();
		// Send optional notification.
		if (req.query.msg) {
			cons.emit("event", {
				event: "onGetMessages"
				, data: {
					messages: [{
						class: "color-blueA"
						, message: String(req.query.msg)
						, type: "chat"
					}]
				}
			});
		}
		// Ask threads to save all data.
		await cons.forceSaveAll();
		// Wait for all threads to get idle again.
		await atlas.returnWhenZonesIdle();
		// HTTP Return value.
		res.jsonp({
			success: true
		});
	}
};
