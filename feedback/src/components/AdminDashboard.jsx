import React, { useState, useEffect, useContext } from 'react'
import { createTemplate, getTemplates } from '../services/adminService'
import { AuthContext } from '../context/AuthContext'

function AdminDashboard() {
  const { token } = useContext(AuthContext)
  const [templateName, setTemplateName] = useState('')
  const [questions, setQuestions] = useState(['', '', '', '', '']) // Start with 5 empty questions
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    if (!token) return
    fetchTemplates()
  }, [token])

  const fetchTemplates = async () => {
    try {
      const res = await getTemplates(token)
      // Ensure question_count is a number
      const templatesWithCount = res.data.map((t) => ({
        ...t,
        question_count: Number(t.question_count),
      }))
      setTemplates(templatesWithCount)
    } catch (err) {
      console.error('Error fetching templates:', err)
    }
  }

  const handleQuestionChange = (index, value) => {
    const updated = [...questions]
    updated[index] = value
    setQuestions(updated)
  }

  const addQuestion = () => {
    if (questions.length >= 10) return
    setQuestions([...questions, ''])
  }

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index)
    setQuestions(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!templateName.trim()) {
      alert('Template name is required')
      return
    }
    if (questions.length < 5) {
      alert('At least 5 questions are required')
      return
    }
    try {
      await createTemplate(templateName, questions, token)
      alert('Template created successfully!')
      setTemplateName('')
      setQuestions(['', '', '', '', '']) // Reset to 5 empty questions
      fetchTemplates() // Refresh templates list
    } catch (err) {
      console.error('Error creating template:', err)
      alert('Error creating template')
    }
  }

  return (
    <div className="container mt-4">
      <h3>Admin Dashboard</h3>

      <form onSubmit={handleSubmit} className="mb-5">
        <div className="mb-3">
          <label className="form-label">Template Name</label>
          <input
            type="text"
            className="form-control"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            required
          />
        </div>

        {questions.map((q, index) => (
          <div className="mb-3 d-flex" key={index}>
            <input
              type="text"
              className="form-control"
              placeholder={`Question ${index + 1}`}
              value={q}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              required
            />
            {questions.length > 1 && (
              <button
                type="button"
                className="btn btn-danger ms-2"
                onClick={() => removeQuestion(index)}
              >
                X
              </button>
            )}
          </div>
        ))}

        {questions.length < 10 && (
          <button type="button" className="btn btn-secondary mb-3" onClick={addQuestion}>
            Add Question
          </button>
        )}

        <button type="submit" className="btn btn-primary">
          Create Template
        </button>
      </form>

      <h5>Existing Templates</h5>
      <ul className="list-group">
        {templates.map((t) => (
          <li key={t.template_id} className="list-group-item">
            {t.template_name} ({t.question_count} questions)
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminDashboard
