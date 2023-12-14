const {Novu} = require('@novu/node')

const sendInApp = async (user, products) => {

    products.map(async(product) => {
    const novu = new Novu("5f1e6fe959dc67d0185587253cb49d21");
    try {
        await novu.trigger('expiryproducts',
    {
        to: {
        subscriberId: user,
        },
        payload: {
            productName: product.product_name,
            daysRemaining:product.days_remaining
          }
    }
    );
    }
        catch(err){
            console.log(err)
        }
    })}




module.exports = {sendInApp}

