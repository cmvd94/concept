const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: 'rzp_test_ExTurXclRa0aRF',
    key_secret: 'ZTY5lNvZaZyLx9ERwpcgFV0X'
});

async function createPaymentLink() {
    const options = {
        "amount": 10000, // Amount in paise (100 INR)
        "currency": "INR",
        "receipt": "receipt_order_1728725613042",
        "payment_capture": 1,
        "notes": {
            "userId": "6703cd6e9a14225899319415",
            "grade": "67065f85d34f005535d6e9e6",
            "semester": "Semester 1"
        }
    };

    try {
        const order = await instance.orders.create(options);
        console.log('------order-----',order.id)
        console.log(order); // Order details including order ID
        
        // Create a payment link
        const paymentLinkOptions = {
            amount: options.amount,
            currency: options.currency,
            accept_partial: false,
            reference_id: order.id,
            description: "Payment for Course Purchase",
            customer: {
                name: "vishnudas",
                email: "cmvd94@gmail.com",
                contact: "9791253796"
            },
            notify: {
                sms: true,
                email: true
            },
            callback_url: "https://localhost:8000/payment/callback", // URL to handle Razorpay's callback after payment
            callback_method: "get"
        };

        const paymentLink = await instance.paymentLink.create(paymentLinkOptions);
        console.log('......payment link......')
        console.log(paymentLink);
        return paymentLink;
    } catch (error) {
        console.error("Error creating payment link:", error);
    }
}

createPaymentLink();
