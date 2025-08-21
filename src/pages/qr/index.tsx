import React from "react";
import Layout from "@theme/Layout";

type ManifestItem = {
  title: string;
  url: string;   // destination page
  file: string;  // QR PNG path under /qr
};

export default function QRIndex() {
  const [items, setItems] = React.useState<ManifestItem[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/qr/_manifest.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ManifestItem[];
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
  }, []);

  const normalized = query.trim().toLowerCase();
  const filtered = !normalized
    ? items
    : items.filter(
        (it) =>
          it.title.toLowerCase().includes(normalized) ||
          it.url.toLowerCase().includes(normalized) ||
          it.file.toLowerCase().includes(normalized)
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
              Generated for docs with <code>qr: true</code> in front matter.{" "}
              <a href="/qr/_manifest.json" target="_blank" rel="noreferrer">
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
                Failed to load <code>/qr/_manifest.json</code>: {error}
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
              {filtered.map((it, i) => (
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
                    href={it.file}
                    target="_blank"
                    rel="noreferrer"
                    title="Open PNG in a new tab"
                    style={{ display: "block", textAlign: "center" }}
                  >
                    <img
                      src={it.file}
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
                    {it.url}
                  </div>

                  {/* Stacked, full-width buttons */}
                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <a
                      className="button button--sm button--primary button--block"
                      href={it.file}
                      download
                      title="Download PNG"
                    >
                      Download
                    </a>
                    <button
                      className="button button--sm button--secondary button--block"
                      onClick={() =>
                        copyToClipboard(window.location.origin + it.file, i)
                      }
                      type="button"
                      title="Copy image URL"
                    >
                      {copiedIdx === i ? "Copied!" : "Copy image URL"}
                    </button>
                    <a
                      className="button button--sm button--secondary button--block"
                      href={it.url}
                      target="_blank"
                      rel="noreferrer"
                      title="Open destination page"
                    >
                      Open page
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
