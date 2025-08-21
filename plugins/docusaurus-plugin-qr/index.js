const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const matter = require("gray-matter");

// Ensure dir exists
function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function filenameFromPermalink(permalink) {
  return (
    permalink
      .replace(/^\/|\/$/g, "")
      .replace(/[\/?&#:%]/g, "_")
      .replace(/__+/g, "_") + ".png"
  );
}

function walkFiles(dir, exts = [".md", ".mdx"]) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(p, exts));
    else if (exts.includes(path.extname(entry.name))) out.push(p);
  }
  return out;
}

function relPathNoExt(abs, root) {
  const rel = path.relative(root, abs).replace(/\\/g, "/");
  return rel.replace(/\.(md|mdx)$/i, "");
}

module.exports = function pluginQr(context) {
  const {
    siteDir,
    baseUrl,
    siteConfig: { url: siteUrl },
  } = context;

  const origin = (siteUrl && siteUrl.replace(/\/$/, "")) || "http://localhost:3000";
  const siteBase = (origin + baseUrl).replace(/\/$/, "");
  const routeBasePath = "/docs"; // assumes default; adjust if you changed docs.routeBasePath

  const qrOutDir = path.join(siteDir, "static", "qr");
  ensureDir(qrOutDir);

  return {
    name: "docusaurus-plugin-qr",

    async contentLoaded({ allContent }) {
      // ---- Attempt 1: read docs from allContent (covers multi-instance/versions) ----
      const docsRoot = allContent?.["docusaurus-plugin-content-docs"];
      const allDocsViaAPI = docsRoot
        ? Object.values(docsRoot)
            .flatMap((plugin) => plugin?.loadedVersions || [])
            .flatMap((v) => v.docs || [])
        : [];

      let targets = allDocsViaAPI.filter((d) => d?.frontMatter?.qr);

      console.log(`[qr] allContent -> total docs: ${allDocsViaAPI.length}`);
      console.log(`[qr] allContent -> docs with qr:true: ${targets.length}`);

      // ---- Attempt 2 (fallback): scan /docs folder if API returns nothing ----
      if (targets.length === 0) {
        const docsDir = path.join(siteDir, "docs");
        const files = walkFiles(docsDir);
        const picked = [];

        for (const f of files) {
          const raw = fs.readFileSync(f, "utf8");
          const fm = matter(raw);
          if (fm?.data?.qr) {
            // slug rules: use explicit front-matter slug if provided, else use relative path
            const relNoExt = relPathNoExt(f, docsDir);
            const fmSlug = (fm.data.slug || "").toString().replace(/^\//, "");
            const slug = fmSlug || relNoExt;
            const permalink = `${routeBasePath}/${slug}`.replace(/\/+/g, "/");
            picked.push({
              title: fm.data.title || path.basename(relNoExt),
              permalink,
            });
          }
        }

        console.log(`[qr] fallback scan -> docs with qr:true: ${picked.length}`);

        // Convert to a shape compatible with the later loop
        targets = picked.map((d) => ({
          title: d.title,
          permalink: d.permalink,
        }));
      }

      // ---- Generate QR images for targets ----
      const manifest = [];
      for (const doc of targets) {
        const pagePath = doc.permalink; // e.g. "/docs/intro"
        const fullUrl = new URL(pagePath.replace(/^\//, ""), siteBase + "/").toString();
        const filename = filenameFromPermalink(pagePath);
        const outFile = path.join(qrOutDir, filename);

        await QRCode.toFile(outFile, fullUrl, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 1024,
        });

        manifest.push({ title: doc.title, url: fullUrl, file: `/qr/${filename}` });
      }

      // ---- Always write a manifest ----
      const manifestPath = path.join(qrOutDir, "_manifest.json");
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

      console.log(`[qr] wrote ${manifest.length} PNG(s) to static/qr/`);
      console.log(`[qr] manifest: ${path.relative(siteDir, manifestPath)}`);
    },
  };
};
