import QRCode from "qrcode-generator";

export default function Home() {
  const url = `${window.location.origin}/initiator`;

  const qr = QRCode(4, "L");
  qr.addData(url);
  qr.make();

  const qrImg = qr.createImgTag(4);

  return (
    <>
      <header>
        <h1>Official Trip Competition Portal</h1>
      </header>

      <main>
        <div className="card">
          <h2>Scan or Click to Create a Trip</h2>
          <p>Share this QR code or link with your friends to invite them to vote:</p>
          <a href={url} target="_blank" rel="noreferrer" className="button">
            {url}
          </a>
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            {qrImg && <div dangerouslySetInnerHTML={{ __html: qrImg }} />}
          </div>
        </div>
      </main>
    </>
  );
}