import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/i18nProvider';
import { Link } from 'react-router-dom';

const DEFAULT_TASK_KEYS = [
  { id: 't1', keyTitle: 'tracker.default_tasks.t1_title', keyDesc: 'tracker.default_tasks.t1_desc', category: 'screening', priority: 'high', link: '/screener' },
  { id: 't2', keyTitle: 'tracker.default_tasks.t2_title', keyDesc: 'tracker.default_tasks.t2_desc', category: 'screening', priority: 'high' },
  { id: 't3', keyTitle: 'tracker.default_tasks.t3_title', keyDesc: 'tracker.default_tasks.t3_desc', category: 'language', priority: 'high', link: '/compliance' },
  { id: 't4', keyTitle: 'tracker.default_tasks.t4_title', keyDesc: 'tracker.default_tasks.t4_desc', category: 'community', priority: 'medium', link: '/resources' },
  { id: 't5', keyTitle: 'tracker.default_tasks.t5_title', keyDesc: 'tracker.default_tasks.t5_desc', category: 'insurance', priority: 'medium', link: '/bill-s634b' },
  { id: 't6', keyTitle: 'tracker.default_tasks.t6_title', keyDesc: 'tracker.default_tasks.t6_desc', category: 'lifestyle', priority: 'normal' },
  { id: 't7', keyTitle: 'tracker.default_tasks.t7_title', keyDesc: 'tracker.default_tasks.t7_desc', category: 'lifestyle', priority: 'normal' },
];

const STORAGE_KEY = 'aapi_health_task_tracker_v1';

function ProcessTaskTracker() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('screening');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  // Load state from localStorage or initialize defaults
  useEffect(() => {
    document.title = `${t('tracker.title')} — AAPICHECK`;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTasks(JSON.parse(saved));
      } else {
        const initial = DEFAULT_TASK_KEYS.map((dt) => ({
          id: dt.id,
          isDefault: true,
          keyTitle: dt.keyTitle,
          keyDesc: dt.keyDesc,
          category: dt.category,
          priority: dt.priority,
          link: dt.link || null,
          completed: false,
          createdAt: Date.now(),
        }));
        setTasks(initial);
      }
    } catch (e) {
      console.error('Failed to parse saved task tracker state', e);
    }
  }, [t]);

  // Persist state to localStorage on updates
  const updateTasksState = (newTasks) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {
      console.error('Failed to save task tracker state', e);
    }
  };

  const toggleTask = (id) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    updateTasksState(updated);
  };

  const deleteTask = (id) => {
    const updated = tasks.filter((task) => task.id !== id);
    updateTasksState(updated);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const customTask = {
      id: `custom_${Date.now()}`,
      isDefault: false,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      completed: false,
      createdAt: Date.now(),
    };

    updateTasksState([customTask, ...tasks]);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const resetDefaultTasks = () => {
    if (window.confirm(t('tracker.reset_confirm'))) {
      const initial = DEFAULT_TASK_KEYS.map((dt) => ({
        id: dt.id,
        isDefault: true,
        keyTitle: dt.keyTitle,
        keyDesc: dt.keyDesc,
        category: dt.category,
        priority: dt.priority,
        link: dt.link || null,
        completed: false,
        createdAt: Date.now(),
      }));
      updateTasksState(initial);
    }
  };

  const exportSummary = () => {
    const total = tasks.length;
    const completedCount = tasks.filter((t) => t.completed).length;
    const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    let textContent = `========================================================\n`;
    textContent += ` AAPI HEALTH EQUITY - DIABETES PREVENTION ACTION PLAN\n`;
    textContent += ` Exported Date: ${new Date().toLocaleDateString()}\n`;
    textContent += ` Progress: ${completedCount}/${total} tasks completed (${pct}%)\n`;
    textContent += `========================================================\n\n`;

    tasks.forEach((task, idx) => {
      const title = task.isDefault ? t(task.keyTitle) : task.title;
      const desc = task.isDefault ? t(task.keyDesc) : '';
      const statusStr = task.completed ? '[X] COMPLETED' : '[ ] PENDING';
      textContent += `${idx + 1}. ${statusStr} - ${title}\n`;
      textContent += `   Category: ${task.category.toUpperCase()} | Priority: ${task.priority.toUpperCase()}\n`;
      if (desc) textContent += `   Note: ${desc}\n`;
      textContent += `\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AAPI_Health_Action_Plan_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printActionPlan = () => {
    window.print();
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = activeCategory === 'all' || task.category === activeCategory;
    const matchesStatus =
      activeStatus === 'all' ||
      (activeStatus === 'completed' && task.completed) ||
      (activeStatus === 'pending' && !task.completed);
    return matchesCategory && matchesStatus;
  });

  const categories = [
    { id: 'all', label: t('tracker.category_all'), icon: '📂' },
    { id: 'screening', label: t('tracker.category_screening'), icon: '📊' },
    { id: 'language', label: t('tracker.category_language'), icon: '🗣️' },
    { id: 'community', label: t('tracker.category_community'), icon: '🤝' },
    { id: 'insurance', label: t('tracker.category_insurance'), icon: '📜' },
    { id: 'lifestyle', label: t('tracker.category_lifestyle'), icon: '🥗' },
  ];

  return (
    <div className="page-enter tracker-page">
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        
        {/* === HEADER BANNER === */}
        <header className="tracker-header glass-card" id="tracker-header">
          <div className="tracker-header__content">
            <span className="hero__badge">✦ {t('tracker.badge')}</span>
            <h1>{t('tracker.title')}</h1>
            <p>{t('tracker.subtitle')}</p>
          </div>

          <div className="tracker-progress-box">
            <div className="tracker-progress-box__top">
              <span className="tracker-progress-box__title">{t('tracker.progress_title')}</span>
              <span className="tracker-progress-box__value">{progressPercent}%</span>
            </div>
            <div className="progress-bar-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="tracker-progress-box__sub">
              <span>{completedTasks} / {totalTasks} {t('tracker.progress_completed')}</span>
            </div>
          </div>
        </header>

        {/* === ACTION TOOLBAR === */}
        <div className="tracker-toolbar" id="tracker-toolbar">
          <div className="tracker-toolbar__left">
            <button className="btn btn--primary" onClick={() => setShowAddModal(true)} id="btn-add-task">
              {t('tracker.add_task_btn')}
            </button>
            <button className="btn btn--secondary" onClick={exportSummary} id="btn-export">
              {t('tracker.export_btn')}
            </button>
            <button className="btn btn--secondary" onClick={printActionPlan} id="btn-print">
              {t('tracker.print_btn')}
            </button>
          </div>
          <div className="tracker-toolbar__right">
            <button className="btn btn--ghost" onClick={resetDefaultTasks} id="btn-reset" title="Reset default checklist">
              {t('tracker.reset_btn')}
            </button>
          </div>
        </div>

        {/* === FILTERS & CATEGORIES === */}
        <div className="tracker-controls">
          {/* Category Tabs */}
          <div className="tracker-category-tabs" role="tablist" aria-label="Task categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`tracker-tab ${activeCategory === cat.id ? 'tracker-tab--active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                id={`cat-tab-${cat.id}`}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="tracker-status-pills">
            <button
              className={`pill-btn ${activeStatus === 'all' ? 'pill-btn--active' : ''}`}
              onClick={() => setActiveStatus('all')}
              id="filter-status-all"
            >
              {t('tracker.filter_all')} ({totalTasks})
            </button>
            <button
              className={`pill-btn ${activeStatus === 'pending' ? 'pill-btn--active' : ''}`}
              onClick={() => setActiveStatus('pending')}
              id="filter-status-pending"
            >
              {t('tracker.filter_pending')} ({totalTasks - completedTasks})
            </button>
            <button
              className={`pill-btn ${activeStatus === 'completed' ? 'pill-btn--active' : ''}`}
              onClick={() => setActiveStatus('completed')}
              id="filter-status-completed"
            >
              {t('tracker.filter_completed')} ({completedTasks})
            </button>
          </div>
        </div>

        {/* === TASK LIST === */}
        <div className="tracker-list" id="tracker-list">
          {filteredTasks.length === 0 ? (
            <div className="glass-card tracker-empty">
              <div className="tracker-empty__icon">📌</div>
              <p>{t('tracker.empty_state')}</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const title = task.isDefault ? t(task.keyTitle) : task.title;
              const desc = task.isDefault ? t(task.keyDesc) : '';
              const priorityKey = `tracker.priority_${task.priority}`;
              const priorityLabel = t(priorityKey) !== priorityKey ? t(priorityKey) : task.priority;

              return (
                <div
                  key={task.id}
                  className={`glass-card task-card ${task.completed ? 'task-card--completed' : ''}`}
                  id={`task-item-${task.id}`}
                >
                  <label className="task-card__checkbox-container">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                      aria-label={title}
                    />
                    <span className="task-checkmark" />
                  </label>

                  <div className="task-card__body">
                    <div className="task-card__header">
                      <h3 className="task-card__title">{title}</h3>
                      <div className="task-card__meta">
                        <span className={`priority-badge priority-badge--${task.priority}`}>
                          {priorityLabel}
                        </span>
                        <span className="category-badge">
                          {task.category}
                        </span>
                      </div>
                    </div>

                    {desc && <p className="task-card__desc">{desc}</p>}

                    {task.link && (
                      <div className="task-card__link">
                        <Link to={task.link} className="task-card__action-link">
                          Explore Tool →
                        </Link>
                      </div>
                    )}
                  </div>

                  <button
                    className="task-card__delete"
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                    aria-label={`Delete task: ${title}`}
                  >
                    🗑️
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* === ADD TASK MODAL === */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="modal-add-title">
            <div className="modal-header">
              <h2 id="modal-add-title">{t('tracker.modal_add_title')}</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)} aria-label="Close modal">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddTask} className="modal-form">
              <div className="form-group">
                <label htmlFor="task-title-input">{t('tracker.task_title_label')}</label>
                <input
                  id="task-title-input"
                  type="text"
                  className="form-input"
                  placeholder={t('tracker.task_title_placeholder')}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-category-select">{t('tracker.task_category_label')}</label>
                <select
                  id="task-category-select"
                  className="form-input"
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                >
                  <option value="screening">{t('tracker.category_screening')}</option>
                  <option value="language">{t('tracker.category_language')}</option>
                  <option value="community">{t('tracker.category_community')}</option>
                  <option value="insurance">{t('tracker.category_insurance')}</option>
                  <option value="lifestyle">{t('tracker.category_lifestyle')}</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-priority-select">{t('tracker.task_priority_label')}</label>
                <select
                  id="task-priority-select"
                  className="form-input"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                >
                  <option value="high">{t('tracker.priority_high')}</option>
                  <option value="medium">{t('tracker.priority_medium')}</option>
                  <option value="normal">{t('tracker.priority_normal')}</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowAddModal(false)}>
                  {t('tracker.cancel')}
                </button>
                <button type="submit" className="btn btn--primary">
                  {t('tracker.save_task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessTaskTracker;
