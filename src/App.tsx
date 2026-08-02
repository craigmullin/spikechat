import { Route, Routes } from 'react-router-dom'
import './App.css'
import { ChatPage } from './pages/ChatPage'
import { EditPersonPage } from './pages/EditPersonPage'
import { HomePage } from './pages/HomePage'
import { PeoplePage } from './pages/PeoplePage'
import { SocialPostEditorPage } from './features/social-posts/SocialPostEditorPage'
import { SocialPostListPage } from './features/social-posts/SocialPostListPage'
import { SocialPostPreviewPage } from './features/social-posts/SocialPostPreviewPage'
import { BackupPage } from './features/backup/BackupPage'
import { LandingPage } from './pages/LandingPage'
import { AboutPage } from './pages/AboutPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/studio" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/people/new" element={<EditPersonPage />} />
      <Route path="/people/:personId/edit" element={<EditPersonPage />} />
      <Route path="/chat/:personId" element={<ChatPage />} />
      <Route path="/social-posts" element={<SocialPostListPage />} />
      <Route path="/social-posts/new" element={<SocialPostEditorPage />} />
      <Route path="/social-posts/:postId" element={<SocialPostPreviewPage />} />
      <Route path="/social-posts/:postId/edit" element={<SocialPostEditorPage />} />
      <Route path="/data" element={<BackupPage />} />
    </Routes>
  )
}

export default App
