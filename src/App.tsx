import { useState, useMemo } from "react";

const WGS84 = {
  a: 6378137.0,
  f: 1 / 298.257223563,
  get e2() {
    return 2 * this.f - this.f * this.f;
  },
  get b() {
    return this.a * (1 - this.f);
  },
  get ep2() {
    return (this.a * this.a - this.b * this.b) / (this.b * this.b);
  },
};

const geodeticToCartesian3 = (
  latDeg: number,
  lonDeg: number,
  height: number
): { x: number; y: number; z: number } => {
  const phi = (latDeg * Math.PI) / 180;
  const lambda = (lonDeg * Math.PI) / 180;

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const N = WGS84.a / Math.sqrt(1 - WGS84.e2 * sinPhi * sinPhi);

  const x = (N + height) * cosPhi * Math.cos(lambda);
  const y = (N + height) * cosPhi * Math.sin(lambda);
  const z = ((1 - WGS84.e2) * N + height) * sinPhi;

  return { x, y, z };
};

const cartesian3ToGeodetic = (
  x: number,
  y: number,
  z: number
): { latDeg: number; lonDeg: number; height: number } => {
  const p = Math.sqrt(x * x + y * y);

  if (p < 1e-10) {
    const latDeg = z > 0 ? 90 : -90;
    const lonDeg = 0;
    const height = Math.abs(z) - WGS84.b;
    return { latDeg, lonDeg, height };
  }

  const theta = Math.atan2(z * WGS84.a, p * WGS84.b);
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);

  const phi = Math.atan2(
    z + WGS84.ep2 * WGS84.b * sinTheta * sinTheta * sinTheta,
    p - WGS84.e2 * WGS84.a * cosTheta * cosTheta * cosTheta
  );

  const lambda = Math.atan2(y, x);

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const N = WGS84.a / Math.sqrt(1 - WGS84.e2 * sinPhi * sinPhi);

  let height: number;
  if (Math.abs(cosPhi) > 1e-10) {
    height = p / cosPhi - N;
  } else {
    height = z / sinPhi - N * (1 - WGS84.e2);
  }

  const latDeg = (phi * 180) / Math.PI;
  const lonDeg = (lambda * 180) / Math.PI;

  return { latDeg, lonDeg, height };
};

export default function App() {
  const [mode, setMode] = useState<"geo2cart" | "cart2geo">("geo2cart");
  const [useRadians, setUseRadians] = useState(false);
  const [precision, setPrecision] = useState(6);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [heightGeo, setHeightGeo] = useState("");

  const [xCoord, setXCoord] = useState("");
  const [yCoord, setYCoord] = useState("");
  const [zCoord, setZCoord] = useState("");

  const [result, setResult] = useState<{
    x?: number;
    y?: number;
    z?: number;
    latDeg?: number;
    lonDeg?: number;
    height?: number;
  } | null>(null);
  const [error, setError] = useState("");

  const handleConvert = () => {
    setError("");
    setResult(null);

    try {
      if (mode === "geo2cart") {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const h = parseFloat(heightGeo);

        if (isNaN(lat) || isNaN(lon) || isNaN(h)) {
          throw new Error("Bitte geben Sie gültige numerische Werte ein");
        }

        // Convert from radians if checkbox is checked
        const latDeg = useRadians ? (lat * 180) / Math.PI : lat;
        const lonDeg = useRadians ? (lon * 180) / Math.PI : lon;

        if (Math.abs(latDeg) > 90) {
          throw new Error("Latitude muss zwischen -90° und 90° liegen");
        }
        if (Math.abs(lonDeg) > 180) {
          throw new Error("Longitude muss zwischen -180° und 180° liegen");
        }

        const cartesian = geodeticToCartesian3(latDeg, lonDeg, h);
        setResult(cartesian);
      } else {
        const x = parseFloat(xCoord);
        const y = parseFloat(yCoord);
        const z = parseFloat(zCoord);

        if (isNaN(x) || isNaN(y) || isNaN(z)) {
          throw new Error("Bitte geben Sie gültige numerische Werte ein");
        }

        const geodetic = cartesian3ToGeodetic(x, y, z);
        setResult(geodetic);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
    }
  };

  const swapMode = () => {
    setMode(mode === "geo2cart" ? "cart2geo" : "geo2cart");
    setResult(null);
    setError("");
  };

  const setPreset = (lat: number, lon: number, h: number) => {
    setLatitude(lat.toString());
    setLongitude(lon.toString());
    setHeightGeo(h.toString());
  };

  const copyToClipboard = () => {
    if (result) {
      const json = JSON.stringify(result, null, 2);
      navigator.clipboard.writeText(json);
    }
  };

  const magnitude = useMemo(() => {
    if (
      result &&
      "x" in result &&
      result.x !== undefined &&
      result.y !== undefined &&
      result.z !== undefined
    ) {
      return Math.sqrt(
        result.x * result.x + result.y * result.y + result.z * result.z
      );
    }
    return null;
  }, [result]);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "";
    return num.toFixed(precision);
  };

  const inputUnit =
    mode === "geo2cart" && useRadians ? "rad" : mode === "geo2cart" ? "°" : "m";

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#1e293b",
            marginBottom: "1.5rem",
          }}
        >
          Koordinaten ⇄ Cartesian3
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <button
            onClick={swapMode}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "14px",
            }}
            aria-label="Modus wechseln"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
            </svg>
            {mode === "geo2cart"
              ? "Geodätisch → Cartesian3"
              : "Cartesian3 → Geodätisch"}
          </button>
        </div>

        {mode === "geo2cart" && (
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <input
                type="checkbox"
                checked={useRadians}
                onChange={(e) => setUseRadians(e.target.checked)}
                aria-label="Eingaben in Radiant"
              />
              <span style={{ fontSize: "14px", color: "#475569" }}>
                Eingaben in Radiant
              </span>
            </label>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {mode === "geo2cart" ? (
            <>
              <div>
                <label
                  htmlFor="latitude"
                  style={{
                    display: "block",
                    marginBottom: "0.25rem",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  Latitude ({inputUnit})
                </label>
                <input
                  id="latitude"
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder={useRadians ? "z.B. 0.8726" : "z.B. 50.0"}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  aria-label="Latitude"
                />
              </div>

              <div>
                <label
                  htmlFor="longitude"
                  style={{
                    display: "block",
                    marginBottom: "0.25rem",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  Longitude ({inputUnit})
                </label>
                <input
                  id="longitude"
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder={useRadians ? "z.B. 0.1745" : "z.B. 10.0"}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  aria-label="Longitude"
                />
              </div>

              <div>
                <label
                  htmlFor="height"
                  style={{
                    display: "block",
                    marginBottom: "0.25rem",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  Height (m)
                </label>
                <input
                  id="height"
                  type="text"
                  value={heightGeo}
                  onChange={(e) => setHeightGeo(e.target.value)}
                  placeholder="z.B. 100"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  aria-label="Height"
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => setPreset(0, 0, 0)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Set: (0°, 0°, 0m)
                </button>
                <button
                  onClick={() => setPreset(48.7823, 11.9601, 400)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Set: Neuburg
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="x"
                  style={{
                    display: "block",
                    marginBottom: "0.25rem",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  X (m)
                </label>
                <input
                  id="x"
                  type="text"
                  value={xCoord}
                  onChange={(e) => setXCoord(e.target.value)}
                  placeholder="z.B. 6378137"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  aria-label="X coordinate"
                />
              </div>

              <div>
                <label
                  htmlFor="y"
                  style={{
                    display: "block",
                    marginBottom: "0.25rem",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  Y (m)
                </label>
                <input
                  id="y"
                  type="text"
                  value={yCoord}
                  onChange={(e) => setYCoord(e.target.value)}
                  placeholder="z.B. 0"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  aria-label="Y coordinate"
                />
              </div>

              <div>
                <label
                  htmlFor="z"
                  style={{
                    display: "block",
                    marginBottom: "0.25rem",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  Z (m)
                </label>
                <input
                  id="z"
                  type="text"
                  value={zCoord}
                  onChange={(e) => setZCoord(e.target.value)}
                  placeholder="z.B. 0"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  aria-label="Z coordinate"
                />
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleConvert}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
            marginBottom: "1rem",
          }}
          aria-label="Umrechnen"
        >
          Umrechnen
        </button>

        {error && (
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "4px",
              color: "#991b1b",
              marginBottom: "1rem",
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        {result && (
          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "1rem",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b" }}>
                Ergebnis:
              </h3>
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <label
                  htmlFor="precision"
                  style={{ fontSize: "12px", color: "#64748b" }}
                >
                  Nachkommastellen:
                </label>
                <select
                  id="precision"
                  value={precision}
                  onChange={(e) => setPrecision(Number(e.target.value))}
                  style={{
                    padding: "0.25rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <option value={3}>3</option>
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                </select>
              </div>
            </div>

            <div
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              {"x" in result ? (
                <>
                  <div>x: {formatNumber(result.x)} m</div>
                  <div>y: {formatNumber(result.y)} m</div>
                  <div>z: {formatNumber(result.z)} m</div>
                  {magnitude !== null && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      |r| = {formatNumber(magnitude)} m
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>Latitude: {formatNumber(result.latDeg)}°</div>
                  <div>Longitude: {formatNumber(result.lonDeg)}°</div>
                  <div>Height: {formatNumber(result.height)} m</div>
                </>
              )}
            </div>

            <button
              onClick={copyToClipboard}
              style={{
                marginTop: "0.75rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#475569",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                width: "100%",
              }}
              aria-label="Als JSON kopieren"
            >
              Als JSON kopieren
            </button>
          </div>
        )}
      </div>

      <footer
        style={{
          textAlign: "center",
          marginTop: "2rem",
          fontSize: "12px",
          color: "#94a3b8",
        }}
      >
        <a
          href="https://github.com/Oko-Tester/geo-2-cart"
          style={{ color: "#64748b", textDecoration: "none" }}
        >
          GitHub
        </a>
        <span style={{ margin: "0 0.5rem" }}>•</span>
        <span>Oko-Tester</span>

        <h3>Impressum</h3>
        <p>
          <strong>Kontakt</strong>
        </p>
        <p>
          E-Mail:
          <a href="mailto:okotestproduction@gmail.com">
            okotestproduction@gmail.com
          </a>
        </p>

        <p>
          <small>
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: Alexander Remer
          </small>
        </p>
      </footer>
    </div>
  );
}
