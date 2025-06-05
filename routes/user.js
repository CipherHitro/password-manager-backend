const express = require('express')
const router = express.Router() ;
const { handleSignup, handleLogin, handleForgotPassword, handleVerifyOTP, handleResetPassword } = require('../controller/user')

router.post('/signup', handleSignup);
router.post('/login', handleLogin);

router.post('/forgot-password', handleForgotPassword)
router.post('/verify-otp', handleVerifyOTP)
router.post('/reset-password', handleResetPassword)
module.exports = router;
