import React, { useState } from 'react';
import { Product } from '../../types';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState<'men' | 'women' | 'kids'>(product?.category || 'men');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [sizes, setSizes] = useState(product?.sizes.join(', ') || '');
  const [colors, setColors] = useState(product?.colors.join(', ') || '');
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedProduct: Product = {
      id: product?.id || crypto.randomUUID(),
      name,
      price: parseFloat(price),
      description,
      category,
      imageUrl,
      sizes: sizes.split(',').map(size => size.trim()),
      colors: colors.split(',').map(color => color.trim()),
      inStock,
      featured,
    };
    
    onSubmit(formattedProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Product Name
          </label>
          <input
            id="name"
            type="text"
            className="input w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
            Price
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            className="input w-full"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="input w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            id="category"
            className="input w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value as 'men' | 'women' | 'kids')}
            required
          >
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 mb-1">
            Image URL
          </label>
          <input
            id="imageUrl"
            type="text"
            className="input w-full"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sizes" className="block text-sm font-medium text-slate-700 mb-1">
            Available Sizes (comma separated)
          </label>
          <input
            id="sizes"
            type="text"
            className="input w-full"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            placeholder="S, M, L, XL"
            required
          />
        </div>
        
        <div>
          <label htmlFor="colors" className="block text-sm font-medium text-slate-700 mb-1">
            Available Colors (comma separated)
          </label>
          <input
            id="colors"
            type="text"
            className="input w-full"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="black, white, blue"
            required
          />
        </div>
      </div>

      <div className="flex space-x-6">
        <div className="flex items-center">
          <input
            id="inStock"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-600"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
          <label htmlFor="inStock" className="ml-2 block text-sm text-slate-700">
            In Stock
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="featured"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-600"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-slate-700">
            Featured Product
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
        >
          {product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;