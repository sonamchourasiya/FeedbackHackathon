import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ratingMap = { Excellent: 4, Good: 3, Satisfactory: 2, Poor: 1 };

function FeedbackForm() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState('student'); // get role from JWT or localStorage
  const token = localStorage.getItem('token');

  // Fetch user role from token (optional: parse JWT)
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || 'student');
      } catch (err) {
        console.error('Error parsing token', err);
      }
    }
  }, [token]);

  // Fetch active feedback sessions
  const fetchActiveFeedbacks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/feedback/student/active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error('Error fetching feedback sessions:', err);
      setMessage('Failed to load feedback sessions.');
    }
  };

  useEffect(() => {
    if (token) fetchActiveFeedbacks();
  }, [token]);

  // Fetch questions for selected session
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedFeedback) return;

      try {
        setLoadingQuestions(true);
        const res = await axios.get(
          `http://localhost:5000/api/feedback/questions/${selectedFeedback.schedule_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setQuestions(res.data);
        setAnswers({});
        setComments('');
      } catch (err) {
        console.error('Error fetching questions:', err);
        setMessage('Failed to load questions.');
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [selectedFeedback, token]);

  // Store selected rating
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return alert('Please select a feedback session');

    const answersArray = Object.entries(answers).map(([question_id, ratingLabel]) => ({
      question_id,
      rating: ratingMap[ratingLabel],
    }));

    try {
      await axios.post(
        `http://localhost:5000/api/feedback/${selectedFeedback.schedule_id}/submit`,
        { answers: answersArray, comments },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Feedback submitted successfully!');
      setSelectedFeedback(null);
      setQuestions([]);
      setAnswers({});
      setComments('');
      fetchActiveFeedbacks();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setMessage('Failed to submit feedback.');
    }
  };

  // Close feedback (teacher only)
  const handleClose = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to close this feedback session?')) return;
    try {
      await axios.put(
        `http://localhost:5000/api/feedback/${scheduleId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Feedback session closed successfully!');
      fetchActiveFeedbacks();
      if (selectedFeedback?.schedule_id === scheduleId) {
        setSelectedFeedback(null);
        setQuestions([]);
      }
    } catch (err) {
      console.error('Error closing feedback session:', err);
      setMessage('Failed to close feedback session.');
    }
  };

  return (
    <div className="container mt-3">
      <h3>Feedback Form</h3>
      {message && <div className="alert alert-warning">{message}</div>}

      {/* Refresh & Close buttons */}
      <div className="mb-3 d-flex gap-2">
        {/* <button className="btn btn-primary" onClick={fetchActiveFeedbacks}>Refresh</button> */}
        {userRole === 'teacher' && selectedFeedback && (
          <button
            className="btn btn-danger"
            onClick={() => handleClose(selectedFeedback.schedule_id)}
          >
            Close Feedback
          </button>
        )}
      </div>

      {/* Select Feedback Session */}
      <div className="mb-3">
        <label htmlFor="feedbackSession" className="form-label">
          Select Feedback Session:
        </label>
        <select
          id="feedbackSession"
          className="form-select"
          value={selectedFeedback ? selectedFeedback.schedule_id : ''}
          onChange={e =>
            setSelectedFeedback(
              feedbacks.find(f => f.schedule_id === Number(e.target.value))
            )
          }
        >
          <option value="">-- Select --</option>
          {feedbacks.map(f => (
            <option key={f.schedule_id} value={f.schedule_id}>
              {f.template_name} - Batch {f.batch_id}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loadingQuestions && <p>Loading questions...</p>}

      {/* Feedback Questions */}
      {selectedFeedback && questions.length > 0 && !loadingQuestions && (
        <form onSubmit={handleSubmit}>
          {questions.map(q => (
            <div className="mb-3" key={q.question_id}>
              <label className="form-label">{q.question_text}</label>
              <select
                className="form-select"
                value={answers[q.question_id] || ''}
                onChange={e => handleAnswerChange(q.question_id, e.target.value)}
              >
                <option value="">-- Select --</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Satisfactory</option>
                <option>Poor</option>
              </select>
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label">Comments / Suggestions</label>
            <textarea
              className="form-control"
              value={comments}
              onChange={e => setComments(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-success">Submit</button>
        </form>
      )}

      {feedbacks.length === 0 && <p>No active feedback sessions available.</p>}
    </div>
  );
}

export default FeedbackForm;
