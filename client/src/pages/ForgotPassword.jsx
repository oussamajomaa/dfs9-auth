import { useState } from "react"

export default function ForgotPassword() {
    const [email,setEmail] = useState('')
    async function handleSubmit(e){
        try {

            e.preventDefault()
            const response = await fetch('http://localhost:3000/forgot-password',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({email})
            })
            const data = await response.json()
            console.log(data)
        }catch(err) {
            console.log(err)
        }
    }
  return (
    <form onSubmit={handleSubmit}>
        <input 
            type="email" 
            onChange={(e)=>setEmail(e.target.value)} />
        <button>Envoyer</button>
    </form>
  )
}
