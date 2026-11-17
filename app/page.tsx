import Hero from "@/components/hero/Hero";
import Approach from "@/components/approach/Approach";
import Navbar from "@/components/navbar/Navbar";
import BookingSection from "@/components/booking-section/BookingSection";
import TrainingExperiences from "@/components/training-experiences/TrainingExperiences";
import StatStrip from "@/components/stat-strip/StatStrip";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="skip-target" tabIndex={-1}>
        <Hero />
        <StatStrip />
        <Approach />
        <TrainingExperiences />
        <BookingSection />
      </main>
      <Footer />
    </>
  );
}
