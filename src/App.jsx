import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useParams } from 'react-router-dom'
import './App.css'
import AppProvider from './AppProvider.jsx'
import StoreProvider from './StoreProvider.jsx'
import Navb from '../Layers/Navb.jsx'
import Hero from '../Layers/Hero.jsx'
import Foot from '../Layers/Foot.jsx'
import Shop from '../Layers/Shop.jsx'
import Caregores from '../Layers/caregores.jsx'
import Prodact from '../Layers/prodact.jsx'
import Chiickout from '../Layers/chiickout.jsx'
import MyOrders from '../Layers/MyOrders.jsx'
import NotFound from '../Layers/NotFound.jsx'
import CartDrawer from '../Layers/CartDrawer.jsx'
import SignInModal from '../Layers/SignInModal.jsx'
import Toast from '../Layers/Toast.jsx'

// The dashboard is only downloaded when someone opens /admin.
const Admin = lazy(() => import('../Layers/admin.jsx'))

// New page -> scroll to top. Link like /#about -> scroll to that section.
function ScrollManager() {
  const { key, hash } = useLocation()
  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [key, hash])
  return null
}

// key={id} resets the quantity picker when you jump between products.
const ProductRoute = () => <Prodact key={useParams().id} />

function App() {
  return (
    <AppProvider>
      <StoreProvider>
        <BrowserRouter>
          <ScrollManager />
          <Navb />
          <main>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/categories" element={<Caregores />} />
                <Route path="/categories/:id" element={<Caregores />} />
                <Route path="/product/:id" element={<ProductRoute />} />
                <Route path="/checkout" element={<Chiickout />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Foot />
          <CartDrawer />
          <SignInModal />
          <Toast />
        </BrowserRouter>
      </StoreProvider>
    </AppProvider>
  )
}

export default App
