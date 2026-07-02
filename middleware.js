const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// THIS IS THE FUNCTION THAT WAS MISSING OR MISSPELLED!
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to edit this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
// Middleware for Owners
module.exports.isOwner = (req, res, next) => {
    // Let them pass if they are an Owner OR an Admin!
    if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
        return next();
    }
    req.flash("error", "You must be a registered Owner to create listings.");
    return res.redirect("/listings");
};

// Middleware for Admins
module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    req.flash("error", "Access Denied: Admin privileges required.");
    return res.redirect("/");
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
// middleware.js
module.exports.isAdmin = (req, res, next) => {
    // Check if user is logged in AND is an admin
    if (req.user && req.user.role === 'admin') {
        return next(); // Let them pass
    }
    // If not, kick them out
    req.flash("error", "Access Denied: You do not have permission to view this page.");
    return res.redirect("/listings");
};