const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendTripEmail = async (to, trip={cafe:"test café", finalDate:"tommorow"}) => {
    const { cafe, finalDate } = trip;
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Trip confirmed!",
        text: `
Café: ${trip.cafe}

Winning date: ${trip.finalDate}

See you there!
`
    });
};

module.exports = { sendTripEmail };