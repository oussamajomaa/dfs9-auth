import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function Register() {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [role, setRole] = useState('')
	const [image, setImage] = useState(null)
	const navigate = useNavigate()

	async function handleSubmit(e) {
		e.preventDefault()
		try {
			const formData = new FormData()
			formData.append('username', username)
			formData.append('email', email)
			formData.append('password', password)
			formData.append('role', role)
			formData.append('image', image)
			const response = await fetch('http://localhost:3000/register', {
				method: 'POST',
				body: formData,
				// credentials: "include"
			})
			if (!response.ok) {
				throw new Error("Erreur lors de l'inscription")
			}
			const data = await response.json()
			console.log(data)
			navigate('/login')
		} catch (err) {
			console.log(err)
		}
	}
	return (
		<main>
			<form onSubmit={handleSubmit}>
				<input type="text" placeholder="Username..." onChange={(e) => setUsername(e.target.value)} />
				<input type="email" placeholder="Email..." onChange={(e) => setEmail(e.target.value)} required />
				<input type="password" placeholder="Password..." onChange={(e) => setPassword(e.target.value)} required />
				<select name="role" id="role" onChange={(e) => setRole(e.target.value)} required>
					<option value="">-- Choisir un rôle --</option>
					<option value="user">Utilisateur</option>
					<option value="admin">Administrateur</option>
				</select>
				<input 
					type="file" 
					accept="image/*" 
					onChange={(e) => setImage(e.target.files[0])} />
				<button>S'inscrire</button>
				<Link to={'/login'}>Se connecter</Link>
			</form>
		</main>
	)
}
