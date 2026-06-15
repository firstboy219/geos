"use client";

import { useEffect, useState } from "react";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function DateLine() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const d = new Date();
    setLabel(`${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`);
  }, []);
  return <span>{label}</span>;
}
