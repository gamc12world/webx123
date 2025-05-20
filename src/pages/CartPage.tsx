import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, X, ShoppingBag } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag size={64} className="mx-auto text-slate-300 mb-6" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-slate-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-200">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-medium text-slate-900">{item.product.name}</h3>
                    <div className="text-sm text-slate-500 mt-1">
                      <span>Size: {item.size}</span> • <span>Color: {item.color}</span>
                    </div>
                    <div className="mt-2">
                      <span className="font-medium text-slate-900">${item.product.price.toFixed(2)}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-center sm:justify-start mt-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 border border-slate-300 rounded-l-md text-slate-700 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 py-1 text-center border-t border-b border-slate-300 text-slate-900"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-1 border border-slate-300 rounded-r-md text-slate-700 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex items-center sm:flex-col sm:items-end">
                    <span className="font-medium text-slate-900 sm:mb-2">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="ml-4 sm:ml-0 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span>${(totalPrice * 0.1).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${(totalPrice + (totalPrice * 0.1)).toFixed(2)}</span>
              </div>
            </div>
            
            <Link to="/checkout" className="btn btn-primary w-full mb-4">
              Proceed to Checkout
            </Link>
            
            <Link to="/" className="btn btn-secondary w-full">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;