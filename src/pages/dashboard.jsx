import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CreateEnvironment from "../components/CreateEnviroment";
import CreateAnnouncement from "../components/CreateAnnoucement";
import AnnouncementList from "../components/AnnoucementList";
import NotificationBadge from "../components/NotificationBadge";
import InvitePanel from "../components/InvitePanel";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      if (!token) {
        navigate("/");
        return;
      }

      const res = await fetch("http://localhost:3000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        navigate("/");
        
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      navigate("/");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome {user.name}</h2>
      <NotificationBadge token={token} user={user} />
      {!user.isPaid && (
        <div>
          <p style={{ color: "red" }}>Belum Subscribe</p>
          <button onClick={() => navigate("/home")}>Subscribe Now</button>
        </div>
      )}

      {user.isPaid && !user.environmentId && (
        <CreateEnvironment token={token} refreshUser={fetchUser} />
      )}

      {user.environmentId && (
        <>
          <InvitePanel token={token} user={user} />
          <p style={{ color: "green" }}>Environment Active</p>

          <CreateAnnouncement token={token} user={user} />
          <AnnouncementList token={token} user={user} />
        </>
      )}
    </div>
  );
}
