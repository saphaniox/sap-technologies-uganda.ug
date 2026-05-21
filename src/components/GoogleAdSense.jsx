import { useEffect, useRef } from "react";
import { ADSENSE_AUTO_ADS, ADSENSE_CLIENT, ADSENSE_ENABLED } from "../config/adsense";
import "../styles/AdSense.css";

const ADSENSE_SCRIPT_ID = "google-adsense-script";
const ADSENSE_META_NAME = "google-adsense-account";

const ensureAdSenseMeta = () => {
  if (!ADSENSE_ENABLED || typeof document === "undefined") return;

  let meta = document.querySelector(`meta[name="${ADSENSE_META_NAME}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", ADSENSE_META_NAME);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", ADSENSE_CLIENT);
};

const ensureAdSenseScript = () => {
  if (!ADSENSE_ENABLED || typeof document === "undefined") return;
  if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
};

const pushAdSenseSlot = () => {
  if (!ADSENSE_ENABLED || typeof window === "undefined") return;

  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  } catch (error) {
    console.warn("AdSense slot could not be initialized:", error);
  }
};

const GoogleAdSense = () => {
  useEffect(() => {
    if (!ADSENSE_AUTO_ADS) return;

    ensureAdSenseMeta();
    ensureAdSenseScript();
  }, []);

  return null;
};

export const AdSenseSlot = ({
  slot,
  className = "",
  format = "auto",
  fullWidthResponsive = true,
  minHeight = 120,
  label = "Advertisement"
}) => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ENABLED || !slot || initializedRef.current) return undefined;

    ensureAdSenseMeta();
    ensureAdSenseScript();

    const timer = window.setTimeout(() => {
      pushAdSenseSlot();
      initializedRef.current = true;
    }, 250);

    return () => window.clearTimeout(timer);
  }, [slot]);

  if (!ADSENSE_ENABLED || !slot) return null;

  const adProps = {
    className: "adsbygoogle",
    style: {
      display: "block",
      minHeight: `${minHeight}px`
    },
    "data-ad-client": ADSENSE_CLIENT,
    "data-ad-slot": slot,
    "data-ad-format": format,
    "data-full-width-responsive": fullWidthResponsive ? "true" : "false"
  };

  return (
    <aside className={`adsense-placement ${className}`.trim()} aria-label={label}>
      <span className="adsense-placement-label">{label}</span>
      <ins {...adProps} />
    </aside>
  );
};

export default GoogleAdSense;
