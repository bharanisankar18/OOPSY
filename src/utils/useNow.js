import { useEffect, useState } from 'react';

/** Current Date, refreshed every `ms` (default 1s). */
export default function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
