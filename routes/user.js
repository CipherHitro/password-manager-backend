const express = require('express')
const router = express.Router() ;
const { handleSignup, handleLogin } = require('../controller/user')

router.post('/signup', handleSignup);
router.post('/login', handleLogin);

module.exports = router;
