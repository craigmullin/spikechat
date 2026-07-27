import { Route, Routes } from 'react-router-dom'
import './App.css'
import { ChatPage } from './pages/ChatPage'
import { EditPersonPage } from './pages/EditPersonPage'
import { HomePage } from './pages/HomePage'
import { PeoplePage } from './pages/PeoplePage'
import { SocialPostEditorPage } from './features/social-posts/SocialPostEditorPage'
import { SocialPostListPage } from './features/social-posts/SocialPostListPage'
import { SocialPostPreviewPage } from './features/social-posts/SocialPostPreviewPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/people/new" element={<EditPersonPage />} />
      <Route path="/people/:personId/edit" element={<EditPersonPage />} />
      <Route path="/chat/:personId" element={<ChatPage />} />
      <Route path="/social-posts" element={<SocialPostListPage />} />
      <Route path="/social-posts/new" element={<SocialPostEditorPage />} />
      <Route path="/social-posts/:postId" element={<SocialPostPreviewPage />} />
      <Route path="/social-posts/:postId/edit" element={<SocialPostEditorPage />} />
    </Routes>
  )
}

export default App
