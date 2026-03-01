import { useState } from "react";

export default function CreateAnnouncement({ token, user }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:3000/announcement/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        message,
        scheduledAt,
      }),
    });
    console.log("User role:", user.role);
    alert("Announcement created!");
    setTitle("");
    setMessage("");
    setScheduledAt("");
  };

  if (user.role !== "A1" && user.role !== "A2") return null;

  return (
    <div style={{ marginBottom: 30 }}>
      <h3>Create Announcement</h3>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        <br /><br />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}