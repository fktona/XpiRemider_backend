const admin = require('firebase-admin');

const{updateDaysRemainingForAllUsers} = require('./updating_days')
const { signInWithEmailAndPassword , onAuthStateChanged, sendPasswordResetEmail, generatePasswordResetLink , signInWithCustomToken } = require("firebase/auth"); 
const { getAuth, signOut } = require("firebase/auth");
const firebase = require('firebase/app');
const {sendEmail} = require('./email')


  const register = async (req, res) => {
  const { firstname, lastname, password, email ,shop_name,phone_number } = req.body;

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
      displayName:firstname,
      phoneNumber:phone_number
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
      phone_number
     
    };

    
  const customToken = await admin.auth().createCustomToken(userRecord.uid);
       
       const user = {...userRecord , ...userData}

    const db = admin.firestore()
    const userDetailsRef = db.collection('users').doc(userRecord.uid)

    await userDetailsRef.set(userData);
    
    sendEmail(email , emailVerificationLink , firstname)
    
    
    res.status(201).json({ message: 'User created successfully' , token: customToken,  data: user });
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
    
    // if(!userRecord?.emailVerified){
      
    //   res.status(500).json({ message: 'email not verified verification link sent to mail ' ,data: userRecord})
    //   const  emailVerificationLink = await admin.auth().generateEmailVerificationLink(email)
      
    //   sendEmail(email , emailVerificationLink , email)
    //   return
    //     }
        
        
    await signInWithEmailAndPassword(getAuth(), email, password)

   
    
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    const db = admin.firestore();
    const userData = await db.collection('users').where("id", "==" , userRecord.uid ).get();
    
        const user = userData.docs[0].data();
        console.log(user);
const userInfo = {...userRecord ,...user}

    updateDaysRemainingForAllUsers(userRecord.uid)

    return res.status(200).json({ message: 'Login successful', token: customToken , data: userInfo});
  } catch (error) {
    console.error('Error during login:', error);

    if (error.code === 'auth/user-not-found') {
      return res.status(401).json({ message: 'User Not Found ' });
    } else if (error.code === 'auth/wrong-password') {
      res.status(401).json({ message: 'Wrong password' });
    } else {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
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
    const userRecord = await admin.auth().getUserByEmail(email);

    if(userRecord.lenth < 1){
      return res.status(401).json({ message: 'Email not Registered' });
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

const verifyToken = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
    
  }

  signInWithCustomToken(getAuth(),token).then((userCredential) => {
  
    userCredential.user.getIdToken().then((idToken) => {
      console.log(idToken)  
      
    });
    res.status(200).json({ message: 'Token is valid', data: userCredential });
  }).catch((error) => {
    res.status(401).json({ message: 'Token is invalid', error: error.message });
  })
}





module.exports = {
  register,
  login,
  logout,
  reset_password,
  verifyToken
};
