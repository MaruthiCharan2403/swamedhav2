import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import {store} from './redux/store.js'
import axios from 'axios'

axios.defaults.baseURL ='https://swamedhabackend.vercel.app'
// axios.defaults.baseURL = 'http://localhost:5000'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
  <App />
</Provider>
)
