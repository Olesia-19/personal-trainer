import styles from "./Footer.module.css";

const CONTACT_LINKS = [
  { label: "+1 (555) 010-0199", href: "tel:+15550100199" },
  { label: "hello@elite-demo.com", href: "mailto:hello@elite-demo.com" },
  { label: "@elite.demo", href: "#" },
] as const;

const NAV_LINKS = [
  { label: "Coach", href: "#approach" },
  { label: "Programs", href: "#services" },
  { label: "Results", href: "#services" },
  { label: "Book", href: "#book" },
] as const;

const LEGAL_LINES = ["© 2026 ELITE", "Concept demo", "All content is fictional"] as const;

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.wordmark} aria-hidden="true">
          <span className={styles.wordmarkText}>ELITE</span>
          <span className={styles.wordmarkSquare} />
        </div>

        <div className={styles.info}>
          <div className={styles.contacts}>
            {CONTACT_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className={styles.link}>
                {label}
              </a>
            ))}
          </div>

          <nav className={styles.nav} aria-label="Footer">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className={styles.navLink}>
                {label}
              </a>
            ))}
          </nav>

          <div className={styles.legal}>
            {LEGAL_LINES.map((line) => (
              <span key={line} className={styles.legalLine}>
                {line}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
