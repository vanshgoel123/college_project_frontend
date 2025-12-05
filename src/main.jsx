import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from "axios";

axios.defaults.withCredentials = true;

// ⚠️ REPLACE with your actual Google Client ID from Cloud Console
const GOOGLE_CLIENT_ID = "1096730764737-ma3q511kei4goe7kq14on8bk9pj5trtl.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
)