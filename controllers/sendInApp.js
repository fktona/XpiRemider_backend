const admin = require('firebase-admin');
const { sendInApp } = require('./novoInapp');

const sendInAppMsg = async (userId) => {
  const db = admin.firestore();
  let expiringProducts = [];
  
  try {
    const getProducts = await db
      .collection('users')
      .doc(userId)
      .collection('products_details')
      .where('days_remaining', '<', 30)
      .get();

    getProducts.forEach((doc) => {
      const productData = doc.data();
      expiringProducts.push(productData);
    });

    if (expiringProducts.length > 0) {
      const sendInAppFlagDocRef = db.collection('notification').doc(userId);
      const sendInAppFlagSnapshot = await sendInAppFlagDocRef.get();
      const currentDate = new Date().toISOString().slice(0, 10);

      if (!sendInAppFlagSnapshot.exists || sendInAppFlagSnapshot.data().date !== currentDate) {
        await sendInApp(userId, expiringProducts);
        await sendInAppFlagDocRef.set({ called: true, date: currentDate });
      } else {
        console.log('In-app message already sent today for user:', userId);
      }
    } else {
      console.log('No expiring products for user:', userId);
    }
  } catch (err) {
    console.error("Can't send notifications:", err);
  }
};

module.exports = { sendInAppMsg };
