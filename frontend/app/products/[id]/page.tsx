import React from 'react';

const ProductDetailPage = ({ product }) => {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <h2>Price: ${product.price}</h2>
      <button>Add to Cart</button>
    </div>
  );
};

export default ProductDetailPage;