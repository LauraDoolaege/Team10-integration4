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

// const sendTripDetails = async (to, trip = { cafe: "test café", finalDate: "tommorow", players=[]}) => {
//     const { cafe, finalDate } = trip;

//     await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to,
//         subject: "Trip confirmed!",
//         html: `
//         <h2> Café: ${trip.cafe} <h2>
        

// Winning date: ${trip.finalDate}

// See you there!
// `
//     });
// };

const sendTripDetails = async (
    to,
    trip = {
        cafe: "test café",
        finalDate: "tomorrow",
        players: [],
    }
) => {
    const { cafe, finalDate, players } = trip;

    const attachments = players.map((player, index) => {
        // convert Base64 → Buffer (same idea as QR code)
        const base64Data = player.image.replace(/^data:image\/png;base64,/, "");//remove base64 prefix
        const buffer = Buffer.from(base64Data, "base64");//convert to binary -> better form email services img tags did not seem to work

        return {
            filename: `player-${index}.png`,
            content: buffer,
            cid: `player${index}`, // unique CID per player (to reference in the html below)
        };
    });

    const playersHtml = players
        .map(
            (player, index) => `
        <div style="display:inline-block; text-align:center; margin:10px;">
          <img
            src="cid:player${index}" 
            width="50"
            height="50"
            style="
              border-radius:50%;
              object-fit:cover;
              display:block;
              border:4px solid #FFF;
            "
          />
          <p style="font-size:12px; margin-top:5px;">
            ${player.username}
          </p>
        </div>
      `
        )
        .join(""); //merges all prevent array seperation with ","

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Trip confirmed!",
        html: `
      <h2>Café: ${cafe}</h2>

      <p><strong>Winning date:</strong> ${finalDate}</p>

      <hr />

      <h3>Players</h3>

      <div style="text-align:center;">
        ${playersHtml}
      </div>
    `,
        attachments,
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