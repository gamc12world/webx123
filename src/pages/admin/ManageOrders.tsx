import React, { useState, useEffect } from 'react';
import { Search, Eye, ArrowDownUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';

const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortField, setSortField] = useState<'date' | 'total'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const fetchOrders = async () => {
    try {
      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch user data for each order
      const ordersWithUsers = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', order.user_id)
            .maybeSingle();

          if (userError) {
            console.error('Error fetching user data:', userError);
            return { ...order, user: null };
          }

          // Fetch order items with product details in a single query
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              id,
              quantity,
              size,
              color,
              price,
              product_id
            `)
            .eq('order_id', order.id);

          if (itemsError) {
            console.error('Error fetching order items:', itemsError);
            return { ...order, user, items: [] };
          }

          // Fetch all products for these items in a single query
          const productIds = items.map(item => item.product_id);
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, image_url')
            .in('id', productIds);

          if (productsError) {
            console.error('Error fetching products:', productsError);
            return { ...order, user, items: items.map(item => ({
              ...item,
              product: {
                id: item.product_id,
                name: 'Unknown Product',
                price: item.price,
                imageUrl: '',
              }
            })) };
          }

          // Map products to items
          const itemsWithProducts = items.map(item => {
            const product = products?.find(p => p.id === item.product_id);
            return {
              ...item,
              product: product ? {
                id: item.product_id,
                name: product.name,
                price: product.price,
                imageUrl: product.image_url,
              } : {
                id: item.product_id,
                name: 'Unknown Product',
                price: item.price,
                imageUrl: '',
              }
            };
          });

          return {
            ...order,
            user,
            items: itemsWithProducts,
            createdAt: new Date(order.created_at),
          };
        })
      );

      setOrders(ordersWithUsers);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription
    const ordersSubscription = supabase
      .channel('orders_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (order.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === '' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    } else {
      return sortDirection === 'asc' 
        ? a.total - b.total
        : b.total - a.total;
    }
  });

  const toggleSort = (field: 'date' | 'total') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      // Update order status in database first
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // After successful update, fetch user email and order details for email notification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', (orders.find(o => o.id === orderId))?.user_id)
        .maybeSingle();

      if (!userError && userData?.email) {
        // Fetch order details for the email
        const { data: orderData } = await supabase
          .from('orders')
          .select('id, total, shipping_address')
          .eq('id', orderId)
          .single();

        // Fetch order items and products separately to avoid join issues
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('id, quantity, size, color, price, product_id')
          .eq('order_id', orderId);

        if (itemsData) {
          const productIds = itemsData.map(item => item.product_id);
          const { data: productsData } = await supabase
            .from('products')
            .select('id, name, price, image_url')
            .in('id', productIds);

          // Combine items with their product data
          const itemsWithProducts = itemsData.map(item => {
            const product = productsData?.find(p => p.id === item.product_id);
            return {
              ...item,
              product: product || {
                name: 'Unknown Product',
                price: item.price,
                image_url: ''
              }
            };
          });

          // Send email notification
          await supabase.functions.invoke('send-order-email', {
            body: {
              email: userData.email,
              orderNumber: orderId.slice(0, 8),
              status: newStatus,
              items: itemsWithProducts,
              total: orderData?.total,
              shippingAddress: orderData?.shipping_address,
              customerName: userData.name
            },
          });
        }
      }

      // Update local state
      if (viewingOrder?.id === orderId) {
        setViewingOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }

      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
  };

  const closeOrderDetail = () => {
    setViewingOrder(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Manage Orders</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input w-full md:w-auto"
            >
              <option value="">All Statuses</option>
              {orderStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Order Details</h2>
                <button 
                  onClick={closeOrderDetail}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <p className="text-sm text-slate-600">Order ID: #{viewingOrder.id.slice(0, 8)}</p>
                  <p className="text-sm text-slate-600">
                    Date: {viewingOrder.createdAt.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600">
                    Customer: {viewingOrder.user?.name || 'Guest'}
                  </p>
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1">Status:</label>
                    <select
                      value={viewingOrder.status}
                      onChange={(e) => handleStatusChange(viewingOrder.id, e.target.value)}
                      disabled={updating === viewingOrder.id}
                      className="input w-full"
                    >
                      {orderStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  {viewingOrder.shippingAddress ? (
                    <>
                      <p className="text-sm text-slate-600">{viewingOrder.shippingAddress.fullName}</p>
                      <p className="text-sm text-slate-600">{viewingOrder.shippingAddress.streetAddress}</p>
                      <p className="text-sm text-slate-600">
                        {viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state} {viewingOrder.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm text-slate-600">{viewingOrder.shippingAddress.country}</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No shipping address available</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-4">Order Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-4 py-3 bg-slate-50 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 bg-slate-50 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 bg-slate-50 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {viewingOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">
                                  {item.product.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-slate-500">
                              Size: {item.size}
                            </div>
                            <div className="text-sm text-slate-500">
                              Color: {item.color}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-slate-900">
                            ${item.product.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-slate-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-slate-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-end border-t border-slate-200 pt-6">
                <div className="w-64">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Subtotal:</span>
                    <span className="text-sm text-slate-900">${(viewingOrder.total * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Tax:</span>
                    <span className="text-sm text-slate-900">${(viewingOrder.total * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${viewingOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-lg">
              <div className="flex justify-end">
                <button
                  onClick={closeOrderDetail}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <button 
                    onClick={() => toggleSort('date')}
                    className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Date
                    <ArrowDownUp size={12} className="ml-1" />
                  </button>
                </th>
                <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <button 
                    onClick={() => toggleSort('total')}
                    className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Total
                    <ArrowDownUp size={12} className="ml-1" />
                  </button>
                </th>
                <th className="px-6 py-3 bg-slate-50 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sortedOrders.length > 0 ? (
                sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {order.user?.name || 'Guest'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {order.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className={`px-3 py-1 text-sm font-semibold rounded-full
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'}
                          ${updating === order.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {orderStatuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <Eye size={16} />
                        <span className="sr-only">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;