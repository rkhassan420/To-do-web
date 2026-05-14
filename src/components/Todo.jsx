import { useRef, useState, useEffect, useCallback } from "react"
import { FiSun, FiMoon, FiPlus, FiTrash2, FiEdit3, FiCheck, FiX, FiFlag, FiTag, FiCalendar, FiFilter } from "react-icons/fi"
import { MdDragIndicator } from "react-icons/md"
import './todo.css'

const CATEGORIES = ['Work', 'Personal', 'Health', 'Finance', 'Study']
const PRIORITIES = ['high', 'medium', 'low']

const PRIORITY_META = {
  high:   { label: 'High',   color: 'priority-high' },
  medium: { label: 'Med',    color: 'priority-medium' },
  low:    { label: 'Low',    color: 'priority-low' },
}

function isOverdue(task) {
  if (task.isComplete || !task.due) return false
  return new Date(task.due) < new Date(new Date().toISOString().split('T')[0])
}

function ProgressRing({ pct }) {
  const r = 22, c = 2 * Math.PI * r
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" strokeWidth="3" className="ring-track" />
      <circle
        cx="28" cy="28" r={r} fill="none" strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        strokeLinecap="round" className="ring-fill"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x="28" y="33" textAnchor="middle" className="ring-text">{pct}%</text>
    </svg>
  )
}

function TaskCard({ task, onToggle, onDelete, onEdit, dragHandlers }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const editRef = useRef()

  useEffect(() => { if (editing) editRef.current?.focus() }, [editing])

  const saveEdit = () => {
    const t = editText.trim()
    if (t) onEdit(task.id, t)
    setEditing(false)
  }

  const over = isOverdue(task)
  const pm = PRIORITY_META[task.priority]

  return (
    <div
      className={`task-card ${task.isComplete ? 'task-done' : ''} ${over ? 'task-overdue' : ''}`}
      data-priority={task.priority}
    >
      <span className="drag-handle" {...dragHandlers} title="Drag to reorder">
        <MdDragIndicator />
      </span>

      <button
        className={`check-circle ${task.isComplete ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
        aria-label="Toggle complete"
      >
        {task.isComplete && <FiCheck strokeWidth={3} />}
      </button>

      <div className="task-body">
        {editing ? (
          <input
            ref={editRef}
            className="inline-edit"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
          />
        ) : (
          <p className={`task-text ${task.isComplete ? 'striked' : ''}`}>{task.text}</p>
        )}

        <div className="task-chips">
          <span className={`chip ${pm.color}`}>
            <FiFlag size={10} /> {pm.label}
          </span>
          <span className="chip chip-cat">
            <FiTag size={10} /> {task.category}
          </span>
          {task.due && (
            <span className={`chip ${over ? 'chip-overdue' : 'chip-due'}`}>
              <FiCalendar size={10} />
              {over ? 'Overdue · ' : ''}{task.due}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" onClick={() => setEditing(true)} title="Edit" aria-label="Edit task">
          <FiEdit3 size={14} />
        </button>
        <button className="icon-btn danger" onClick={() => onDelete(task.id)} title="Delete" aria-label="Delete task">
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export const Todo = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light-theme')
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ReactTaskV2')) || [] } catch { return [] }
  })
  const [filter, setFilter] = useState('all')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('Work')
  const [due, setDue] = useState('')
  const [celebrated, setCelebrated] = useState(false)
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const inputRef = useRef()

  useEffect(() => { document.body.className = theme }, [theme])
  useEffect(() => { localStorage.setItem('ReactTaskV2', JSON.stringify(tasks)) }, [tasks])

  const toggleTheme = () => {
    const next = theme === 'dark-theme' ? 'light-theme' : 'dark-theme'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  const addTask = () => {
    const text = inputRef.current?.value.trim()
    if (!text) return
    setTasks(prev => [{
      id: Date.now(), text, priority, category,
      due: due || null, isComplete: false,
    }, ...prev])
    inputRef.current.value = ''
  }

  const toggleComplete = id => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isComplete: !t.isComplete } : t))
  }

  const deleteTask = id => setTasks(prev => prev.filter(t => t.id !== id))

  const editTask = (id, text) => setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t))

  const clearCompleted = () => setTasks(prev => prev.filter(t => !t.isComplete))

  // Celebrate when all done
  useEffect(() => {
    if (tasks.length > 0 && tasks.every(t => t.isComplete) && !celebrated) {
      setCelebrated(true)
      setTimeout(() => setCelebrated(false), 3000)
    }
    if (!tasks.every(t => t.isComplete)) setCelebrated(false)
  }, [tasks])

  // Delete key removes completed
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Delete' && document.activeElement.tagName !== 'INPUT') {
        setTasks(prev => prev.filter(t => !t.isComplete))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Drag & drop
  const onDragStart = (e, id) => { setDragging(id); e.dataTransfer.effectAllowed = 'move' }
  const onDragOver = (e, id) => { e.preventDefault(); setDragOver(id) }
  const onDrop = (e, targetId) => {
    e.preventDefault()
    if (dragging === targetId) return
    setTasks(prev => {
      const arr = [...prev]
      const from = arr.findIndex(t => t.id === dragging)
      const to = arr.findIndex(t => t.id === targetId)
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
    setDragging(null); setDragOver(null)
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const total = tasks.length
  const done = tasks.filter(t => t.isComplete).length
  const overdue = tasks.filter(isOverdue).length
  const pct = total ? Math.round((done / total) * 100) : 0

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'done', label: 'Done' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'high', label: '🔴 High' },
  ]

  const visible = tasks.filter(t => {
    if (filter === 'active') return !t.isComplete
    if (filter === 'done') return t.isComplete
    if (filter === 'overdue') return isOverdue(t)
    if (filter === 'high') return t.priority === 'high' && !t.isComplete
    return true
  })

  return (
    <div className="main-container">
      {celebrated && (
        <div className="celebrate-overlay" aria-live="polite">
          <div className="celebrate-emoji">🎉</div>
          <p>All tasks complete!</p>
        </div>
      )}

      {/* Top bar */}
      <div className="top-bar">
        <span className="date-label">{dateStr}</span>
        <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark-theme' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>

      {/* Header + progress */}
      <div className="header-row">
        <div>
          <h1 className="app-title">My Tasks</h1>
          <p className="task-summary">
            {done} of {total} complete{overdue > 0 ? ` · ${overdue} overdue` : ''}
          </p>
        </div>
        <ProgressRing pct={pct} />
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>

      {/* Input area */}
      <div className="input-section">
        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            placeholder="Add a new task…"
            className="task-input"
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button className="add-btn" onClick={addTask} aria-label="Add task">
            <FiPlus size={20} strokeWidth={2.5} />
          </button>
        </div>
        <div className="meta-row">
          <select className="meta-select" value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_META[p].label} priority</option>)}
          </select>
          <select className="meta-select" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="date"
            className="meta-select date-pick"
            value={due}
            onChange={e => setDue(e.target.value)}
            title="Due date"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-pill ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        {done > 0 && (
          <button className="filter-pill clear-btn" onClick={clearCompleted}>
            <FiX size={11} /> Clear done
          </button>
        )}
      </div>

      {/* Task list */}
      <div className="scroll-container">
        {visible.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✓</span>
            <p>No tasks here</p>
          </div>
        ) : (
          visible.map(task => (
            <div
              key={task.id}
              className={`drag-wrapper ${dragOver === task.id ? 'drag-target' : ''}`}
              onDragOver={e => onDragOver(e, task.id)}
              onDrop={e => onDrop(e, task.id)}
            >
              <TaskCard
                task={task}
                onToggle={toggleComplete}
                onDelete={deleteTask}
                onEdit={editTask}
                dragHandlers={{
                  draggable: true,
                  onDragStart: e => onDragStart(e, task.id),
                  onDragEnd: () => { setDragging(null); setDragOver(null) },
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {total > 0 && (
        <div className="footer-row">
          <span>{total - done} remaining</span>
          <button className="text-btn danger" onClick={() => setTasks([])}>Delete all</button>
        </div>
      )}
    </div>
  )
}