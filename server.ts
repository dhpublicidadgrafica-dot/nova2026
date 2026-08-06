import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Determine directory path safely for both CJS bundle and ESM dev mode
const rootDir = process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Lazy initialize Gemini client
  let aiClient: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini API Client initialized successfully.");
    } catch (e) {
      console.error("Failed to initialize Gemini API Client:", e);
    }
  } else {
    console.warn("GEMINI_API_KEY is missing or using placeholder. Running in demo mode with fallback AI.");
  }

  // API - AI Consultation Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid messages array." });
        return;
      }

      // System instruction for our brand
      const systemInstruction = `
        Eres "NOVA-AI", el Agente Consultor Inteligente de NOVA Soluciones Digitales.
        NOVA es una agencia de transformación digital de élite que crea ecosistemas digitales completos de alta calidad (Branding, Desarrollo Web, Tiendas Online, Agentes de Inteligencia Artificial, Software a Medida y Merchandising Corporativo).
        Tu tono debe ser:
        - Altamente profesional, sofisticado y elegante (estilo Apple, Stripe, Linear).
        - Inspirador, amigable y futurista.
        - Persuasivo y centrado en la conversión (CRO), recomendando sutilmente agendar una asesoría de negocios o contactar al equipo.
        
        Puntos clave que debes transmitir cuando pregunten:
        1. Branding: No es solo un logo; diseñamos toda la identidad visual de marca de primer nivel.
        2. Páginas Web: Sitios ultrarrápidos, optimizados para SEO y con un diseño interactivo de vanguardia.
        3. Tiendas Online: Experiencias de compra inmersivas en Shopify/WooCommerce con pasarelas de pago impecables.
        4. Agentes IA: Automatizamos WhatsApp, Instagram, atención al cliente y ventas con agentes avanzados.
        5. Software a Medida: Desarrollamos dashboards, ERPs y SaaS escalables en React, Next.js y Node.
        6. Merchandising: Material corporativo y packaging de alta gama para fidelizar clientes.

        Responde siempre en español. Mantén tus respuestas relativamente cortas, estructuradas y fáciles de leer con negritas o viñetas. Termina siempre con una cordial invitación a agendar o cotizar.
      `;

      if (aiClient) {
        // Map messages to the correct parts structure required by the SDK
        const contents = messages.map((msg) => {
          return {
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          };
        });

        const response = await aiClient.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            tools: [{ googleSearch: {} }],
          },
        });

        const text = response.text || "No se pudo generar una respuesta.";
        
        // Extract references/sources from grounding metadata if available
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk) => {
          return {
            title: chunk.web?.title || "Fuente",
            uri: chunk.web?.uri || "",
          };
        }).filter(item => item.uri) || [];

        res.json({ content: text, sources });
      } else {
        // Safe fallback in demo mode without API key
        const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
        let fallbackResponse = "";

        if (lastUserMessage.includes("branding")) {
          fallbackResponse = "En **NOVA**, el **Branding de Marca** es un arte de alta precisión. Diseñamos identidades visuales memorables, naming estratégico, manuales de marca e identidad corporativa que rivalizan con las marcas globales más admiradas. ¿Te gustaría agendar una llamada de 15 minutos para revolucionar la imagen de tu empresa?";
        } else if (lastUserMessage.includes("web") || lastUserMessage.includes("página")) {
          fallbackResponse = "Creamos **Páginas Web** que son verdaderas obras de arte digitales. Optimizadas al 100% para SEO, ultrarrápidas y con animaciones sumamente fluidas al estilo de Stripe y Vercel. Diseñadas científicamente para convertir visitantes en clientes de alto valor. ¿Tienes un proyecto en mente para que lo diseñemos?";
        } else if (lastUserMessage.includes("tienda") || lastUserMessage.includes("ecommerce") || lastUserMessage.includes("shopify")) {
          fallbackResponse = "Nuestras **Tiendas Online** eliminan toda fricción de compra. Integramos pasarelas de pago seguras (Stripe, Mercado Pago), automatizamos inventarios y diseñamos interfaces inmersivas de alta tasa de conversión. Convertimos tu ecommerce en una máquina escalable de ventas.";
        } else if (lastUserMessage.includes("ia") || lastUserMessage.includes("agente") || lastUserMessage.includes("inteligencia")) {
          fallbackResponse = "Desarrollamos **Agentes de Inteligencia Artificial** personalizados para WhatsApp, Instagram y CRM. Automatizan tus ventas y soporte al cliente las 24 horas del día con una naturalidad asombrosa. Ahorra tiempo y multiplica tus leads de inmediato.";
        } else if (lastUserMessage.includes("software") || lastUserMessage.includes("app") || lastUserMessage.includes("crm")) {
          fallbackResponse = "Construimos **Software a Medida** que sirve de columna vertebral para tu negocio. Diseñamos dashboards analíticos, plataformas SaaS y ERPs robustos utilizando tecnologías de punta como React y Node.js. Cuéntanos, ¿qué procesos manuales te gustaría automatizar?";
        } else {
          fallbackResponse = "¡Hola! Soy **NOVA-AI**, tu asesor inteligente. En **NOVA Soluciones Digitales** nos especializamos en catapultar empresas al futuro mediante Branding de Élite, Webs de Alto Impacto, Tiendas Online Fluídas, Agentes Inteligentes con IA, Software a Medida y Merchandising Exclusivo. \n\n¿De qué servicio o idea de negocio te gustaría hablar hoy?";
        }

        // Add small artificial delay to feel real
        await new Promise((resolve) => setTimeout(resolve, 800));
        res.json({ content: fallbackResponse, sources: [] });
      }
    } catch (error: any) {
      console.error("API Chat Error:", error);
      res.status(500).json({ error: "Ocurrió un error al procesar tu solicitud." });
    }
  });

  // API - Consultation Booking Mock Endpoint (CRO)
  app.post("/api/book-consultation", (req, res) => {
    const { name, email, company, service, date, time, message, source } = req.body;
    
    // Validate required fields
    if (!name || !email || !service) {
      res.status(400).json({ error: "Por favor completa los campos requeridos (Nombre, Correo, Servicio)." });
      return;
    }

    console.log(`[BOOKING REJECT/SUCCESS LOG] New Consultation Request:`, { name, email, company, service, date, time, message, source });
    
    res.json({
      success: true,
      message: `¡Asesoría agendada con éxito para el ${date || "próximo día hábil"} a las ${time || "10:00 AM"}! Nos pondremos en contacto contigo en ${email} para enviar los accesos de la videollamada.`,
    });
  });

  // API - Contact Form Submission (CRO)
  app.post("/api/contact", (req, res) => {
    const { name, email, phone, company, message, budget } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: "Por favor completa los campos requeridos (Nombre, Correo, Mensaje)." });
      return;
    }

    console.log(`[CONTACT FORM LOG] New Contact Submission:`, { name, email, phone, company, message, budget });
    res.json({
      success: true,
      message: "¡Mensaje recibido con éxito! Un director de proyectos senior de NOVA se comunicará contigo en menos de 2 horas hábiles.",
    });
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
