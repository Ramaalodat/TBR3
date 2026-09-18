import React, { useEffect, useState } from "react";

export default function BannerBar() {
  const [banner, setBanner] = useState(null);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/banner`)
      .then((res) => res.json())
      .then((data) => {
        const activeBanner = data.banner;

        if (activeBanner?.is_active) {
          const key = `tbr3_banner_closed_${activeBanner.id}`;
          const saved = localStorage.getItem(key);

          if (saved) {
            const { timestamp } = JSON.parse(saved);
            const now = Date.now();
            const age = now - timestamp;

            // less than 24h ago, keep hidden+
            if (age < 24 * 60 * 60 * 1000) {
              setIsClosed(true);
              return;
            } else {
              // if expire??, remove it
              localStorage.removeItem(key);
            }
          }

          setBanner(activeBanner);
        }
      })
      .catch((err) => console.error("Banner fetch failed:", err));
  }, []);

  const handleClose = () => {
    if (banner?.id) {
      localStorage.setItem(
        `tbr3_banner_closed_${banner.id}`,
        JSON.stringify({ timestamp: Date.now() })
      );
    }
    setIsClosed(true);
  };

  if (!banner || isClosed) return null;

  return (
    <div className="bg-red-800 text-white text-sm text-center p-2 shadow-md z-50 relative">
      <div
        dangerouslySetInnerHTML={{ __html: banner.content }}
        className="max-w-screen-lg mx-auto px-4"
      />
      <button
        onClick={handleClose}
        className="absolute top-1 right-3 text-white text-lg font-bold hover:text-gray-200"
        aria-label="Close banner"
      >
        &times;
      </button>
    </div>
  );
}
