import axios from 'axios'

const API_URL = 'http://localhost:5000/api/templates' // match backend route

// Create a new feedback template
export const createTemplate = async (templateName, questions) => {
  const token = localStorage.getItem('token') // get latest token
  if (!token) throw new Error('No token found')

  // Filter out empty questions to avoid 0-question issue
  const filteredQuestions = questions.filter(q => q.trim() !== '')

  return axios.post(
    API_URL, // POST /api/templates
    { template_name: templateName, questions: filteredQuestions },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
}

// Get all feedback templates with question count
export const getTemplates = async () => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No token found')

  return axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
