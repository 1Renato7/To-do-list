import React, { useState, createContext, useContext, useEffect } from 'react'; 
import './To-do-list.css';
import { useGoogleLogin } from '@react-oauth/google';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {

    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem('mytasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    });

    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        localStorage.setItem('mytasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (newTask) => {
        if (newTask.trim() !== '') {
            setTasks([...tasks, newTask]);
        }
    };

    const deleteTask = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    }

    const movePriorityUp = (index) => {
        if (index > 0) {
            const updatedTasks = [...tasks];
            [updatedTasks[index - 1], updatedTasks[index]] = [updatedTasks[index], updatedTasks[index - 1]];
            setTasks(updatedTasks);
        }
    };

    const movePriorityDown = (index) => {
        if (index < tasks.length - 1) {
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index + 1]] = [updatedTasks[index + 1], updatedTasks[index]];//Obs.: É importante não usar index - 1 pois haveria um índice negativo
            setTasks(updatedTasks);
        }
    };

    return (<TaskContext.Provider value={{ tasks, addTask, deleteTask, movePriorityUp, movePriorityDown, accessToken, setAccessToken }}>
        {children}
    </TaskContext.Provider>);
    
}

function ToDoList() {
    const { tasks, addTask, deleteTask, movePriorityUp, movePriorityDown, accessToken, setAccessToken } = useTaskContext();

    const handleInputChange = (event) => {
        setNewTask(event.target.value);
    }

    const handleAddTaskClick = () => {
        addTask(newTask);
        setNewTask('');
    }

    const loginComGoogle = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            console.log('Login Success:', tokenResponse);
            setAccessToken(tokenResponse.access_token);
        },
        onError: (error) => {
            console.log('Login Failed:', error);
        },
        scope: 'https://www.googleapis.com/auth/calendar.events'
    });

    const [newTask, setNewTask] = useState('');

    return (
        <div className="todo-container">
            <h1>To-Do List</h1>
            <div className="auth-section">
                {!accessToken ? (
                    <button onClick={() => loginComGoogle} className="google-login-btn">
                        Vincular Google Calendar
                    </button>
                ) : (
                    <span className="logged-in-text">Google Calendar Vinculado</span>
                )}
            </div>
            <div>
                <input className='input-bar'
                    type="text"
                    value={newTask}
                    onChange={handleInputChange}
                    placeholder="Digite uma nova tarefa"
                />
                <button className="add-button" onClick={handleAddTaskClick}>Add</button>
            </div>
            <ul className='task-list'>
                {tasks.map((task, index) => (
                    <li key={index}>
                        <span className="text">{task}</span>
                        <button className="up-button" onClick={() => movePriorityUp(index)}>↑</button>
                        <button className="down-button" onClick={() => movePriorityDown(index)}>↓</button>
                        <button className="done-button" onClick={() => deleteTask(index)}>✓</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ToDoList;