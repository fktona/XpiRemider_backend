const admin = require('firebase-admin');
const { sendExpiryEmail } = require('./email');
const { sendSms } = require('./sms');


const updateDaysRemainingForAllUsers = async (req , res) => {
  const db = admin.firestore();
  const today = new Date();
  
  try {
    const usersSnapshot = await db.collection('users').get();

    const updatePromises = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      const productsSnapshot = await userDoc.ref
        .collection('products_details')
        .get();

      const batch = db.batch();

      productsSnapshot.forEach((doc) => {
        const productData = doc.data();
        const expiryDate = new Date(productData.expiry_date);
        const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        batch.update(doc.ref, { days_remaining: daysRemaining });
      });

      updatePromises.push(batch.commit());

      const expiringProducts = [];

      const expiringProductsQuery = await db
        .collection('users')
        .doc(userId)
        .collection('products_details')
        .where('days_remaining', '<', 30)
        .get();

      expiringProductsQuery.forEach((doc) => {
        expiringProducts.push(doc.data());
      });

      if (expiringProducts.length > 0) {
        const userEmail = userData.email;
        const userName = userData.firstname;
        const phone = userData.phone_number;

        
        await sendExpiryEmail(userEmail, expiringProducts, userName);
             await sendSms(userId,userName, phone, expiringProducts )

        console.log("message sent")
      
      }
    }

    await Promise.all(updatePromises);
    return res.status(201).json({message: "message sent "})
          
  } catch (error) {
    console.error('Error updating days_remaining for all users:', error);
  }
};

module.exports = {
  updateDaysRemainingForAllUsers
};
