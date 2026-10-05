import Hero from "@/components/hero/Hero";
import Approach from "@/components/approach/Approach";
import Navbar from "@/components/navbar/Navbar";
import BookingSection from "@/components/booking-section/BookingSection";
import TrainingExperiences from "@/components/training-experiences/TrainingExperiences";
import StatStrip from "@/components/stat-strip/StatStrip";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatStrip />
        <Approach />
        <TrainingExperiences />
        <BookingSection />
      </main>
    </>
  );
}
