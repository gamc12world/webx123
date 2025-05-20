import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const products: Product[] = [
  {
    id: uuidv4(),
    name: 'Classic White T-Shirt',
    price: 24.99,
    description: 'A timeless white t-shirt made from 100% organic cotton. Perfect for everyday wear and can be easily styled with any outfit.',
    category: 'men',
    imageUrl: 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['white'],
    inStock: true,
    featured: true,
  },
  {
    id: uuidv4(),
    name: 'Slim Fit Jeans',
    price: 59.99,
    description: 'Modern slim fit jeans with a comfortable stretch. These jeans offer both style and comfort for everyday wear.',
    category: 'men',
    imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sizes: ['30', '32', '34', '36'],
    colors: ['blue', 'black'],
    inStock: true,
  },
  {
    id: uuidv4(),
    name: 'Floral Summer Dress',
    price: 49.99,
    description: 'A beautiful floral dress perfect for summer days. Made from lightweight fabric to keep you cool and comfortable.',
    category: 'women',
    imageUrl: 'https://images.pexels.com/photos/6765164/pexels-photo-6765164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['multicolor'],
    inStock: true,
    featured: true,
  },
  {
    id: uuidv4(),
    name: 'Casual Blazer',
    price: 89.99,
    description: 'A versatile blazer that can be dressed up or down. Perfect for office wear or casual outings.',
    category: 'women',
    imageUrl: 'https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sizes: ['S', 'M', 'L'],
    colors: ['black', 'navy'],
    inStock: true,
  },
  {
    id: uuidv4(),
    name: 'Kids Dinosaur T-Shirt',
    price: 19.99,
    description: 'A fun dinosaur-themed t-shirt that kids will love. Made from soft, durable fabric for active play.',
    category: 'kids',
    imageUrl: 'https://images.pexels.com/photos/5693889/pexels-photo-5693889.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sizes: ['3-4Y', '5-6Y', '7-8Y'],
    colors: ['green', 'blue'],
    inStock: true,
    featured: true,
  },
  {
    id: uuidv4(),
    name: 'Running Shoes',
    price: 79.99,
    description: 'Lightweight and comfortable running shoes with excellent support and cushioning for your daily runs.',
    category: 'men',
    imageUrl: 'https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sizes: ['8', '9', '10', '11', '12'],
    colors: ['gray', 'black', 'blue'],
    inStock: true,
  },
  {
    id: uuidv4(),
    name: 'Leather Handbag',
    price: 119.99,
    description: 'A stylish leather handbag with multiple compartments. Perfect for everyday use or special occasions.',
    category: 'women',
    imageUrl: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sizes: ['One Size'],
    colors: ['brown', 'black'],
    inStock: true,
    featured: true,
  },
  {
    id: uuidv4(),
    name: 'Kids Cartoon Pajamas',
    price: 29.99,
    description: 'Soft and cozy pajamas featuring popular cartoon characters. Perfect for a comfortable night\'s sleep.',
    category: 'kids',
    imageUrl: 'https://images.pexels.com/photos/6437841/pexels-photo-6437841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sizes: ['3-4Y', '5-6Y', '7-8Y'],
    colors: ['blue', 'pink'],
    inStock: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) || 
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
};