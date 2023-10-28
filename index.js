const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const uuid = require('uuid');
const serviceAccount = require('./secret.json');
const auth = require('./routes/user');
const products = require('./routes/products_details');
const cron = require('node-cron');
const {updateDaysRemainingForAllUsers }= require('./controllers/updating_days')

const { initializeApp, getAnalytics } = require("firebase/app");

const app = express();
app.use(express.json());
app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  
});


const firebaseConfig = {
  apiKey: "AIzaSyC_R8HQ2bdZLPuEwPoFOr4OhPqa5J41N2A",
  projectId: "xpiremider",
  storageBucket: "xpiremider.appspot.com",
  messagingSenderId: "1029428861293",
  appId: "1:1029428861293:web:ae12c813e70aadaf2b6264",
  measurementId: "G-K587K23W0V",
};


const firebaseApp = initializeApp(firebaseConfig);


app.use('/api/auth', auth);
app.use('/api', products);

cron.schedule('0 0 * * *', updateDaysRemainingForAllUsers);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
