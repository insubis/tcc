import React, { useState } from 'react';
import { Upload, Terminal, AlertCircle } from 'lucide-react';

interface ProcessingResult {
  arquivo: string;
  comando: string;
  texto_processado: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file && command) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('command', command);

      try {
        const response = await fetch('http://127.0.0.1:5000/api/process', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          setResult({
            arquivo: data.arquivo,
            comando: data.comando,
            texto_processado: data.texto_processado,
          });
          setError(null);
        } else {
          setError(data.erro || 'Unknown error');
        }
      } catch (error) {
        setError('Failed to connect to the backend');
      }
    } else {
      setError('Please provide both a file and a command');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            DeepSeek para processos de Arquivos
          </h1>
          <p className="text-blue-300">Desenvolvido com tecnologia avançada de IA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${isDragging
              ? 'border-blue-400 bg-blue-900/20'
              : 'border-gray-600 hover:border-blue-500'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-12 h-12 text-blue-400" />
              <label className="cursor-pointer group">
                <span className="bg-blue-600 px-4 py-2 rounded-lg inline-block transition-transform group-hover:scale-105">
                  Selecionar Arquivo
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              <p className="text-gray-400">
                {file ? file.name : 'Drag and drop your file here or click to select'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-blue-300">Digite seu comando</label>
            <div className="relative">
              <Terminal className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 pl-10 h-32 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                placeholder="Example: Extract all important dates and their corresponding events"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-[1.02]"
          >
            Arquivo de processo
          </button>
        </form>

        {result && (
          <div className="mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700 animate-fadeIn">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">Resultado do Processamento</h3>
            <div className="space-y-3">
              <p>
                <span className="text-gray-400">Arquivo:</span> {result.arquivo}
              </p>
              <p>
                <span className="text-gray-400">Comando:</span> {result.comando}
              </p>
              <pre className="bg-gray-900/50 p-4 rounded-lg overflow-x-auto text-blue-300">
                {result.texto_processado}
              </pre>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center space-x-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
