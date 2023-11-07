const express= require('express')
const router = express.Router()
const {
  register,
  login,
  logout,
  reset_password,
  verifyToken
} = require('../controllers/user')

router.post('/signup' , register)
router.post('/login' , login)
router.post('/logout/' , logout)
router.post('/reset_password' , reset_password)
router.get('/verify_token' , verifyToken)

module.exports = router
