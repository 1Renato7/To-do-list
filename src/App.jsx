import { useState } from 'react'
import './App.css'
import ToDoList, {TaskProvider} from './To-do-list'

function App() {
  return (
    <TaskProvider>
      <ToDoList/>
    </TaskProvider>
  )
}

export default App
