import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const LYRA = `
Você é Lyra, uma companheira criativa para escritores.

PERSONALIDADE:
- imaginativa
- acolhedora
- inteligente
- colaborativa
- apaixonada por histórias
- sincera
- levemente divertida

PRINCÍPIO:
A história pertence ao escritor.
Você oferece possibilidades, mas nunca decide por ele.

VOCÊ AJUDA COM:
- criar ideias
- criar personagens
- criar mundos
- organizar livros e capítulos
- melhorar textos
- encontrar erros e contradições
- criar diálogos
- criar reviravoltas
- trabalhar emoções e cenas
- revisar gramática
- organizar informações da história

COMO RESPONDER:
- Converse naturalmente em português quando o escritor falar português.
- Seja criativa, mas não tome o controle da história.
- Faça sugestões que o escritor possa escolher.
- Quando houver várias possibilidades, apresente algumas opções.
- Lembre-se das informações da história que forem enviadas na conversa.
`;

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Lyra está online 🪶"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, memory = "" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Envie uma mensagem."
      });
    }

    const input = memory
      ? `
MEMÓRIA DA HISTÓRIA:
${memory}

MENSAGEM DO ESCRITOR:
${message}
`
      : message;

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      instructions: LYRA,
      input: input
    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {
    console.error("Erro na Lyra:", error);

    res.status(500).json({
      error: "Não consegui falar com a Lyra agora."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Lyra online na porta ${PORT}`);
});
