import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'

function Header() {
  const { cartItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img 
              src="./logo.png" 
              alt="milani Logo" 
              className="h-10 md:h-12 w-auto object-contain"
              onError={(e) => {
                if (e.target.src.includes('.png')) {
                  e.target.src = './logo.jpg';
                } else if (e.target.src.includes('.jpg')) {
                  e.target.src = './logo.svg';
                } else {
                  e.target.style.display = 'none';
                }
              }}
            />
            <Link to="/" className="text-2xl font-bold gradient-text">
              milani
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition">
              Home
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-primary-600 font-medium transition">
              Shop
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary-600 font-medium transition">
              Contact
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-primary-600 font-medium transition relative">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-secondary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/admin" className="btn-primary text-sm">
              Admin
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/shop" className="text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Shop
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              <Link to="/cart" className="text-gray-700 hover:text-primary-600 font-medium flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                Cart
                {cartCount > 0 && (
                  <span className="bg-secondary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/admin" className="btn-primary text-sm inline-block text-center" onClick={() => setIsMenuOpen(false)}>
                Admin
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header