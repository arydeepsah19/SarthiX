import { useState, useEffect } from "react";
import { Menu, X, Truck } from "lucide-react";
import truck1 from "../assets/navbar/truck1.png";
import truck2 from "../assets/navbar/truck2.png";
import truck3 from "../assets/navbar/truck3.png";
import truck4 from "../assets/navbar/truck4.png";
import truck5 from "../assets/navbar/truck5.png";
import { useNavigate } from "react-router-dom";
import { ClerkLoaded, SignedIn, useUser, UserButton } from "@clerk/clerk-react";

const truckImages = [truck1, truck2, truck3, truck4, truck5];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const links = ["Features", "How It Works", "Reviews", "Contact"];
  const linkRoutes = {
    Features: "features",
    "How It Works": "how-it-works",
    Reviews: "reviews",
  };

  const handleClick = (link) => {
    const el = document.getElementById(linkRoutes[link]);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  useEffect(() => {
    const spawnTruck = () => {
      const id = Date.now();
      const duration = 7000 + Math.random() * 5000;
      const image = truckImages[Math.floor(Math.random() * truckImages.length)];
      setTrucks((p) => [...p, { id, duration, image }]);
      setTimeout(
        () => setTrucks((p) => p.filter((t) => t.id !== id)),
        duration,
      );
      setTimeout(spawnTruck, 3000 + Math.random() * 6000);
    };
    const t = setTimeout(spawnTruck, 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        :root { --orange: #f97316; --dark: #0c0c18; }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
          border-bottom: 1px solid transparent;
        }
        .nav.scrolled {
          background: rgba(12,12,24,0.88);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom-color: rgba(249,115,22,0.1);
        }
        .nav-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5vw; height: 68px; max-width: 1400px; margin: 0 auto;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 0.6rem;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.55rem; letter-spacing: 0.12em;
          color: #fff; text-decoration: none; flex-shrink: 0; z-index: 1;
        }
        .nav-logo-icon {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; background: var(--orange);
          clip-path: polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px));
          flex-shrink: 0;
        }
        .nav-logo span { color: var(--orange); }

        .nav-links {
          display: flex; align-items: center; gap: 0.25rem;
          list-style: none; margin: 0; padding: 0;
        }
        .nav-links a {
          display: block; padding: 0.45rem 0.9rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; font-weight: 400;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.5); text-decoration: none;
          position: relative; transition: color 0.2s; white-space: nowrap;
        }
        .nav-links a::after {
          content: ''; position: absolute;
          bottom: 0; left: 50%; right: 50%; height: 1px;
          background: var(--orange);
          transition: left 0.25s, right 0.25s;
        }
        .nav-links a:hover { color: rgba(255,255,255,0.9); }
        .nav-links a:hover::after { left: 0.9rem; right: 0.9rem; }

        .nav-actions { display: flex; align-items: center; gap: 0.75rem; }

        .nav-login {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.45); background: none; border: none;
          cursor: pointer; padding: 0.45rem 0.7rem; transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-login:hover { color: rgba(255,255,255,0.85); }

        .nav-cta {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #fff; background: var(--orange); border: none;
          padding: 0.6rem 1.4rem; cursor: pointer; white-space: nowrap;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
          transition: background 0.2s, transform 0.15s;
        }
        .nav-cta:hover { background: #fb923c; transform: translateY(-1px); }

        .nav-status {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.28rem 0.7rem;
          border: 1px solid rgba(249,115,22,0.2);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.62rem; letter-spacing: 0.18em;
          color: rgba(249,115,22,0.65); text-transform: uppercase;
          white-space: nowrap;
        }
        .nav-status-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--orange);
          animation: blink 1.4s ease-in-out infinite;
        }

        .nav-hamburger {
          display: none; background: none; border: none;
          color: rgba(255,255,255,0.7); cursor: pointer;
          padding: 0.3rem; transition: color 0.2s;
        }
        .nav-hamburger:hover { color: var(--orange); }

        /* Mobile drawer */
        .nav-mobile {
          display: none; flex-direction: column;
          background: rgba(12,12,24,0.97);
          border-top: 1px solid rgba(249,115,22,0.1);
          padding: 0.5rem 5vw 1.5rem;
          backdrop-filter: blur(18px);
          max-height: 0; overflow: hidden;
          transition: max-height 0.35s ease, padding 0.35s ease;
        }
        .nav-mobile.open {
          display: flex; max-height: 500px;
          padding: 1rem 5vw 1.5rem;
        }
        .nav-mobile a {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.5); text-decoration: none;
          padding: 0.9rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: color 0.2s;
        }
        .nav-mobile a:hover { color: var(--orange); }
        .nav-mobile-actions {
          display: flex; gap: 0.75rem; margin-top: 1.2rem; flex-wrap: wrap;
          align-items: center;
        }

        /* Truck parade */
        @keyframes driveTruck { from { left: -120px; } to { left: 110%; } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

        /* Clerk overrides */
        .cl-userButtonAvatarBox {
          width: 40px !important; height: 40px !important;
          border-radius: 4px !important;
          border: 1.5px solid #f97316 !important;
          background-color: #f97316 !important;
          box-shadow: 0 0 10px rgba(249,115,22,0.5) !important;
          transition: all 0.2s !important;
        }
        .cl-userButtonAvatarBox:hover {
          box-shadow: 0 0 16px rgba(249,115,22,0.7), 0 0 32px rgba(249,115,22,0.3) !important;
        }
        .cl-userButtonPopoverCard {
          background: rgba(6,11,20,0.98) !important;
          border: 1px solid rgba(249,115,22,0.25) !important;
          border-radius: 4px !important;
          box-shadow: 0 0 40px rgba(249,115,22,0.1), 0 16px 48px rgba(0,0,0,0.8) !important;
          backdrop-filter: blur(16px) !important;
        }
        .cl-userButtonPopoverFooter { display: none !important; }

        /* ── Responsive breakpoints ── */
        @media (max-width: 1100px) {
          .nav-status { display: none; }
        }
        @media (max-width: 900px) {
          .nav-links, .nav-login { display: none; }
          .nav-hamburger { display: flex; }
          .nav-cta { display: none; }
        }
        @media (max-width: 480px) {
          .nav-inner { padding: 0 4vw; height: 60px; }
          .nav-logo { font-size: 1.3rem; }
          .nav-logo-icon { width: 28px; height: 28px; }
          .nav-mobile a { font-size: 0.82rem; }
        }
      `}</style>

      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          {/* Logo */}
          <a
            href="#"
            className="nav-logo"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div className="nav-logo-icon">
              <Truck size={17} color="#fff" />
            </div>
            Sarth<span>ix</span>
          </a>

          {/* Desktop links */}
          <ul className="nav-links">
            {links.map((l) => (
              <li key={l}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(l);
                  }}
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="nav-actions">
            <div className="nav-status">
              <div className="nav-status-dot" />
              Live tracking
            </div>

            <button
              className="nav-cta"
              onClick={() => navigate(isSignedIn ? "/dashboard" : "/login")}
            >
              {isSignedIn ? "Dashboard" : "Get Started"}
            </button>

            <ClerkLoaded>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: "40px",
                        height: "40px",
                        borderRadius: "4px",
                        border: "1.5px solid #f97316",
                        backgroundColor: "#f97316",
                        boxShadow: "0 0 10px rgba(249,115,22,0.5)",
                        transition: "all 0.2s",
                      },
                      userButtonTrigger: { boxShadow: "none", outline: "none" },
                      userButtonPopoverCard: {
                        background: "rgba(6,11,20,0.98)",
                        border: "1px solid rgba(249,115,22,0.25)",
                        borderRadius: "4px",
                        boxShadow:
                          "0 0 40px rgba(249,115,22,0.1), 0 16px 48px rgba(0,0,0,0.8)",
                        backdropFilter: "blur(16px)",
                        padding: "4px",
                      },
                      userButtonPopoverFooter: { display: "none" },
                      userPreviewMainIdentifier: {
                        color: "#f97316",
                        fontSize: "12px",
                        fontWeight: "700",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      },
                      userButtonPopoverActionButton: {
                        color: "#e5e7eb",
                        fontSize: "13px",
                        fontWeight: "600",
                        borderRadius: "3px",
                        padding: "8px 12px",
                        background: "transparent",
                        transition: "all 0.15s",
                      },
                      userButtonPopoverActionButtonIcon: {
                        color: "rgba(249,115,22,0.6)",
                      },
                      userButtonPopoverActionButton__signOut: {
                        color: "#ef4444",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: "3px",
                        marginTop: "4px",
                      },
                      userButtonPopoverActionButtonIcon__signOut: {
                        color: "#ef4444",
                      },
                    },
                    variables: {
                      colorPrimary: "#f97316",
                      colorBackground: "rgba(6,11,20,0.98)",
                      colorText: "#e5e7eb",
                      borderRadius: "3px",
                    },
                  }}
                />
              </SignedIn>
            </ClerkLoaded>

            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`nav-mobile${menuOpen ? " open" : ""}`}>
          {links.map((l) => (
            <a
              href="#"
              key={l}
              onClick={(e) => {
                e.preventDefault();
                handleClick(l);
              }}
            >
              {l}
            </a>
          ))}
          <div className="nav-mobile-actions">
            <button
              className="nav-cta"
              style={{ display: "flex" }}
              onClick={() => {
                setMenuOpen(false);
                navigate(isSignedIn ? "/dashboard" : "/login");
              }}
            >
              {isSignedIn ? "Dashboard" : "Get Started"}
            </button>
            <ClerkLoaded>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: 34,
                        height: 34,
                        border: "1px solid rgba(249,115,22,0.4)",
                        borderRadius: "3px",
                      },
                    },
                  }}
                />
              </SignedIn>
            </ClerkLoaded>
          </div>
        </div>

        {/* Truck parade */}
        <div
          style={{
            position: "absolute",
            bottom: -18,
            left: 0,
            right: 0,
            height: 36,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 99,
          }}
        >
          {trucks.map((truck) => (
            <img
              key={truck.id}
              src={truck.image}
              alt=""
              style={{
                position: "absolute",
                bottom: 0,
                height: 34,
                animation: `driveTruck ${truck.duration}ms linear forwards`,
              }}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
