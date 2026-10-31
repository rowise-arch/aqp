import Cursor from "@/components/Cursor";
import Effects from "@/components/Effects";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Reel from "@/components/Reel";
import Menu from "@/components/Menu";
import Looks from "@/components/Looks";
import Categories from "@/components/Categories";
import Overture from "@/components/Overture";
import Team from "@/components/Team";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import Faq from "@/components/Faq";
import Visit from "@/components/Visit";
import { getSiteData } from "@/lib/site-data";

export default async function Home() {
  const site = await getSiteData();
  return (
    <>
      <Effects />
      <Cursor />
      <Header />
      <main id="main">
        <Hero />
        <Looks />
        <Intro />
        <Categories services={site.services} />
        <Overture services={site.services} />
        <Menu services={site.services} />
        <Reel />
        <Team />
        <Booking services={site.services} hours={site.hours} />
        <Visit hours={site.hours} policy={site.policy} reviews={site.reviews} sample={site.sample} />
        <Faq items={site.faq} sample={site.sample.faq} />
      </main>
      <Footer />
    </>
  );
}
