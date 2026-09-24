import { forwardRef } from "react";
import styles from "./HeroVideo.module.css";

const CLOUDINARY_BASE =
  "https://res.cloudinary.com/dzqk9wipf/video/upload";
const VIDEO_ID = "1797a332-53a4-42fd-9ccb-89c012e34178_vsosnr";

const POSTER_SRC = `${CLOUDINARY_BASE}/q_auto,f_auto,w_1920,so_0/${VIDEO_ID}.jpg`;

const HeroVideo = forwardRef<HTMLVideoElement>(function HeroVideo(_, ref) {
  return (
    <div className={styles.media} aria-hidden="true">
      <video
        ref={ref}
        className={styles.video}
        poster={POSTER_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
      >
        <source
          src={`${CLOUDINARY_BASE}/q_auto:best,f_auto,w_1920/${VIDEO_ID}.mp4`}
          type="video/mp4"
          media="(min-width: 1024px)"
        />
        <source
          src={`${CLOUDINARY_BASE}/q_auto:good,f_auto,w_1280/${VIDEO_ID}.mp4`}
          type="video/mp4"
          media="(min-width: 601px)"
        />
        <source
          src={`${CLOUDINARY_BASE}/q_auto:good,f_auto,w_800/${VIDEO_ID}.mp4`}
          type="video/mp4"
        />
      </video>
      <div className={styles.scrim} />
    </div>
  );
});

export default HeroVideo;
