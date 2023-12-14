const admin = require('firebase-admin');
const uuid = require('uuid');
const {sendExpiryEmail} = require('./email')


const validateDates = (productionDate, expiryDate) => {
  const currentTimestamp = new Date().getTime();
  const productionTimestamp = new Date(productionDate).getTime();
  const expiryTimestamp = new Date(expiryDate).getTime();
  return productionTimestamp < expiryTimestamp && productionTimestamp <= currentTimestamp;
};


const products_details = async (req, res) => {
  const { userId } = req.params;
  const { product_name, expiry_date, batch_number, quantity, production_date, price } = req.body;

  // if (
  //   !product_name ||
  //   !expiry_date ||
  //   !batch_number ||
  //   !quantity ||
  //   !production_date ||
  //   !price
  // ) {
  //   return res.status(400).json({ error: "One or more fields are empty." });
  // }
  
  if (!validateDates(production_date, expiry_date)) {
  return res.status(400).json({ error: "Production date must be earlier than the expiry date and not greater than the current date." });
}
const admin = require('firebase-admin');
const Timestamp = admin.firestore.Timestamp;


const firestoreTimestamp = Timestamp.now(); 
const date = firestoreTimestamp.toDate();
const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
const days_remaining =  new Date(expiry_date).getTime() - new Date().getTime() 
const daysRemaining = Math.ceil(days_remaining / (1000 * 60 * 60 * 24));

  const product_data = {
    product_name,
    expiry_date,
    batch_number,
    quantity,
    production_date,
    price,
    days_remaining: daysRemaining,
    created_at: formattedDate 
  };

  const db = admin.firestore();

  try {
  const addedProducts =  await db.collection('users').doc(userId).collection('products_details').add(product_data);
    
   const ProductSnapshot = await addedProducts.get();
   const id = ProductSnapshot.id
  const productInfo = ProductSnapshot.data()
 let newProductData = []

 newProductData.push({id , ...productInfo})
    res.status(201).json({ message: 'Product details added successfully' ,
    data: newProductData});
  } catch (error) {
    console.error('Error adding product details:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const getAllProducts = async (req ,res) => {
  const { userId } = req.params;
  const db = admin.firestore();
  const allProducts =[]
  try {
  const getProducts = await db
      .collection('users')
      .doc(userId)
      .collection('products_details')
      .orderBy('created_at', 'desc')
      .get();

      
const Timestamp = admin.firestore.Timestamp;
  
      
  getProducts.forEach((doc) => {
      const id = doc.id;
      const productData = doc.data();
      const firestoreTimestamp = Timestamp.now(); 
      const date = firestoreTimestamp.toDate();
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const days_remaining =  new Date(productData.expiry_date).getTime() - new Date().getTime() 
      const daysRemaining = Math.ceil(days_remaining / (1000 * 60 * 60 * 24));
      
const updatedProductDataWithDaysRemaining = {...productData , days_remaining: daysRemaining}

   let status = ''
    if (productData.days_remaining < 1 ){

      status = 'expired'
    }else{
        status = 'active'
    }
      allProducts.push({  id , status, ...productData });
    });
  
  
    res.status(201).json({ message: 'Product retrieved successfully', 
     products : allProducts
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
  
}



const updateProductDetails = async (req, res) => {
  const { userId , productId } = req.params;
  const updateData = req.body;

  if (!updateData) {
    return res.status(400).json({ error: "Update data is missing.", data: updateData});
  }
  const { production_date, expiry_date } = updateData;
  if (!validateDates(production_date, expiry_date)) {
  return res.status(400).json({ error: "Production date must be earlier than the expiry date and not greater than the current date." , data: updateData });
}

  const db = admin.firestore();
  const Timestamp = admin.firestore.Timestamp;

  try {
    const productRef = db.collection('users').doc(userId).collection('products_details').doc(productId);

    const firestoreTimestamp = Timestamp.now(); 
const date = firestoreTimestamp.toDate();
const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
const days_remaining =  new Date(expiry_date).getTime() - new Date().getTime() 
const daysRemaining = Math.ceil(days_remaining / (1000 * 60 * 60 * 24));




 const updatedProductSnapshot = await productRef.get()

 const updatedProductData = updatedProductSnapshot.data();
 const updatedProductDataWithDaysRemaining = {...updateData , id:updatedProductSnapshot.id, days_remaining: daysRemaining , edited_at: formattedDate}
  await productRef.update(updatedProductDataWithDaysRemaining);
   return res.status(200).json({ message: 'Product details updated successfully' ,
    updateProduct: updatedProductDataWithDaysRemaining
    });
    
    
  } catch (error) {
    console.error('Error updating product details:', error);
   return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const deleteProduct = async (req, res) => {
  const { userId , productId } = req.params;
  const db = admin.firestore();

  try {
    const productRef = db.collection('users').doc(userId).collection('products_details').doc(productId);

    await productRef.delete();

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
   return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const checkAndSendExpiryEmail = async (req ,res) => {
  const { userId } = req.params;
  const db = admin.firestore();
  const today = new Date();
  const expiryThreshold = new Date();
  expiryThreshold.setDate(today.getDate() + 30);

  try {

      const expiringProducts = [];
      
      const getProducts = await db
  .collection('users')
  .doc(userId)
  .collection('products_details')
  .where('days_remaining', '<', 30)
  .get();


  await    getProducts.forEach((doc) => {
        const productData = doc.data();
        const productId = doc.id;
        expiringProducts.push({productId: productId, productData})
      });

      if (expiringProducts.length > 0) {
        
        res.status(200).json({message: "products about to expire fetched successfully " , data:expiringProducts})
      }else{
       res.status(200).json({message: "products about to expire fetched successfully no product found" , data:expiringProducts})
        console.log("no product ")
      }
    
  } catch (error) {
    console.error('Error checking and sending expiry emails:', error);
  }
};


module.exports = {
  products_details,
  getAllProducts,
  updateProductDetails,
  checkAndSendExpiryEmail,
  deleteProduct,
};


