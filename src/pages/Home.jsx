import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductContext.jsx'
import ProductCard from '../components/ProductCard.jsx'

function Home() {
  const { products } = useProducts()
  const featuredProducts = products.filter(p => p.featured).slice(0, 8)
  const categories = ['Clothes', 'Shoes', 'Accessories', 'Jewelry']

  const getCategoryProducts = (category) => {
    return products.filter(p => p.category?.toLowerCase() === category.toLowerCase()).slice(0, 2)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-primary text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome to <span className="text-yellow-200">milani</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Discover your unique style with our curated collection of fashion-forward clothes, 
            stylish shoes, elegant accessories, and stunning jewelry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/shop" 
              className="bg-white text-gray-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-50 transform hover:scale-105 transition-all duration-200 inline-block"
            >
              Shop Now
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-gray-800 transition-all duration-200 inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-red-300/20 rounded-full blur-xl"></div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Shop by Category</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Explore our four main product categories and find exactly what you're looking for
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {categories.map((category, index) => {
              const icons = ['👕', '👠', '👜', '💎']
              const gradients = [
                'from-blue-400 to-purple-500',
                'from-pink-400 to-red-500', 
                'from-green-400 to-blue-500',
                'from-yellow-400 to-orange-500'
              ]
              
              return (
                <Link 
                  key={category}
                  to={`/shop?category=${category.toLowerCase()}`}
                  className={`bg-gradient-to-br ${gradients[index]} text-white p-8 rounded-xl text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                >
                  <div className="text-4xl mb-4">{icons[index]}</div>
                  <h3 className="text-xl font-bold">{category}</h3>
                  <p className="text-sm opacity-90 mt-2">Explore Collection</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Featured Products</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Hand-picked items that represent the best of our collection
          </p>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No featured products available yet.</p>
              <Link to="/admin" className="btn-primary">
                Add Products in Admin Panel
              </Link>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              to="/shop" 
              className="btn-primary text-lg"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Category Previews */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {categories.map((category, index) => {
            const categoryProducts = getCategoryProducts(category)
            if (categoryProducts.length === 0) return null
            
            return (
              <div key={category} className={`mb-16 ${index > 0 ? 'border-t pt-16' : ''}`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold">{category}</h3>
                  <Link 
                    to={`/shop?category=${category.toLowerCase()}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
                  >
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {categoryProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust milani for their fashion needs
          </p>
          <Link 
            to="/shop" 
            className="bg-white text-gray-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 inline-block"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home