import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function AnnouncementList({ token, user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ title: "", content: "" });

  const socket = io("http://localhost:3000");
  useEffect(() => {
    fetchAnnouncements();
    socket.emit("joinEnvironment", user.environmentId);

    socket.on("newAnnouncement", (data) => {
      setAnnouncements((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchAnnouncements = async () => {
    const res = await fetch("http://localhost:3000/announcement", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) setAnnouncements(data);
    console.log(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;

    await fetch(`http://localhost:3000/announcement/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchAnnouncements();
  };

  const handleEdit = (announcement) => {
    setEditId(announcement._id);
    setEditData({
      title: announcement.title,
      content: announcement.content,
    });
  };

  const handleUpdate = async (id) => {
    await fetch(`http://localhost:3000/announcement/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editData),
    });

    setEditId(null);
    fetchAnnouncements();
  };

  return (
    <div>
      <h3>Announcements</h3>

      {announcements.map((a) => (
        <div
          key={a._id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          {editId === a._id ? (
            <>
              <input
                value={editData.title}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
              />
              <br />
              <br />
              <textarea
                value={editData.content}
                onChange={(e) =>
                  setEditData({ ...editData, content: e.target.value })
                }
              />
              <br />
              <br />
              <button onClick={() => handleUpdate(a._id)}>Save</button>
              <button onClick={() => setEditId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <h4>{a.title}</h4>
              <p>{a.content}</p>

              <p style={{ color: a.isPublished ? "green" : "orange" }}>
                {a.isPublished ? "Published" : "Scheduled"}
              </p>

              {(user.role === "A1" || user.role === "A2") && !a.isPublished && (
                <>
                  <button onClick={() => handleEdit(a)}>Edit</button>
                  <button onClick={() => handleDelete(a._id)}>Delete</button>
                </>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
