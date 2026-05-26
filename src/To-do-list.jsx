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

    const addCalendarEvent = async (taskText, taskDateTime, token) => {
        const startTime = taskDateTime ? new Date(taskDateTime) : new Date();
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const event = {
            summary: taskText,
            description: 'Tarefa agendada',
            start: {
                dateTime: startTime.toISOString(),
                timeZone: userTimeZone,
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: userTimeZone,
            }
        };

        try {
            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });

            if (response.ok) {
                console.log('Evento adicionado com sucesso ao Google Calendar');
            }
            else {
                console.error('Erro ao adicionar evento ao Google Calendar:');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    };

    const addTask = async (taskText,  taskDateTime) => {
        if (taskText.trim() !== '') {
            const newTaskObject = {
                text: taskText,
                dateTime: taskDateTime || null
            };
            setTasks(prevTasks => [...prevTasks, newTaskObject]);

            if (accessToken) {
                await addCalendarEvent(taskText, taskDateTime, accessToken);
            }
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

    
    const [newTask, setNewTask] = useState('');
    const [taskDateTime, setTaskDateTime] = useState('');

    const handleInputChange = (event) => {
        setNewTask(event.target.value);
    }

    const handleAddTaskClick = () => {
        addTask(newTask, taskDateTime);
        setNewTask('');
        setTaskDateTime('');
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

    const formatarData = (dataString) => {
        if (!dataString) return '';
        const data = new Date(dataString);
        return `${data.toLocaleDateString()} às ${data.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    }//deixar um formato bom para data e hora

    return (
        <div className="todo-container">
            <h1>To-Do List</h1>
            <div className="auth-section">
                {!accessToken ? (
                    <button onClick={() => loginComGoogle()} className="google-login-btn">
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
                <input className='datetime-input'
                    type = "datetime-local"
                    value = {taskDateTime}
                    onChange = {(e) => setTaskDateTime(e.target.value)}
                />
                <button className="add-button" onClick={handleAddTaskClick}>Add</button>
            </div>
            <ul className='task-list'>
                {tasks.map((task, index) => {
                    const isObject = typeof task === 'object' && task !== null;
                    const textoTarefa = isObject ? task.text : task;
                    const dataTarefa = isObject ? task.dateTime : null;
                    return (
                    <li key={index}>
                        <div className="text-content">
                            <span className="text">{textoTarefa}</span>
                            {dataTarefa && <span className="task-date">{formatarData(dataTarefa)}</span>}
                        </div>
                        <div className="button-group">
                            <button className="up-button" onClick={() => movePriorityUp(index)}>↑</button>
                            <button className="down-button" onClick={() => movePriorityDown(index)}>↓</button>
                            <button className="done-button" onClick={() => deleteTask(index)}>✓</button>
                        </div>
                    </li>
                );
            })}
            </ul>
        </div>
    );
};

export default ToDoList;