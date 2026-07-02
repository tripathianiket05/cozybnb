const Listing = require("../models/listing");
const User = require("../models/user");
const Review = require("../models/review");

// Load Dashboard Data
module.exports.renderDashboard = async (req, res) => {
    // 1. Get database statistics
    const totalListings = await Listing.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();

    // 2. Fetch the latest listings and users to display in tables
    const recentListings = await Listing.find({}).populate("owner").sort({_id: -1}).limit(10);
    const allUsers = await User.find({}).sort({_id: -1});

    res.render("admin/dashboard.ejs", {
        totalListings, 
        totalUsers, 
        totalReviews, 
        recentListings, 
        allUsers
    });
};

// Admin Power: Delete ANY Listing
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Admin Action: Listing permanently deleted.");
    res.redirect("/admin/dashboard");
};

// Admin Power: Delete ANY User
module.exports.deleteUser = async (req, res) => {
    let { id } = req.params;
    
    // Safety check: Prevent the admin from accidentally deleting themselves!
    if (req.user._id.equals(id)) {
        req.flash("error", "You cannot delete your own admin account!");
        return res.redirect("/admin/dashboard");
    }
    
    await User.findByIdAndDelete(id);
    req.flash("success", "Admin Action: User removed from platform.");
    res.redirect("/admin/dashboard");
};