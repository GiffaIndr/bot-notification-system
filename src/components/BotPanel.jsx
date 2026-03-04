import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";

const socket = io("http://localhost:3000");

export default function BotPanel({ token }) {
  const [environment, setEnvironment] = useState(null);
  const [qr, setQr] = useState(null);

  useEffect(() => {
    fetchEnvironment();
  }, []);

  useEffect(() => {
    socket.on("qrUpdate", ({ environmentId, qr }) => {
      console.log("QR UPDATE:", environmentId);

      setQr((prev) => {
        if (environment && environment._id === environmentId) {
          return qr;
        }
        return prev;
      });
    });

    socket.on("botStatusUpdate", ({ environmentId, status }) => {
      console.log("STATUS UPDATE:", environmentId, status);

      setEnvironment((prev) => {
        if (!prev || prev._id !== environmentId) return prev;

        return { ...prev, status };
      });

      if (status === "connected") {
        setQr(null);
      }
    });

    return () => {
      socket.off("qrUpdate");
      socket.off("botStatusUpdate");
    };
  }, []); // 🔥 kosongin dependency

  const fetchEnvironment = async () => {
    const res = await fetch("http://localhost:3000/environment/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setEnvironment(data);
  };

  const connectBot = async () => {
    await fetch("http://localhost:3000/api/wa/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };
  if (!environment) return null;

  return (
    <div style={{ border: "1px solid #ccc", padding: 20, marginBottom: 20 }}>
      <h3>{environment.name}</h3>
      <p>Status: {environment.status}</p>

      {environment.status !== "connected" && (
        <button onClick={connectBot}>Connect Bot</button>
      )}

      {qr && (
        <div style={{ marginTop: 15 }}>
          <p>Scan QR:</p>
          <QRCodeCanvas value={qr} size={200} />
        </div>
      )}
    </div>
  );
}
