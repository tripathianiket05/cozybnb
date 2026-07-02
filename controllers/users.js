const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password, role } = req.body;
        
        // SECURITY CHECK: Prevent users from hacking the form to become admins.
        // If they didn't specifically check "owner", default them to "user".
        if (role !== 'owner') {
            role = 'user';
        }

        const newUser = new User({ email, username, role });
        const registeredUser = await User.register(newUser, password);
        
        // Auto-login the user right after they sign up
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            
            req.flash("success", "Welcome to CozyBnB!");
            
            // Redirect based on the role they just picked!
            if (req.user.role === 'owner') {
                res.redirect("/listings/new"); // Send owners straight to create a listing
            } else {
                res.redirect("/listings");     // Send travelers to explore
            }
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to CozyBnB !");
    
    // Check if they were trying to access a specific page before being forced to log in
    let redirectUrl = res.locals.redirectUrl; 

    // If they just clicked "Log In" normally, route them based on their role
    if (!redirectUrl) {
        if (req.user.role === 'admin') {
            redirectUrl = "/admin/dashboard"; // (If you build this later)
        } else if (req.user.role === 'owner') {
            redirectUrl = "/listings"; // Owners can go to explore, but they will see their special navbar buttons
        } else {
            redirectUrl = "/listings";
        }
    }
    
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};