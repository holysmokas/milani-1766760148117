import { useCart } from '../context/CartContext.jsx'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'clothes':
        return '👕'
      case 'shoes':
        return '👠'
      case 'accessories':
        return '👜'
      case 'jewelry':
        return '💎'
      default:
        return '🛍️'
    }
  }

  return (
    <div className="card overflow-hidden group">
      <div className="relative overflow-hidden">
        <img 
          src={product.image || 'https://placehold.co/300x300/f3f4f6/9ca3af?text=No+Image'} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
          {getCategoryIcon(product.category)} {product.category}
        </div>
        {product.featured && (
          <div className="absolute top-3 right-3 bg-gradient-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 text-gray-800">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">${product.price?.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          <button
            onClick={() => addToCart(product)}
            className="btn-primary text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard