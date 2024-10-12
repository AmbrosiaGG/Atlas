const { error } = require("console");
const config = require("../config"),
  utils = require("./utils"),
  CheckAuth = require("./auth/CheckAuth");

module.exports.load = async (client) => {
  /* Init express app */

  const express = require("express"),
    session = require("express-session"),
    path = require("path"),
    { Server } = require("rootless-ssh"),
    app = express(),
    http = require("http")
    cm = require("connect-mongo"),
    server = http.createServer(app),
    ssh = new Server(
      {
        welcomemsg: "~~ Ambrosia Atlas Console ~~ \n Welcome! User",
        auth: config.owner.ssh, // unique token that needs to be in the `authorization` header when connecting to websocket as `Bearer <password>`,
        path: "/ssh"
      },
      server
    ); // you can put the options in {}

  /* Routers */
  const mainRouter = require("./routes/index"),
    discordAPIRouter = require("./routes/discord"),
    logoutRouter = require("./routes/logout"),
    settingsRouter = require("./routes/settings"),
    guildStatsRouter = require("./routes/guild-stats"),
    guildManagerRouter = require("./routes/guild-manager");

  /* App configuration */
  app
    // For post methods
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .engine("html", require("ejs").renderFile)
    .set("view engine", "ejs")
    .use(
      "/node_modules",
      express.static(path.join(__dirname, "../node_modules"))
    )
    .use("/assets", express.static(path.join(__dirname, "../assets")))
    .set("views", path.join(__dirname, "/views"))
    .set("port", config.dashboard.port)
    .use(
      session({
        secret: config.dashboard.expressSessionPassword,
        resave: false,
        saveUninitialized: false,
        store: cm.create({
          mongoUrl: config.mongoDB,
          collectionName: "sessions",
        }),
      })
    )
    // Multi languages support
    .use(async function (req, res, next) {
      req.user = req.session.user;
      req.client = client;
      req.locale = req.user
        ? req.user.locale === "fr"
          ? "fr-FR"
          : "en-US"
        : "en-US";
      if (req.user && req.url !== "/")
        req.userInfos = await utils.fetchUser(req.user, req.client);
      if (req.user) {
        req.translate = req.client.translations.get(req.locale);
        req.printDate = (date) => req.client.printDate(date, null, req.locale);
      }
      next();
    })

    .use("/api", discordAPIRouter)
    .use("/logout", logoutRouter)
    .use("/servers", guildManagerRouter)
    .use("/stats", guildStatsRouter)
    .use("/settings", settingsRouter)
    .use("/", mainRouter)
    .use(CheckAuth, function (req, res) {
      res.status(404).render("404", {
        user: req.userInfos,
        translate: req.translate,
        currentURL: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      });
    })
    .use(CheckAuth, function (err, req, res) {
      console.error(err.stack);
      if (!req.user) return res.redirect("/");
      res.status(500).render("500", {
        user: req.userInfos,
        translate: req.translate,
        currentURL: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      });
    })
    .use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render("errors/error.ejs", {
        message: res.locals.message,
        error: res.locals.error,
        status: err.status || 500,
      });
    });

  // Listen
  server.listen(app.get("port"), () => {
    console.log("Atlanta Dashboard is listening on port " + app.get("port"));
  });
  ssh.start();
};
