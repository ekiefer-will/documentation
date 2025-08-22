import React from "react";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

type ManifestItem = {
  title: string;
  url: string;   // destination page (absolute or site-relative)
  file: string;  // QR PNG path under /qr (site-relative)
};

function joinBase(baseUrl: string, pathOrUrl: string): string {
  // Leave absolute URLs alone
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  // Ensure exactly one slash between base and path
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export default function QRIndex() {
  const { siteConfig } = useDocusaurusContext();
  const baseUrl = siteConfig?.baseUrl ?? "/";
  const manifestUrl = useBaseUrl("/qr/_manifest.json");

  const [items, setItems] = React.useState<ManifestItem[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(manifestUrl, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // Guard against HTML (e.g., a 404 page)
        const text = await res.text();
        if (text.trim().startsWith("<")) {
          throw new Error(
            "Received HTML instead of JSON (check .nojekyll and path)"
          );
        }

        const data = JSON.parse(text) as ManifestItem[];
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load manifest");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [manifestUrl]);

  const normalized = query.trim().toLowerCase();
  const filtered = !normalized
    ? items
    : items.filter(
        (it) =>
          (it.title || "").toLowerCase().includes(normalized) ||
          (it.url || "").toLowerCase().includes(normalized) ||
          (it.file || "").toLowerCase().includes(normalized)
      );

  async function copyToClipboard(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((v) => (v === idx ? null : v)), 1400);
    } catch {
      /* ignore */
    }
  }

  return (
    <Layout title="QR Codes" description="Gallery of generated QR codes">
      <main className="container padding-vert--lg">
        <div className="row">
          <div className="col col--12">
            <h1 style={{ marginBottom: 8 }}>QR Codes</h1>
            <p style={{ marginTop: 0, opacity: 0.75 }}>
              Generated for docs with <code>qr: true</code> in front matter{" "}
              <a href={manifestUrl} target="_blank" rel="noreferrer">
                View manifest
              </a>
              .
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                margin: "12px 0 20px",
              }}
            >
              <input
                type="search"
                className="input"
                placeholder="Search title / URL / filename"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ maxWidth: 420, width: "100%" }}
              />
              <div style={{ flex: 1 }} />
              <button
                className="button button--sm button--secondary"
                onClick={() => window.print()}
                type="button"
                title="Print this page"
              >
                Print page
              </button>
            </div>

            {loading && <p>Loading…</p>}
            {error && (
              <div className="alert alert--danger" role="alert">
                Failed to load <code>{manifestUrl}</code>: {error}
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="alert alert--warning" role="alert">
                No QR codes found. Make sure at least one doc has{" "}
                <code>qr: true</code> and rebuild.
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 24,
              }}
            >
              {filtered.map((it, i) => {
                const fileHref = joinBase(baseUrl, it.file);
                const pageHref = joinBase(baseUrl, it.url);
                const absoluteFileUrl =
                  typeof window !== "undefined"
                    ? new URL(fileHref, window.location.href).href
                    : fileHref;

                return (
                  <article
                    key={`${it.file}-${i}`}
                    style={{
                      border: "1px solid var(--ifm-toc-border-color, #e6e6e6)",
                      borderRadius: 12,
                      padding: 16,
                      background: "var(--ifm-card-background-color)",
                    }}
                  >
                    <a
                      href={fileHref}
                      target="_blank"
                      rel="noreferrer"
                      title="Open PNG in a new tab"
                      style={{ display: "block", textAlign: "center" }}
                    >
                      <img
                        src={fileHref}
                        alt={it.title || it.url}
                        style={{
                          width: "100%",
                          height: "auto",
                          maxWidth: 360,
                          margin: "0 auto",
                        }}
                        loading="lazy"
                      />
                    </a>

                    <div style={{ marginTop: 10, fontWeight: 600 }}>
                      {it.title || it.url}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.75,
                        wordBreak: "break-all",
                        marginTop: 4,
                      }}
                      title={it.url}
                    >
                      {pageHref}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      <a
                        className="button button--sm button--primary button--block"
                        href={fileHref}
                        download
                        title="Download PNG"
                      >
                        Download
                      </a>
                      <button
                        className="button button--sm button--secondary button--block"
                        onClick={() => copyToClipboard(absoluteFileUrl, i)}
                        type="button"
                        title="Copy image URL"
                      >
                        {copiedIdx === i ? "Copied!" : "Copy image URL"}
                      </button>
                      <a
                        className="button button--sm button--secondary button--block"
                        href={pageHref}
                        target="_blank"
                        rel="noreferrer"
                        title="Open destination page"
                      >
                        Open page
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
