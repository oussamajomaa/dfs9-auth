import { useState } from "react"
import { Link } from "react-router-dom"

export default function Register() {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [role, setRole] = useState('')

	async function handleSubmit(e) {
		e.preventDefault()
		try {

			const response = await fetch('http://localhost:3000/register',{
				method: 'POST',
				headers: {
					'Content-Type':'application/json'
				},
				body: JSON.stringify({username,email,password,role})
			})
			if (!response.ok) {
				throw new Error("Erreur lors de l'inscription")
			}
			const data = await response.json()
			console.log(data)
		} catch (err) {
			console.log(err)
		}
	}
	return (
		<main>
			<form onSubmit={handleSubmit}>
				<input type="text" placeholder="Username..." onChange={(e) => setUsername(e.target.value)} />
				<input type="email" placeholder="Email..." onChange={(e) => setEmail(e.target.value)} required/>
				<input type="password" placeholder="Password..." onChange={(e) => setPassword(e.target.value)} required/>
				<select name="" id="" onChange={(e) => setRole(e.target.value)} >
					{/* <option defaultValue={"user"} >Rôle...</option> */}
					<option value="user">Utilisateur</option>
					<option value="admin">Administrateur</option>
				</select>
				<button>S'inscrire</button>
				<Link to={'/login'}>Se connecter</Link>
			</form>
		</main>
	)
}
