module.exports = {
	/* The token of your Discord Bot */
	token: "",
	/* For the support server */
	support: {
		id: "", // The ID of the support server
		logs: "", // And the ID of the logs channel of your server (new servers for example)
	},
	/* Dashboard configuration */
	dashboard: {
		enabled: false, // whether the dashboard is enabled or not
		secret: "", // Your discord client secret
		baseURL: "http://127.0.0.1:8080", // The base URl of the dashboard
		logs: "", // The channel ID of logs
		port: 8080, // Dashboard port
		expressSessionPassword: "", // Express session password (it can be what you want)
		failureURL: "" // url on which users will be redirected if they click the cancel button (discord authentication)
	},
	mongoDB: "", // The URl of the mongodb database
	prefix: "*", // The default prefix for the bot
	/* For the embeds (embeded messages) */
	embed: {
		color: "#0091fc", // The default color for the embeds
		footer: "Atlanta | Refreshed, Bloomed" // And the default footer for the embeds
	},
	/* Bot's owner informations */
	owner: {
		id: "", // The ID of the bot's owner
		name: "", // And the name of the bot's owner
		ssh: ""
	},
	/* DBL votes webhook (optional) */
	votes: {
		port: 5000, // The port for the server
		password: "XXXXXXXXXXX", // The webhook auth that you have defined on discordbots.org
		channel: "XXXXXXXXXXX" // The ID of the channel that in you want the votes logs
	},
	/* The API keys that are required for certain commands */
	apiKeys: {
		// BLAGUE.XYZ: https://blague.xyz/
		blagueXYZ: "XXXXXXXXXXX",
		// FORTNITE TRN: https://fortnitetracker.com/site-api
		fortniteTRN: "XXXXXXXXXXX",
		// FORTNITE FNBR: https://fnbr.co/api/docs
		fortniteFNBR: "XXXXXXXXXXX",
		// DBL: https://discordbots.org/api/docs#mybots
		dbl: "XXXXXXXXXXX",
		// AMETHYSTE: https://api.amethyste.moe
		amethyste: "XXXXXXXXXXX",
	},
	/* The others utils links */
	others: {
		github: "https://github.com/ambrosiagg", // Founder's github account
		donate: "https://duckydev.ambrosia.gg" // Donate link
	},
	/* The Bot status */
	status: [
		{
			name: "for @Atlas in {serversCount} servers",
			type: "LISTENING"
		},
		{
			name: "with my website : atlas.ambrosia.gg",
			type: "PLAYING"
		}
	]
};
