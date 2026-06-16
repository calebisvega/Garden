"use client";

import { useEffect, useState } from "react";

/** Night hours: 6pm – 6am local time */
function isNightHour(date = new Date()) {
  const hour = date.getHours();
  return hour >= 18 || hour < 6;
}

export function useIsNightTime() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const update = () => setIsNight(isNightHour());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return isNight;
}
