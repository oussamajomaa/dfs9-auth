import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Profile from './pages/Profile'
import { useState, useEffect } from 'react'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // <-- AJOUT DE CET ÉTAT REQUIS

  // async function checkAuth() {
  //   try {
  //     const response = await fetch('http://localhost:3000/profile', { credentials: "include" });
  //     if (response.ok) {
  //       const data = await response.json();
  //       setUser(data.user); 
  //     } else {
  //       setUser(null);
  //     }
  //   } catch (error) {
  //     setUser(null);
  //   } finally {
  //     setLoading(false); // <-- Maintenant cela ne plantera plus !
  //   }
  // }

  // useEffect(() => {
  //   checkAuth()
  // }, [])

  // IMPORTANT : On attend la fin du chargement avant d'afficher l'application
  // if (loading) {
  //   return <div style={{ padding: "20px" }}>Chargement...</div>
  // }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
        <Route path='admin' element={<Admin />} />
        <Route path='profile' element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App