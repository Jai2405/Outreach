import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Your profile - customize this
MY_PROFILE = """
Name: [Your Name]
Background: Software Engineer with experience in Python, backend development, and AI/ML
Skills: Python, Flask, FastAPI, React, PostgreSQL, MongoDB, AWS, Docker, Machine Learning, LLMs
Experience: 3+ years building web applications and AI-powered tools
Looking for: Software engineering roles, backend roles, AI/ML engineering roles
"""


def generate_email(company_info: str, mode: str, job_description: str = None) -> dict:
    """Generate cold email using LLM."""

    if mode == "job_specific":
        prompt = f"""You are helping write a cold outreach email for a specific job.

MY PROFILE:
{MY_PROFILE}

COMPANY INFO:
{company_info}

JOB DESCRIPTION:
{job_description}

Write a cold email that:
1. Is concise (under 150 words)
2. Shows I've researched the company
3. Connects my specific skills to the job requirements
4. Has a clear call to action
5. Sounds human, not templated

Return JSON:
{{"subject": "email subject line", "body": "email body"}}

Only return valid JSON."""
    else:  # generic
        prompt = f"""You are helping write a cold outreach email for a general inquiry.

MY PROFILE:
{MY_PROFILE}

COMPANY INFO:
{company_info}

Write a cold email that:
1. Is concise (under 150 words)
2. Shows genuine interest in the company
3. Briefly highlights my relevant skills
4. Asks about potential opportunities
5. Sounds human, not templated

Return JSON:
{{"subject": "email subject line", "body": "email body"}}

Only return valid JSON."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    result = response.choices[0].message.content

    try:
        import json
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
        return json.loads(result.strip())
    except:
        return {"subject": "Error", "body": result}


@app.route("/generate", methods=["POST"])
def generate():
    """Generate cold email endpoint."""
    data = request.json

    company_info = data.get("company_info", "")
    mode = data.get("mode", "generic")  # "generic" or "job_specific"
    job_description = data.get("job_description", "")

    if not company_info:
        return jsonify({"error": "company_info is required"}), 400

    if mode == "job_specific" and not job_description:
        return jsonify({"error": "job_description is required for job_specific mode"}), 400

    result = generate_email(company_info, mode, job_description)
    return jsonify(result)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
