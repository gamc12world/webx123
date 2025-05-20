import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CreditCard, MapPin } from 'lucide-react';

interface ShippingForm {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface PaymentForm {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const tax = totalPrice * 0.1;
  const totalAmount = totalPrice + tax;

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
  });
  
  const [payment, setPayment] = useState<PaymentForm>({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  // Redirect if cart is empty or not logged in
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [items, user, navigate]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          total: totalAmount,
          status: 'pending',
          shipping_address: shipping,
          payment_method: 'Credit Card',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and redirect to confirmation
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to process order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!user || items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Checkout Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center w-full max-w-3xl">
          <div className={`flex flex-col items-center flex-1 ${step === 'shipping' ? 'text-slate-900' : 'text-slate-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step === 'shipping' ? 'bg-amber-500 text-white' : 'bg-slate-200'}`}>
              <MapPin size={18} />
            </div>
            <span className="text-sm">Shipping</span>
          </div>
          
          <div className="w-full mx-4 h-1 bg-slate-200 flex-1 relative">
            {step === 'payment' && <div className="absolute inset-0 bg-amber-500"></div>}
          </div>
          
          <div className={`flex flex-col items-center flex-1 ${step === 'payment' ? 'text-slate-900' : 'text-slate-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step === 'payment' ? 'bg-amber-500 text-white' : 'bg-slate-200'}`}>
              <CreditCard size={18} />
            </div>
            <span className="text-sm">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {step === 'shipping' ? (
              <>
                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                <form onSubmit={handleShippingSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        required
                        className="input w-full"
                        value={shipping.fullName}
                        onChange={handleShippingChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="streetAddress" className="block text-sm font-medium text-slate-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="streetAddress"
                        name="streetAddress"
                        required
                        className="input w-full"
                        value={shipping.streetAddress}
                        onChange={handleShippingChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          required
                          className="input w-full"
                          value={shipping.city}
                          onChange={handleShippingChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          required
                          className="input w-full"
                          value={shipping.state}
                          onChange={handleShippingChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          required
                          className="input w-full"
                          value={shipping.postalCode}
                          onChange={handleShippingChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">
                          Country
                        </label>
                        <select
                          id="country"
                          name="country"
                          required
                          className="input w-full"
                          value={shipping.country}
                          onChange={handleShippingChange}
                        >
                          <option value="USA">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="UK">United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <button type="submit" className="btn btn-primary w-full">
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
                <form onSubmit={handlePaymentSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        required
                        className="input w-full"
                        value={payment.cardNumber}
                        onChange={handlePaymentChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-slate-700 mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        required
                        className="input w-full"
                        value={payment.cardName}
                        onChange={handlePaymentChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="block text-sm font-medium text-slate-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiry"
                          name="expiry"
                          placeholder="MM/YY"
                          required
                          className="input w-full"
                          value={payment.expiry}
                          onChange={handlePaymentChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-slate-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          required
                          className="input w-full"
                          value={payment.cvv}
                          onChange={handlePaymentChange}
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200 mt-6 pt-6">
                      <h3 className="font-medium mb-2">Billing Address</h3>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sameAsShipping"
                          className="h-4 w-4 text-slate-900 focus:ring-slate-500 border-slate-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="sameAsShipping" className="ml-2 block text-sm text-slate-700">
                          Same as shipping address
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-secondary w-full"
                      onClick={() => setStep('shipping')}
                      disabled={isProcessing}
                    >
                      Back to Shipping
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-start py-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-slate-500">Size: {item.size} • Color: {item.color}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;