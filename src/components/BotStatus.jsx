import React from 'react'

export default function BotStatus({ status }) {
  const color =
    status === "connected"
      ? "green"
      : status === "connecting"
      ? "orange"
      : "red";

  return (
    <p>
      Status: <span style={{ color }}>{status}</span>
    </p>
  );
}
