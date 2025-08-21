import React from "react";
import {useLocation} from '@docusaurus/router';
export default function QR({alt='QR code', size=240, caption='Scan to open this page'}) {
  const { pathname } = useLocation();
  const name = pathname.replace(/\/$/, '').replace(/^\/|\/$/g,'').replace(/[\/?&#:%]/g,'_') + '.png';
  const src = `/qr/${name}`;
  return (
    <figure style={{textAlign:'center'}}>
      <img src={src} alt={alt} style={{width:size, height:size}} />
      <figcaption style={{fontSize:12, opacity:.7}}>{caption}</figcaption>
    </figure>
  );
}
