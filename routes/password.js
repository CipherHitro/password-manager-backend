const express = require('express')
const { handleAddPassword , handleDeletePassword, handleGetAllPasswords} = require('../controller/password')

const router = express.Router();

router.get('/', handleGetAllPasswords)
router.post('/', handleAddPassword)
router.delete('/:id', handleDeletePassword)
module.exports = router