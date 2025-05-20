import { Order } from '../types';

export const orders: Order[] = [];

export const getOrdersByUserId = (userId: string): Order[] => {
  return orders.filter(order => order.userId === userId);
};

export const getOrderById = (id: string): Order | undefined => {
  return orders.find(order => order.id === id);
};

export const createOrder = (order: Order): Order => {
  orders.push(order);
  return order;
};

export const updateOrderStatus = (id: string, status: Order['status']): Order | undefined => {
  const order = orders.find(order => order.id === id);
  if (order) {
    order.status = status;
    return order;
  }
  return undefined;
};