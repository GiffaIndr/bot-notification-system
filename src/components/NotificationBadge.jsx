import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

export default function NotificationBadge({ token, user }) {
  const [count, setCount] = useState(0);
const navigate = useNavigate();
  useEffect(() => {
    fetchCount();

    const socket = io("http://localhost:3000");
    socket.emit("joinUserRoom", user._id);

    socket.on("newNotification", () => {
      fetchCount();
      new Audio("/notif.mp3").play();
    });

    return () => socket.disconnect();
  }, []);

  const fetchCount = async () => {
    const res = await fetch(
      "http://localhost:3000/notification/unread-count",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (res.ok) setCount(data.count);
  };

  const markAllRead = async () => {
    await fetch(
      "http://localhost:3000/notification/mark-all-read",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setCount(0);
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
      onClick={() => navigate("/notifications")}
    >
      🔔
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: -5,
            right: -10,
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: 12,
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}