import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'

export default function Admin() {
	const [users, setUsers] = useState([])
	const navigate = useNavigate()
	async function getAdminData() {
		
		try {
			// const token = localStorage.getItem('token')
			const response = await fetch('http://localhost:3000/admin', {
				method: 'GET',
				credentials: "include"
			})
			console.log(response)
			if (!response.ok) {
				throw new Error('Accès refusés')
			}
			const data = await response.json()
			console.log(data)
			setUsers(data)

		} catch (err) {
			console.log(err)
			navigate('/login')
		}
	}

	useEffect(() => {
		getAdminData()
	}, [])
	const  image= localStorage.getItem('image')
	return (
		<div>
			<div>Vous êtes administrateur</div>
			<img
				width={50} 
				src={`http://localhost:3000/uploads/avatar.jpg`} 
				alt={`http://localhost:3000/uploads/${image}`} />
			{users.map(user => <h2 key={user._id}>{user.username}</h2>)}
		</div>
	)
}
