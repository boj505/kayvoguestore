import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout/Layout'
import Home from './Pages/Home'
import About from './Pages/About'
import Reviews from './Pages/Reviews'
import Contact from './Pages/Contact'
import './index.css'
import { Toaster } from 'sonner'
import Login from './Pages/Login'
import Register from './Pages/Register'
import ForgotPassword from './Pages/ForgotPassword'
import ResetPassword from './Pages/ResetPassword'
import Profile from './Pages/Profile'
import Shop from './Pages/Shop'
import CategoriesPage from './Pages/CategoriesPage'
import CategoryPage from './Pages/CategoryPage'
import Product from './Pages/Product'
import Wishlist from './Pages/Wishlist'
import CheckoutPage from './Pages/CheckoutPage'
import OrderConfirmation from './Pages/OrderConfirmation'
import CartPage from './Pages/Cart'
import FAQs from './Pages/Faqs'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistProvider'
import { CartProvider } from './context/CartContext'
import MoveToTop from './Components/MoveToTop'



function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
    <CartProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <MoveToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path='/reviews' element={<Reviews />} />
            <Route path='/faqs' element={<FAQs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/collections/:collection" element={<CategoryPage />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
      </WishlistProvider>
      </AuthProvider>
  )
}

export default App
