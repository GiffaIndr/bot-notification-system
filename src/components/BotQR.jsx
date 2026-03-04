import { QRCodeCanvas } from "qrcode.react";

export default function BotQR({ qr }) {
  if (!qr) return null;

  return (
    <div style={{ marginTop: 15 }}>
      <p>Scan QR:</p>
      <QRCodeCanvas value={qr} size={200} />
    </div>
  );
}