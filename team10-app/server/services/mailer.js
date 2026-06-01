import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendTripEmail = async (to, trip = { cafe: 'test café', finalDate: 'tomorrow' }) => {
  const { cafe, finalDate } = trip;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Trip confirmed!',
    text: `
Café: ${cafe}

Winning date: ${finalDate}

See you there!
`
  });
};
