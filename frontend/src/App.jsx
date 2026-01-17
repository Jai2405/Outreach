import { useState } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('generic')
  const [companyInfo, setCompanyInfo] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)

  const generate = async () => {
    if (!companyInfo.trim()) return
    if (mode === 'job_specific' && !jobDescription.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('http://localhost:5000/generate', {
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
    <div className="container">
      <header>
        <h1>Outreach</h1>
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
  )
}

export default App
