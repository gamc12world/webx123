import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <div className="relative">
      {/* Hero image */}
      <div className="h-[70vh] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/6626914/pexels-photo-6626914.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Fashion hero"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
      </div>

      {/* Hero content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Summer Collection 2025
            </h1>
            <p className="text-white/90 text-lg mb-8 max-w-md">
              Discover our latest arrivals and elevate your summer style with premium clothing that combines comfort and elegance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/category/men"
                className="btn bg-white text-slate-900 hover:bg-slate-100"
              >
                Shop Men
              </Link>
              <Link
                to="/category/women"
                className="btn bg-amber-500 text-white hover:bg-amber-600"
              >
                Shop Women
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;