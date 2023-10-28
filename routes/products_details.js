const express = require('express');
const {
  products_details,
  getAllProducts,
  updateProductDetails,
  checkAndSendExpiryEmail,
  deleteProduct,
  
} = require('../controllers/products_details');

const router = express.Router();

router.post('/products/:userId', products_details);
router.get('/get_products/:userId', getAllProducts);
router.get('/exp_products/:userId', checkAndSendExpiryEmail);
router.patch('/update_product/:userId/:productId', updateProductDetails); 
router.get('/exp_product/:userId', checkAndSendExpiryEmail);
router.delete('/delete_product/:userId/:productId', deleteProduct); 

module.exports = router;
