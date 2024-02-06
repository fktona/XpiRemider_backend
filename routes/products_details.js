const express = require('express');
const {
  products_details,
  getAllProducts,
  updateProductDetails,
  checkAndSendExpiryEmail,
  deleteProduct,
  
} = require('../controllers/products_details');

const {sendExpiryMsg}= require('../controllers/sendNotice')
const {updateDaysRemainingForAllUsers} =require('../controllers/updating_days')


const router = express.Router();

router.post('/product/:userId', products_details);
router.get('/get_products/:userId', getAllProducts);
router.get('/exp_products/:userId', checkAndSendExpiryEmail);
router.patch('/update_product/:userId/:productId', updateProductDetails); 
router.get('/exp_product/:userId', checkAndSendExpiryEmail);
router.get('/weekly_msg', updateDaysRemainingForAllUsers);
router.post('/send_exp/:userId', sendExpiryMsg);
router.delete('/delete_product/:userId/:productId', deleteProduct); 

module.exports = router;
