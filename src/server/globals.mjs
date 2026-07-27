global.io = (await import("./db/io.js")).default;
global.cons = (await import("./security/connections.js")).default;
global._ = (await import("./misc/helpers.mjs")).default;
global.atlas = (await import("./world/atlas.js")).default;
global.leaderboard = (await import("./leaderboard/leaderboard.js")).default;
global.clientConfig = (await import("./config/clientConfig.js")).default;

global.consts = (await import("./config/consts.js")).default;

global.language = (await import("./language/index.mjs")).default;
