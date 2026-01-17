import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000'

function App() {
  const [mode, setMode] = useState('generic')
  const [companyInfo, setCompanyInfo] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/prompt`)
      .then(res => res.json())
      .then(data => setPrompt(data.prompt || ''))
      .catch(() => {})
  }, [])

  const savePrompt = async () => {
    setSaving(true)
    try {
      await fetch(`${API_URL}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
    } catch (err) {}
    setSaving(false)
  }

  const generate = async () => {
    if (!companyInfo.trim()) return
    if (mode === 'job_specific' && !jobDescription.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_info: companyInfo,
          mode: mode,
          job_description: jobDescription
        })
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: 'Failed to connect to server' })
    }
    setLoading(false)
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="layout">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>System Prompt</h2>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <textarea
          className="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your system prompt here... Include your background, skills, and email instructions."
        />
        <button className="save-btn" onClick={savePrompt} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="main">
        <div className="container">
          <header>
            <div className="header-row">
              <h1>Outreach</h1>
              <button className="settings-btn" onClick={() => setSidebarOpen(true)}>
                Settings
              </button>
            </div>
            <p className="subtitle">Cold emails that don't sound cold</p>
          </header>

          <div className="toggle-wrapper">
            <button
              className={`toggle-btn ${mode === 'generic' ? 'active' : ''}`}
              onClick={() => setMode('generic')}
            >
              Generic
            </button>
            <button
              className={`toggle-btn ${mode === 'job_specific' ? 'active' : ''}`}
              onClick={() => setMode('job_specific')}
            >
              Job Specific
            </button>
          </div>

          <div className="form">
            <div className="field">
              <label>Company Info</label>
              <textarea
                value={companyInfo}
                onChange={(e) => setCompanyInfo(e.target.value)}
                placeholder="Paste company name, what they do, founder names, etc."
                rows={4}
              />
            </div>

            {mode === 'job_specific' && (
              <div className="field">
                <label>Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description, requirements, etc."
                  rows={6}
                />
              </div>
            )}

            <button
              className="generate-btn"
              onClick={generate}
              disabled={loading || !companyInfo.trim() || (mode === 'job_specific' && !jobDescription.trim())}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {result && !result.error && (
            <div className="result">
              <div className="result-section">
                <div className="result-header">
                  <label>Subject</label>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(result.subject, 'subject')}
                  >
                    {copied === 'subject' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="result-content subject">{result.subject}</div>
              </div>

              <div className="result-section">
                <div className="result-header">
                  <label>Body</label>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(result.body, 'body')}
                  >
                    {copied === 'body' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="result-content body">{result.body}</div>
              </div>
            </div>
          )}

          {result?.error && (
            <div className="error">{result.error}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
