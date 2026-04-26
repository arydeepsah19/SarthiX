import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorks";
import ReviewsSection from "../components/ReviewsSection";
import Footer from "../components/Footer";
import TruckLoader from "../TruckLoader";

const Home = () => {
  const [loading, setLoading] = useState(
    sessionStorage.getItem("loaderShown") !== "true",
  );

  useEffect(() => {
    if (sessionStorage.getItem("loaderShown") === "true") return;

    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("loaderShown", "true");
    }, 4600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <TruckLoader />}

      <div style={{ display: loading ? "none" : "block" }}>
        <Navbar />

        <div id="home">
          <Hero />
        </div>

        <div id="features">
          <FeaturesSection />
        </div>

        <div id="how-it-works">
          <HowItWorksSection />
        </div>

        <div id="reviews">
          <ReviewsSection />
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Home;
