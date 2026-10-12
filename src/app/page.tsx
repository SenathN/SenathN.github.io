import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Descent from "@/components/Descent";
import DepthSection from "@/components/DepthSection";
import Work from "@/components/Work";
import Logbook from "@/components/Logbook";
import Approach from "@/components/Approach";
import FieldNotes from "@/components/FieldNotes";
import Contact, { SiteFooter } from "@/components/Contact";
import CurrentField from "@/components/CurrentField";
import DepthSystem from "@/components/DepthSystem";

export default function Home() {
  return (
    <>
      <Nav />
      <div className="page">
        <div className="page-bg" aria-hidden="true" />
        <CurrentField />
        <main id="main">
          <Hero />
          <Descent />
          <DepthSection />
          <Work />
          <Logbook />
          <Approach />
          <FieldNotes />
          <Contact />
        </main>
        <SiteFooter />
      </div>
      <DepthSystem />
    </>
  );
}
