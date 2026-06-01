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
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>

        <div dangerouslySetInnerHTML={{ __html: qrImg }} />
      </main>
    </>
  );
}