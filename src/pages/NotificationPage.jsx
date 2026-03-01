import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationPage({ token }) {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await fetch("http://localhost:3000/notification", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) setNotifications(data);
  };

  const handleClick = async (notif) => {
    await fetch(`http://localhost:3000/notification/${notif._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    navigate("/dashboard"); // atau nanti ke detail announcement
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Notifications</h2>

      {notifications.map((n) => (
        <div
          key={n._id}
          onClick={() => handleClick(n)}
          style={{
            padding: 15,
            marginBottom: 10,
            border: "1px solid #ccc",
            background: n.isRead ? "#f5f5f5" : "#e6f2ff",
            cursor: "pointer",
          }}
        >
          <h4>{n.announcementId?.title}</h4>
          <p>{n.announcementId?.content}</p>
        </div>
      ))}
    </div>
  );
}
