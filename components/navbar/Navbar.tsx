"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import styles from "./Navbar.module.css";

/** Matches the CSS breakpoint where the mobile menu is hidden. */
const DESKTOP_MEDIA = "(min-width: 860px)";

const NAV_LINKS = [
  { label: "Approach", href: "#approach" },
  { label: "Programs", href: "#services" },
  { label: "Results", href: "#services" },
  { label: "FAQ", href: "#book" },
] as const;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // The mobile menu is display: none on desktop; close it if the viewport
  // grows past the breakpoint so the scroll lock is released.
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const desktopQuery = window.matchMedia(DESKTOP_MEDIA);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMenuOpen(false);
      }
    };

    desktopQuery.addEventListener("change", handleChange);
    return () => desktopQuery.removeEventListener("change", handleChange);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const closeMenuAndRefocus = () => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  };

  // Header holds both the toggle and the mobile nav, so the toggle stays
  // reachable for closing while focus is kept inside the open menu.
  useFocusTrap({
    containerRef: headerRef,
    active: menuOpen,
    onEscape: closeMenuAndRefocus,
    initialFocusRef: firstMobileLinkRef,
  });

  return (
    <header ref={headerRef} className={styles.navbar} data-site-header>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          ELITE<span className={styles.logoDot}>.</span>
        </Link>

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
          <a
            href="#book"
            className={`btn btn-primary ${styles.cta}`}
            onClick={closeMenu}
          >
            Book a session
          </a>

          <button
            ref={toggleRef}
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
          {NAV_LINKS.map(({ label, href }, index) => (
            <li key={label}>
              <a
                ref={index === 0 ? firstMobileLinkRef : undefined}
                href={href}
                className={styles.mobileLink}
                onClick={closeMenu}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#book"
              className={`btn btn-primary ${styles.mobileCta}`}
              onClick={closeMenu}
            >
              Book a session
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
