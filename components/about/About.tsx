import styles from "./About.module.css";

const PHILOSOPHY_COLUMNS = [
  {
    title: "Precise Training",
    text: "Every rep and program is built on sports science, tailored perfectly to your metabolic profile and goals.",
  },
  {
    title: "Total Nutrition",
    text: "No restrictive diets. We integrate high-performance nutrition seamlessly into your high-achieving lifestyle.",
  },
  {
    title: "Relentless Focus",
    text: "Uncompromising accountability and elite coaching to ensure you achieve results that stay with you forever.",
  },
] as const;

const About = () => {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      <div className={styles.container}>
        <p className={styles.eyebrow}>THE PHILOSOPHY</p>
        <h2 id="about-heading" className={styles.headline}>
          We don&apos;t just change bodies. We upgrade lifestyles.
        </h2>
        <div className={styles.columns} role="list" aria-label="Philosophy pillars">
          {PHILOSOPHY_COLUMNS.map((column) => (
            <article key={column.title} className={styles.column} role="listitem">
              <h3 className={styles.columnTitle}>{column.title}</h3>
              <p className={styles.columnText}>{column.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
