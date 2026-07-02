const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdmin } = require("../middleware.js");

// SECRET WEAPON: Apply the security middleware to EVERY route in this file at once!
router.use(isLoggedIn, isAdmin);

// Dashboard Route: GET /admin/dashboard
router.get("/dashboard", wrapAsync(adminController.renderDashboard));

// Delete Listing Route: DELETE /admin/listings/:id
router.delete("/listings/:id", wrapAsync(adminController.deleteListing));

// Delete User Route: DELETE /admin/users/:id
router.delete("/users/:id", wrapAsync(adminController.deleteUser));

module.exports = router;