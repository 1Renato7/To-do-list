import React, { useState } from 'react'; 

function ToDoList() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    const handleInputChange = (event) => {
        setNewTask(event.target.value);
    }

    const addTask = () => {
        if (newTask.trim() !== '') {
            setTasks([...tasks, newTask]);
            setNewTask('');
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

    return (
        <div>
            <h1>To-Do List</h1>
            <div>
                <input
                    type="text"
                    value={newTask}
                    onChange={handleInputChange}
                    placeholder="Digite uma nova tarefa"
                />
                <button onClick={addTask}>Adicionar</button>
            </div>
            <ul>
                {tasks.map((task, index) => (
                    <li key={index}>
                        {task}
                        <button onClick={() => movePriorityUp(index)}>↑</button>
                        <button onClick={() => movePriorityDown(index)}>↓</button>
                        <button onClick={() => deleteTask(index)}>Feito</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ToDoList;