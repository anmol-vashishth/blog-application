const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const secretkey = "c56rd65s6g%789j&*";

const route = Router();
const saltRounds = 10;

route.post("/signup", async (req, res) => {
  try {
    const { name, email, password, designation } = req.body;

    // Check for missing fields
    if (!name || !email || !password)
      return res.json({ message: "All fields required" }).status(400);

    // Check already existing user with email
    const userExist = await User.findOne({ email: email });
    if (userExist)
      return res.json({ message: "user already exists" }).status(409);

    const salt = bcrypt.genSaltSync(saltRounds);
    console.log(salt);
    const hash = bcrypt.hashSync(password, salt);
    console.log(hash);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hash,
      designation,
    });
    return res
      .json({ message: "User created successfully", data: user })
      .status(201);
  } catch (error) {
    return res.json({ message: "Failed to create user" }).status(500);
  }
});

route.post("/signin", async (req, res) => {
  try {
    //Get user from DB by email
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({ message: "Enter valid email/password" }).status(401);
    const user = await User.findOne({ email });

    if (!user)
      return res.json({ message: "Enter valid email/password" }).status(401);

    //Compare passwords
    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword)
      return res.json({ message: "Enter valid email/password" }).status(401);

    //Generate JWT
    const payload = {
      sub: user._id,
      email: user.email,
    };
    const token = JWT.sign(payload, secretkey);

    return res.json({ data: user, token: token });
  } catch (error) {
    return res.json({ message: "Something went wrong" }).status(500);
  }
});

module.exports = route;
