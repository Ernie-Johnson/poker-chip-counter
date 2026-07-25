import { useState, useRef, useEffect, useCallback } from "react";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  felt:    "#1a3a2a",
  feltMid: "#224a36",
  feltRim: "#2d5c44",
  gold:    "#c9a84c",
  goldSoft:"#e8c96a",
  cream:   "#f5f0e8",
  ink:     "#1a1a1a",
  muted:   "#6b6b5a",
  white:   "#ffffff",
  danger:  "#c0392b",
};

// ── Chip colour presets ───────────────────────────────────────────────────────
const CHIP_PRESETS = [
  { label: "White",  hex: "#e8e8e0", textColor: "#333" },
  { label: "Red",    hex: "#c0392b", textColor: "#fff" },
  { label: "Blue",   hex: "#2060a0", textColor: "#fff" },
  { label: "Green",  hex: "#1e7a3e", textColor: "#fff" },
  { label: "Black",  hex: "#1a1a1a", textColor: "#fff" },
  { label: "Purple", hex: "#6a2fa0", textColor: "#fff" },
  { label: "Yellow", hex: "#d4b800", textColor: "#333" },
  { label: "Pink",   hex: "#c0507a", textColor: "#fff" },
  { label: "Orange", hex: "#d46a10", textColor: "#fff" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
function penceToDisplay(pence) {
  if (pence >= 100) {
    const pounds = pence / 100;
    return `£${pounds % 1 === 0 ? pounds.toFixed(0) : pounds.toFixed(2)}`;
  }
  return `${pence}p`;
}
function parseValue(str) {
  str = str.trim();
  if (str.startsWith("£")) return Math.round(parseFloat(str.slice(1)) * 100);
  if (str.endsWith("p"))  return parseInt(str.slice(0, -1), 10);
  const n = parseFloat(str);
  if (!isNaN(n)) return n < 10 ? Math.round(n * 100) : Math.round(n);
  return 0;
}

// ── Chip swatch ───────────────────────────────────────────────────────────────
function ChipSwatch({ color, size = 28 }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size,
      borderRadius: "50%",
      background: color.hex,
      border: `2px solid rgba(0,0,0,0.25)`,
      boxShadow: "inset 0 2px 4px rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.4)",
      flexShrink: 0,
    }} />
  );
}

// ── Felt card ────────────────────────────────────────────────────────────────
function FeltCard({ children, style = {} }) {
  return (
    <div style={{
      background: C.feltMid,
      border: `1px solid ${C.feltRim}`,
      borderRadius: 16,
      padding: "24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Gold button ──────────────────────────────────────────────────────────────
function GoldBtn({ children, onClick, disabled, style = {}, secondary = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: secondary ? "transparent" : C.gold,
        color: secondary ? C.goldSoft : C.ink,
        border: secondary ? `1px solid ${C.gold}` : "none",
        borderRadius: 10,
        padding: "12px 24px",
        fontFamily: "Georgia, serif",
        fontSize: 15,
        fontWeight: secondary ? 400 : 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        letterSpacing: "0.03em",
        transition: "opacity 0.15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
function Inp({ value, onChange, placeholder, style = {} }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: "rgba(0,0,0,0.25)",
        border: `1px solid ${C.feltRim}`,
        borderRadius: 8,
        padding: "10px 14px",
        color: C.cream,
        fontSize: 15,
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "inherit",
        ...style,
      }}
    />
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SCREEN 1 — Home
// ════════════════════════════════════════════════════════════════════════════
function HomeScreen({ onCreateRoom, onJoinRoom }) {
  const [joinCode, setJoinCode] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState(null); // "create" | "join"

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "40px 20px" }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>♠</div>
        <h1 style={{ fontFamily: "Georgia, serif", color: C.gold, fontSize: 28, margin: 0, letterSpacing: "0.04em" }}>
          Chip Count
        </h1>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>End-of-game chip calculator</p>
      </div>

      {!mode && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <GoldBtn onClick={() => setMode("create")} style={{ width: "100%", padding: "16px" }}>
            Create a room
          </GoldBtn>
          <GoldBtn onClick={() => setMode("join")} secondary style={{ width: "100%", padding: "16px" }}>
            Join a room
          </GoldBtn>
        </div>
      )}

      {mode === "create" && (
        <FeltCard>
          <h2 style={{ color: C.goldSoft, fontFamily: "Georgia, serif", fontSize: 18, margin: "0 0 20px" }}>
            Create a room
          </h2>
          <label style={{ color: C.cream, fontSize: 13, display: "block", marginBottom: 6 }}>Your name</label>
          <Inp value={name} onChange={setName} placeholder="e.g. James" />
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <GoldBtn secondary onClick={() => setMode(null)} style={{ flex: 1 }}>Back</GoldBtn>
            <GoldBtn
              onClick={() => onCreateRoom(name.trim())}
              disabled={!name.trim()}
              style={{ flex: 2 }}
            >
              Create →
            </GoldBtn>
          </div>
        </FeltCard>
      )}

      {mode === "join" && (
        <FeltCard>
          <h2 style={{ color: C.goldSoft, fontFamily: "Georgia, serif", fontSize: 18, margin: "0 0 20px" }}>
            Join a room
          </h2>
          <label style={{ color: C.cream, fontSize: 13, display: "block", marginBottom: 6 }}>Room code</label>
          <Inp
            value={joinCode}
            onChange={v => setJoinCode(v.toUpperCase().slice(0, 6))}
            placeholder="e.g. KQJ7T9"
            style={{ letterSpacing: "0.15em", fontSize: 20, textAlign: "center" }}
          />
          <label style={{ color: C.cream, fontSize: 13, display: "block", margin: "16px 0 6px" }}>Your name</label>
          <Inp value={name} onChange={setName} placeholder="e.g. Sarah" />
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <GoldBtn secondary onClick={() => setMode(null)} style={{ flex: 1 }}>Back</GoldBtn>
            <GoldBtn
              onClick={() => onJoinRoom(joinCode, name.trim())}
              disabled={joinCode.length < 4 || !name.trim()}
              style={{ flex: 2 }}
            >
              Join →
            </GoldBtn>
          </div>
        </FeltCard>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SCREEN 2 — Host setup (chip values)
// ════════════════════════════════════════════════════════════════════════════
function HostSetupScreen({ room, onReady }) {
  const [chips, setChips] = useState([
    { ...CHIP_PRESETS[0], value: "4p",  id: 1 },
    { ...CHIP_PRESETS[1], value: "8p",  id: 2 },
    { ...CHIP_PRESETS[4], value: "£1",  id: 3 },
  ]);
  const [adding, setAdding] = useState(false);
  const [newChip, setNewChip] = useState({ ...CHIP_PRESETS[2], value: "" });

  function updateValue(id, val) {
    setChips(ch => ch.map(c => c.id === id ? { ...c, value: val } : c));
  }
  function removeChip(id) {
    setChips(ch => ch.filter(c => c.id !== id));
  }
  function addChip() {
    if (!newChip.value.trim()) return;
    setChips(ch => [...ch, { ...newChip, id: Date.now() }]);
    setAdding(false);
    setNewChip({ ...CHIP_PRESETS[2], value: "" });
  }

  const valid = chips.length > 0 && chips.every(c => parseValue(c.value) > 0);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <span style={{ color: C.gold, fontSize: 24 }}>♠</span>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", color: C.gold, fontSize: 20, margin: 0 }}>Set chip values</h1>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Room code: <strong style={{ color: C.goldSoft, letterSpacing: "0.1em" }}>{room.code}</strong></p>
        </div>
      </div>

      <FeltCard style={{ marginBottom: 16 }}>
        <p style={{ color: C.muted, fontSize: 13, margin: "0 0 16px" }}>
          Set the value of each chip colour. Values can be in pence (4p) or pounds (£1.50).
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {chips.map(chip => (
            <div key={chip.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ChipSwatch color={chip} />
              <span style={{ color: C.cream, fontSize: 14, flex: 1 }}>{chip.label}</span>
              <input
                value={chip.value}
                onChange={e => updateValue(chip.id, e.target.value)}
                placeholder="e.g. 50p or £1"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: `1px solid ${C.feltRim}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: C.cream,
                  fontSize: 14,
                  width: 90,
                  fontFamily: "inherit",
                  textAlign: "right",
                }}
              />
              <button
                onClick={() => removeChip(chip.id)}
                style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, padding: "0 4px" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {adding ? (
          <div style={{ marginTop: 16, padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: 10 }}>
            <p style={{ color: C.goldSoft, fontSize: 13, margin: "0 0 12px" }}>Pick a colour</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {CHIP_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setNewChip(nc => ({ ...nc, ...p }))}
                  style={{
                    background: p.hex,
                    border: newChip.label === p.label ? `2px solid ${C.gold}` : "2px solid transparent",
                    borderRadius: "50%",
                    width: 32, height: 32,
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: C.cream, fontSize: 13, minWidth: 60 }}>{newChip.label}</span>
              <Inp value={newChip.value} onChange={v => setNewChip(nc => ({ ...nc, value: v }))} placeholder="Value e.g. 25p" style={{ flex: 1 }} />
              <GoldBtn onClick={addChip} disabled={!newChip.value.trim()} style={{ padding: "8px 16px" }}>Add</GoldBtn>
              <GoldBtn secondary onClick={() => setAdding(false)} style={{ padding: "8px 12px" }}>✕</GoldBtn>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{ marginTop: 14, background: "none", border: `1px dashed ${C.feltRim}`, borderRadius: 8, color: C.muted, padding: "10px", width: "100%", cursor: "pointer", fontSize: 14 }}
          >
            + Add chip colour
          </button>
        )}
      </FeltCard>

      <GoldBtn onClick={() => onReady(chips)} disabled={!valid} style={{ width: "100%", padding: "16px" }}>
        Open room for players →
      </GoldBtn>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SCREEN 3 — Lobby (host view, waiting for players)
// ════════════════════════════════════════════════════════════════════════════
function LobbyScreen({ room, players, onStartCounting }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 8px" }}>Share this code with your players</p>
        <div style={{
          fontFamily: "Georgia, serif",
          fontSize: 48,
          color: C.gold,
          letterSpacing: "0.2em",
          padding: "16px",
          background: "rgba(0,0,0,0.2)",
          borderRadius: 12,
          display: "inline-block",
        }}>
          {room.code}
        </div>
      </div>

      <FeltCard style={{ marginBottom: 20 }}>
        <p style={{ color: C.muted, fontSize: 13, margin: "0 0 14px" }}>Chip values</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {room.chips.map(chip => (
            <div key={chip.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "6px 12px" }}>
              <ChipSwatch color={chip} size={18} />
              <span style={{ color: C.cream, fontSize: 13 }}>{chip.label} = {chip.value}</span>
            </div>
          ))}
        </div>
      </FeltCard>

      <FeltCard style={{ marginBottom: 24 }}>
        <p style={{ color: C.muted, fontSize: 13, margin: "0 0 14px" }}>
          Players in room ({players.length})
        </p>
        {players.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 14, fontStyle: "italic" }}>Waiting for players to join…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {players.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: C.gold, color: C.ink,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 13,
                }}>
                  {p.name[0].toUpperCase()}
                </div>
                <span style={{ color: C.cream, fontSize: 15 }}>{p.name}</span>
                {p.isHost && <span style={{ color: C.gold, fontSize: 12, marginLeft: "auto" }}>host</span>}
              </div>
            ))}
          </div>
        )}
      </FeltCard>

      <GoldBtn
        onClick={onStartCounting}
        disabled={players.length === 0}
        style={{ width: "100%", padding: "16px" }}
      >
        Game's over — start counting chips
      </GoldBtn>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SCREEN 4 — Player waiting (joined but waiting for host to start)
// ════════════════════════════════════════════════════════════════════════════
function PlayerWaitScreen({ room, player, players }) {
  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "32px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>♣</div>
      <h2 style={{ fontFamily: "Georgia, serif", color: C.gold, fontSize: 22, margin: "0 0 8px" }}>You're in, {player.name}</h2>
      <p style={{ color: C.muted, fontSize: 15, marginBottom: 32 }}>Waiting for the host to end the game…</p>

      <FeltCard>
        <p style={{ color: C.muted, fontSize: 13, margin: "0 0 14px" }}>Players in room</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {players.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: p.id === player.id ? C.gold : C.feltRim,
                color: p.id === player.id ? C.ink : C.cream,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 12,
              }}>
                {p.name[0].toUpperCase()}
              </div>
              <span style={{ color: p.id === player.id ? C.goldSoft : C.cream, fontSize: 14 }}>
                {p.name} {p.isHost ? "(host)" : ""}
              </span>
            </div>
          ))}
        </div>
      </FeltCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SCREEN 5 — Photo capture + AI counting
// ════════════════════════════════════════════════════════════════════════════
function PhotoScreen({ room, player, onDone }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null); // base64 jpeg
  const [counting, setCounting] = useState(false);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Start camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(s => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      })
      .catch(() => setError("Camera access denied. Please allow camera access and refresh."));
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);
    stream?.getTracks().forEach(t => t.stop());
  }

  function retake() {
    setPhoto(null);
    setError(null);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(s => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setCameraReady(true);
        }
      });
  }

  async function countChips() {
    setCounting(true);
    setError(null);
    const base64 = photo.split(",")[1];

    const chipList = room.chips.map(c =>
      `- ${c.label} chip (colour: ${c.hex}, value: ${c.value} = ${parseValue(c.value)} pence)`
    ).join("\n");

    const prompt = `You are counting poker chips in an image. The player has photographed their chip stack from the side.

The room has these chip types:
${chipList}

Count how many chips of each colour are visible. Be precise — count every chip you can see including partially visible ones in a stack. Return ONLY a JSON object like this (no markdown, no explanation):
{"counts": {"White": 5, "Red": 3, "Black": 2}}

Only include colours that are actually present. Use exact colour names from the list above.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
              { type: "text", text: prompt },
            ],
          }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("").trim();

      let parsed;
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        throw new Error("Could not read chip count from AI. Try a clearer photo.");
      }

      const counts = parsed.counts || {};
      let totalPence = 0;
      const breakdown = [];
      for (const [colour, qty] of Object.entries(counts)) {
        const chip = room.chips.find(c => c.label.toLowerCase() === colour.toLowerCase());
        if (chip && qty > 0) {
          const valuePence = parseValue(chip.value);
          totalPence += valuePence * qty;
          breakdown.push({ chip, qty, subtotal: valuePence * qty });
        }
      }

      onDone({ player, totalPence, breakdown });
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setCounting(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px" }}>
      <h2 style={{ fontFamily: "Georgia, serif", color: C.gold, fontSize: 20, margin: "0 0 4px" }}>
        {player.name}'s chips
      </h2>
      <p style={{ color: C.muted, fontSize: 14, margin: "0 0 20px" }}>
        Stack your chips in a neat pile and take a photo from the side.
      </p>

      {error && (
        <div style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#e88", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Camera / photo view */}
      <div style={{ borderRadius: 14, overflow: "hidden", background: "#000", marginBottom: 16, aspectRatio: "4/3", position: "relative" }}>
        {!photo && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {photo && (
          <img src={photo} alt="Your chips" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
        {!photo && cameraReady && (
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "6px 14px",
            color: "rgba(255,255,255,0.7)", fontSize: 12,
          }}>
            Line up your chip stack
          </div>
        )}
        {counting && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(26,58,42,0.85)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            <div style={{ fontSize: 32 }}>🔍</div>
            <p style={{ color: C.goldSoft, fontFamily: "Georgia, serif", fontSize: 16 }}>Counting chips…</p>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Chip key */}
      <FeltCard style={{ marginBottom: 16 }}>
        <p style={{ color: C.muted, fontSize: 12, margin: "0 0 10px" }}>Chip values for this game</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {room.chips.map(chip => (
            <div key={chip.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "4px 10px" }}>
              <ChipSwatch color={chip} size={16} />
              <span style={{ color: C.cream, fontSize: 12 }}>{chip.label} = {chip.value}</span>
            </div>
          ))}
        </div>
      </FeltCard>

      {!photo ? (
        <GoldBtn onClick={takePhoto} disabled={!cameraReady} style={{ width: "100%", padding: "16px" }}>
          📷 Take photo
        </GoldBtn>
      ) : (
        <div style={{ display: "flex", gap: 10 }}>
          <GoldBtn secondary onClick={retake} style={{ flex: 1 }}>Retake</GoldBtn>
          <GoldBtn onClick={countChips} disabled={counting} style={{ flex: 2 }}>
            {counting ? "Counting…" : "Count my chips →"}
          </GoldBtn>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SCREEN 6 — Results leaderboard
// ════════════════════════════════════════════════════════════════════════════
function ResultsScreen({ results, room }) {
  const sorted = [...results].sort((a, b) => b.totalPence - a.totalPence);
  const grandTotal = results.reduce((s, r) => s + r.totalPence, 0);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>♠</div>
        <h1 style={{ fontFamily: "Georgia, serif", color: C.gold, fontSize: 26, margin: 0 }}>Final count</h1>
        <p style={{ color: C.muted, fontSize: 14, margin: "6px 0 0" }}>Room {room.code}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {sorted.map((r, i) => (
          <div key={r.player.id} style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: i === 0 ? "rgba(201,168,76,0.15)" : C.feltMid,
            border: i === 0 ? `1px solid rgba(201,168,76,0.4)` : `1px solid ${C.feltRim}`,
            borderRadius: 12,
            padding: "16px 20px",
          }}>
            <span style={{ fontSize: 24, width: 32, textAlign: "center" }}>
              {medals[i] || `${i + 1}`}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ color: i === 0 ? C.goldSoft : C.cream, fontWeight: 600, fontSize: 16, margin: 0 }}>
                {r.player.name}
              </p>
              {r.breakdown && (
                <p style={{ color: C.muted, fontSize: 12, margin: "3px 0 0" }}>
                  {r.breakdown.map(b => `${b.qty}× ${b.chip.label}`).join(", ")}
                </p>
              )}
            </div>
            <span style={{
              fontFamily: "Georgia, serif",
              fontSize: 22,
              color: i === 0 ? C.gold : C.cream,
              fontWeight: 700,
            }}>
              {penceToDisplay(r.totalPence)}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        borderTop: `1px solid ${C.feltRim}`,
        paddingTop: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
      }}>
        <span style={{ color: C.muted, fontSize: 14 }}>Total pot</span>
        <span style={{ fontFamily: "Georgia, serif", color: C.goldSoft, fontSize: 28 }}>
          {penceToDisplay(grandTotal)}
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  ROOT — State machine
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  // screen: home | host-setup | lobby | player-wait | photo | photo-done | results
  const [screen, setScreen] = useState("home");
  const [room, setRoom] = useState(null);       // { code, chips }
  const [player, setPlayer] = useState(null);   // { id, name, isHost }
  const [players, setPlayers] = useState([]);   // all players
  const [results, setResults] = useState([]);   // submitted chip counts
  const [myResult, setMyResult] = useState(null);

  // Simulate real-time with localStorage polling (demo — replace with Socket.io in prod)
  // For the prototype we'll just manage state locally and simulate multi-player
  // with a "demo players" button in the lobby.

  function handleCreateRoom(name) {
    const code = genCode();
    const p = { id: "host-" + Date.now(), name, isHost: true };
    setPlayer(p);
    setRoom({ code, chips: [] });
    setPlayers([p]);
    setScreen("host-setup");
  }

  function handleJoinRoom(code, name) {
    // In production: look up room by code via server
    // For demo: join the in-memory room if code matches, or create a demo guest view
    if (room && code === room.code) {
      const p = { id: "player-" + Date.now(), name, isHost: false };
      setPlayer(p);
      setPlayers(pl => [...pl, p]);
      if (screen === "lobby" || screen === "host-setup") {
        setScreen("player-wait");
      }
    } else {
      // Demo: create a demo room for the guest
      alert(`In production, this would connect you to room ${code}.\n\nFor this demo, use the Create room flow and then simulate joining from the lobby.`);
    }
  }

  function handleChipsReady(chips) {
    setRoom(r => ({ ...r, chips: chips.map(c => ({ ...c, valuePence: parseValue(c.value) })) }));
    setScreen("lobby");
  }

  function handleStartCounting() {
    setScreen("photo");
  }

  function handlePhotoDone(result) {
    const newResults = [...results, result];
    setResults(newResults);
    setMyResult(result);

    // Check if all players have submitted (demo: host counts and we go to results)
    // In production: wait for all players' Socket.io events
    setScreen("results");
  }

  // Add demo players to lobby
  function addDemoPlayer() {
    const names = ["Sarah", "James", "Priya", "Tom", "Mei"];
    const existing = players.map(p => p.name);
    const next = names.find(n => !existing.includes(n));
    if (next) setPlayers(pl => [...pl, { id: "demo-" + Date.now(), name: next, isHost: false }]);
  }

  // Demo: simulate all players counting chips (random values) and show results
  function simulateAllCounted() {
    const allResults = players.map(p => {
      if (myResult && p.id === player.id) return myResult;
      const totalPence = Math.floor(Math.random() * 800) + 100;
      return {
        player: p,
        totalPence,
        breakdown: room.chips.map(c => ({
          chip: c,
          qty: Math.floor(Math.random() * 8),
          subtotal: 0,
        })),
      };
    });
    setResults(allResults);
    setScreen("results");
  }

  const bg = {
    minHeight: "100vh",
    background: C.felt,
    color: C.cream,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  };

  return (
    <div style={bg}>
      {screen === "home" && (
        <HomeScreen onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      )}
      {screen === "host-setup" && (
        <HostSetupScreen room={room} onReady={handleChipsReady} />
      )}
      {screen === "lobby" && (
        <div>
          <LobbyScreen room={room} players={players} onStartCounting={handleStartCounting} />
          {/* Demo controls */}
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 40px", display: "flex", gap: 10 }}>
            <button onClick={addDemoPlayer} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: `1px solid ${C.feltRim}`, borderRadius: 8, color: C.muted, padding: "10px", cursor: "pointer", fontSize: 13 }}>
              + Simulate player joining
            </button>
          </div>
        </div>
      )}
      {screen === "player-wait" && (
        <PlayerWaitScreen room={room} player={player} players={players} />
      )}
      {screen === "photo" && (
        <div>
          <PhotoScreen room={room} player={player} onDone={handlePhotoDone} />
          {/* Demo shortcut if no camera */}
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 40px" }}>
            <button
              onClick={simulateAllCounted}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px dashed ${C.feltRim}`, borderRadius: 8, color: C.muted, padding: "10px", cursor: "pointer", fontSize: 12, marginTop: 8 }}
            >
              Skip to results with simulated counts (demo)
            </button>
          </div>
        </div>
      )}
      {screen === "results" && (
        <ResultsScreen results={results} room={room} />
      )}
    </div>
  );
}
