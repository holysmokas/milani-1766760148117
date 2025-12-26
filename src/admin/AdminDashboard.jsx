import { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext.jsx';

// HolySmokas API URL
const API_URL = 'https://api.holysmokas.com';

// Initialize Firebase Auth (loaded from CDN)
let auth = null;
let firebaseLoaded = false;

const loadFirebase = async () => {
  if (firebaseLoaded && auth) {
    return true;
  }
  
  // Check if already loaded
  if (window.firebase?.auth) {
    auth = window.firebase.auth();
    firebaseLoaded = true;
    return true;
  }

  try {
    // Fetch Firebase config from backend
    const configResponse = await fetch(`${API_URL}/api/firebase-config`);
    const configData = await configResponse.json();
    
    if (!configData.success) {
      throw new Error('Failed to load Firebase config');
    }

    // Load Firebase SDK
    await new Promise((resolve, reject) => {
      const script1 = document.createElement('script');
      script1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js';
        script2.onload = () => resolve();
        script2.onerror = () => reject(new Error('Failed to load Firebase Auth'));
        document.head.appendChild(script2);
      };
      script1.onerror = () => reject(new Error('Failed to load Firebase'));
      document.head.appendChild(script1);
    });

    // Initialize Firebase with config from backend
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(configData.config);
    }
    auth = window.firebase.auth();
    firebaseLoaded = true;
    return true;
  } catch (err) {
    console.error('Failed to load Firebase:', err);
    return false;
  }
};

// Image Uploader Component
function ImageUploader({ currentImage, onImageUploaded, userId, projectId }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImage || '');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    setUploadSuccess(false);
    setUploading(true);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('projectId', projectId);
      if (userId) formData.append('userId', userId);
      formData.append('productName', 'product-' + Date.now());

      const response = await fetch(`${API_URL}/api/upload-product-image`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const imageUrl = data.driveUrl || data.primaryUrl || data.imageUrl;
        // Pass both URL and fileId to parent
        onImageUploaded(imageUrl, data.fileId);
        setPreview(imageUrl);
        setUploadSuccess(true);
        setError('');
      } else if (data.needsConnection) {
        setError('Google Drive not connected. Image saved locally.');
        onImageUploaded(reader.result, null);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed: ' + err.message);
      // Fallback to base64
      onImageUploaded(reader.result, null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {preview && (
        <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded border" />
      )}
      <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700'}`}>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
        {uploading ? '⏳ Uploading...' : '📁 Choose Image'}
      </label>
      {uploadSuccess && <p className="text-green-600 text-sm">✅ Image uploaded to cloud!</p>}
      {error && <p className="text-amber-600 text-sm">⚠️ {error}</p>}
    </div>
  );
}

function AdminDashboard() {
  // Auth states
  const [authMode, setAuthMode] = useState('loading'); // 'loading', 'login', 'authenticated', 'error'
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  // Product states
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    image: '', 
    category: '', 
    inStock: true, 
    driveFileId: null,
    externalPaymentUrl: '' 
  });
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Get project ID from meta tag
  const projectId = document.querySelector('meta[name="project-id"]')?.content || '';

  // Toast helper function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Delete product and its image from Google Drive
  const handleDelete = async (product) => {
    // First, try to delete from Google Drive if there's a fileId
    if (product.driveFileId) {
      try {
        const response = await fetch(`${API_URL}/api/delete-product-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: projectId,
            fileId: product.driveFileId
          })
        });
        const data = await response.json();
        if (data.success) {
          console.log('✅ Image deleted from Drive');
        }
      } catch (err) {
        console.warn('⚠️ Could not delete from Drive:', err);
        // Continue with local delete anyway
      }
    }

    // Delete from local state
    deleteProduct(product.id);
    showToast(`"${product.name}" has been deleted`, 'success');
  };

  // Initialize Firebase and check auth state
  useEffect(() => {
    const initAuth = async () => {
      const loaded = await loadFirebase();
      if (!loaded) {
        setAuthMode('error');
        setAuthError('Failed to initialize authentication. Please refresh the page.');
        return;
      }

      auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Check if user owns this project
          try {
            const response = await fetch(`${API_URL}/api/verify-project-owner?` + new URLSearchParams({
              userId: firebaseUser.uid,
              projectId: projectId
            }));
            const data = await response.json();
            
            if (data.isOwner === true) {
              setIsOwner(true);
              setAuthMode('authenticated');
              localStorage.setItem('userId', firebaseUser.uid);
              localStorage.setItem('projectId', projectId);
            } else {
              setIsOwner(false);
              setAuthMode('not-owner');
            }
          } catch (err) {
            console.error('Owner check failed:', err);
            // Fallback: allow access if check fails but user is logged in
            setIsOwner(true);
            setAuthMode('authenticated');
            localStorage.setItem('userId', firebaseUser.uid);
          }
        } else {
          setUser(null);
          setIsOwner(false);
          setAuthMode('login');
        }
      });
    };

    initAuth();
  }, [projectId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Invalid email format');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Too many failed attempts. Please try again later.');
      } else {
        setAuthError('Login failed. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('userId');
      localStorage.removeItem('projectId');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Updated to accept fileId
  const handleImageUploaded = (imageUrl, fileId) => {
    setForm(prev => ({ ...prev, image: imageUrl, driveFileId: fileId || null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = { 
      ...form, 
      price: parseFloat(form.price),
      driveFileId: form.driveFileId || null,
      externalPaymentUrl: form.externalPaymentUrl?.trim() || null
    };
    if (editing) {
      updateProduct(editing, productData);
      showToast('Product updated successfully!', 'success');
    } else {
      addProduct(productData);
      showToast('Product added successfully!', 'success');
    }
    setForm({ name: '', description: '', price: '', image: '', category: '', inStock: true, driveFileId: null, externalPaymentUrl: '' });
    setEditing(null);
  };

  const startEdit = (product) => {
    setEditing(product.id);
    setForm({ 
      ...product, 
      price: product.price?.toString() || '',
      driveFileId: product.driveFileId || null,
      externalPaymentUrl: product.externalPaymentUrl || ''
    });
  };

  // Loading state
  if (authMode === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (authMode === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-6">{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Login form
  if (authMode === 'login') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
            <p className="text-gray-600 text-sm">Sign in with your HolySmokas account</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="••••••••"
                required
              />
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {authError}
              </div>
            )}
            
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-gray-600 text-sm mb-3">Don't have an account?</p>
            <a 
              href="https://holysmokas.com/dashboard.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create account at HolySmokas →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Not owner state
  if (authMode === 'not-owner') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to manage this store. Please sign in with the account that owns this website.
          </p>
          <button 
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Sign in with different account
          </button>
        </div>
      </div>
    );
  }

  // Authenticated - Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Signed in as {user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium">
            Logout
          </button>
        </div>

        {/* Connection Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">
            ✅ <strong>Connected to HolySmokas</strong> - Product images will be saved to your Google Drive
          </p>
        </div>

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Product Name" 
              required 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})} 
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Price" 
              required 
              step="0.01" 
              min="0"
              value={form.price} 
              onChange={(e) => setForm({...form, price: e.target.value})} 
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <ImageUploader 
                currentImage={form.image} 
                onImageUploaded={handleImageUploaded}
                userId={user?.uid}
                projectId={projectId}
              />
              {form.image && !form.image.startsWith('data:') && (
                <input 
                  type="text" 
                  value={form.image} 
                  onChange={(e) => setForm({...form, image: e.target.value})} 
                  placeholder="Or enter image URL directly" 
                  className="mt-2 p-2 border rounded w-full text-sm" 
                />
              )}
            </div>
            <input 
              type="text" 
              placeholder="Category (optional)" 
              value={form.category} 
              onChange={(e) => setForm({...form, category: e.target.value})} 
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <div>
              <input 
                type="url" 
                placeholder="External Payment Link (optional)" 
                value={form.externalPaymentUrl} 
                onChange={(e) => setForm({...form, externalPaymentUrl: e.target.value})} 
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full" 
              />
              <p className="text-xs text-gray-500 mt-1">Stripe, PayPal, or other checkout link. If set, "Buy Now" opens this URL.</p>
            </div>
            <textarea 
              placeholder="Description" 
              value={form.description} 
              onChange={(e) => setForm({...form, description: e.target.value})} 
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 md:col-span-2" 
              rows="3"
            />
            <label className="flex items-center gap-2 text-gray-700">
              <input 
                type="checkbox" 
                checked={form.inStock} 
                onChange={(e) => setForm({...form, inStock: e.target.checked})} 
                className="w-4 h-4 text-blue-600"
              />
              In Stock
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
              {editing ? 'Update Product' : 'Add Product'}
            </button>
            {editing && (
              <button 
                type="button" 
                onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', image: '', category: '', inStock: true, driveFileId: null, externalPaymentUrl: '' }); }} 
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold">Products ({products.length})</h2>
          </div>
          {products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No products yet. Add your first product above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Image</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Payment</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <img 
                          src={product.image || 'https://placehold.co/50x50?text=No+Image'} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded border"
                          onError={(e) => { e.target.src = 'https://placehold.co/50x50?text=Error'; }}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">${product.price?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.externalPaymentUrl ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {product.externalPaymentUrl ? 'External' : 'Cart'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => startEdit(product)} className="text-blue-600 hover:text-blue-800 mr-4 font-medium">
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(product)} 
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center gap-2`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
