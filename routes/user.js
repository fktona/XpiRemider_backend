const express= require('express')
const router = express.Router()
const {
  register,
  login,
  logout,
  reset_password
} = require('../controllers/user')

router.post('/signup' , register)
router.post('/login' , login)
router.post('/logout/' , logout)
router.post('/reset_password' , reset_password)

module.exports = router