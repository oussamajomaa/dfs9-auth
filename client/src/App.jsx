
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Profile from './pages/Profile'

function App() {
  
  
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='' element={<Home />} />
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
        <Route path='admin' element={<Admin />} />
        <Route path='profile' element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
