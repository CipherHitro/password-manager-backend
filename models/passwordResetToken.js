const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const passwordResetTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      maxLength: 255,
    },
    otpHash: {
      type: String,
      required: true,
      maxLength: 255,
    },
    resetToken: {
      type: String,
      default: null, // This will be set after OTP verification
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    max_attempts: {
      type: Number,
      default: 3,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for automatic document expiration
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster queries
passwordResetTokenSchema.index({ email: 1, isUsed: 1 });

// Hash OTP before saving
// passwordResetTokenSchema.pre('save', async function(next) {
//     if (this.isNew && this.otpHash && !this.otpHash.startsWith('$2b$')) {
//         this.otpHash = await bcrypt.hash(this.otpHash, 10);
//     }
//     next();
// });

// Method to verify OTP
passwordResetTokenSchema.methods.verifyOTP = async function (otp) {
  return await bcrypt.compare(otp.toString(), this.otpHash);
};

// Method to increment attempts
passwordResetTokenSchema.methods.incrementAttempts = async function () {
  this.attempts += 1;
  return await this.save();
};

// Method to check if token is expired
passwordResetTokenSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Method to check if max attempts reached
passwordResetTokenSchema.methods.maxAttemptsReached = function () {
  return this.attempts >= this.max_attempts;
};

const PasswordResetToken = mongoose.model(
  "PasswordResetToken",
  passwordResetTokenSchema
);
module.exports = PasswordResetToken;
