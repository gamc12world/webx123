import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { ShoppingBag, Heart, ArrowLeft } from 'lucide-react';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setProduct(data);
          if (data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }
          if (data.colors.length > 0) {
            setSelectedColor(data.colors[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    // Set up real-time subscription
    const subscription = supabase
      .channel('product_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products',
        filter: `id=eq.${id}`
      }, () => {
        fetchProduct();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 w-20 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-slate-200 rounded-lg aspect-square"></div>
            <div>
              <div className="h-8 bg-slate-200 w-3/4 mb-4"></div>
              <div className="h-6 bg-slate-200 w-1/4 mb-6"></div>
              <div className="h-24 bg-slate-200 rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-8 bg-slate-200 w-1/2"></div>
                <div className="h-8 bg-slate-200 w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      return;
    }

    setIsAddingToCart(true);

    // Simulate API delay
    setTimeout(() => {
      addToCart(product, quantity, selectedSize, selectedColor);
      setIsAddingToCart(false);
      // Provide feedback
      const notification = document.getElementById('notification');
      if (notification) {
        notification.classList.remove('opacity-0', 'translate-y-2');
        notification.classList.add('opacity-100', 'translate-y-0');
        
        setTimeout(() => {
          notification.classList.remove('opacity-100', 'translate-y-0');
          notification.classList.add('opacity-0', 'translate-y-2');
        }, 3000);
      }
    }, 600);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-slate-900 mb-6">${product.price.toFixed(2)}</p>
          
          <div className="border-t border-b border-slate-200 py-6 mb-6">
            <p className="text-slate-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    selectedSize === size 
                      ? 'border-slate-900 bg-slate-900 text-white' 
                      : 'border-slate-300 text-slate-700 hover:border-slate-900'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Color</h3>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(color => (
                <button 
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    selectedColor === color 
                      ? 'border-slate-900 bg-slate-900 text-white' 
                      : 'border-slate-300 text-slate-700 hover:border-slate-900'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Quantity</h3>
            <div className="flex items-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border border-slate-300 rounded-l-md text-slate-700 hover:bg-slate-100"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 py-1 text-center border-t border-b border-slate-300 text-slate-900"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 border border-slate-300 rounded-r-md text-slate-700 hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart & Wishlist */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor || isAddingToCart}
              className="btn btn-primary flex-1 min-w-[180px]"
            >
              {isAddingToCart ? (
                <span>Adding...</span>
              ) : (
                <>
                  <ShoppingBag size={18} className="mr-2" />
                  Add to Cart
                </>
              )}
            </button>
            <button className="btn btn-secondary">
              <Heart size={18} className="mr-2" />
              Add to Wishlist
            </button>
          </div>

          {/* Product Meta */}
          <div className="mt-8 text-sm text-slate-500">
            <p>Category: {product.category}</p>
            <p>Availability: {product.inStock ? 'In Stock' : 'Out of Stock'}</p>
          </div>
        </div>
      </div>

      {/* Notification */}
      <div 
        id="notification"
        className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg opacity-0 translate-y-2 transition-all duration-300"
      >
        <p className="flex items-center">
          <ShoppingBag size={16} className="mr-2" />
          Product added to your cart
        </p>
      </div>
    </div>
  );
};

export default ProductPage;