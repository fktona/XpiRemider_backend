const {Novu} = require('@novu/node')

const sendSms = async (user , UserName , phone, expiringProducts) => {

    
    const novu = new Novu("fb4a450decae0545729dd0df0178d519");
    try {
        await novu.trigger('untitled',
    {
        to: {
        subscriberId: user,
        phone: phone
        },
        payload: {
           message:`Hello, ${ UserName ? UserName.charAt(0).toUpperCase() + UserName.slice(1).toLowerCase() : 'Dear'} 
This message is from XpiReminder You have ${expiringProducts.filter((o) => o.days_remaining > 0)?.length} products about to expire and ${expiringProducts.filter((o) => o.days_remaining < 0)?.length} expired products check your account for more details 
 www.xpiremider.com `
          }
    }
    );
    console.log("sms sent"  )
    }
        catch(err){
            console.log("sms", err)
        }
    }




module.exports = {sendSms}

