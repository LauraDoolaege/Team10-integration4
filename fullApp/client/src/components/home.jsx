import QRCode from "qrcode-generator";

export default function TripQR() {
  // This URL is constant in your app
  const url = `${window.location.origin}/initiator.html`;

  // Generate QR code once per render (no hooks needed)
  const qr = QRCode(4, "L");
  qr.addData(url);
  qr.make();
  const qrImg = qr.createImgTag(4);

  return (
    <div>
      <header>
        <h1>Official Trip Competition Portal</h1>
      </header>

      <main>
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>

        {/* QR code HTML image */}
        <div dangerouslySetInnerHTML={{ __html: qrImg }} />
      </main>
    </div>
  );
}