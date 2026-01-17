import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

PROMPT_PATH = os.path.join(os.path.dirname(__file__), 'prompt.txt')


def load_prompt():
    """Load custom prompt from file."""
    if os.path.exists(PROMPT_PATH):
        with open(PROMPT_PATH, 'r') as f:
            return f.read()
    return ""


def save_prompt(text):
    """Save custom prompt to file."""
    with open(PROMPT_PATH, 'w') as f:
        f.write(text)


def generate_email(company_info: str, mode: str, job_description: str = None) -> dict:
    """Generate cold email using LLM."""
    custom_prompt = load_prompt()

    if mode == "job_specific":
        prompt = f"""{custom_prompt}

COMPANY INFO:
{company_info}

JOB DESCRIPTION:
{job_description}

Write a cold email for this specific job. Connect my skills to the job requirements.

Return JSON:
{{"subject": "email subject line", "body": "email body"}}

Only return valid JSON."""
    else:
        prompt = f"""{custom_prompt}

COMPANY INFO:
{company_info}

Write a cold email asking about potential opportunities.

Return JSON:
{{"subject": "email subject line", "body": "email body"}}

Only return valid JSON."""

    print("\n" + "="*50)
    print("FULL PROMPT SENT TO LLM:")
    print("="*50)
    print(prompt)
    print("="*50 + "\n")

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    result = response.choices[0].message.content

    try:
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
        return json.loads(result.strip())
    except:
        return {"subject": "Error", "body": result}


@app.route("/prompt", methods=["GET"])
def get_prompt():
    """Get current prompt."""
    return jsonify({"prompt": load_prompt()})


@app.route("/prompt", methods=["POST"])
def update_prompt():
    """Update prompt."""
    data = request.json
    save_prompt(data.get("prompt", ""))
    return jsonify({"status": "ok"})


@app.route("/generate", methods=["POST"])
def generate():
    """Generate cold email endpoint."""
    data = request.json

    company_info = data.get("company_info", "")
    mode = data.get("mode", "generic")
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
