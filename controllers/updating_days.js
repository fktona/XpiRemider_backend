
const admin = require('firebase-admin');
const {sendExpiryEmail} = require('./email')
const {sendInApp} = require('./novoInapp')
const {sendSms} = require('./sms')



const updateDaysRemainingForAllUsers = async (user_id) => {
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

      //console.log(expiringProducts)

      if (expiringProducts.length > 0) {
     
        const userEmail = userdata.email; 
        const  UserName = userdata.firstname
        const phone = userdata.phone_number

        
        const mondayFlagDocRef = db.collection('notification').doc('mondayEmailSent');
        const mondayFlagSnapshot = await mondayFlagDocRef.get();

        
         
        

         if (!mondayFlagSnapshot.exists) {
          await sendExpiryEmail(userEmail, expiringProducts, UserName);
        //  await sendSms(userId,UserName, phone, expiringProducts )
          console.log("sending emailing.....")
          await mondayFlagDocRef.set({ sent: true });
         } else{
          console.log(" monday email already  sent ")
         }
           
         
        
        
        
        if (userId == user_id) {
          const sendInAppFlagDocRef = db.collection('notification').doc(userId);
          const sendInAppFlagSnapshot = await sendInAppFlagDocRef.get();
        
          if (!sendInAppFlagSnapshot.exists) {
            await sendInApp(userId, expiringProducts);
            await sendInAppFlagDocRef.set({ called: true });
          }
        } else {
          console.log('not');
        }
        
        // ...
        
        if (today.getHours() == 23 && today.getMinutes() == 59) {
          const sendInAppFlagDocRef = db.collection('notification').doc(userId);
          const sendInAppFlagSnapshot = await sendInAppFlagDocRef.get();
        
          if (sendInAppFlagSnapshot.exists) {
            sendInAppFlagDocRef.delete();
          }
        }
      
             }
              else{
        console.log("no product" , userdata.email)
      }
    }
  } catch (error) {
    console.error('Error updating days_remaining for all users:', error);
  }finally{
  return
  }
};


module.exports ={
  updateDaysRemainingForAllUsers
}

