import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    // Add product with default size and color
    addToCart(product, 1, product.sizes[0], product.colors[0]);
  };

  return (
    <div className="card group overflow-hidden">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-10"></div>
          
          <button 
            onClick={handleQuickAdd}
            className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
            aria-label="Quick add to cart"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-slate-900">{product.name}</h3>
          <p className="mt-1 font-medium text-slate-700">${product.price.toFixed(2)}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {product.colors.map(color => (
              <span key={color} className="badge badge-secondary text-xs">{color}</span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;