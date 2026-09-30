import { forwardRef } from "react";
import styles from "./HeroVideo.module.css";

const HeroVideo = forwardRef<HTMLVideoElement>(function HeroVideo(_, ref) {
  return (
    <div className={styles.media} aria-hidden="true">
      <video
        ref={ref}
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
      >
        <source src="/videos/hero-barbell.mp4" type="video/mp4" />
      </video>
      <div className={styles.grain} />
      <div className={styles.scrim} />
    </div>
  );
});

export default HeroVideo;
