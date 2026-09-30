"use client";

import { Fraunces } from "next/font/google";
import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const NAV_LINKS = [
  { label: "Coach", href: "#about" },
  { label: "Programs", href: "#services" },
  { label: "Results", href: "#services" },
  { label: "FAQ", href: "#book" },
] as const;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`${styles.navbar} ${fraunces.variable}`}
      data-site-header
    >
      <div className={styles.inner}>
        <a href="/" className={styles.logo} onClick={closeMenu}>
          ELITE<span className={styles.logoDot}>.</span>
        </a>

        <nav className={styles.desktopNav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className={styles.navLink}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.trailing}>
          <a href="#book" className={styles.cta} onClick={closeMenu}>
            Book a session
          </a>

          <button
            type="button"
            className={`${styles.menuToggle} ${menuOpen ? styles.menuToggleOpen : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.menuBar} />
            <span className={styles.menuBar} />
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <ul className={styles.mobileList}>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href} className={styles.mobileLink} onClick={closeMenu}>
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href="#book" className={styles.mobileCta} onClick={closeMenu}>
              Book a session
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
