import { useLocation, Route, Routes } from 'react-router-dom'
import LandingPage from './UI/templates/LandingPage'
import Login from './UI/templates/Login'
import Register from './UI/templates/register'
import Profile from './UI/templates/profile'
import Upload from './UI/components/Upload'
import ForgetPassword from './UI/templates/forget_password'

function App() {

  return (
   <div className=''>
      <main>
        <Routes>
          <Route path='/' element={<LandingPage/>}/> 
          <Route path='/Login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/profile' element={<Profile/>}/> 
          <Route path='/profile/:ownerId' element={<Profile/>}/> 
          <Route path='/lupa-sandi' element={<ForgetPassword/>}/>
          <Route path='/test' element={<Upload/>}/>     
        </Routes>
      </main>
   </div>
  )
}

export default App
