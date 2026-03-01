import React from "react";

export default function Subscribe() {

  const handleSubscribe = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Silakan login dulu");
      return;
    }

    const res = await fetch("http://localhost:3000/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 FIX DI SINI
      },
    });

    if (!res.ok) {
      alert("Unauthorized, silakan login ulang");
      return;
    }

    const data = await res.json();

    if (!data.token) {
      alert("Gagal mendapatkan Snap token");
      return;
    }

    window.snap.pay(data.token, {
      onSuccess: function () {
        alert("Pembayaran berhasil");
        window.location.href = "/dashboard";
      },
      onPending: function () {
        alert("Menunggu pembayaran");
      },
      onError: function () {
        alert("Pembayaran gagal");
      },
    });
  };

  return (
    <button onClick={handleSubscribe}>
      Subscribe Semester
    </button>
  );
}