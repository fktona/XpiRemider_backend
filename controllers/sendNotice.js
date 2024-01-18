const admin = require('firebase-admin');
const { sendExpiryEmail } = require('./email');
const { sendSms } = require('./sms');

const sendExpiryMsg = async (req, res) => {
  const { userId } = req.params;
  const db = admin.firestore();
  let expiringProducts = [];

  const userDoc = await db.collection('users').doc(userId).get();
  const userdata = userDoc.data();

  const userEmail = userdata.email;
  const UserName = userdata.firstname;
  const phone = userdata.phone_number;

  try{

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
    await sendExpiryEmail(userEmail, expiringProducts, UserName);
    res.status(200).json({ message: 'Email sent successfully' });
 await sendSms(userId, UserName, phone, expiringProducts);
    console.log("sending emailing.....");
  }}
  catch(err){
    res.status(400).json({ message: err }); 
  }
};

module.exports = { sendExpiryMsg };