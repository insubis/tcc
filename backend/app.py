from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from backend.ler_arquivos import processar_arquivo

app = Flask(__name__)
CORS(app)

# Defina o diretório de upload
app.config['UPLOAD_FOLDER'] = 'uploads'

@app.route('/')
def home():
    return "API para rodar DeeepSeek!"

@app.route('/api/process', methods=['POST'])
def process_file():
    try:
        if 'file' not in request.files:
            return jsonify({'erro': "Nenhum arquivo enviado"}), 400

        file = request.files['file']
        command = request.form.get('command', '').strip()

        if not command:
            return jsonify({'erro': "Digite um comando"}), 400

        if file.filename == '':
            return jsonify({'erro': "Nome de arquivo inválido"}), 400

        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        resultado = processar_arquivo(file_path, command)

        if os.path.exists(file_path):
            os.remove(file_path)

        return jsonify({
            'arquivo': file.filename,
            'comando': command,
            'texto_processado': resultado
        })

    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)