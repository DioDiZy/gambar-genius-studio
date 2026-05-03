import { useState, useEffect } from "react";

const kidStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&display=swap');

  .pg * { box-sizing: border-box; }
  .pg { font-family: 'Nunito', sans-serif; background: #FFF9F0; color: #2D2D2D; overflow-x: hidden; }
  .pg h1, .pg h2, .pg h3 { font-family: 'Baloo 2', cursive; }

  @keyframes float-up-down {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-18px) rotate(3deg); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
    50% { opacity: 0.4; transform: scale(0.6) rotate(20deg); }
  }
  @keyframes rainbow-glow {
    0%   { box-shadow: 0 8px 0 #C4421A, 0 12px 30px rgba(255,107,43,0.45); }
    33%  { box-shadow: 0 8px 0 #B5007A, 0 12px 30px rgba(255,77,157,0.45); }
    66%  { box-shadow: 0 8px 0 #1E6FAE, 0 12px 30px rgba(52,152,219,0.45); }
    100% { box-shadow: 0 8px 0 #C4421A, 0 12px 30px rgba(255,107,43,0.45); }
  }
  @keyframes cloud-drift {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(25px); }
  }
  @keyframes slide-up {
    from { transform: translateY(40px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes menu-drop {
    from { opacity: 0; transform: translateY(-10px) scaleY(0.94); }
    to   { opacity: 1; transform: translateY(0)     scaleY(1); }
  }

  .pg .float   { animation: float-up-down 4s   ease-in-out infinite; }
  .pg .float-2 { animation: float-up-down 5s   ease-in-out infinite 1.2s; }
  .pg .float-3 { animation: float-up-down 3.5s ease-in-out infinite 0.6s; }
  .pg .twinkle   { animation: twinkle 2.5s ease-in-out infinite; }
  .pg .twinkle-2 { animation: twinkle 1.8s ease-in-out infinite 0.8s; }
  .pg .twinkle-3 { animation: twinkle 3s   ease-in-out infinite 1.5s; }
  .pg .cloud-drift   { animation: cloud-drift 8s  ease-in-out infinite; }
  .pg .cloud-drift-2 { animation: cloud-drift 11s ease-in-out infinite 3s; }
  .pg .slide-up   { animation: slide-up 0.7s ease both; }
  .pg .slide-up-2 { animation: slide-up 0.7s ease both 0.15s; }
  .pg .slide-up-3 { animation: slide-up 0.7s ease both 0.3s; }

  /* ── NAVBAR ── */
  .pg .nav-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 20px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px; position: relative;
  }
  .pg .nav-logo {
    display: flex; align-items: center; gap: 8px;
    text-decoration: none; flex-shrink: 0;
  }
  .pg .nav-logo-text {
    font-family: 'Baloo 2', cursive; font-size: 22px; font-weight: 800;
    background: linear-gradient(90deg, #FF5A1F, #FF4D8D, #9B59B6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .pg .nav-desktop { display: flex; align-items: center; gap: 4px; }
  .pg .nav-link {
    font-family: 'Baloo 2', cursive; font-weight: 700; font-size: 16px;
    color: #444; text-decoration: none; padding: 8px 16px; border-radius: 50px;
    transition: background 0.18s, color 0.18s, transform 0.15s; white-space: nowrap;
  }
  .pg .nav-link:hover { background: #FFE5D0; color: #FF5A1F; transform: scale(1.05); }

  /* Hamburger — hidden on desktop, shown on mobile */
  .pg .hamburger {
    display: none; flex-direction: column; justify-content: center; align-items: center;
    gap: 5px; width: 44px; height: 44px;
    background: #FFE5D0; border: none; border-radius: 12px;
    cursor: pointer; padding: 0; flex-shrink: 0;
    transition: background 0.18s;
  }
  .pg .hamburger:hover { background: #FFD0B0; }
  .pg .hamburger span {
    display: block; width: 22px; height: 3px;
    background: #FF5A1F; border-radius: 3px;
    transition: transform 0.25s, opacity 0.2s;
    transform-origin: center;
  }
  .pg .hamburger.open span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
  .pg .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .pg .hamburger.open span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

  /* Mobile dropdown */
  .pg .mobile-menu {
    display: none; position: absolute; top: 100%; left: 0; right: 0;
    background: rgba(255,249,240,0.98); backdrop-filter: blur(10px);
    border-bottom: 3px solid #FFE0C8; padding: 14px 20px 20px;
    flex-direction: column; gap: 6px;
    animation: menu-drop 0.22s ease both; z-index: 50;
  }
  .pg .mobile-menu.open { display: flex; }
  .pg .mobile-nav-link {
    font-family: 'Baloo 2', cursive; font-weight: 700; font-size: 18px; color: #444;
    text-decoration: none; padding: 12px 16px; border-radius: 16px; display: block;
    transition: background 0.18s, color 0.18s;
  }
  .pg .mobile-nav-link:hover { background: #FFE5D0; color: #FF5A1F; }
  .pg .mobile-cta { display: block; text-align: center; margin-top: 6px; }

  @media (max-width: 680px) {
    .pg .nav-desktop  { display: none; }
    .pg .hamburger    { display: flex; }
    .pg .nav-logo-text{ font-size: 18px; }
  }

  /* ── BUTTONS ── */
  .pg .btn-kid {
    display: inline-block; padding: 14px 34px; border-radius: 60px; border: none;
    font-family: 'Baloo 2', cursive; font-size: 19px; font-weight: 700;
    cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
    text-decoration: none; letter-spacing: 0.3px;
  }
  .pg .btn-kid:hover  { transform: translateY(-4px) scale(1.04); }
  .pg .btn-kid:active { transform: translateY(1px)  scale(0.97); }
  .pg .btn-orange {
    background: linear-gradient(160deg, #FF8040, #FF5A1F); color: white;
    box-shadow: 0 7px 0 #B83500, 0 10px 25px rgba(255,90,31,0.4);
  }
  .pg .btn-orange:hover {
    box-shadow: 0 10px 0 #B83500, 0 14px 30px rgba(255,90,31,0.5);
    animation: rainbow-glow 2s ease infinite;
  }
  .pg .btn-white {
    background: white; color: #FF5A1F;
    border: 3.5px solid #FF5A1F; box-shadow: 0 6px 0 #FF5A1F;
  }
  .pg .btn-white:hover { box-shadow: 0 9px 0 #FF5A1F; }

  /* ── CARDS ── */
  .pg .feature-card {
    border-radius: 28px; padding: 30px 24px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative; overflow: hidden;
  }
  .pg .feature-card::before {
    content: ''; position: absolute; top: -20px; right: -20px;
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
  }
  .pg .feature-card:hover {
    transform: translateY(-8px) rotate(-1.5deg) scale(1.02);
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  }
  .pg .example-card {
    border-radius: 24px; overflow: hidden;
    transition: transform 0.2s;
  }
  .pg .example-card:hover { transform: scale(1.04) rotate(1deg); }

  /* ── MISC ── */
  .pg .star-deco { position: absolute; pointer-events: none; user-select: none; }
  .pg .section-title {
    font-family: 'Baloo 2', cursive; font-size: 40px; font-weight: 800;
    display: inline-block;
  }
  .pg .section-title::after {
    content: ''; display: block; height: 6px; border-radius: 6px; margin-top: 6px;
    background: linear-gradient(90deg, #FF5A1F, #FF4D8D, #9B59B6);
  }
  .pg .section-title-wrap { text-align: center; margin-bottom: 48px; }
  .pg .wave-div { width: 100%; overflow: hidden; line-height: 0; display: block; }
  .pg .wave-div svg { display: block; }

  @media (max-width: 480px) {
    .pg .section-title { font-size: 26px; }
    .pg .btn-kid { font-size: 16px; padding: 12px 24px; }
  }
`;

const features = [
  { emoji: "✨", title: "Gambar Keren Banget!", description: "Gambar yang kamu buat bakal jernih dan detil, siap dipajang atau dicetak!", bg: "#FFF3B0", border: "#F5C800", iconBg: "#FFD700" },
  { emoji: "⚡", title: "Super Cepat!", description: "Dalam hitungan detik, gambar impianmu langsung jadi. Secepat kilat!", bg: "#D0F0FF", border: "#47B8E0", iconBg: "#47B8E0" },
  { emoji: "🎨", title: "Pilih Gaya Suka-suka", description: "Mau kartun, realistis, atau seperti lukisan? Semua bisa kamu pilih!", bg: "#FFD6F0", border: "#FF6BB5", iconBg: "#FF6BB5" },
  { emoji: "💾", title: "Simpan & Bagikan", description: "Simpan gambarmu ke HP atau komputer, lalu bagikan ke teman-teman!", bg: "#D4F5E2", border: "#2ECC71", iconBg: "#2ECC71" },
  { emoji: "📱", title: "Bisa di HP Kamu!", description: "Buat gambar seru kapan saja dan di mana saja lewat HP-mu!", bg: "#E8D8FF", border: "#9B59B6", iconBg: "#9B59B6" },
  { emoji: "🔄", title: "Coba Terus!", description: "Satu deskripsi bisa bikin banyak gambar berbeda. Mana yang paling keren?", bg: "#FFE0CC", border: "#FF7043", iconBg: "#FF7043" },
];

const examples = [
  { label: "Kota masa depan penuh cahaya warna-warni", image: "/DashboardAssets/kota.webp", bg: "linear-gradient(135deg,#1a1a4e,#4a0080,#00aaff)" },
  { label: "Naga mini lucu duduk di puncak gunung", image: "/DashboardAssets/naga.webp", bg: "linear-gradient(135deg,#2ecc71,#27ae60,#1a5c30)" },
  { label: "Robot bersahabat yang suka memasak", image: "/DashboardAssets/robot.webp", bg: "linear-gradient(135deg,#3498db,#2980b9,#1a5276)" },
  { label: "Petualangan bawah laut penuh ikan lucu", image: "/DashboardAssets/ikan.webp", bg: "linear-gradient(135deg,#00c6ff,#0072ff,#003380)" },
  { label: "Kucing astronot di planet bintang", image: "/DashboardAssets/kucing.webp", bg: "linear-gradient(135deg,#8e44ad,#6c3483,#2c1654)" },
  { label: "Peri hutan menjaga bunga ajaib", image: "/DashboardAssets/bunga.webp", bg: "linear-gradient(135deg,#ff6b9d,#c0392b,#7d1010)" },
];

const NAV_LINKS = [
  ["#features", "Fitur"],
  ["#demo", "Contoh"],
];

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (!e.target.closest(".pg nav")) setMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="pg">
      <style>{kidStyles}</style>

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,249,240,0.96)",
          backdropFilter: "blur(8px)",
          borderBottom: "3px solid #FFE0C8",
        }}
      >
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <span style={{ fontSize: 30 }}>🎨</span>
            <span className="nav-logo-text">PembuatGambar</span>
          </a>

          {/* Desktop */}
          <div className="nav-desktop">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            ))}
            <a href="/signin" className="btn-kid btn-orange" style={{ fontSize: 15, padding: "10px 22px", marginLeft: 10 }}>
              Masuk Yuk! 🚀
            </a>
          </div>

          {/* Hamburger */}
          <button className={`hamburger${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? "Tutup menu" : "Buka menu"}>
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} className="mobile-nav-link" onClick={closeMenu}>
              {label}
            </a>
          ))}
          <a href="/signin" className="btn-kid btn-orange mobile-cta" onClick={closeMenu}>
            Masuk Yuk! 🚀
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(175deg, #87CEEB 0%, #B0E0FF 35%, #FFF9F0 100%)",
          paddingTop: 80,
          paddingBottom: 0,
          minHeight: 600,
        }}
      >
        {[
          { left: "5%", top: 40, size: 120 },
          { left: "75%", top: 60, size: 90 },
          { left: "50%", top: 20, size: 70 },
        ].map((c, i) => (
          <div
            key={i}
            className={i % 2 === 0 ? "cloud-drift" : "cloud-drift-2"}
            style={{
              position: "absolute",
              left: c.left,
              top: c.top,
              width: c.size,
              height: c.size * 0.55,
              background: "rgba(255,255,255,0.85)",
              borderRadius: "50px",
              boxShadow: `0 4px 20px rgba(255,255,255,0.5), ${c.size * 0.25}px -${c.size * 0.2}px 0 ${c.size * 0.1}px rgba(255,255,255,0.8)`,
            }}
          />
        ))}

        {[
          { top: "12%", left: "10%", cls: "twinkle", sz: 30 },
          { top: "18%", left: "88%", cls: "twinkle-2", sz: 26 },
          { top: "65%", left: "4%", cls: "twinkle-3", sz: 22 },
          { top: "72%", left: "93%", cls: "twinkle", sz: 28 },
        ].map((s, i) => (
          <span key={i} className={`star-deco ${s.cls}`} style={{ top: s.top, left: s.left, fontSize: s.sz }}>
            ⭐
          </span>
        ))}

        <div className="float" style={{ position: "absolute", top: "15%", right: "8%", fontSize: 58, zIndex: 1 }}></div>
        <div className="float-2" style={{ position: "absolute", bottom: "22%", left: "6%", fontSize: 46, zIndex: 1 }}>
          🎭
        </div>
        <div className="float-3" style={{ position: "absolute", top: "60%", right: "11%", fontSize: 40, zIndex: 1 }}>
          🪄
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", padding: "0 20px 100px", position: "relative", zIndex: 2 }}>
          <div
            className="slide-up"
            style={{
              display: "inline-block",
              background: "#FFD700",
              color: "#7A4000",
              padding: "6px 22px",
              borderRadius: 50,
              fontFamily: "'Baloo 2', cursive",
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 24,
              boxShadow: "0 4px 0 #C49000",
            }}
          >
            ✨ Gambar Seru Pakai AI ✨
          </div>

          <h1
            className="slide-up-2"
            style={{
              fontSize: "clamp(30px, 7vw, 64px)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 20,
              color: "#1A1A2E",
            }}
          >
            Buat Gambar <span style={{ background: "linear-gradient(90deg,#FF5A1F,#FF4D8D,#9B59B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Impianmu</span>
            <br />
            dengan Keajaiban AI! 🎨
          </h1>

          <p
            className="slide-up-3"
            style={{
              fontSize: "clamp(15px, 2.5vw, 19px)",
              fontWeight: 600,
              color: "#445566",
              maxWidth: 580,
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Tulis apa yang kamu bayangkan — robot, naga, pemandangan keren — dan AI akan membuatkannya jadi gambar yang nyata! Semudah itu! 🚀
          </p>

          <div className="slide-up-3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/signup" className="btn-kid btn-orange">
              🎉 Ayo Mulai Berkarya!
            </a>
            <a href="#demo" className="btn-kid btn-white">
              👀 Lihat Contohnya
            </a>
          </div>
        </div>

        <div className="wave-div">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ height: 80, width: "100%" }}>
            <path d="M0,40 C360,90 1080,-10 1440,40 L1440,80 L0,80 Z" fill="#FFF9F0" />
          </svg>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 20px", background: "#FFF9F0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="section-title-wrap">
            <span className="section-title">🌟 Fitur Keren Kami!</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 22 }}>
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card"
                style={{
                  background: f.bg,
                  border: `3px solid ${f.border}`,
                  boxShadow: `0 8px 0 ${f.border}, 0 12px 30px ${f.border}44`,
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    background: f.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    marginBottom: 16,
                    boxShadow: `0 4px 0 ${f.border}99`,
                  }}
                >
                  {f.emoji}
                </div>
                <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, marginBottom: 10, color: "#1A1A2E" }}>{f.title}</h3>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#445566", lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wave-div" style={{ background: "#FFF9F0" }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ height: 80, width: "100%", display: "block" }}>
          <path d="M0,20 C480,80 960,0 1440,50 L1440,80 L0,80 Z" fill="#EBF8FF" />
        </svg>
      </div>

      {/* ── EXAMPLES ── */}
      <section id="demo" style={{ padding: "80px 20px", background: "#EBF8FF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="section-title-wrap">
            <span className="section-title">🖼️ Gambar yang Bisa Kamu Buat!</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 22 }}>
            {examples.map((ex, i) => (
              <div
                key={i}
                className="example-card"
                style={{
                  background: "white",
                  border: "3px solid #D0E8FF",
                  boxShadow: "0 6px 0 #A0C8F0, 0 10px 25px rgba(0,0,0,0.08)",
                  borderRadius: "12px", // Tambahan agar lebih smooth
                  overflow: "hidden",
                }}
              >
                {/* Container Gambar dengan Overlay */}
                <div
                  style={{
                    height: 190,
                    background: ex.bg,
                    position: "relative", // Wajib agar overlay & teks bisa diposisikan absolute
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {/* Gambar Utama */}
                  <img
                    src={ex.image}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover", // Supaya gambar tidak gepeng
                    }}
                  />

                  {/* Lapisan Gelap (Overlay) */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6))", // Gradasi dari agak terang ke gelap
                      zIndex: 1,
                    }}
                  />
                </div>

                {/* Bagian Deskripsi Bawah */}
                <div style={{ padding: "14px 18px" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#2C4A6E", lineHeight: 1.5, textAlign: "center" }}>"{ex.label}"</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#445566", marginBottom: 20 }}>Kamu bisa membuat apa saja yang kamu bayangkan! 🌈</p>
            <a href="/signup" className="btn-kid btn-orange">
              🎨 Coba Sekarang, Gratis!
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: "100px 20px",
          background: "linear-gradient(135deg, #FF5A1F 0%, #FF4D8D 50%, #9B59B6 100%)",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div className="float" style={{ position: "absolute", top: "10%", left: "5%", fontSize: 68, opacity: 0.55 }}>
          🌟
        </div>
        <div className="float-2" style={{ position: "absolute", top: "20%", right: "5%", fontSize: 76, opacity: 0.55 }}>
          🎨
        </div>
        <div className="float-3" style={{ position: "absolute", bottom: "10%", left: "14%", fontSize: 58, opacity: 0.45 }}>
          ✨
        </div>
        <div className="float" style={{ position: "absolute", bottom: "14%", right: "12%", fontSize: 62, opacity: 0.45 }}>
          🚀
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 62, marginBottom: 16 }}>🏆</div>
          <h2
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: "clamp(24px, 5vw, 50px)",
              fontWeight: 800,
              color: "white",
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            Siap Jadi Seniman AI yang Keren?
          </h2>
          <p style={{ fontSize: "clamp(14px, 2.5vw, 19px)", fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 40, lineHeight: 1.6 }}>
            Bergabung bersama ribuan anak-anak yang sudah berkarya! Daftar sekarang dan dapatkan 20 gambar GRATIS! 🎁
          </p>
          <a
            href="/signup"
            className="btn-kid"
            style={{
              background: "white",
              color: "#FF5A1F",
              boxShadow: "0 8px 0 rgba(0,0,0,0.2), 0 16px 40px rgba(0,0,0,0.2)",
              fontSize: "clamp(16px, 3vw, 22px)",
            }}
          >
            🎉 Daftar Gratis Sekarang!
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1A1A2E", padding: "40px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 26 }}>🎨</span>
              <span style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, background: "linear-gradient(90deg,#FF5A1F,#FF4D8D,#9B59B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                PembuatGambar
              </span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>© 2025 PembuatGambar. Hak cipta dilindungi. 💫</p>
          </div>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            {["Kebijakan Privasi", "Syarat & Ketentuan", "Hubungi Kami"].map((label) => (
              <a
                key={label}
                href="#"
                style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#FF5A1F")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
