// utils/otpGenerator.js
const crypto = require('crypto');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = { generateOTP, generateSecureToken };