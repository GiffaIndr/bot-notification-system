import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function NotificationBadge({ token, user }) {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const fetchCount = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notification/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Fetch gagal");

      const data = await res.json();
      setCount(data.count);
    } catch (err) {
      console.error("Gagal fetch count:", err);
    }
  }, [token]);

  const markAllRead = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notification/mark-all-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Mark read gagal");

      setCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user?._id || !token) return;

    fetchCount();

    const socket = io(API_URL, {
      auth: { token }, // Kirim JWT user
    });

    socket.emit("joinUserRoom", user._id);

    socket.on("newNotification", () => {
      fetchCount();
      new Audio("/notif.mp3").play().catch(() => {});
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, token, fetchCount]);

  const handleClick = async () => {
    await markAllRead();
    navigate("/notifications");
  };

  return (
    <div style={containerStyle} onClick={handleClick}>
      <span style={{ fontSize: "24px" }}>🔔</span>
      {count > 0 && (
        <span style={badgeStyle}>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
}

const containerStyle = {
  position: "relative",
  display: "inline-block",
  cursor: "pointer",
  padding: "4px",
};

const badgeStyle = {
  position: "absolute",
  top: 0,
  right: -2,
  background: "#FF3B30",
  color: "white",
  borderRadius: "10px",
  padding: "2px 5px",
  fontSize: "10px",
  fontWeight: "bold",
  minWidth: "14px",
  textAlign: "center",
  border: "2px solid white",
};