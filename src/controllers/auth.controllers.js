import User from "../models/User.js";
import passport from "passport";

// Render the sign-up form
export const renderSignUpForm = (req, res) => res.render("auth/signup");

// Handle sign-up logic
export const signup = async (req, res) => {
  let errors = [];
  const { name, email, password, confirm_password } = req.body;

  // Check if passwords match
  if (password !== confirm_password) {
    errors.push({ text: "Passwords do not match." });
  }

  // Check if password length is valid
  if (password.length < 4) {
    errors.push({ text: "Passwords must be at least 4 characters." });
  }

  // If there are errors, render the signup form again with error messages
  if (errors.length > 0) {
    return res.render("auth/signup", {
      errors,
      name,
      email,
      password,
      confirm_password,
    });
  }

  try {
    // Look for email coincidence in the database
    const userFound = await User.findOne({ email: email });
    if (userFound) {
      req.flash("error_msg", "The Email is already in use.");
      return res.redirect("/auth/signup");
    }

    // Create a new user and hash the password
    const newUser = new User({ name, email, password });
    newUser.password = await newUser.encryptPassword(password);
    
    // Save the new user in the database
    await newUser.save();
    req.flash("success_msg", "You are registered.");
    res.redirect("/auth/signin");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "There was an error registering your account.");
    res.redirect("/auth/signup");
  }
};

// Render the sign-in form
export const renderSigninForm = (req, res) => res.render("auth/signin");

// Handle sign-in logic using Passport.js
export const signin = passport.authenticate("local", {
  successRedirect: "/notes",
  failureRedirect: "/auth/signin",
  failureFlash: true,
});

// Handle log out logic
export const logout = async (req, res, next) => {
  try {
    await req.logout((err) => {
      if (err) return next(err);
      req.flash("success_msg", "You are logged out now.");
      res.redirect("/auth/signin");
    });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "There was an error logging out.");
    res.redirect("/auth/signin");
  }
};
