import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

// ========================================
// 🔐 CONFIGURAÇÃO DA OPENAI
// ========================================

const apiKey = process.env.OPENAI_API_KEY;

let client = null;

if (apiKey) {
  client = new OpenAI({
    apiKey: apiKey
  });
}


// ========================================
// 🪶 PERSONALIDADE DA LYRA
// ========================================

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
- Fale em português quando o escritor falar português.
- Seja criativa e acolhedora.
- Não tome o controle da história.
- Ofereça possibilidades para o escritor escolher.
- Quando houver várias possibilidades, apresente algumas opções.
`;


// ========================================
// 🏠 TESTE DO SERVIDOR
// ========================================

app.get("/", (req, res) => {

  res.json({
    ok: true,
    message: "Lyra está online 🪶",
    servidor: "funcionando"
  });

});


// ========================================
// 🔎 DIAGNÓSTICO
// ========================================

app.get("/api/diagnostico", (req, res) => {

  res.json({

    servidor: "OK",

    apiKeyConfigurada: !!apiKey,

    openaiConfigurada: !!client,

    modelo: "gpt-5.6-luna",

    rotaChat: "/api/chat"

  });

});


// ========================================
// 💬 CHAT DA LYRA
// ========================================

app.post("/api/chat", async (req, res) => {

  console.log("--------------------------------");
  console.log("📨 Nova mensagem recebida");

  try {

    // ------------------------------------
    // Verificar API KEY
    // ------------------------------------

    if (!apiKey) {

      console.error("❌ OPENAI_API_KEY não encontrada.");

      return res.status(500).json({

        error: "A chave da OpenAI não está configurada no Render.",

        diagnostico: "OPENAI_API_KEY ausente"

      });

    }


    // ------------------------------------
    // Verificar cliente OpenAI
    // ------------------------------------

    if (!client) {

      console.error("❌ Cliente OpenAI não foi criado.");

      return res.status(500).json({

        error: "O cliente da OpenAI não foi configurado.",

        diagnostico: "Cliente OpenAI ausente"

      });

    }


    // ------------------------------------
    // Receber mensagem
    // ------------------------------------

    const { message, memory = "" } = req.body || {};

    console.log("Mensagem recebida:", message);


    if (!message || typeof message !== "string") {

      console.error("❌ Mensagem inválida.");

      return res.status(400).json({

        error: "Envie uma mensagem válida.",

        diagnostico: "O campo 'message' não foi recebido corretamente."

      });

    }


    // ------------------------------------
    // Memória da história
    // ------------------------------------

    let input = message;

    if (memory) {

      input = `
MEMÓRIA DA HISTÓRIA:

${memory}

MENSAGEM DO ESCRITOR:

${message}
`;

    }


    console.log("🧠 Enviando mensagem para a OpenAI...");
    console.log("🤖 Modelo:", "gpt-5.6-luna");


    // ------------------------------------
    // CHAMADA PARA A OPENAI
    // ------------------------------------

    const response = await client.responses.create({

      model: "gpt-5.6-luna",

      instructions: LYRA,

      input: input

    });


    console.log("✅ OpenAI respondeu.");

    console.log(
      "Resposta recebida:",
      response.output_text
    );


    // ------------------------------------
    // Enviar resposta para o CodePen
    // ------------------------------------

    return res.json({

      ok: true,

      reply:
        response.output_text ||
        "A Lyra não conseguiu gerar uma resposta."

    });


  } catch (error) {

    // ====================================
    // 🚨 ERRO
    // ====================================

    console.error("================================");
    console.error("🚨 ERRO NA LYRA");
    console.error("Mensagem:", error?.message);
    console.error("Status:", error?.status);
    console.error("Nome:", error?.name);
    console.error("Código:", error?.code);
    console.error("================================");


    return res.status(
      error?.status >= 400 &&
      error?.status < 600
        ? error.status
        : 500
    ).json({

      ok: false,

      error: "A Lyra encontrou um erro.",

      diagnostico:
        error?.message ||
        "Erro desconhecido no servidor."

    });

  }

});


// ========================================
// 🚀 SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

  console.log("--------------------------------");
  console.log("🪶 LYRA INICIADA");
  console.log("Porta:", PORT);
  console.log(
    "API Key configurada:",
    !!apiKey
  );
  console.log("--------------------------------");

});
