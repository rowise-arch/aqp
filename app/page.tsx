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

export default function Home() {
  return (
    <>
      <Effects />
      <Cursor />
      <Header />
      <main id="main">
        <Hero />
        <Looks />
        <Intro />
        <Categories />
        <Overture />
        <Menu />
        <Reel />
        <Team />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
