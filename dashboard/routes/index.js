const express = require("express"),
	CheckAuth = require("../auth/CheckAuth"),
	router = express.Router();

router.get("/", async (req, res) => {
	res.render("landing", {
		user: req.userInfos,
		translate: req.translate,
		currentURL: `${req.client.config.dashboard.baseURL}/${req.originalUrl}`
	});
});

router.get("/servers", CheckAuth, async(req, res) => {
	res.render("selector", {
		user: req.userInfos,
		translate: req.translate,
		currentURL: `${req.client.config.dashboard.baseURL}/${req.originalUrl}`
	});
	console.log(req.user.info)
	function logNonArrayNonObjectProperties(obj) {
		Object.entries(obj).forEach(([key, value]) => {
			if (typeof value !== 'object' || value === null) { // Check for null to exclude it from objects
				console.log(`${key}: ${value}`);
			}
		});
	}
	
	// Assuming req.userInfos is the object you want to log
	console.log(logNonArrayNonObjectProperties(req.userInfos));
});

module.exports = router;