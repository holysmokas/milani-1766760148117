function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold gradient-text mb-4">milani</h3>
            <p className="text-gray-400 mb-4">
              Your premier destination for fashion-forward clothes, stylish shoes, elegant accessories, and stunning jewelry. 
              Discover your unique style with our curated collection.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary-400">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#/" className="hover:text-white transition">Home</a></li>
              <li><a href="#/shop" className="hover:text-white transition">Shop</a></li>
              <li><a href="#/contact" className="hover:text-white transition">Contact</a></li>
              <li><a href="#/cart" className="hover:text-white transition">Cart</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary-400">Contact Us</h4>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                5555 Broadway, New York, NY 10024
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@milanifam.com
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (800) 555-9999
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <a href="terms-of-service.html" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
              Terms of Service
            </a>
            <a href="privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
              Privacy Policy
            </a>
            <a href="cookies.html" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
              Cookie Policy
            </a>
            <a href="disclaimer.html" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
              Disclaimer
            </a>
          </div>
          <p className="text-gray-400">
            &copy; 2025 milani. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer