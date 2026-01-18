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
  const [notes, setNotes] = useState('')

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
          job_description: jobDescription,
          notes: notes
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
    <div className="app">
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>System Prompt</h2>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <textarea
          className="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your system prompt here..."
        />
        <button className="save-btn" onClick={savePrompt} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Header */}
      <header className="header">
        <h1>Outreach</h1>
        <button className="settings-btn" onClick={() => setSidebarOpen(true)}>Settings</button>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Column - Input */}
        <div className="column input-column">
          <div className="column-header">
            <h2>Input</h2>
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
          </div>

          <div className="field">
            <label>Company Info</label>
            <textarea
              value={companyInfo}
              onChange={(e) => setCompanyInfo(e.target.value)}
              placeholder="Paste company name, what they do, founder names, etc."
            />
          </div>

          {mode === 'job_specific' && (
            <div className="field">
              <label>Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description, requirements, etc."
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

        {/* Right Column - Output */}
        <div className="column output-column">
          <div className="column-header">
            <h2>Output</h2>
          </div>

          {!result && !loading && (
            <div className="empty-state">
              Generated email will appear here
            </div>
          )}

          {loading && (
            <div className="empty-state">
              Generating...
            </div>
          )}

          {result && !result.error && (
            <>
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

              <div className="refine-section">
                <div className="field">
                  <label>Refine</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="'Make it shorter', 'Mention my ML experience'..."
                    rows={2}
                  />
                </div>
                <button
                  className="regenerate-btn"
                  onClick={generate}
                  disabled={loading}
                >
                  {loading ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
            </>
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
