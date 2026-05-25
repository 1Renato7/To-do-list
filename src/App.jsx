import { useState } from 'react'
import './App.css'
import ToDoList, {TaskProvider} from './To-do-list'
import {GoogleOAuthProvider} from '@react-oauth/google';

const googleClientId = '1084943527480-b2rini02fu0rgblo97rsnlthjpi4ggkc.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <TaskProvider>
        <ToDoList/>
      </TaskProvider>
    </GoogleOAuthProvider> 
  )
}

export default App
