import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/shop" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Cart Items */}
          <div className="divide-y divide-gray-200">
            {cartItems.map(item => (
              <div key={item.id} className="p-6 flex items-center gap-6">
                <img 
                  src={item.image || 'https://placehold.co/100x100/f3f4f6/9ca3af?text=No+Image'} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.category}</p>
                  <p className="text-primary-600 font-bold text-lg">${item.price?.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-24">
                    <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-gray-50 p-6 border-t">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items in cart
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  Total: ${getTotal().toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/shop" 
                className="btn-secondary flex-1 text-center"
              >
                Continue Shopping
              </Link>
              <Link 
                to="/checkout" 
                className="btn-primary flex-1 text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart