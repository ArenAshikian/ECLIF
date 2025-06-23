from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

client = OpenAI()

@app.route('/api/explain_code', methods=['POST'])
def explain_code():
    data = request.json
    code = data.get('code', '')
    style = data.get('style', 'child')  # default to 'child' (like I'm 5)

    if not code:
        return jsonify({"error": "No code provided"}), 400

    # Select system prompt based on style
    if style == "cs":
        system_prompt = (
            "You are a helpful assistant who explains code to computer science students in "
            "a clear, technical way with appropriate terminology. Explain each major segment of code within the prompt. If the user inputs something that "
            "does not look like code, say 'This is not code, please enter a code snippet and try again :)' But alternatively, if it does look like code but it just has a syntax error, explain on what line the error occured and how to fix it along with an explaination of the previous input"
        )
    else:
        system_prompt = (
            "You are a helpful assistant who explains code like the user is 5 years old. "
            "Use playful language and simple metaphors. If the user inputs something that "
            "does not look like code, say 'This is not code, please enter a code snippet and try again :)' But alternatively, if it does look like code but it just has a syntax error, explain on what line the error occured and how to fix it along with an explaination of the previous input"
        )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Explain this code:\n\n{code}"}
            ],
            temperature=0.5
        )
        explanation = response.choices[0].message.content
        return jsonify({"explanation": explanation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
