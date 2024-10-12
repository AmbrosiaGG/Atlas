const express = require("express"),
  router = express.Router(),
  Discord = require("discord.js");

const fetch = require("node-fetch"),
  btoa = require("btoa");
var cron = require("node-cron");

// Helper function to update user session
async function updateSession(req, tokens) {
  const userData = await fetchUserData(tokens.access_token);
  req.session.user = { ...userData.infos, guilds: userData.guilds };
}

router.get("/callback", async (req, res) => {
  if (!req.query.code)
    return res.redirect(req.client.config.dashboard.failureURL);

  const redirectURL = req.client.states[req.query.state] || "/servers";
  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("code", req.query.code);
  params.set(
    "redirect_uri",
    `${req.client.config.dashboard.baseURL}/api/callback`
  );

  try {
    // Exchange code for tokens
    let response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: params.toString(),
      headers: {
        Authorization: `Basic ${btoa(
          `${req.client.user.id}:${req.client.config.dashboard.secret}`
        )}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Fetch tokens
    const tokens = await response.json();
    if (tokens.error || !tokens.access_token) {
      console.error("Token retrieval error:", tokens.error);
      return res.redirect(`/api/login&state=${req.query.state}`);
    }

    // Update the session initially
    await updateSession(req, tokens);

    // Schedule cron job to update session every reboot and at regular intervals
    cron.schedule("*/1 * * * *", async () => {
      console.log("Updated Session")
      await updateSession(req, tokens); // Regular interval update (e.g., every 5th minute of the hour)
    });

    // Add @reboot cron task
    cron.schedule("@reboot", async () => {
      await updateSession(req, tokens); // Run on server reboot
      cron.schedule("*/1 * * * *", async () => {
        console.log("Updated Session")
        await updateSession(req, tokens); // Regular interval update (e.g., every 5th minute of the hour)
      });
    });

    // Log user info if it's their first login
    const userID = req.session.user.id;
    const user = await req.client.users.fetch(userID);
    const userDB = await req.client.findOrCreateUser({ id: userID });
    const logsChannel = req.client.channels.cache.get(req.client.config.dashboard.logs);

    if (!userDB.logged && logsChannel && user) {
      const embed = new Discord.EmbedBuilder()
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .setColor("#DA70D6")
        .setDescription(req.client.translate("dashboard:FIRST_LOGIN", { user: user.tag }));
      logsChannel.send({ embeds: [embed] });
      userDB.logged = true;
      await userDB.save();
    }

    res.redirect(redirectURL);
  } catch (error) {
    console.error("Error during callback handling:", error);
    res.redirect(req.client.config.dashboard.failureURL);
  }
});

module.exports = router;
