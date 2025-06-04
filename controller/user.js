const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { setUser } = require("../services/auth");

async function handleSignup(req, res) {
  const { fullName, email, password } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const passHash = bcrypt.hashSync(password, salt);

  const user = await User.create({
    fullName,
    email,
    password: passHash,
  });

  if (user) {
    return res.status(200).json({ message: "User created ", user });
  }
}
async function handleLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User doesn't exists" });
  }

  const authUser = bcrypt.compareSync(password, user.password);
  if (!authUser) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }
  const token = setUser(user);

  res.cookie("uid", token, {
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({ message: "Logged in successfully", token });
}

module.exports = {
  handleSignup,
  handleLogin,
};
