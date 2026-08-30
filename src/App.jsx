import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { useLocation, Route, Routes } from 'react-router-dom'
import LandingPage from './UI/templates/LandingPage'
import Login from './UI/templates/Login'
import Register from './UI/templates/register'
import Profile from './UI/templates/profile'
import Upload from './UI/components/Upload'

function App() {
  const [count, setCount] = useState(0)
  const location = useLocation()

  return (
   <div className=''>
      <main>
        <Routes>
          <Route path='/' element={<LandingPage/>}/> 
          <Route path='/Login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/profile' element={<Profile/>}/> 
          <Route path='/test' element={<Upload/>}/>     
        </Routes>
      </main>
   </div>
  )
}

export default App
