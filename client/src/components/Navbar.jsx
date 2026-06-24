// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() { // On récupère user et setUser ici
	const navigate = useNavigate();

	async function handleLogout() {
		try {
			const response = await fetch('http://localhost:3000/logout', {
				method: 'POST',
				credentials: "include"
			});

			if (response.ok) {
				localStorage.clear();
				setUser(null); // Changement immédiat de l'affichage !
				navigate('/login');
			}
		} catch (error) {
			console.error("Erreur déconnexion :", error);
		}
	}

	return (
		<nav style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center', padding: "16px" }}>
			<div style={{ display: "flex", gap: "16px" }}>
				<Link to={'/'}>Accueil</Link>


				<Link to={'/login'}>Connexion</Link>
				<Link to={'/register'}>Inscription</Link>

				<Link to={'/admin'}>dashboard</Link>
			</div>


		</nav>
	);
}