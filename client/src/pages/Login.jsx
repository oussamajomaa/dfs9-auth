import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

const BASE_URL = "http://localhost:3000/login-cookie"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setpassword] = useState("")
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include"
            })
            
            if (!response.ok) {
                throw new Error('Forbidden')
            }
            
            const data = await response.json()
            localStorage.setItem('role',data.user.role)
            localStorage.setItem('image',data.user.image)

            if (data.user.role === 'admin') {
                navigate('/admin')
            } else {
                navigate('/profile')
            }

        } catch (err) {
            console.error("Erreur de connexion :", err)
        }
    }

    return (
        <main>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email..."
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setpassword(e.target.value)}
                />
                <button>Connexion</button>
                <Link to={'/register'}>Inscription</Link>
            </form>
        </main>
    )
}