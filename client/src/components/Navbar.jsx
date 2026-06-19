import {Link ,useNavigate} from 'react-router-dom'

export default function Navbar() {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  function logout(){
    localStorage.clear()
    navigate('/login')
  }
  function login(){
    navigate('/login')
  }
  return (
    <nav style={{display:"flex",justifyContent:'space-between', alignItems:'center',padding:"16px"}}>
      <div style={{display:"flex", gap:"16px", }}>
        <Link to={'/'}>Accueil</Link>
        <Link to={'/cv'}>CV</Link>
        <Link to={'/contact'}>Contact</Link>
        {/* <Link to={'/login'}>Connexion</Link> */}
        {/* <Link to={'/register'}>Inscription</Link>
        <Link to={'/admin'}>dashboard</Link> */}
      </div>
      {token
        ?<button onClick={logout}>Déconnexion</button>
        :<button onClick={login}>Connexion</button>
      }
    </nav>
  )
}
