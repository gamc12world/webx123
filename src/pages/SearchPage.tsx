import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { searchProducts } from '../data/products';
import { Product } from '../types';
import { Search as SearchIcon, Filter, X } from 'lucide-react';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = ['men', 'women', 'kids'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', '30', '32', '34', '36', '3-4Y', '5-6Y', '7-8Y'];

  useEffect(() => {
    setLoading(true);
    
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      let results = searchQuery 
        ? searchProducts(searchQuery)
        : searchProducts(''); // Return all products if no query
      
      // Apply category filter
      if (selectedCategories.length > 0) {
        results = results.filter(product => selectedCategories.includes(product.category));
      }
      
      // Apply size filter
      if (selectedSizes.length > 0) {
        results = results.filter(product => 
          product.sizes.some(size => selectedSizes.includes(size))
        );
      }
      
      // Apply price filter
      results = results.filter(product => 
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
      
      setProducts(results);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategories, selectedSizes, priceRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Update URL with search query
    const params = new URLSearchParams(location.search);
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    
    window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setPriceRange([0, 200]);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Filters - Mobile */}
        <div className="w-full md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center btn btn-secondary"
          >
            <Filter size={18} className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters - Desktop & Mobile Expanded */}
        <div className={`w-full md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center"
              >
                <X size={14} className="mr-1" />
                Clear all
              </button>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Price Range</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-600"
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-sm text-slate-700 capitalize">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-sm font-medium mb-3">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-2 py-1 text-xs rounded-md border ${
                      selectedSizes.includes(size)
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'border-slate-300 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input rounded-r-none flex-1"
              />
              <button type="submit" className="btn btn-primary rounded-l-none px-4">
                <SearchIcon size={18} />
              </button>
            </form>
          </div>

          {/* Results info */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {loading ? 'Searching...' : `${products.length} results found`}
            </h2>
            <div className="flex items-center text-sm">
              <span className="text-slate-500 mr-2">Sort by:</span>
              <select className="input py-1 px-2">
                <option>Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 rounded-lg aspect-square mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;