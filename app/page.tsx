import Hero from "@/components/hero/Hero";
import Navbar from "@/components/navbar/Navbar";
import TrainingExperiences from "@/components/training-experiences/TrainingExperiences";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrainingExperiences />
    </main>
  );
}
