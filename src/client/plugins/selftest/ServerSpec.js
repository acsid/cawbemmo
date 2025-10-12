describe("Server", () => {
	let client;
	beforeAll(async () => {
		client = await new Promise(res => {
			require(["/js/system/client.js"], res);
		});
	}, 60 * 1000);
	describe("when ready", () => {
		beforeAll((done) => {
			client.init(done);
		});
		it("has connected websocket", () => {
			expect(client.socket.connected).toBeTrue();
		});
	});
});
