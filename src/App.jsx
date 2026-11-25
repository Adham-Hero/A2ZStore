import './App.css'
import AppProvider from './AppProvider.jsx'
import Navb from '../Layers/Navb.jsx'
import Hero from '../Layers/Hero.jsx'
import Foot from '../Layers/Foot.jsx'
import CartDrawer from '../Layers/CartDrawer.jsx'
import SignInModal from '../Layers/SignInModal.jsx'

function App() {
  return (
    <AppProvider>
      <Navb />
      <main>
        <Hero />
      </main>
      <Foot />
      <CartDrawer />
      <SignInModal />
    </AppProvider>
  )
}

export default App
