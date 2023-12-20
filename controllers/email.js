const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'xpireminder@gmail.com',
    pass:  'bcvwryerjvcvttse',
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
const sendExpiryEmail = async (email, products, Username) => {
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
      from: 'xpireminder@gmail.com',
      to: email,
      subject: 'Products Expiry Reminder',
      html:` <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XpireMinder Reminder</title>
        <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    header {
      background-color: #e95420;
      padding: 15px;
      text-align: center;
      color: #fff;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background-color: #e95420;
      color: #fff;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px auto;
    }

    footer {
      text-align: center;
      padding: 15px;
      background-color: #e95420;
      color: #fff;
    }
  </style>
      </head>
      <body>
        <div class="container">
        <header>
        <h1>Hello, ${ Username ? Username.charAt(0).toUpperCase() + Username.slice(1).toLowerCase() : 'Dear'},</h1>
        <p>Your XpireMinder Expiry Notifications</p>
      </header>
      
  
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Expiry Date</th>
                <th>Qty</th>
                <th>Days to Expiry</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(product => `
                <tr>
                  <td>${product.product_name}</td>
                  <td>${product.expiry_date}</td>
                  <td>${product.quantity}</td>
                  <td>${product.days_remaining < 1 ? "Expired":product.days_remaining }</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
  
          <img src="path/to/your/logo.png" alt="Company Logo">
  
          <footer>
            &copy; 2023 XpireMinder. All rights reserved.
          </footer>
        </div>
      </body>
      </html>
    `
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
