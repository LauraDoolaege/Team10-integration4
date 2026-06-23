const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const os = require("os");
const fs = require("fs");
const path = require("path");
const mjml = require("mjml");
const networkInterfaces = os.networkInterfaces();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper to escape XML special characters to prevent MJML parsing errors
const escapeXml = (unsafe) => {
    if (unsafe === undefined || unsafe === null) return "";
    return unsafe.toString().replace(/[<>&"']/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return c;
        }
    });
};

const getCid = (filename, assetMap) => {
    const sanitized = filename.toLowerCase();
    const cid = assetMap[sanitized];
    if (!cid) {
        const fallbackCid = sanitized.split('.')[0].replace(/[^a-z0-9]/g, "_");
        return `cid:${fallbackCid}`;
    }
    return `cid:${cid}`;
};

const getAssetAttachments = () => {
    const assetsDir = path.join(__dirname, "../assets");
    const attachments = [];
    const assetMap = {};

    if (fs.existsSync(assetsDir)) {
        const assetFiles = fs.readdirSync(assetsDir);
        assetFiles.forEach(file => {
            if (/\.(png|jpg|jpeg|svg)$/i.test(file)) {
                const ext = path.extname(file);
                const name = path.basename(file, ext).toLowerCase();
                const cid = name.replace(/[^a-z0-9]/g, "_");
                assetMap[file.toLowerCase()] = cid;
                attachments.push({
                    filename: file,
                    path: path.join(assetsDir, file),
                    cid: cid
                });
            }
        });
    }
    return { attachments, assetMap };
};

const sendTripDetails = async (to, tripData) => {
    try {
        console.log(`[MAILER] Starting sendTripDetails for ${to}`);
        const { cafe = {}, finalDate = "", players = [], budget = "", mood = "", expected_players = 0 } = tripData;

        // 1. Prepare assets and player images as attachments
        const { attachments: assetAttachments, assetMap } = getAssetAttachments();

        // Only attach player custom images if they exist
        console.log(`[MAILER] Processing ${players.length} players for attachments`);
        const playerAttachments = players
            .map((player, index) => {
                if (player.image && player.image.trim() !== "") {
                    const matches = player.image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
                    if (matches) {
                        const ext = matches[1];
                        const base64Data = matches[2];
                        const buffer = Buffer.from(base64Data, "base64");
                        return {
                            filename: `player-${index}.${ext}`,
                            content: buffer,
                            cid: `player_custom_${index}`,
                        };
                    }
                }
                return null;
            })
            .filter(attachment => attachment !== null);

        const attachments = [...assetAttachments, ...playerAttachments];

        // 2. Generate Dynamic Leaderboard Rows
        const leaderboardRowsHtml = players.map((player, index) => {
            const username = escapeXml(player.username);
            const score = escapeXml(player.score);
            
            const hasCustomImage = player.image && player.image.trim() !== "" && player.image.startsWith("data:image/");
            const avatarCid = hasCustomImage ? `player_custom_${index}` : getCid('pfp.png', assetMap).replace('cid:', '');

            if (index === 0) {
                return `
                <tr>
                  <td width="60" align="center" valign="middle">
                    <img src="${getCid('first-place.png', assetMap)}" width="60" alt="1" style="display:block; border:0;" />
                  </td>
                  <td width="16"></td>
                  <td bgcolor="#5796FF" style="border-radius: 18px; padding: 12px 20px;" valign="middle">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="left" valign="middle">
                          <div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">${username}</div>
                          <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: 400; color: #FFFFFF;">${score} pts</div>
                        </td>
                        <td align="right" width="46" valign="middle">
                          <img src="cid:${avatarCid}" width="46" height="46" style="display:block; border-radius: 50%; border: 2px solid #FFFFFF; object-fit: cover;" alt="User Avatar" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td colspan="3" height="12" style="font-size:0; line-height:0;">&nbsp;</td></tr>`;
            } else {
                return `
                <tr>
                  <td width="45" align="center" valign="middle" style="font-family: Arial, sans-serif; font-size: 28px; font-weight: 700; color: #333333;">${index + 1}</td>
                  <td width="16"></td>
                  <td bgcolor="#EAE6D0" style="border-radius: 18px; padding: 12px 20px;" valign="middle">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="left" valign="middle">
                          <div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: 700; color: #222222; margin-bottom: 4px;">${username}</div>
                          <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: 400; color: #666666;">${score} pts</div>
                        </td>
                        <td align="right" width="46" valign="middle">
                          <img src="cid:${avatarCid}" width="46" height="46" style="display:block; border-radius: 50%; object-fit: cover;" alt="User Avatar" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td colspan="3" height="12" style="font-size:0; line-height:0;">&nbsp;</td></tr>`;
            }
        }).join("");

        // 3. Define FULL MJML Template with Dynamic Injections
        const dateObj = new Date(finalDate);
        const formattedDate = isNaN(dateObj.getTime()) ? escapeXml(finalDate) : dateObj.toLocaleDateString("nl-BE");

        const cafeName = escapeXml(cafe.name || tripData.cafe_name || "The Location");
        const cafeBudget = escapeXml(budget || tripData.budget || "0");
        const participantCount = escapeXml(`${expected_players || tripData.expected_players || players.length} invited`);
        const cafeMood = escapeXml(mood || tripData.mood || "Beer and Banter");
        const cafeDescription = escapeXml(cafe.description || tripData.description || "We found an absolute hidden gem! This cozy, ultra-niche bar is tucked away in a secret corner of Antwerp you've probably never even heard of. It's the perfect low-key spot featuring an incredible selection of unique craft beers and a relaxed vibe.");
        const cafeAddress = escapeXml(cafe.address || tripData.address || "Steenplein 1, 2000 Antwerpen");

        const template = `<mjml>
  <mj-head>
    <mj-font name="Arial" href="https://fonts.googleapis.com/css?family=Arial"></mj-font>
    <mj-attributes>
      <mj-all font-family="Arial, sans-serif"></mj-all>
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#F7F6EA">
    <!-- Header -->
    <mj-section padding="32px 20px" background-color="#5796FF" border-radius="0px 0px 24px 24px">
      <mj-column>
        <mj-image 
          src="${getCid('logo.png', assetMap)}" 
          alt="Logo"
          width="45px"
          align="center">
        </mj-image>
        
        <mj-spacer height="24px"></mj-spacer>
        
        <mj-image 
          src="${getCid('header.png', assetMap)}" 
          alt="Header"
          width="300px"
          padding="0px">
        </mj-image>
      </mj-column>
    </mj-section>

    <!-- Leaderboard -->
    <mj-section background-color="#F7F5EE" padding="40px 24px" border-radius="0px">
      <mj-column width="100%">
        <mj-image 
          src="${getCid('Leaderboard.png', assetMap)}" 
          width="240px" 
          align="center" 
          alt="Leaderboard" 
          padding="16px 0px 48px 0px">
        </mj-image>

        <mj-table padding="0px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${leaderboardRowsHtml}
          </table>
        </mj-table>
      </mj-column>
    </mj-section>

    <!-- Hangout -->
    <mj-section background-color="#E9E7C7" padding="0px 24px 48px 24px" border-radius="24px 24px 24px 24px">
      <mj-column width="100%">
        <mj-image 
          src="${getCid('theHangout.png', assetMap)}" 
          width="240px" 
          align="center" 
          alt="The Hangout" 
          padding="48px 0px">
        </mj-image>

        <mj-table padding="0px 16px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td width="42" align="center" valign="middle">
                <img src="${getCid('date-icon.png', assetMap)}" width="42" alt="When" style="display:block; border:0;" />
              </td>
              <td width="16"></td>
              <td align="left" valign="middle">
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #767676; margin-bottom: 2px;">When?</div>
                <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; color: #2B4C3F;">${formattedDate}</div>
              </td>
            </tr>
            <tr><td colspan="3" height="20" style="font-size:0; line-height:0;">&nbsp;</td></tr>
            <tr>
              <td width="42" align="center" valign="middle">
                <img src="${getCid('location-icon.png', assetMap)}" width="42" alt="Location" style="display:block; border:0;" />
              </td>
              <td width="16"></td>
              <td align="left" valign="middle">
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #767676; margin-bottom: 2px;">Location</div>
                <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; color: #2B4C3F;">${cafeName}</div>
              </td>
            </tr>
            <tr><td colspan="3" height="20" style="font-size:0; line-height:0;">&nbsp;</td></tr>
            <tr>
              <td width="42" align="center" valign="middle">
                <img src="${getCid('budget-icon.png', assetMap)}" width="42" alt="Budget" style="display:block; border:0;" />
              </td>
              <td width="16"></td>
              <td align="left" valign="middle">
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #767676; margin-bottom: 2px;">Budget</div>
                <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; color: #2B4C3F;">&euro;${cafeBudget}</div>
              </td>
            </tr>
            <tr><td colspan="3" height="20" style="font-size:0; line-height:0;">&nbsp;</td></tr>
            <tr>
              <td width="42" align="center" valign="middle">
                <img src="${getCid('people-icon.png', assetMap)}" width="42" alt="People" style="display:block; border:0;" />
              </td>
              <td width="16"></td>
              <td align="left" valign="middle">
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #767676; margin-bottom: 2px;">People</div>
                <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; color: #2B4C3F;">${participantCount}</div>
              </td>
            </tr>
            <tr><td colspan="3" height="20" style="font-size:0; line-height:0;">&nbsp;</td></tr>
            <tr>
              <td width="42" align="center" valign="middle">
                <img src="${getCid('drink-icon.png', assetMap)}" width="42" alt="Drink" style="display:block; border:0;" />
              </td>
              <td width="16"></td>
              <td align="left" valign="middle">
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #767676; margin-bottom: 2px;">Drink</div>
                <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; color: #2B4C3F;">${cafeMood}</div>
              </td>
            </tr>
          </table>
        </mj-table>
      </mj-column>
    </mj-section>

    <!-- Location -->
    <mj-section padding="32px 0px" border-radius="0px">
      <mj-column width="55%" vertical-align="middle">
        <mj-image 
          src="${getCid('theLocation.png', assetMap)}" 
          width="186px" 
          align="left" 
          alt="The location" 
          padding="24px 24px">
        </mj-image>
        <mj-text 
          font-family="Arial, sans-serif" 
          font-size="16px" 
          line-height="24px" 
          color="#333333" 
          padding="0px 24px">
          ${cafeDescription}
        </mj-text>
      </mj-column>
      <mj-column width="45%" vertical-align="middle">
        <mj-image 
          src="${getCid('bar.png', assetMap)}" 
          width="186px" 
          align="right" 
          alt="Bar Interior" 
          padding="16px 0px 0px 0px">
        </mj-image>
      </mj-column>
    </mj-section>

    <!-- Address & Opening Hours -->
    <mj-section background-color="#5796FF" padding="40px 24px 40px 24px" border-radius="24px 24px 24px 24px">
      <mj-column width="100%">
        <mj-image 
          src="${getCid('adress.png', assetMap)}" 
          width="130px" 
          align="left" 
          alt="Adress" 
          padding="0px 0px 12px 0px">
        </mj-image>
        <mj-text 
          font-family="Arial, sans-serif" 
          font-size="18px" 
          color="#FFFFFF" 
          padding="0px 0px 24px 0px">
          ${cafeAddress} 
        </mj-text>
   
        <mj-table  padding="0px 24px 40px 24px">
          <tr>
            <td width="60%" valign="middle">
              <img src="${getCid('openingHours.png', assetMap)}" width="230" alt="Opening hours" style="display:block; border:0; margin-bottom:16px;" />
              <div style="font-family:Arial,sans-serif; font-size:16px; line-height:28px; color:#FFFFFF;">
                <strong>Thu–Fri</strong> &middot; 10:00–22:00<br />
                <strong>Mon–Sun</strong> &middot; 09:00–23:00<br />
                <strong>Tue–Sat</strong> &middot; 11:00–00:00
              </div>
            </td>
            <td width="40%" align="right" valign="middle">
              <img src="${getCid('clock.png', assetMap)}" width="120" alt="Clock" style="display:block; border:0; margin-left:auto;" />
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>

    <!-- Make a day out of it -->
    <mj-section padding="32px 0px">
      <mj-column width="100%" vertical-align="middle">
        <mj-image 
          src="${getCid('day-out-of-it.png', assetMap)}" 
          width="290px" 
          align="center" 
          alt="Make a day out of it" 
          padding="24px 24px">
        </mj-image>
      </mj-column>
    </mj-section>

    <!-- Card 1: Frituur Chips (Orange) -->
    <mj-wrapper padding="0px 24px 32px 24px">
      <mj-section background-color="#FF7338" border-radius="20px" padding="24px 16px">
        <mj-column width="100%">
          <mj-table padding="0px 0px 16px 0px">
            <tr>
              <td width="45%" align="center" valign="middle">
                <img src="${getCid('frituur-image.png', assetMap)}" width="160" alt="Frituur Chips Graphic" style="display:block; border:0;" />
              </td>
              <td width="55%" valign="middle">
                <img src="${getCid('frituur-h.png', assetMap)}" width="180" alt="Frituur Chips" style="display:block; border:0; margin-bottom:12px;" />
                <div style="font-family:Arial,sans-serif; font-size:15px; line-height:22px; color:#FFFFFF; margin-bottom:16px;">
                  Grab a small pack of fries with Andalouse sauce down the street before you start counting pints in the local bar.
                </div>
                <span style="display:inline-block; background-color:rgba(0,0,0,0.15); color:#FFFFFF; font-family:Arial,sans-serif; font-size:12px; padding:4px 10px; border-radius:6px; margin-right:6px; margin-bottom:6px;">#streetfood</span>
                <span style="display:inline-block; background-color:rgba(0,0,0,0.15); color:#FFFFFF; font-family:Arial,sans-serif; font-size:12px; padding:4px 10px; border-radius:6px; margin-right:6px; margin-bottom:6px;">#fries</span>
                <span style="display:inline-block; background-color:rgba(0,0,0,0.15); color:#FFFFFF; font-family:Arial,sans-serif; font-size:12px; padding:4px 10px; border-radius:6px; margin-right:6px; margin-bottom:6px;">#belgian</span>
              </td>
            </tr>
          </mj-table>
          <mj-table padding="0px">
            <tr>
              <td width="50%" style="padding-right:6px;">
                <a href="https://chips.be" style="display:block; text-align:center; font-family:Arial,sans-serif; font-size:16px; color:#FFFFFF; background-color:transparent; border:1.2px solid #87360E; border-radius:12px; padding:12px 0; text-decoration:none;">Visit website</a>
              </td>
              <td width="50%" style="padding-left:6px;">
                <a href="#" style="display:block; text-align:center; font-family:Arial,sans-serif; font-size:16px; color:#FFFFFF; background-color:#1A1A1A; border-radius:12px; padding:12px 0; text-decoration:none;">Find on maps</a>
              </td>
            </tr>
          </mj-table>
        </mj-column>
      </mj-section>
    </mj-wrapper>

    <!-- Card 2: Street Art Alleys (Blue) -->
    <mj-wrapper padding="0px 24px 32px 24px">
      <mj-section background-color="#5796FF" border-radius="20px" padding="24px 16px">
        <mj-column width="100%">
          <mj-table padding="0px 0px 16px 0px">
            <tr>
              <td width="45%" align="center" valign="middle">
                <img src="${getCid('street-art-image.png', assetMap)}" width="160" alt="Street art image" style="display:block; border:0;" />
              </td>
              <td width="55%" valign="middle">
                <img src="${getCid('street-art-h.png', assetMap)}" width="180" alt="Street art" style="display:block; border:0; margin-bottom:12px;" />
                <div style="font-family:Arial,sans-serif; font-size:15px; line-height:22px; color:#FFFFFF; margin-bottom:16px;">
                  Take a 2-minute detour through Het Kopstraatje, a narrow alley covered in graffiti and murals, to experience raw Antwerp street vibes.
                </div>
                <span style="display:inline-block; background-color:rgba(0,0,0,0.15); color:#FFFFFF; font-family:Arial,sans-serif; font-size:12px; padding:4px 10px; border-radius:6px; margin-right:6px; margin-bottom:6px;">#streetart</span>
                <span style="display:inline-block; background-color:rgba(0,0,0,0.15); color:#FFFFFF; font-family:Arial,sans-serif; font-size:12px; padding:4px 10px; border-radius:6px; margin-right:6px; margin-bottom:6px;">#graffiti</span>
                <span style="display:inline-block; background-color:rgba(0,0,0,0.15); color:#FFFFFF; font-family:Arial,sans-serif; font-size:12px; padding:4px 10px; border-radius:6px; margin-right:6px; margin-bottom:6px;">#art</span>
              </td>
            </tr>
          </mj-table>
          <mj-table padding="0px">
            <tr>
              <td width="50%" style="padding-right:6px;">
                <a href="https://visit.antwerpen.be/ontdek-de-beste-graffitikunstwerken-van-antwerpen-in-de-street-art-antwerp-app" style="display:block; text-align:center; font-family:Arial,sans-serif; font-size:16px; color:#FFFFFF; background-color:transparent; border:1.2px solid #1B54B8; border-radius:12px; padding:12px 0; text-decoration:none;">Visit website</a>
              </td>
              <td width="50%" style="padding-left:6px;">
                <a href="#" style="display:block; text-align:center; font-family:Arial,sans-serif; font-size:16px; color:#FFFFFF; background-color:#1A1A1A; border-radius:12px; padding:12px 0; text-decoration:none;">Find on maps</a>
              </td>
            </tr>
          </mj-table>
        </mj-column>
      </mj-section>
    </mj-wrapper>

    <!-- Card 3: Secret Labyrinth (Green) -->
    <mj-wrapper padding="0px 24px 32px 24px">
      <mj-section background-color="#00D67B" border-radius="20px" padding="24px 16px">
        <mj-column width="100%">
          <mj-table padding="0px 0px 16px 0px">
            <tr>
              <td width="45%" align="center" valign="middle">
                <img src="${getCid('secret-labyrynth-image.png', assetMap)}" width="160" alt="Secret labyrinth image" style="display:block; border:0;" />
              </td>
              <td width="55%" valign="middle">
                <img src="${getCid('secret-labyrinth-h.png', assetMap)}" width="180" alt="Secret labyrinth" style="display:block; border:0; margin-bottom:12px;" />
                <div style="font-family:Arial,sans-serif; font-size:15px; line-height:22px; color:#FFFFFF; margin-bottom:16px;">
                  Slip through the wooden door at Oude Koornmarkt 16 to find Vlaeykensgang - a hidden 16th-century alleyway that feels completely frozen in time.
                </div>
                <span style="display:inline-block; background-color:rgba(0,0,0,0.15); color:#FFFFFF; font-family:Arial,sans-serif; font-size:12px; padding:4px 10px; border-radius:6px; margin-right:6px; margin-bottom:6px;">#maze</span>
                <span style="display:inline-block; background-color:rgba(0,0,0,0.15); color:#FFFFFF; font-family:Arial,sans-serif; font-size:12px; padding:4px 10px; border-radius:6px; margin-right:6px; margin-bottom:6px;">#history</span>
                <span style="display:inline-block; background-color:rgba(0,0,0,0.15); color:#FFFFFF; font-family:Arial,sans-serif; font-size:12px; padding:4px 10px; border-radius:6px; margin-right:6px; margin-bottom:6px;">#authentic</span>
              </td>
            </tr>
          </mj-table>
          <mj-table padding="0px">
            <tr>
              <td width="50%" style="padding-right:6px;">
                <a href="#" style="display:block; text-align:center; font-family:Arial,sans-serif; font-size:16px; color:#FFFFFF; background-color:transparent; border:1.2px solid #0E8752; border-radius:12px; padding:12px 0; text-decoration:none;">Visit website</a>
              </td>
              <td width="50%" style="padding-left:6px;">
                <a href="https://www.atlasobscura.com/places/vlaeykensgang" style="display:block; text-align:center; font-family:Arial,sans-serif; font-size:16px; color:#FFFFFF; background-color:#1A1A1A; border-radius:12px; padding:12px 0; text-decoration:none;">Find on maps</a>
              </td>
            </tr>
          </mj-table>
        </mj-column>
      </mj-section>
    </mj-wrapper>

    <!-- Footer -->
    <mj-section padding="32px 24px 48px 24px">
      <mj-column padding="20px 28px">
        <mj-image
          src="${getCid('logo.png', assetMap)}"
          width="45px"
          align="center"
          alt="Logo"
          padding="0px 0px 29px 0px">
        </mj-image>
        <mj-text
          font-family="Arial, sans-serif"
          font-size="16px"
          line-height="26px"
          color="#1A1A1A"
          align="center"
          padding="0px 0px 29px 0px">
          Steenplein 1<br />
          2000 Antwerpen
        </mj-text>
        <mj-text
          font-family="Arial, sans-serif"
          font-size="16px"
          color="#1A1A1A"
          align="center"
          padding="0px 0px 29px 0px">
          info@visitantwerpen.be
        </mj-text>
        <mj-text
          font-family="Arial, sans-serif"
          font-size="16px"
          color="#1A1A1A"
          align="center"
          padding="0px">
          +32(0)3 221 13 33
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

        // 4. Compile MJML to HTML
        const result = await mjml(template, {
            validationLevel: 'soft',
            minify: false
        });

        const html = result.html;
        if (!html || html.trim() === "") {
            throw new Error("MJML compilation produced empty output");
        }

        // 5. Send Mail
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: "Trip confirmed!",
            html: html,
            attachments,
        });

        console.log(`[MAILER] Success! MessageId: ${info.messageId}`);
    } catch (error) {
        console.error("[MAILER] CRITICAL ERROR:", error);
    }
};


const sendTripCoupon = async (to, couponId, cafe, finalDate) => {
    try {
        const url = getFrontendUrl(couponId);
        const qrBuffer = await QRCode.toBuffer(url);

        const { attachments: assetAttachments, assetMap } = getAssetAttachments();

        const template = `<mjml>
  <mj-head>
    <mj-font name="Arial" href="https://fonts.googleapis.com/css?family=Arial"></mj-font>
    <mj-attributes>
      <mj-all font-family="Arial, sans-serif"></mj-all>
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#F7F6EA">
    <!-- Header -->
    <mj-section padding="32px 20px" background-color="#5796FF" border-radius="0px 0px 24px 24px">
      <mj-column>
        <mj-image 
          src="${getCid('logo.png', assetMap)}" 
          alt="Logo"
          width="45px"
          align="center">
        </mj-image>
        
        <mj-spacer height="24px"></mj-spacer>
        
        <mj-image 
          src="${getCid('header2.png', assetMap)}" 
          alt="Header"
          width="300px"
          padding="0px">
        </mj-image>
      </mj-column>
    </mj-section>

    <!-- Leaderboard / Coupon Header -->
    <mj-section background-color="#F7F5EE" padding="40px 24px" border-radius="0px">
      <mj-column width="100%">
        <mj-image 
          src="${getCid('your-coupon.png', assetMap)}" 
          width="240px" 
          align="center" 
          alt="Your Coupon" 
          padding="16px 0px 48px 0px">
        </mj-image>

      <mj-text
      font-family="Arial, sans-serif"
      font-size="16px"
      color="#707070"
      align="center"
      line-height="140%"
      padding="0px 24px 16px 24px">
      Show this qr code to the bar upon ordering to redeem your free drink
    </mj-text>

    <!-- Place & Date -->
    <mj-text
      font-family="Arial, sans-serif"
      font-size="20px"
      color="#79775B"
      align="center"
      line-height="140%"
      padding="0px 0px 24px 0px">
      <strong>Place:</strong> ${escapeXml(cafe)}<br />
      <strong>Date:</strong> ${escapeXml(finalDate)}
    </mj-text>

    <!-- QR Code -->
    <mj-image
      src="cid:qrcode"
      width="150px"
      alt="QR Code"
      padding="0px 0px 24px 0px" />
      </mj-column>
    </mj-section>

    <!-- Link Section -->
    <mj-section padding="0px 24px 20px 24px">
      <mj-column width="100%">
        <mj-text font-family="Arial, sans-serif" font-size="14px" color="#707070" align="center">
          Or open directly: <a href="${url}" style="color: #5796FF; text-decoration: none;">${url}</a>
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section padding="0px 24px 48px 24px">
      <mj-column padding="20px 28px">
        <mj-image
          src="${getCid('logo.png', assetMap)}"
          width="45px"
          align="center"
          alt="Logo"
          padding="0px 0px 29px 0px">
        </mj-image>
        <mj-text
          font-family="Arial, sans-serif"
          font-size="16px"
          line-height="26px"
          color="#1A1A1A"
          align="center"
          padding="0px 0px 29px 0px">
          Steenplein 1<br />
          2000 Antwerpen
        </mj-text>
        <mj-text
          font-family="Arial, sans-serif"
          font-size="16px"
          color="#1A1A1A"
          align="center"
          padding="0px 0px 29px 0px">
          info@visitantwerpen.be
        </mj-text>
        <mj-text
          font-family="Arial, sans-serif"
          font-size="16px"
          color="#1A1A1A"
          align="center"
          padding="0px">
          +32(0)3 221 13 33
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

        const result = await mjml(template, {
            validationLevel: 'soft',
            minify: false
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: "Congratulations, you had the highest score of your friendgroup!",
            html: result.html,
            attachments: [
                ...assetAttachments,
                {
                    filename: "qrcode.png",
                    content: qrBuffer,
                    cid: "qrcode"
                }
            ]
        });

        console.log(`[MAILER] Coupon email sent successfully to ${to}`);
    } catch (error) {
        console.error("[MAILER] Error sending coupon email:", error);
    }
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