import textract
import pdfplumber
import pandas as pd
from docx import Document

from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama.llms import OllamaLLM

llm = OllamaLLM(
    model='deepseek-r1:8b',
    temperature=0,
)

def processar_arquivo(caminho, comando):
    try:
        if caminho.lower().endswith(".pdf"):  
            with pdfplumber.open(caminho) as pdf:
                texto = "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())
        
        elif caminho.lower().endswith(".docx"):  
            doc = Document(caminho)
            texto = "\n".join(paragraph.text for paragraph in doc.paragraphs)
        
        elif caminho.lower().endswith(".csv"):  
            df = pd.read_csv(caminho, encoding="utf-8")
            texto = df.to_string()
        
        elif caminho.lower().endswith(".xlsx"):  
            df = pd.read_excel(caminho, engine="openpyxl")
            texto = df.to_string()
        
        else:  
            texto = textract.process(caminho).decode("utf-8")
    
    except Exception as e:
        return f"Erro ao ler o arquivo: {e}"
    
    # Criar template dinâmico
    template = """Você é um assistente de análise de documentos. 
    Execute a seguinte tarefa no texto fornecido:

    Tarefa: {comando}

    Texto: Responda sempre em português do Brasil(pt-br)
    {texto}

"""

    # Configurar prompt
    prompt = PromptTemplate(
        template=template,
        input_variables=["comando", "texto"]
    )

    chain = prompt | llm | StrOutputParser()

    return chain.invoke({
        "comando": comando,
        "texto": texto
    })
