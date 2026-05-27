"use client";

import { useState, type KeyboardEvent, type MouseEvent } from "react";
import styles from "./TrainingExperiences.module.css";

const EXPERIENCES = [
  {
    id: "strength-coaching",
    number: "01",
    title: "Strength Coaching",
    description:
      "Progressive overload, precise form, and programs built for measurable strength gains.",
    banner: false,
    glow: "topLeft" as const,
    details: {
      subtitle: "Program modules",
      list: "1. Progressive Overload. 2. Precise Form & Technique. 3. Periodized Programming.",
      price: "$199 / month",
    },
  },
  {
    id: "athletic-performance",
    number: "02",
    title: "Athletic Performance",
    description:
      "Speed, power, and agility work tailored to your sport and competition calendar.",
    banner: false,
    glow: "topRight" as const,
    details: {
      subtitle: "Performance pillars",
      list: "1. Speed & Acceleration. 2. Power Development. 3. Sport-Specific Conditioning.",
      price: "$249 / month",
    },
  },
  {
    id: "online-transformation",
    number: "03",
    title: "Online Transformation",
    description:
      "Remote coaching with weekly check-ins, custom training, and accountability that scales.",
    banner: true,
    glow: "bottomRight" as const,
    details: {
      subtitle: "Remote coaching",
      list: "1. Custom Training Plans. 2. Weekly Video Check-ins. 3. Nutrition & Habit Tracking.",
      price: "$149 / month",
    },
  },
] as const;

const GLOW_CLASS = {
  topLeft: styles.glowTopLeft,
  topRight: styles.glowTopRight,
  bottomRight: styles.glowBottomRight,
} as const;

const TrainingExperiences = () => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const handleCardClick = (id: string) => {
    setActiveCardId((prev) => (prev === id ? null : id));
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    id: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick(id);
    }
  };

  const handleApplyClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <section
      id="services"
      className={styles.section}
      aria-labelledby="training-experiences-heading"
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>What we offer</p>
          <h2 id="training-experiences-heading" className={styles.title}>
            Training Experiences
          </h2>
          <p className={styles.lead}>
            Three focused paths—each structured, coached, and built for results.
          </p>
        </header>

        <ul className={styles.grid} role="list">
          {EXPERIENCES.map(
            ({
              id,
              number,
              title,
              description,
              banner,
              glow,
              details,
            }) => {
              const isActive = activeCardId === id;

              return (
                <li
                  key={id}
                  className={banner ? styles.gridBanner : undefined}
                >
                  <div
                    className={`${styles.cardContainer} ${banner ? styles.cardContainerLarge : ""} ${isActive ? styles.cardContainerActive : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isActive}
                    aria-label={`${title}. ${isActive ? "Showing details. Click to flip back." : "Click to view details."}`}
                    onClick={() => handleCardClick(id)}
                    onKeyDown={(event) => handleCardKeyDown(event, id)}
                  >
                    <div
                      className={`${styles.cardInner} ${isActive ? (banner ? styles.cardInnerFlippedLarge : styles.cardInnerFlipped) : ""}`}
                    >
                      <div
                        className={`${styles.cardFront} ${banner ? styles.cardFrontBanner : styles.cardFrontStandard}`}
                      >
                        <span
                          className={`${styles.cardGlow} ${GLOW_CLASS[glow]}`}
                          aria-hidden="true"
                        />
                        {banner ? (
                          <div className={styles.cardFaceContent}>
                            <div className={styles.bannerLeft}>
                              <span className={styles.number}>{number}</span>
                              <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>{title}</h3>
                                <p className={styles.cardDescription}>
                                  {description}
                                </p>
                              </div>
                            </div>
                            <span className={styles.arrow} aria-hidden="true">
                              →
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`${styles.cardFaceContent} ${styles.cardFaceContentStandard}`}
                          >
                            <span className={styles.number}>{number}</span>
                            <div className={styles.cardBody}>
                              <h3 className={styles.cardTitle}>{title}</h3>
                              <p className={styles.cardDescription}>
                                {description}
                              </p>
                            </div>
                            <span
                              className={`${styles.arrow} ${styles.arrowInline}`}
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={styles.cardBack}>
                        <span
                          className={`${styles.cardGlow} ${GLOW_CLASS[glow]}`}
                          aria-hidden="true"
                        />
                        <span className={styles.flipClose} aria-hidden="true">
                          ←
                        </span>
                        <div className={styles.cardBackContent}>
                          <p className={styles.detailsSubtitle}>
                            {details.subtitle}
                          </p>
                          <p className={styles.detailsList}>{details.list}</p>
                          <p className={styles.detailsPrice}>{details.price}</p>
                          <button
                            type="button"
                            className={styles.applyBtn}
                            onClick={handleApplyClick}
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            },
          )}
        </ul>
      </div>
    </section>
  );
};

export default TrainingExperiences;
