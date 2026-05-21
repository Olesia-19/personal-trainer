import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.orb} aria-hidden="true" />
      <div className={styles.container}>
        <p className={styles.eyebrow}>Elite Personal Training</p>
        <h1 id="hero-heading" className={styles.headline}>
          Transform Your Body.
          <br />
          Elevate Your Performance.
        </h1>
        <p className={styles.subheadline}>
          Personal training designed to build strength, confidence, and real
          results.
        </p>
        <div className={styles.actions}>
          <a href="#book" className={styles.primaryCta}>
            Book a session
          </a>
          <a href="#learn" className={styles.secondaryCta}>
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
