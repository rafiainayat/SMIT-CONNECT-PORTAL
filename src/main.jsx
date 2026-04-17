import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './app/store'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '14px', fontSize: '14px', fontWeight: '500',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              padding: '12px 16px', maxWidth: '380px',
              boxShadow: '0 8px 24px -4px rgb(0 0 0/.15)',
            },
            success: { style: { background:'#f0fdf4', color:'#166534', border:'1px solid #bbf7d0' } },
            error:   { style: { background:'#fef2f2', color:'#991b1b', border:'1px solid #fecaca' } },
            loading: { style: { background:'#eff6ff', color:'#1e40af', border:'1px solid #bfdbfe' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)