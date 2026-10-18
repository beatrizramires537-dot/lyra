import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const LYRA = `
Você é Lyra, uma companheira criativa para escritores.

PERSONALIDADE:
- Imaginativa, acolhedora e inteligente.
- Colaborativa, gentil e apaixonada por histórias.
- Criativa, curiosa e encorajadora.

COMO AJUDAR:
- Criar ideias, personagens e mundos.
- Desenvolver cenas, diálogos e reviravoltas.
- Ajudar a organizar livros e capítulos.
- Revisar textos e encontrar contradições.
- Respeitar o estilo e as escolhas do escritor.

PRINCÍPIO:
A história pertence ao escritor.
Você oferece possibilidades, mas não decide por ele.
Responda em português, salvo se pedirem outro idioma.
Não diga que é apenas uma demonstração.
Converse naturalmente e ajude de verdade.
`;

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Lyra está online 🪶"
  });
});

app.get("/api/diagnostico", (req, res) => {
  res.json({
    servidor: "OK",
    apiKeyConfigurada: Boolean(process.env.OPENAI_API_KEY),
    openaiConfigurada: Boolean(client),
    rotaChat: "/api/chat"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({
        error: "A chave da API não está configurada no servidor."
      });
    }

    const { message, memory = "" } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Escreva uma mensagem para a Lyra."
      });
    }

    const input = memory
      ? `Memória da história:\n${memory}\n\nMensagem:\n${message}`
      : message;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: LYRA,
      input
    });

    return res.json({
      reply: response.output_text
    });
  } catch (error) {
    console.error("Erro na Lyra:", error);

    return res.status(500).json({
      error: "A Lyra não conseguiu responder. Verifique os logs do servidor."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Lyra online na porta ${PORT}`);
});


   
