import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {GoogleOAuthProvider} from '@react-oauth/google'
import { ToastProvider } from '../components/Toast.jsx'

//google oauth
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

//redux
import { Provider } from 'react-redux'
import { store } from '../app/store.js'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Provider>
  </GoogleOAuthProvider>
)
