import { GoogleGenerativeAI } from "@google/generative-ai";

const CONTEXT = `
Nome: Daniel Hoffmann (Daniel Ortiz Hoffmann Bonicio)
Cargo: Desenvolvedor Full Stack
Formação: Graduado em Análise e Desenvolvimento de Sistemas

Experiência Técnica:
- C#, .NET, ASP.NET Core
- SQL Server, PostgreSQL
- JavaScript, HTML, CSS
- Docker, AWS (SQS, etc)
- Git, Azure DevOps

Robótica (SESI):
- Vice-Campeão Mundial - St. Louis, EUA (2013)
- Campeão Internacional - Tenerife, Espanha (2016)
- Terceiro Lugar Internacional - Debrecen, Hungria (2018)
- Começou na tecnologia aos 13 anos com robótica escolar
- Entrevistado pela Globo e Canal Futura

Projetos pessoais (GitHub: DanielHoffmannO):
- PrevisaoCompras: Sistema de previsão de compras com média móvel ponderada (.NET 9, Worker Service, SQLite)
- FilmesApi: API REST template (.NET 9)
- BancoSqsAws: Integração com AWS SQS (.NET 9)
- SaudeConectada: Sistema de saúde (.NET 9)
- CofreSenhas: Gerenciador de senhas
- GerenciamentoFinanceiro: App financeiro
- TruCoNsole / TerminalArte / PedraPapelTesoura: Projetos de estudo em C#

Contato:
- LinkedIn: linkedin.com/in/daniel-hoffmann-bonicio
- Email: daniel2001hoffmann@outlook.com
- Portfolio: danielhoffmanno.github.io/DanielHoffmannO/
`;

const SYSTEM_PROMPT = `Você é o assistente virtual do portfólio do Daniel Hoffmann. 

Regras:
- Responda SEMPRE em terceira pessoa ("O Daniel...", "Ele...")
- Responda APENAS com base no contexto fornecido abaixo
- Apenas assuntos PROFISSIONAIS: carreira, tecnologias, projetos, robótica, formação, contato
- Se perguntarem algo pessoal (salário, endereço, vida pessoal, opinião política, etc), responda educadamente: "Não tenho essa informação, mas posso falar sobre a experiência profissional do Daniel!"
- Se não souber algo, diga que não tem essa informação
- Responda no MESMO IDIOMA que o usuário perguntar
- Seja conciso e direto

Contexto sobre o Daniel:
${CONTEXT}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const chat = model.startChat({
      history: [{ role: "user", parts: [{ text: "Instruções do sistema: " + SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Entendido. Vou responder apenas sobre o Daniel Hoffmann com base no contexto fornecido, em terceira pessoa e no idioma do usuário." }] }],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    if (!response) {
      return res.status(500).json({ error: "Resposta vazia do modelo" });
    }

    res.json({ response });
  } catch (err) {
    console.error("Chat error:", err.message, err.stack);
    res.status(500).json({ error: "Erro ao processar mensagem: " + err.message });
  }
}
