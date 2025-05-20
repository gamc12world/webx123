import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { Check, Package } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (orderError) throw orderError;

        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        if (itemsError) throw itemsError;

        // Get products for each order item
        const items = itemsData.map(item => ({
          product: {
            id: item.product_id,
            name: 'Product Name', // You would typically fetch this from your products table
            price: item.price,
            imageUrl: 'product-image-url', // You would typically fetch this from your products table
          },
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }));

        setOrder({
          ...orderData,
          items,
          createdAt: new Date(orderData.created_at),
        });
      } catch (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="animate-pulse max-w-lg mx-auto">
          <div className="h-20 w-20 bg-slate-200 rounded-full mx-auto mb-6"></div>
          <div className="h-8 bg-slate-200 rounded mx-auto w-3/4 mb-6"></div>
          <div className="h-4 bg-slate-200 rounded mb-3 mx-auto w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded mb-6 mx-auto w-2/3"></div>
          <div className="h-10 bg-slate-200 rounded-md w-1/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="mb-8">We couldn't find an order with the provided ID.</p>
        <Link to="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-600 mb-1">Thank you for your purchase</p>
          <p className="text-slate-500 text-sm">Order #{order.id.slice(0, 8)}</p>
        </div>

        <div className="border-t border-b border-slate-200 py-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Order Details</h2>
          
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex">
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-slate-500">
                    Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-medium mt-1">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-4">Shipping Information</h2>
          <div className="text-slate-600">
            {order.shippingAddress ? (
              <>
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.streetAddress}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </>
            ) : (
              <p>Shipping address not available</p>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-8">
          <div className="flex items-center text-slate-700">
            <Package size={20} className="mr-2" />
            <p>
              Your order is being processed. You will receive a shipping confirmation email once your order has shipped.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span>${(order.total * 0.91).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Tax</span>
            <span>${(order.total * 0.09).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-3 border-t border-slate-200">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;