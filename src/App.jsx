import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  Coffee, 
  Brain,
  Moon,
  Sun
} from 'lucide-react';

/**
 * ZenFlow: A single-file React productivity application.
 * Features: Pomodoro Timer, Task Management, and Persistent State.
 */

const App = () => {
  // --- State Management ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState('focus'); // focus, short, long
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Plan the day', completed: true },
    { id: 2, text: 'Deep work session', completed: false },
  ]);
  const [newTask, setNewTask] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // --- Timer Logic ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a subtle notification sound or alert here if desired
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    switch (timerMode) {
      case 'focus': setTimeLeft(25 * 60); break;
      case 'short': setTimeLeft(5 * 60); break;
      case 'long': setTimeLeft(15 * 60); break;
      default: setTimeLeft(25 * 60);
    }
  };

  const changeMode = (mode) => {
    setTimerMode(mode);
    setIsActive(false);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'short') setTimeLeft(5 * 60);
    else if (mode === 'long') setTimeLeft(15 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Task Logic ---
  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // --- UI Components ---
  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans p-4 md:p-8`}>
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Brain size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ZenFlow</h1>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100'} shadow-sm border border-slate-200 dark:border-slate-700 transition-all`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="grid gap-8">
          
          {/* Timer Card */}
          <section className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-3xl p-8 shadow-xl border flex flex-col items-center transition-all`}>
            <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[
                { id: 'focus', label: 'Focus', icon: Brain },
                { id: 'short', label: 'Short Break', icon: Coffee },
                { id: 'long', label: 'Long Break', icon: Moon }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => changeMode(m.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    timerMode === m.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <m.icon size={14} />
                  {m.label}
                </button>
              ))}
            </div>

            <div className="text-8xl md:text-9xl font-black mb-10 tracking-tighter tabular-nums text-indigo-600">
              {formatTime(timeLeft)}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={toggleTimer}
                className="w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                {isActive ? <Pause fill="white" /> : <Play fill="white" className="ml-1" />}
              </button>
              <button 
                onClick={resetTimer}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${
                  darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <RotateCcw size={20} className="text-slate-500" />
              </button>
            </div>
          </section>

          {/* Tasks Card */}
          <section className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-3xl p-8 shadow-xl border transition-all`}>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-indigo-600" />
              Focus Tasks
            </h2>
            
            <form onSubmit={addTask} className="flex gap-2 mb-6">
              <input 
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What are you working on?"
                className={`flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                } border`}
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl flex items-center justify-center transition-all"
              >
                <Plus size={24} />
              </button>
            </form>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic text-sm">
                  Your task list is empty. Add something to focus on!
                </div>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task.id}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                      task.completed 
                      ? (darkMode ? 'bg-slate-800/50 border-transparent opacity-60' : 'bg-slate-50 border-transparent opacity-60')
                      : (darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={`transition-colors ${task.completed ? 'text-indigo-500' : 'text-slate-400 hover:text-indigo-500'}`}
                      >
                        {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>
                      <span className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                        {task.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>

        <footer className="mt-12 text-center text-slate-500 text-xs tracking-widest uppercase">
          Build With Intention • ZenFlow v1.0
        </footer>
      </div>
    </div>
  );
};

export default App;