const {Novu} = require('@novu/node')

const sendNot = async (email , phoneNumber) => {
  const novu = new Novu("ae9ed958b615a9bebcb53a4e12b78795");
  try {
    await novu.trigger('account-activation',
  {
    to: {
      subscriberId: '656c5f92ba18eb70ecdc0ae1',
      phone:phoneNumber,
      email:email
      
      
    },
    payload:{
        "companyName": "Xpireminder",
        "confirmationLink": "<REPLACE_WITH_DATA>",
        "verificationLink": "<REPLACE_WITH_DATA>"
      }
  }
);
  }
    catch(err){
        console.log(err)
    }
}

module.exports = {sendNot}

