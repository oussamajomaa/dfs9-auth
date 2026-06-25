import { useState } from "react"
import { useSearchParams } from "react-router-dom"


export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const [password,setPassword] = useState('')

    const handleSubmit = async(e)=>{
        e.preventDefault()
        try {
            const response = await fetch(`http://localhost:3000/reset-password?token=${token}`,{
                method: 'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({password})
            })
            if (response.ok) {
                const data = await response.json()
                console.log(data)
            }
        }catch(err) {
            console.log(err)
        }

    }
  return (
    <form onSubmit={handleSubmit}>
        <h2>Nouvea mot de passe</h2>
        <input 
            type="password"
            onChange={(e)=> setPassword(e.target.value)}
         />
         <button>Envoyer</button>
    </form>
  )
}
