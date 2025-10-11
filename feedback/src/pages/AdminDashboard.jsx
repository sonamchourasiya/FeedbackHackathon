import React, { useState, useEffect } from 'react'
import { createTemplate, getTemplates } from '../services/adminService'

function AdminDashboard() {
  const [templateName, setTemplateName] = useState('')
  const [questions, setQuestions] = useState(['', '', '', '', ''])
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const res = await getTemplates()
      setTemplates(res.data || [])
    } catch (err) {
      console.error('Error loading templates:', err)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const filledQuestions = questions.filter(q => q.trim() !== '')
    if (!templateName) return alert('Template name is required')
    if (filledQuestions.length < 5) return alert('At least 5 questions required')

    try {
      await createTemplate(templateName, filledQuestions)
      alert('Template created successfully')
      setTemplateName('')
      setQuestions(['', '', '', '', ''])
      loadTemplates()
    } catch (err) {
      console.error(err)
      alert('Error creating template')
    }
  }

  return (
    <div className="container mt-3">
      <h3>Admin Dashboard</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Template Name</label>
          <input
            type="text"
            className="form-control"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
          />
        </div>

        {questions.map((q, idx) => (
          <div key={idx} className="mb-3 d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder={`Question ${idx + 1}`}
              value={q}
              onChange={e => {
                const newQ = [...questions]
                newQ[idx] = e.target.value
                setQuestions(newQ)
              }}
            />
            {questions.length > 5 && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={() => setQuestions([...questions, ''])}
        >
          Add Question
        </button>
        <button type="submit" className="btn btn-success">
          Create Template
        </button>
      </form>

      <hr />

      <h4>Existing Templates</h4>
      {templates.length === 0 ? (
        <p>No templates created yet.</p>
      ) : (
        <ul className="list-group">
          {templates.map(t => (
            <li key={t.template_id} className="list-group-item">
              {t.template_name} ({t.questions_count} questions)
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminDashboard
