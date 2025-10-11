import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

function TeacherDashboard() {
  const [templates, setTemplates] = useState([]);
  const [batches] = useState([
    { id: 1, name: 'DAC -Aug-2025' },
    { id: 2, name: 'DBDA-Aug-2025' },
    { id: 3, name: 'DMC-Aug-2025' },
    { id: 4, name: 'DESD-Aug-2025' },
    { id: 5, name: 'DITIS-Aug-2025' },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [activeSessions, setActiveSessions] = useState([]);
  const [closedSessions, setClosedSessions] = useState([]);

  // Modal & report
  const [reportData, setReportData] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found. Please log in again.');
      return;
    }
    fetchAllData(token);
  }, []);

  const fetchAllData = async (token) => {
    try {
      await Promise.all([fetchTemplates(token), fetchSessions(token)]);
    } catch (err) {
      console.error('Error loading data:', err);
      setMessage('Failed to load data.');
    }
  };

  const fetchTemplates = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const validTemplates = res.data.filter((t) => Number(t.question_count) > 0);
      setTemplates(validTemplates);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setMessage('Failed to fetch templates.');
    }
  };

  const fetchSessions = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/feedback/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) {
        setActiveSessions(res.data.filter((s) => s.status === 'active'));
        setClosedSessions(res.data.filter((s) => s.status === 'closed'));
      } else {
        setActiveSessions([]);
        setClosedSessions([]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setMessage('Failed to fetch feedback sessions.');
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return setMessage('Token missing. Please log in again.');
    if (!selectedTemplate || !selectedBatch || !startDate || !endDate) {
      return setMessage('Please fill all fields.');
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/feedback/schedule',
        {
          template_id: Number(selectedTemplate),
          batch_id: Number(selectedBatch),
          start_date: startDate,
          end_date: endDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || 'Feedback scheduled successfully!');
      setSelectedTemplate('');
      setSelectedBatch('');
      setStartDate('');
      setEndDate('');
      await fetchSessions(token);
    } catch (err) {
      console.error('Error scheduling feedback:', err);
      setMessage('Failed to schedule feedback.');
    }
  };

  const handleRefresh = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchSessions(token);
    } else {
      setMessage('No token found. Please log in again.');
    }
  };

  // ✅ Close feedback session
  const handleClose = async (scheduleId) => {
    const token = localStorage.getItem('token');
    if (!token) return setMessage('No token found.');

    if (!window.confirm('Are you sure you want to close this session?')) return;

    try {
      await axios.put(
        `http://localhost:5000/api/feedback/${scheduleId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Session closed successfully!');
      fetchSessions(token);
    } catch (err) {
      console.error('Error closing session:', err);
      setMessage('Failed to close session.');
    }
  };

  const viewReport = async (scheduleId) => {
    const token = localStorage.getItem('token');
    if (!token) return setMessage('No token found.');

    try {
      const res = await axios.get(`http://localhost:5000/api/reports/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportData(res.data);
      setShowReportModal(true);
    } catch (err) {
      console.error('Error fetching report:', err);
      setMessage('Failed to fetch report.');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Teacher Dashboard</h3>
      <p>Schedule feedback sessions, view reports, and manage sessions.</p>

      {/* Schedule Feedback */}
      <form onSubmit={handleSchedule} className="card p-4 shadow mb-4">
        <h5>Schedule New Feedback</h5>
        {/* Template */}
        <div className="mb-3">
          <label className="form-label">Select Feedback Template</label>
          <select
            className="form-select"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">-- Select Template --</option>
            {templates.map((t) => (
              <option key={t.template_id} value={t.template_id}>
                {t.template_name} ({t.question_count} questions)
              </option>
            ))}
          </select>
        </div>

        {/* Batch */}
        <div className="mb-3">
          <label className="form-label">Select Batch</label>
          <select
            className="form-select"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">-- Select Batch --</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="mb-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Schedule Feedback
        </button>
      </form>

      {message && <div className="alert alert-info">{message}</div>}

      {/* Active Sessions */}
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center">
          <h5>Active Feedback Sessions</h5>
          <button className="btn btn-sm btn-secondary" onClick={handleRefresh}>
            🔄 Refresh
          </button>
        </div>
        {activeSessions.length === 0 ? (
          <p>No active sessions.</p>
        ) : (
          <ul className="list-group">
            {activeSessions.map((s) => (
              <li
                key={s.schedule_id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{s.template_name}</strong> - Batch {s.batch_id} ({s.start_date} →{' '}
                  {s.end_date})
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => viewReport(s.schedule_id)}
                  >
                    View Report
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleClose(s.schedule_id)}
                  >
                    Close
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Closed Sessions */}
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center">
          <h5>Closed Feedback Sessions</h5>
          <button className="btn btn-sm btn-secondary" onClick={handleRefresh}>
            🔄 Refresh
          </button>
        </div>
        {closedSessions.length === 0 ? (
          <p>No closed sessions.</p>
        ) : (
          <ul className="list-group">
            {closedSessions.map((s) => (
              <li
                key={s.schedule_id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{s.template_name}</strong> - Batch {s.batch_id} (Closed)
                </div>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => viewReport(s.schedule_id)}
                >
                  View Report
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && reportData && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Feedback Report</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReportModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Final Average:</strong> {reportData.final_average.toFixed(2)}
                </p>
                {reportData.questions.map((q) => {
                  const chartData = [
                    { rating: 'Excellent', count: q.rating_counts.Excellent },
                    { rating: 'Good', count: q.rating_counts.Good },
                    { rating: 'Satisfactory', count: q.rating_counts.Satisfactory },
                    { rating: 'Poor', count: q.rating_counts.Poor },
                  ];
                  return (
                    <div key={q.question_id} className="mb-4 card p-3 shadow-sm">
                      <h6>{q.question_text}</h6>
                      <p>Average Rating: {q.average_rating.toFixed(2)}</p>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={chartData}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="rating" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#007bff" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
