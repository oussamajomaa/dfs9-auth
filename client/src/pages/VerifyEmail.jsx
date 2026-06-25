import { useState } from "react"
import { useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"


export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const [message,setMessage] = useState('')
    async function validateEmail() {
        const response = await fetch(`http://localhost:3000/verify-email?token=${token}`)
        const data = await response.json()
        setMessage(data.message)
    }
    useEffect(()=>{
        validateEmail()
    },[])
  return (
    <div>
        {message}
        <Link to={"/login"}>Connexion</Link>
    </div>
  )
}
