import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function RegisterAdmin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const envId = searchParams.get("env");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch(
      "http://localhost:3000/auth/register-admin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          envId,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Admin registered successfully!");
    navigate("/");
  };

  if (!envId) {
    return <p>Invalid invite link</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Register as Admin</h2>

      <form onSubmit={handleRegister}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /><br />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />

        <button type="submit">Register Admin</button>
      </form>
    </div>
  );
}