const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { setUser } = require("../services/auth");
const { generateOTP, generateSecureToken } = require("../utils/otpGenerator");
const PasswordResetToken = require("../models/passwordResetToken");
const { sendOTPEmail, testEmailConnection } = require("../utils/emailService");
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
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  const authUser = bcrypt.compareSync(password, user.password);
  if (!authUser) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }
  const token = setUser(user);

  // res.cookie('uid', token)
  res.cookie("uid", token, {
    httpOnly: false,
    secure: true,
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Also send token in response for frontend use
   return res.status(200).json({
    success: true,
    token: token, // Frontend can use this if needed
  });
}

async function handleForgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message:
          "If this email is registered, you will receive an OTP shortly.",
      });
    }
    const existingToken = await PasswordResetToken.findOne({
      email,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (existingToken) {
      return res.status(400).json({
        message:
          "Password reset already requested. Please check your email or wait before requesting again.",
      });
    }

    const otp = generateOTP();

    const salt = bcrypt.genSaltSync(10);
    const otpHash = bcrypt.hashSync(otp, salt);
    // const test = await testEmailConnection();
    // console.log(test)
    const isEmailSent = await sendOTPEmail(email, otp);
    console.log(isEmailSent);

    const result = await PasswordResetToken.create({
      email: email.toLowerCase(),
      otpHash: otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    });

    return res.status(200).json({
      message: "OTP sent to your email address. Please check your inbox.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
}
async function handleVerifyOTP(req, res) {
  try {
    const { otpCode, email } = req.body;
    // console.log(req.body);
    const resetToken = await PasswordResetToken.findOne({ email });
    if (!resetToken) {
      return res
        .status(400)
        .json({ message: "No password reset request found" });
    }
    // console.log(resetToken)
    // Check if expired
    if (resetToken.isExpired()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // Check max attempts
    if (resetToken.maxAttemptsReached()) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id });
      return res.status(400).json({
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    const isValid = bcrypt.compareSync(otpCode, resetToken.otpHash);

    if (!isValid) {
      await resetToken.incrementAttempts();
      return res.status(400).json({
        message: `Invalid OTP. ${
          resetToken.max_attempts - resetToken.attempts
        } attempts remaining.`,
      });
    }

    const secureResetToken = generateSecureToken();

    // Update the document

    resetToken.isVerified = true;
    resetToken.resetToken = secureResetToken;
    resetToken.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Extend to 30 minutes for password reset

    await resetToken.save();
    return res.status(200).json({
      message: "OTP verified successfully",
      resetToken: secureResetToken,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
  // return res.status(200);
}
async function handleResetPassword(req, res) {
  // console.log(req.body)
  try {
    const { resetToken, password, email } = req.body;
    if (!resetToken) {
      return res.status(400).json({ message: "Reset token is required" });
    }
    const resetTokenDoc = await PasswordResetToken.findOne({
      resetToken,
      isVerified: true,
      isUsed: false,
    });
    if (!resetTokenDoc) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }
    if (resetTokenDoc.isExpired()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }
    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync(password, salt);

    const user = await User.findOneAndUpdate({ email }, { password: passHash });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    resetTokenDoc.isUsed = true;
    await resetTokenDoc.save();

    await PasswordResetToken.deleteMany({
      email: resetTokenDoc.email,
    });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}
module.exports = {
  handleSignup,
  handleLogin,
  handleForgotPassword,
  handleVerifyOTP,
  handleResetPassword,
};
