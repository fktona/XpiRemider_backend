const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'faithadetona@gmail.com',
    pass:  'rrktmuexsbtebmxc',
  },
});
 const sendEmail = async ( email ,  emailVerificationLink ,name) => {
   try{
     
   
   let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'xpiRemider',
        link: 'https://mailgen.js/'
        // Optional product logo
        // logo: 'https://mailgen.js/img/logo.png'
    }
});
    let msg = {
    body: {
        name: name,
        intro: 'Thanks For Signing Up ',
        
        action: {
            instructions: 'Click on the button to verify your mail',
            button: {
                color: '#22BC66', 
                text: 'Verify Your Mail',
                link: emailVerificationLink,
            }
        },
        text: `<p>or click this link ${emailVerificationLink}</p>`,
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
};

let emailBody = mailGenerator.generate(msg);

//console.log('Email Preview:', emailBody);

let mailOptions = {
      from: 'faithadetona@gmail.com',
      to: email,
      subject: 'Email Verification',
      html: emailBody,
    };
  await  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info);
      }
    });
    
   }
   catch(err) {
     console.log(err)
   }
 }
const sendExpiryEmail = async (email, products) => {
  try {
    let mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'xpiRemider',
        link: 'https://mailgen.js/',
      }
    });

    let productsTable = products.map(product => ({
      product_name: product.product_name,
      expiry_date: product.expiry_date,
      Qty: product.quantity,
      days_remaining:  product.days_remaining
    }));

    let msg = {
      body: {
        intro: 'Products with Expiry in Less Than 30 Days:',
        table: {
          data: productsTable,
          columns: {
            // Define table columns
            customWidth: {
              product_name: '35%',
              expiry_date: '40%',
              Qty:'13%',
              days_remaining: '12%',
            },
            
            customHeaders: [
              { name: 'Product Name', align: 'left', key: 'product_name' },
              { name: 'Expiry Date', align: 'left', key: 'expiry_date' },
              { name: 'Time Left', align: 'left', key: 'days_remaining' },
              
            ],
          },
          customStyling: {
        tableBorder: {
          horizontal: true,  
          vertical: true,  
        },
        headerText: {
          bold: true,      
        },
        cellText: {
          padding: '5px',    
        },
      },
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
      }
    }

    let emailBody = mailGenerator.generate(msg);

    let mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Products Expiry Reminder',
      html: emailBody,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  sendEmail,
  sendExpiryEmail,
};
