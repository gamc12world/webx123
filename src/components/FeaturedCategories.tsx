import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  title: string;
  image: string;
  url: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, image, url }) => {
  return (
    <Link to={url} className="group relative overflow-hidden rounded-lg">
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      </div>
      <div className="absolute inset-0 flex items-end p-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <span className="inline-flex items-center text-sm text-white/90 group-hover:text-amber-300 transition-colors">
            Shop now <span className="ml-1 text-xl transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CategoryCard
            title="Men's Collection"
            image="https://images.pexels.com/photos/1813947/pexels-photo-1813947.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            url="/category/men"
          />
          <CategoryCard
            title="Women's Collection"
            image="https://images.pexels.com/photos/5886041/pexels-photo-5886041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            url="/category/women"
          />
          <CategoryCard
            title="Kids' Collection"
            image="https://images.pexels.com/photos/4715298/pexels-photo-4715298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            url="/category/kids"
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;