import React from "react";
import { Link } from "react-router-dom";
import FeatureCards from "./FeatureCards"; // 👈 import the new component

const HeroHeader29 = () => {
  return (
    <>
      <section
        className="ezy__header29 light py-32 md:py-52 text-white bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage:
            "url(https://cdn.easyfrontend.com/pictures/hero/hero_30.png)",
        }}
      >
        <div className="container px-4 mx-auto">
          <div className="md:max-w-5xl mx-auto flex justify-center items-center text-center">
            <div>
              <h1 className="text-3xl font-bold leading-tight md:text-[62px] mb-2">
                Welcome To ConvergeHub
              </h1>
              <p className="text-xl opacity-90 leading-snug px-12 py-6">
                ConvergeHub is a real-time collaboration platform for seamless
                team communication, file sharing, task management, and
                productivity — all in one place.
              </p>
              <div className="mt-6">
                <Link to="/login">
                  <button className="text-white text-lg font-medium px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition duration-300 shadow-lg">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 👇 Add this below the hero section */}
      <div id="features" className="py-20 bg-white">
        <FeatureCards />
      </div>
    </>
  );
};

export default HeroHeader29;
