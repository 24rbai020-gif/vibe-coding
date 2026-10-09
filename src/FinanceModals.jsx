import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Check, Plus, Trash2, X } from 'lucide-react'

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const handleKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal${wide ? ' modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><span className="eyebrow">YOUR MONEY, YOUR WAY</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></div>
        {children}
      </section>
    </div>
  )
}

export function TransactionForm({ categories, transaction, onSave, onClose }) {
  const [form, setForm] = useState(() => transaction || {
    name: '', category: categories.find((category) => !category.type)?.name || categories[0]?.name || '',
    amount: '', type: 'expense', date: new Date().toISOString().slice(0, 10), note: '',
  })
  const availableCategories = categories.filter((category) => category.type === form.type || (!category.type && form.type === 'expense'))

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function changeType(type) {
    const matchingCategory = categories.find((category) => category.type === type || (!category.type && type === 'expense'))
    setForm((current) => ({ ...current, type, category: matchingCategory?.name || '' }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.name.trim() || Number(form.amount) <= 0 || !form.category) return
    onSave({ ...form, name: form.name.trim(), amount: Number(form.amount), note: form.note.trim() })
  }

  return (
    <Modal title={transaction ? 'Edit transaction' : 'Add a transaction'} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <div className="segmented-control" aria-label="Transaction type"><button type="button" className={form.type === 'expense' ? 'selected' : ''} onClick={() => changeType('expense')}><ArrowUpRight size={15} /> Expense</button><button type="button" className={form.type === 'income' ? 'selected' : ''} onClick={() => changeType('income')}><ArrowDownLeft size={15} /> Income</button></div>
        <label className="field-label">What was it for?<input autoFocus required maxLength={70} placeholder="e.g. Weekly groceries" value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
        <div className="form-row"><label className="field-label">Amount<span className="currency-input"><span>$</span><input required min="0.01" step="0.01" type="number" placeholder="0.00" value={form.amount} onChange={(event) => update('amount', event.target.value)} /></span></label><label className="field-label">Date<input required type="date" value={form.date} onChange={(event) => update('date', event.target.value)} /></label></div>
        <label className="field-label">Category<select required value={form.category} onChange={(event) => update('category', event.target.value)}>{availableCategories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>
        <label className="field-label">Note <span className="optional">Optional</span><input maxLength={120} placeholder="Add a little context" value={form.note} onChange={(event) => update('note', event.target.value)} /></label>
        <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary"><Check size={16} /> {transaction ? 'Save changes' : 'Add transaction'}</button></div>
      </form>
    </Modal>
  )
}

export function CategoryManager({ categories, onSave, onClose, palette }) {
  const [drafts, setDrafts] = useState(() => categories.map((category) => ({ ...category })))
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(palette[0])
  const [error, setError] = useState('')
  const hasDuplicateNames = new Set(drafts.map((category) => category.name.trim().toLowerCase())).size !== drafts.length

  function updateCategory(id, field, value) {
    setDrafts((current) => current.map((category) => category.id === id ? { ...category, [field]: value } : category))
  }

  function addCategory(event) {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    if (drafts.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
      setError('A category with that name already exists.')
      return
    }
    setDrafts((current) => [...current, { id: `category-${crypto.randomUUID()}`, name, color: newColor }])
    setNewName('')
    setError('')
  }

  return (
    <Modal title="Your categories" onClose={onClose} wide>
      <p className="modal-description">Make these feel like yours. Changes update your charts and budget totals straight away.</p>
      <div className="category-editor-list">{drafts.map((category) => <div className="category-editor-row" key={category.id}><span className="category-color-dot" style={{ '--category-color': category.color }} /><input aria-label={`Edit ${category.name} category name`} value={category.name} onChange={(event) => updateCategory(category.id, 'name', event.target.value)} /><div className="color-picker" role="group" aria-label={`Color for ${category.name}`}>{palette.map((color) => <button key={color} type="button" className={`color-swatch${category.color === color ? ' active' : ''}`} style={{ '--swatch-color': color }} aria-label={`Use ${color}`} onClick={() => updateCategory(category.id, 'color', color)} />)}</div><button className="icon-button delete-category" type="button" aria-label={`Remove ${category.name}`} onClick={() => setDrafts((current) => current.filter((item) => item.id !== category.id))}><Trash2 size={16} /></button></div>)}</div>
      <form className="add-category-row" onSubmit={addCategory}><label className="visually-hidden" htmlFor="new-category-name">New category name</label><input id="new-category-name" value={newName} maxLength={30} placeholder="New category name" onChange={(event) => { setNewName(event.target.value); setError('') }} /><div className="color-picker" role="group" aria-label="New category color">{palette.map((color) => <button key={color} type="button" className={`color-swatch${newColor === color ? ' active' : ''}`} style={{ '--swatch-color': color }} aria-label={`Use ${color}`} onClick={() => setNewColor(color)} />)}</div><button className="icon-button add-category-button" type="submit" aria-label="Add category" disabled={!newName.trim()}><Plus size={18} /></button></form>
      {error && <p className="form-error">{error}</p>}{drafts.length === 0 && <p className="empty-categories">Add at least one category before saving.</p>}
      {hasDuplicateNames && <p className="form-error">Category names must be unique.</p>}
      <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="button" className="button button-primary" disabled={!drafts.length || drafts.some((category) => !category.name.trim()) || hasDuplicateNames} onClick={() => onSave(drafts.map((category) => ({ ...category, name: category.name.trim() })))}><Check size={16} /> Save categories</button></div>
    </Modal>
  )
}

export function BudgetForm({ budget, onSave, onClose }) {
  const [amount, setAmount] = useState(String(budget))
  return <Modal title="Set your monthly budget" onClose={onClose}><p className="modal-description">A gentle guide, not a hard rule. Pick a number that feels right for this month.</p><form className="form-stack" onSubmit={(event) => { event.preventDefault(); if (Number(amount) > 0) onSave(Number(amount)) }}><label className="field-label">Monthly spending limit<span className="currency-input budget-input"><span>$</span><input autoFocus required type="number" min="1" step="50" value={amount} onChange={(event) => setAmount(event.target.value)} /></span></label><div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary"><Check size={16} /> Save budget</button></div></form></Modal>
}