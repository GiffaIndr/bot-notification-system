import { useState } from "react";

export default function CreateEnvironment({ token, refreshUser }) {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    const res = await fetch("http://localhost:3000/environment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Environment created!");
    refreshUser(); // reload user biar environmentId update
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Create Environment</h3>
      <input
        placeholder="Environment Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}