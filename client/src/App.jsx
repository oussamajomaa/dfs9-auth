import { useState } from "react"



function App() {
  const [email,setEmail] = useState("")
  const [password,setpassword] = useState("")

  async function handleSubmit(e){
    e.preventDefault()
    console.log(email,password)
    const response = await fetch('http://localhost:3000/login-localstorage',{
      method: 'POST',
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({email,password})
    })
    console.log(response)
    const data = await response.json()
    localStorage.setItem('token', data.token)
    console.log(data)
  }
  
  return (
    <>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email..." 
          onChange={(e)=>setEmail(e.target.value)}
          />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e)=>setpassword(e.target.value)}
          />
        <button>Connexion</button>
      </form>
    </>
  )
}

export default App
