import { Route, Routes } from 'react-router-dom'
import './App.css'
import { ChatPage } from './pages/ChatPage'
import { EditPersonPage } from './pages/EditPersonPage'
import { PeoplePage } from './pages/PeoplePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PeoplePage />} />
      <Route path="/people/new" element={<EditPersonPage />} />
      <Route path="/people/:personId/edit" element={<EditPersonPage />} />
      <Route path="/chat/:personId" element={<ChatPage />} />
    </Routes>
  )
}

export default App