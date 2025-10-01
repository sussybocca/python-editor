from flask import Flask, render_template, request, jsonify, send_from_directory
import subprocess
import os
import autopep8
import black
import jedi
import flake8.api.legacy as flake8_api

app = Flask(__name__, static_folder="website", template_folder="website")

# Serve index.html
@app.route("/")
def index():
    return render_template("index.html")

# Serve static files
@app.route("/<path:path>")
def static_files(path):
    return send_from_directory("website", path)

# Run Python code
@app.route("/run", methods=["POST"])
def run_code():
    code = request.form.get("code")
    with open("temp.py", "w") as f:
        f.write(code)
    result = subprocess.run(["python", "temp.py"], capture_output=True, text=True)
    return jsonify({"output": result.stdout, "errors": result.stderr})

# ---------------------------
# Add Save/Open endpoints here
# ---------------------------

@app.route("/save", methods=["POST"])
def save_file():
    filename = request.form.get("filename")
    code = request.form.get("code")
    path = os.path.join("projects", filename)
    with open(path, "w") as f:
        f.write(code)
    return jsonify({"status": "saved"})

@app.route("/open", methods=["GET"])
def open_file():
    filename = request.args.get("filename")
    path = os.path.join("projects", filename)
    if os.path.exists(path):
        with open(path, "r") as f:
            code = f.read()
        return jsonify({"code": code})
    return jsonify({"error": "File not found"})

# ---------------------------
# Other features: format/lint/autocomplete
# ---------------------------

if __name__ == "__main__":
    os.makedirs("projects", exist_ok=True)  # create folder to store files
    app.run(host="0.0.0.0", port=8000, debug=True)
