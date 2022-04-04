const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser");

const JWT_SECERT = "ooomaintoh$$#dargayi";

// Creating a user using post request : at the endpoint of /api/auth
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 4 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors, return bad request and throw the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      // Check whether the user with the email already exits
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "sorry user with this email already exits" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      // Create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECERT);
      success = true
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }
);

// Authenticating user using email and password. No login required
router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "password can not be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors return bad request and the error.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "please try to login with currect credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECERT);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }
);

// Fetching user from the database and login required
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
})

module.exports = router;
