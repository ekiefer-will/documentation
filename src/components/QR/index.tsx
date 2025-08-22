// import React from "react";
// import {useLocation} from '@docusaurus/router';
// export default function QR({alt='QR code', size=240, caption='Scan to open this page'}) {
//   const { pathname } = useLocation();
//   const name = pathname.replace(/\/$/, '').replace(/^\/|\/$/g,'').replace(/[\/?&#:%]/g,'_') + '.png';
//   const src = `/qr/${name}`;
//   return (
//     <figure style={{textAlign:'center'}}>
//       <img src={src} alt={alt} style={{width:size, height:size}} />
//       <figcaption style={{fontSize:12, opacity:.7}}>{caption}</figcaption>
//     </figure>
//   );
// }

// src/components/QR/index.tsx
import React from "react";
import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";

function stripBase(pathname: string, baseUrl: string): string {
  if (!baseUrl || baseUrl === "/") return pathname;
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return pathname.startsWith(base)
    ? pathname.slice(base.length - 1) // keep leading slash
    : pathname;
}

export default function QR({ caption = "Download the QR code" }: { caption?: string }) {
  const { pathname } = useLocation();
  const { siteConfig } = useDocusaurusContext();

  const normalized = stripBase(pathname, siteConfig?.baseUrl ?? "/");

  const safe =
    normalized
      .replace(/\/$/, "")
      .replace(/^\/|\/$/g, "")
      .replace(/[\/?&#:%]/g, "_") || "home";

  const href = useBaseUrl(`/qr/${safe}.png`);

  return (
    <p style={{ textAlign: "left", fontSize: 14 }}>
      <a href={href} rel="noopener noreferrer">
        {caption}
      </a>
    </p>
  );
}