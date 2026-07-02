if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Require Routers
const adminRouter = require("./routes/admin.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Database Connection
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const DBURL = process.env.ATLAS_URL;
// console.log("DEBUG: The DBURL variable is currently:", `"${DBURL}"`);

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(DBURL);
}

// App Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Session Configuration
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Local Variables Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// --- ROUTES ---
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.use("/admin", adminRouter); // Placed correctly before the 404!

// --- 404 CATCH-ALL ---
// --- 404 CATCH-ALL ---
app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// --- ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { err, message });
});

// Start Server
// app.listen(8080, () => {
//   console.log("Server is listening on port 8080");
// });
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});