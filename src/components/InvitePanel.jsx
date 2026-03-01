import { useState } from "react";

export default function InvitePanel({ token, user }) {
  const [adminLink, setAdminLink] = useState("");

  const generateAdminInvite = async () => {
    const res = await fetch("http://localhost:3000/environment/invite-admin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setAdminLink(data.inviteLink);
  };

  if (user.role !== "A1") return null;

  return (
    <div style={{ marginBottom: 30 }}>
      <h3>Invite System</h3>

      <button onClick={generateAdminInvite}>Generate Admin Invite Link</button>

      {adminLink && (
        <div style={{ marginTop: 10 }}>
          <p>Admin Link:</p>
          <input value={adminLink} readOnly style={{ width: "100%" }} />
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <p>Share this to members:</p>

        <input value={user.environmentId} readOnly style={{ width: "100%" }} />
      </div>
    </div>
  );
}
