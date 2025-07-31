import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

function MainBanner() {
  return (
    <div className="relative">
      <img
        src={assets.main_banner_bg}
        alt="banner"
        className="w-full hidden md:block"
      />
      <img
        src={assets.main_banner_bg_sm}
        alt="banner"
        className="w-full md:hidden"
      />
      <div className="absolute inset-0 flex flex-col justify-end items-center md:items-start md:justify-center pb-24 md:pb-0 px-4 md:pl-18 lg:pl-24">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left max-w-72 md:max-w-80 lg:max-w-105 leading-tight lg:leading-15">
          Fresh Grocery Delivered Fast
        </h1>

        <div className="flex items-center gap-4 mt-6 font-medium">
          {/* Shop Now */}
          <Link
            to="/products"
            className="group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-primary-dull text-white transition rounded cursor-pointer"
          >
            Shop Now
            <img
              src={assets.white_arrow_icon}
              alt="arrow"
              className="md:hidden group-hover:translate-x-1 transition"
            />
          </Link>

          {/* Explore Deals */}
          <Link
            to="/products"
            className="group hidden md:flex items-center gap-2 px-9 py-3 cursor-pointer"
          >
            Explore Deals
            <img
              src={assets.black_arrow_icon}
              alt="arrow"
              className="transition group-hover:translate-x-1 "
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MainBanner;
