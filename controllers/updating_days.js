
const admin = require('firebase-admin');
const {sendExpiryEmail} = require('./email')



const updateDaysRemainingForAllUsers = async (req ,res) => {
  const db = admin.firestore();
  const today = new Date();

  try {
    const usersSnapshot = await db.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
            const userdata = userDoc.data();
      const productsSnapshot = await userDoc.ref
        .collection('products_details')
        .get();

      const batch = db.batch();

      productsSnapshot.forEach((doc) => {
        const productData = doc.data();
        
          const daysRemaining = Math.ceil(
            (new Date(productData.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          batch.update(doc.ref, { days_remaining: daysRemaining });
        
      });

      await batch.commit();
      
      const expiringProducts = [];
      
      const getProducts = await db
  .collection('users')
  .doc(userId)
  .collection('products_details')
  .where('days_remaining', '<', 30)
  .get();

  await    getProducts.forEach((doc) => {
        const productData = doc.data();
        expiringProducts.push(productData)
      });

      if (expiringProducts.length > 0) {
     
        const userEmail = userdata.email; 
        name = userdata.firstname
        sendExpiryEmail(userEmail, expiringProducts, name);
        
        console.log(userdata.email , "sent")
      }else{
        console.log("no product" , userdata.email)
      }
    }
  } catch (error) {
    console.error('Error updating days_remaining for all users:', error);
  }finally{
    res.send("Done For Today ")
  }
};


module.exports ={
  updateDaysRemainingForAllUsers
}

