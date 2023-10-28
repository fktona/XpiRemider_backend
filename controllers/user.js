const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

const { signInWithEmailAndPassword , onAuthStateChanged, sendPasswordResetEmail, generatePasswordResetLink } = require("firebase/auth"); 
const { getAuth, signOut } = require("firebase/auth");
const firebase = require('firebase/app');
const {sendEmail} = require('./email')



  const register = async (req, res) => {
  const { firstname, lastname, password, email ,shop_name } = req.body;

  try {
    
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    
    if (!email.match(emailRegex)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName:firstname
    });

    console.log('Successfully created new user:', userRecord);
    
    const  emailVerificationLink = await admin.auth().generateEmailVerificationLink(email)
console.log(emailVerificationLink)
    const userData = {
      id: userRecord.uid,
      firstname,
      lastname,
      email,
      shop_name,
     
    };

    delete userData.password;
    
  

    const db = admin.firestore()
    const userDetailsRef = db.collection('users')

    await userDetailsRef.add(userData);
    
    sendEmail(email , emailVerificationLink , firstname)
    
    
    res.status(201).json({ message: 'User created successfully' , data: userRecord});
    console.log(userRecord);
  } catch (error) {
    console.error('Error creating new user:', error);

    if (error.code === 'auth/email-already-exists') {
      res.status(400).json({ message: 'Email already exists', error: error.message });
    } else {
      res.status(400).json({ message: 'Could not create user', error: error.message });
    }
  }
};







const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    
    if (!email.match(emailRegex)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    
    const userRecord = await admin.auth().getUserByEmail(email);
    
    if(!userRecord?.emailVerified){
      
      res.status(500).json({ message: 'email not verified verification link sent to mail ' ,data: userRecord})
      const  emailVerificationLink = await admin.auth().generateEmailVerificationLink(email)
      
      sendEmail(email , emailVerificationLink , email)
      return
        }
        
        
    await signInWithEmailAndPassword(getAuth(), email, password)
    
    

    res.status(200).json({ message: 'Login successful', data: userRecord});
  } catch (error) {
    console.error('Error during login:', error);

    if (error.code === 'auth/user-not-found') {
      res.status(401).json({ message: 'User Not Found ' });
    } else if (error.code === 'auth/wrong-password') {
      res.status(401).json({ message: 'Wrong password' });
    } else {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
};

const logout = (req, res) => {
  const auth = getAuth();
  console.log(auth?.currentUser)
 const {userId} = req.params
  signOut(auth)
    .then(() => {
      res.status(200).json({ message: 'User signed out successfully' });
      
    })
    .catch(error => {
      console.error('Error during sign out:', error);
      res.status(500).json({ message: 'Error signing out', error: error.message });
    });
};
const reset_password = async (req, res) => {
  const { email } = req.body;

  try {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

    if (!email.match(emailRegex)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
       const resetLink = await sendPasswordResetEmail(getAuth() , email);
//sendEmail(email, resetLink, email);
   

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Error sending password reset email:', error);

    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ message: 'User Not Found' });
    } else {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
};


module.exports = {
  register,
  login,
  logout,
  reset_password,
};
