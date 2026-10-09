import { lazy, Suspense, useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Coffee,
  Ellipsis,
  Filter,
  ForkKnife,
  House,
  Laptop,
  Leaf,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import './App.css'

const WeatherCard = lazy(() => import('./WeatherCard.jsx'))
const TransactionForm = lazy(() => import('./FinanceModals.jsx').then((module) => ({ default: module.TransactionForm })))
const CategoryManager = lazy(() => import('./FinanceModals.jsx').then((module) => ({ default: module.CategoryManager })))
const BudgetForm = lazy(() => import('./FinanceModals.jsx').then((module) => ({ default: module.BudgetForm })))

const STORAGE_KEY = 'morrow-finance-dashboard-v1'
const palette = ['#295c47', '#df8161', '#637cba', '#cb9d3e', '#8b75b5', '#5c9b8d', '#d26c8a', '#82934a']
const categoryIcons = {
  Housing: House,
  Groceries: ShoppingBag,
  Dining: ForkKnife,
  Transport: ArrowLeftRight,
  Shopping: ShoppingBag,
  Health: Leaf,
  Salary: BriefcaseBusiness,
  Freelance: Laptop,
  Coffee,
  Other: Tag,
}

const money = (value, compact = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(value)

const dateKey = (date) => {
  const localDate = new Date(date)
  return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`
}

const shiftMonth = (monthKey, amount) => {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + amount, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const labelMonth = (monthKey, options = { month: 'short' }) =>
  new Date(`${monthKey}-01T12:00:00`).toLocaleDateString('en-US', options)

function getInitialData() {
  const today = new Date()
  const atDay = (daysAgo) => {
    const date = new Date(today)
    date.setDate(today.getDate() - daysAgo)
    return dateKey(date)
  }
  const categories = [
    { id: 'housing', name: 'Housing', color: palette[0] },
    { id: 'groceries', name: 'Groceries', color: palette[1] },
    { id: 'dining', name: 'Dining', color: palette[2] },
    { id: 'transport', name: 'Transport', color: palette[3] },
    { id: 'shopping', name: 'Shopping', color: palette[4] },
    { id: 'health', name: 'Health', color: palette[5] },
    { id: 'salary', name: 'Salary', color: '#397a54', type: 'income' },
    { id: 'freelance', name: 'Freelance', color: '#5871b4', type: 'income' },
  ]
  const transactions = [
    { id: 'tx-1', name: 'Paycheck', category: 'Salary', amount: 4850, type: 'income', date: atDay(1), note: 'Monthly salary' },
    { id: 'tx-2', name: 'Apartment rent', category: 'Housing', amount: 1450, type: 'expense', date: atDay(2), note: 'Monthly rent' },
    { id: 'tx-3', name: 'Fresh Market', category: 'Groceries', amount: 86.42, type: 'expense', date: atDay(2), note: '' },
    { id: 'tx-4', name: 'Blue Bottle Coffee', category: 'Dining', amount: 8.5, type: 'expense', date: atDay(3), note: '' },
    { id: 'tx-5', name: 'Monthly transit pass', category: 'Transport', amount: 72, type: 'expense', date: atDay(4), note: '' },
    { id: 'tx-6', name: 'Freelance project', category: 'Freelance', amount: 620, type: 'income', date: atDay(5), note: 'Brand identity project' },
    { id: 'tx-7', name: 'Weekend dinner', category: 'Dining', amount: 54, type: 'expense', date: atDay(6), note: '' },
    { id: 'tx-8', name: 'Pharmacy', category: 'Health', amount: 24.8, type: 'expense', date: atDay(7), note: '' },
    { id: 'tx-9', name: 'Weekly groceries', category: 'Groceries', amount: 112.36, type: 'expense', date: atDay(9), note: '' },
    { id: 'tx-10', name: 'New headphones', category: 'Shopping', amount: 129, type: 'expense', date: atDay(11), note: '' },
    { id: 'tx-11', name: 'Rideshare', category: 'Transport', amount: 18.4, type: 'expense', date: atDay(12), note: '' },
    { id: 'tx-12', name: 'Lunch with Maya', category: 'Dining', amount: 32.75, type: 'expense', date: atDay(14), note: '' },
  ]
  for (let monthsAgo = 1; monthsAgo <= 5; monthsAgo += 1) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1)
    const monthPrefix = `history-${monthsAgo}`
    const onDay = (day) => dateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), day))
    transactions.push(
      { id: `${monthPrefix}-salary`, name: 'Paycheck', category: 'Salary', amount: 4850, type: 'income', date: onDay(1), note: 'Monthly salary' },
      { id: `${monthPrefix}-rent`, name: 'Apartment rent', category: 'Housing', amount: 1450, type: 'expense', date: onDay(2), note: 'Monthly rent' },
      { id: `${monthPrefix}-groceries`, name: 'Groceries', category: 'Groceries', amount: 315 + monthsAgo * 8, type: 'expense', date: onDay(8), note: '' },
      { id: `${monthPrefix}-dining`, name: 'Dining out', category: 'Dining', amount: 180 + monthsAgo * 11, type: 'expense', date: onDay(15), note: '' },
      { id: `${monthPrefix}-transport`, name: 'Transit pass', category: 'Transport', amount: 95, type: 'expense', date: onDay(20), note: '' },
    )
  }
  const budgets = Object.fromEntries(categories.filter((category) => !category.type).map((category) => [category.name, category.name === 'Housing' ? 1600 : category.name === 'Groceries' ? 500 : category.name === 'Dining' ? 350 : category.name === 'Transport' ? 220 : category.name === 'Shopping' ? 300 : 180]))
  budgets.total = 3600
  return { transactions, categories, budgets, selectedMonth: dateKey(today).slice(0, 7) }
}

function loadData() {
  const fallback = getInitialData()
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved || !Array.isArray(saved.transactions) || !Array.isArray(saved.categories)) return fallback
    return { ...fallback, ...saved, budgets: { ...fallback.budgets, ...saved.budgets } }
  } catch {
    return fallback
  }
}

function CategoryMark({ category, categories }) {
  const definition = categories.find((item) => item.name === category)
  const Icon = categoryIcons[category] || Tag
  return <span className="category-mark" style={{ '--category-color': definition?.color || '#829087' }}><Icon size={17} strokeWidth={1.8} /></span>
}

function App() {
  const [data, setData] = useState(loadData)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [typeFilter, setTypeFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const { transactions, categories, budgets, selectedMonth } = data
  const monthTransactions = transactions.filter((transaction) => transaction.date.slice(0, 7) === selectedMonth)
  const monthExpenses = monthTransactions.filter((transaction) => transaction.type === 'expense')
  const monthIncome = monthTransactions.filter((transaction) => transaction.type === 'income')
  const totalSpent = monthExpenses.reduce((total, transaction) => total + transaction.amount, 0)
  const totalIncome = monthIncome.reduce((total, transaction) => total + transaction.amount, 0)
  const budget = Number(budgets.total) || 0
  const budgetPercent = budget ? Math.min((totalSpent / budget) * 100, 100) : 0
  const budgetLeft = budget - totalSpent
  const filteredTransactions = monthTransactions
    .filter((transaction) => transaction.name.toLowerCase().includes(query.toLowerCase()) || transaction.note.toLowerCase().includes(query.toLowerCase()))
    .filter((transaction) => categoryFilter === 'All categories' || transaction.category === categoryFilter)
    .filter((transaction) => typeFilter === 'all' || transaction.type === typeFilter)
    .sort((first, second) => second.date.localeCompare(first.date))
  const visibleTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 7)
  const categoryTotals = categories.map((category) => ({
    ...category,
    total: monthExpenses.filter((transaction) => transaction.category === category.name).reduce((total, transaction) => total + transaction.amount, 0),
  })).filter((category) => category.total > 0).sort((first, second) => second.total - first.total)
  const chartMonths = Array.from({ length: 6 }, (_, index) => shiftMonth(selectedMonth, index - 5))
  const monthlyData = chartMonths.map((month) => {
    const items = transactions.filter((transaction) => transaction.date.slice(0, 7) === month)
    return {
      month,
      expenses: items.filter((transaction) => transaction.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
      income: items.filter((transaction) => transaction.type === 'income').reduce((sum, item) => sum + item.amount, 0),
    }
  })
  const maxChartValue = Math.max(100, ...monthlyData.flatMap((month) => [month.expenses, month.income]))
  const chartPoints = (key) => monthlyData.map((month, index) => `${48 + index * 100},${210 - (month[key] / maxChartValue) * 160}`).join(' ')
  const categoryGradient = categoryTotals.length
    ? `conic-gradient(${categoryTotals.reduce((parts, category, index) => {
      const start = categoryTotals.slice(0, index).reduce((sum, item) => sum + (item.total / totalSpent) * 100, 0)
      const end = start + (category.total / totalSpent) * 100
      parts.push(`${category.color} ${start}% ${end}%`)
      return parts
    }, []).join(', ')})`
    : 'conic-gradient(#e8e9e3 0% 100%)'
  const monthTitle = labelMonth(selectedMonth, { month: 'long', year: 'numeric' })
  const currentMonth = dateKey(new Date()).slice(0, 7)
  const hasFilters = query || categoryFilter !== 'All categories' || typeFilter !== 'all'

  function updateData(updater) {
    setData((current) => ({ ...current, ...updater(current) }))
  }

  function saveTransaction(transaction) {
    updateData((current) => {
      const exists = current.transactions.some((item) => item.id === transaction.id)
      const saved = { ...transaction, id: transaction.id || `tx-${crypto.randomUUID()}` }
      return { transactions: exists ? current.transactions.map((item) => item.id === saved.id ? saved : item) : [saved, ...current.transactions] }
    })
    setModal(null)
  }

  function saveCategories(nextCategories) {
    const nextNames = new Set(nextCategories.map((category) => category.name))
    const fallbackCategory = nextCategories.find((category) => !category.type)?.name || nextCategories[0]?.name
    updateData((current) => {
      const categoryNameChanges = new Map()
      current.categories.forEach((oldCategory) => {
        const matching = nextCategories.find((category) => category.id === oldCategory.id)
        if (matching && matching.name !== oldCategory.name) categoryNameChanges.set(oldCategory.name, matching.name)
      })
      const removedNames = new Set(current.categories.filter((category) => !nextCategories.some((item) => item.id === category.id)).map((category) => category.name))
      const nextTransactions = current.transactions.map((transaction) => {
        const updatedName = categoryNameChanges.get(transaction.category) || transaction.category
        return removedNames.has(transaction.category) || !nextNames.has(updatedName) ? { ...transaction, category: fallbackCategory } : { ...transaction, category: updatedName }
      })
      const nextBudgets = { ...current.budgets }
      categoryNameChanges.forEach((name, oldName) => {
        if (nextBudgets[oldName] !== undefined) {
          nextBudgets[name] = nextBudgets[oldName]
          delete nextBudgets[oldName]
        }
      })
      removedNames.forEach((name) => delete nextBudgets[name])
      return { categories: nextCategories, transactions: nextTransactions, budgets: nextBudgets }
    })
    setCategoryFilter((current) => nextNames.has(current) ? current : 'All categories')
    setModal(null)
  }

  function deleteTransaction(id) {
    updateData((current) => ({ transactions: current.transactions.filter((item) => item.id !== id) }))
  }

  function changeMonth(offset) {
    updateData((current) => ({ selectedMonth: shiftMonth(current.selectedMonth, offset) }))
    setShowAll(false)
  }

  function selectNav(name) {
    setActiveNav(name)
    if (name === 'Categories') setModal({ type: 'categories' })
    if (name === 'Transactions') document.getElementById('transactions')?.scrollIntoView({ behavior: 'smooth' })
    if (name === 'Budgets') document.getElementById('budget-card')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setActiveNav('Overview')}><span className="brand-mark"><span /><span /><span /><span /></span><span>morrow<span className="brand-period">.</span></span></a>
        <div className="sidebar-caption">YOUR SPACE</div>
        <nav className="main-nav" aria-label="Main navigation">{[
          { name: 'Overview', icon: Wallet }, { name: 'Transactions', icon: ArrowLeftRight }, { name: 'Categories', icon: Tag }, { name: 'Budgets', icon: SlidersHorizontal },
        ].map(({ name, icon: Icon }) => <button key={name} type="button" className={`nav-item${activeNav === name ? ' active' : ''}`} onClick={() => selectNav(name)}><Icon size={18} strokeWidth={1.8} /><span>{name}</span>{name === 'Transactions' && <span className="nav-count">{monthTransactions.length}</span>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="sidebar-tip"><span className="tip-icon"><Sparkles size={17} /></span><strong>A little progress adds up.</strong><p>You have logged {monthTransactions.length} transactions this month. Nice work keeping track.</p></div><button type="button" className="profile-button"><span className="avatar">J</span><span className="profile-copy"><strong>Jamie Parker</strong><small>Personal account</small></span><Ellipsis size={18} /></button></div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar"><div className="breadcrumb"><span>Personal</span><span className="breadcrumb-slash">/</span><strong>{activeNav}</strong></div><div className="topbar-right"><span className="sync-status"><span /> Up to date</span><button type="button" className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><span className="top-avatar">J</span></div></header>
        <div className="page-content">
          <section className="welcome-row"><div><p className="eyebrow">A FRESH LOOK AT YOUR FINANCES</p><h1>Good morning, Jamie<span>.</span></h1><p className="welcome-subtitle">Here's where your money is going this month.</p></div><button type="button" className="button button-primary add-transaction" onClick={() => setModal({ type: 'transaction' })}><Plus size={17} /> Add transaction</button></section>
          <section className="month-toolbar" aria-label="Choose month"><div className="month-selector"><CalendarDays size={16} /><strong>{monthTitle}</strong><button className="month-arrow" type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronDown size={15} /></button><button className="month-arrow next-month" type="button" aria-label="Next month" disabled={selectedMonth >= currentMonth} onClick={() => changeMonth(1)}><ChevronDown size={15} /></button></div>{selectedMonth !== currentMonth && <button type="button" className="text-button" onClick={() => updateData(() => ({ selectedMonth: currentMonth }))}>Back to this month</button>}</section>

          <section className="stats-grid" aria-label="Monthly summary">
            <article className="stat-card stat-balance"><div className="stat-card-top"><span className="stat-label">Left after spending</span><span className="stat-icon balance-icon"><Wallet size={18} /></span></div><strong className="stat-value">{money(totalIncome - totalSpent)}</strong><div className="stat-foot"><span className="trend-pill"><TrendingUp size={13} /> {totalIncome ? `${Math.round((totalIncome - totalSpent) / totalIncome * 100)}%` : '0%'}</span><span>of income remaining</span></div><span className="card-decoration decoration-one" /><span className="card-decoration decoration-two" /></article>
            <article className="stat-card"><div className="stat-card-top"><span className="stat-label">Money in</span><span className="stat-icon income-icon"><ArrowDownLeft size={18} /></span></div><strong className="stat-value">{money(totalIncome)}</strong><div className="stat-foot"><span className="stat-foot-muted">{monthIncome.length} {monthIncome.length === 1 ? 'deposit' : 'deposits'} this month</span></div><span className="sparkline sparkline-up" aria-hidden="true"><svg viewBox="0 0 120 34"><path d="M1 29 C14 26 18 30 29 21 S44 24 54 15 67 21 78 12 94 20 104 6 114 10 119 2" /></svg></span></article>
            <article className="stat-card"><div className="stat-card-top"><span className="stat-label">Money out</span><span className="stat-icon expense-icon"><ArrowUpRight size={18} /></span></div><strong className="stat-value">{money(totalSpent)}</strong><div className="stat-foot"><span className="stat-foot-muted">{monthExpenses.length} {monthExpenses.length === 1 ? 'purchase' : 'purchases'} this month</span></div><span className="sparkline sparkline-down" aria-hidden="true"><svg viewBox="0 0 120 34"><path d="M1 6 C12 10 17 4 28 13 S42 7 55 17 69 13 80 23 94 15 105 27 115 22 119 31" /></svg></span></article>
            <article className="stat-card budget-stat" id="budget-card"><div className="stat-card-top"><span className="stat-label">Monthly budget</span><button className="edit-budget-link" type="button" onClick={() => setModal({ type: 'budget' })}>Edit <SlidersHorizontal size={13} /></button></div><strong className="stat-value">{money(Math.max(budgetLeft, 0))}<span className="stat-denominator"> / {money(budget, true)}</span></strong><div className="budget-progress"><span style={{ width: `${budgetPercent}%` }} className={budgetLeft < 0 ? 'over-budget' : ''} /></div><div className="stat-foot"><span>{budgetLeft >= 0 ? `${money(budgetLeft)} left to spend` : `${money(Math.abs(budgetLeft))} over budget`}</span><span>{budget ? Math.round(totalSpent / budget * 100) : 0}%</span></div></article>
          </section>

          <section className="insights-grid" aria-label="Spending analytics">
            <article className="panel spending-panel"><div className="panel-header"><div><span className="eyebrow">THE BIG PICTURE</span><h2>Income & spending</h2><p className="panel-subtitle">A monthly view of your money flow</p></div><div className="chart-legend"><span><i className="legend-dot income-dot" /> Income</span><span><i className="legend-dot expense-dot" /> Spending</span></div></div>
              <div className="line-chart-wrap"><div className="chart-y-labels"><span>{money(maxChartValue, true)}</span><span>{money(maxChartValue * .66, true)}</span><span>{money(maxChartValue * .33, true)}</span><span>$0</span></div><svg className="line-chart" viewBox="0 0 548 220" preserveAspectRatio="none" role="img" aria-label="Income and spending across the last six months">{[50, 103, 156, 210].map((y) => <line key={y} x1="40" x2="540" y1={y} y2={y} className="chart-gridline" />)}<defs><linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#77a58b" stopOpacity=".19" /><stop offset="100%" stopColor="#77a58b" stopOpacity="0" /></linearGradient></defs><polygon points={`40,210 ${chartPoints('income')} 540,210`} fill="url(#incomeFill)" /><polyline points={chartPoints('income')} className="chart-line chart-income-line" /><polyline points={chartPoints('expenses')} className="chart-line chart-expense-line" />{monthlyData.map((month, index) => <g key={month.month}><circle cx={48 + index * 100} cy={210 - (month.income / maxChartValue) * 160} r="3.5" className="chart-dot chart-dot-income" /><circle cx={48 + index * 100} cy={210 - (month.expenses / maxChartValue) * 160} r="3.5" className="chart-dot chart-dot-expense" /></g>)}</svg><div className="chart-x-labels">{monthlyData.map((month) => <span key={month.month}>{labelMonth(month.month)}</span>)}</div></div>
            </article>
            <article className="panel categories-panel"><div className="panel-header"><div><span className="eyebrow">WHERE IT WENT</span><h2>Spending by category</h2><p className="panel-subtitle">Your {labelMonth(selectedMonth, { month: 'long' })} breakdown</p></div><button className="icon-button panel-menu" type="button" aria-label="Edit categories" onClick={() => setModal({ type: 'categories' })}><Ellipsis size={20} /></button></div>
              <div className="donut-section"><div className="donut-chart" style={{ background: categoryGradient }} role="img" aria-label={`Spending total ${money(totalSpent)} by category`}><div className="donut-hole"><span>Spent</span><strong>{money(totalSpent, true)}</strong></div></div><div className="category-legend">{categoryTotals.length ? categoryTotals.slice(0, 5).map((category) => <div className="category-legend-row" key={category.id}><span className="category-legend-name"><i style={{ background: category.color }} />{category.name}</span><strong>{money(category.total, true)}</strong></div>) : <p className="chart-empty">No spending yet this month.</p>}</div></div>
              <button type="button" className="manage-categories-button" onClick={() => setModal({ type: 'categories' })}>Manage categories <ArrowUpRight size={14} /></button>
            </article>
          </section>

          <Suspense fallback={<section className="panel weather-panel weather-lazy-fallback" aria-label="Weather"><div className="weather-heading"><div><span className="eyebrow">A LITTLE OUTSIDE</span><h2>Weather check</h2><p className="panel-subtitle">A quick look at what’s happening out there</p></div></div><div className="weather-content"><div className="weather-skeleton" role="status" aria-label="Loading weather card"><span className="weather-skeleton-icon" /><span className="weather-skeleton-temp" /><span className="weather-skeleton-line" /><span className="weather-skeleton-wind" /></div></div></section>}>
            <WeatherCard />
          </Suspense>

          <section className="panel transactions-panel" id="transactions"><div className="transactions-heading"><div><span className="eyebrow">THE LITTLE DETAILS</span><h2>Recent transactions</h2><p className="panel-subtitle">Your money, one moment at a time</p></div><button type="button" className="button button-secondary" onClick={() => setModal({ type: 'transaction' })}><Plus size={15} /> Add new</button></div>
            <div className="transaction-toolbar"><label className="search-field"><Search size={16} /><input aria-label="Search transactions" placeholder="Search transactions..." value={query} onChange={(event) => { setQuery(event.target.value); setShowAll(false) }} /><kbd>/</kbd></label><label className="filter-select"><Filter size={14} /><select aria-label="Filter by category" value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setShowAll(false) }}><option>All categories</option>{categories.map((category) => <option key={category.id}>{category.name}</option>)}</select><ChevronDown size={14} /></label><div className="type-filter" role="group" aria-label="Filter transaction type"><button type="button" className={typeFilter === 'all' ? 'selected' : ''} onClick={() => { setTypeFilter('all'); setShowAll(false) }}>All</button><button type="button" className={typeFilter === 'expense' ? 'selected' : ''} onClick={() => { setTypeFilter('expense'); setShowAll(false) }}>Spent</button><button type="button" className={typeFilter === 'income' ? 'selected' : ''} onClick={() => { setTypeFilter('income'); setShowAll(false) }}>Income</button></div></div>
            {hasFilters && <div className="active-filter-note"><span>Showing {filteredTransactions.length} {filteredTransactions.length === 1 ? 'match' : 'matches'}</span><button type="button" onClick={() => { setQuery(''); setCategoryFilter('All categories'); setTypeFilter('all') }}>Clear filters <X size={13} /></button></div>}
            <div className="transaction-table-wrap"><table className="transaction-table"><thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>{visibleTransactions.map((transaction) => <tr key={transaction.id}><td><div className="transaction-title-cell"><CategoryMark category={transaction.category} categories={categories} /><span className="transaction-copy"><strong>{transaction.name}</strong>{transaction.note && <small>{transaction.note}</small>}</span></div></td><td><span className="category-label"><i style={{ background: categories.find((category) => category.name === transaction.category)?.color || '#829087' }} />{transaction.category}</span></td><td className="transaction-date">{new Date(`${transaction.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td><td className={`transaction-amount ${transaction.type}`}>{transaction.type === 'income' ? '+' : '−'}{money(transaction.amount)}</td><td><div className="row-actions"><button type="button" aria-label={`Edit ${transaction.name}`} onClick={() => setModal({ type: 'transaction', transaction })}><SlidersHorizontal size={15} /></button><button type="button" aria-label={`Delete ${transaction.name}`} onClick={() => deleteTransaction(transaction.id)}><Trash2 size={15} /></button></div></td></tr>)}{!visibleTransactions.length && <tr><td colSpan="5"><div className="empty-state"><Search size={21} /><strong>{monthTransactions.length ? 'No transactions match those filters.' : 'A fresh start.'}</strong><span>{monthTransactions.length ? 'Try another search or clear your filters.' : 'Add a transaction to see your monthly picture take shape.'}</span>{!monthTransactions.length && <button type="button" className="button button-primary" onClick={() => setModal({ type: 'transaction' })}><Plus size={15} /> Add transaction</button>}</div></td></tr>}</tbody></table></div>
            {filteredTransactions.length > 7 && <button type="button" className="view-all-button" onClick={() => setShowAll((current) => !current)}>{showAll ? 'Show less' : `View all ${filteredTransactions.length} transactions`} <ChevronDown className={showAll ? 'rotate-chevron' : ''} size={15} /></button>}
          </section>
          <footer className="page-footer"><span><span className="footer-leaf"><Leaf size={14} /></span> Small steps. Clearer tomorrows.</span><button type="button" onClick={() => setModal({ type: 'budget' })}><CircleHelp size={14} /> Budget settings</button><span>Just for you <span className="footer-heart">✳</span></span></footer>
        </div>
      </main>
      <Suspense fallback={null}>
        {modal?.type === 'transaction' && <TransactionForm key={modal.transaction?.id || 'new'} categories={categories} transaction={modal.transaction} onSave={saveTransaction} onClose={() => setModal(null)} />}
        {modal?.type === 'categories' && <CategoryManager categories={categories} palette={palette} onSave={saveCategories} onClose={() => setModal(null)} />}
        {modal?.type === 'budget' && <BudgetForm budget={budget} onSave={(amount) => { updateData(() => ({ budgets: { ...budgets, total: amount } })); setModal(null) }} onClose={() => setModal(null)} />}
      </Suspense>
    </div>
  )
}

export default App
