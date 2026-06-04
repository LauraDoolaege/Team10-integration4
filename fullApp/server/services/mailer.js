const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const os = require("os");
const networkInterfaces = os.networkInterfaces();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendTripDetails = async (to, trip = { cafe: "test café", finalDate: "tommorow" }) => {
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


const sendTripCoupon = async (to, couponId, cafe, finalDate) => {
    // 1. Get the unique URL pointing to the user's coupon page on the frontend
    const url = getFrontendUrl(couponId);

    // 2. Generate a binary PNG image Buffer of the QR code instead of a base64 string.
    // Most email clients (like Gmail) block base64 image tags, but support binary image attachments.
    const qrBuffer = await QRCode.toBuffer(url);

    // 3. Send the email with the QR code embedded directly inside it
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Congratulations, you had the highest score of your friendgroup!",
        html: `
            <h2>You won a free drink!</h2>

            <p><strong>Café:</strong> ${cafe}</p>
            <p><strong>Date:</strong> ${finalDate}</p>

            <p>Show this QR code at the bar to claim your drink:</p>

            <!-- 4. Reference the attachment below using 'cid:qrcode' -->
            <img src="cid:qrcode" alt="QR Code" />

            <p>
                Or open directly:
                <a href="${url}">${url}</a>
            </p>
        `,
        // 5. Attach the binary QR code to the email, assigning it a 'cid' (Content ID)
        // matching the 'src="cid:qrcode"' in the HTML image tag above.
        attachments: [
            {
                filename: "qrcode.png",
                content: qrBuffer,
                cid: "qrcode" // Content ID
            }
        ]
    });
};

const getFrontendUrl = (couponId) => {
    if (process.env.PHASE === "development") {
        for (const interfaceName in networkInterfaces) {
            for (const iface of networkInterfaces[interfaceName] || []) {
                if (iface.family === "IPv4" && !iface.internal) {
                    return `https://${iface.address}:${process.env.PORT}/coupon/${couponId}`;
                }
            }
        }
    }

    return `${process.env.FRONTEND_URL}/coupon/${couponId}`;
};

module.exports = { sendTripDetails, sendTripCoupon }; 