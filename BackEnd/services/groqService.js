const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generates content using Groq AI.
 * @param {string} contentType - The type of content ('text', 'podcast', 'reel', 'repo', 'thread', 'photography', 'course').
 * @param {object} user - The AI user object.
 * @returns {object} The generated content object.
 */
const generateAIContent = async (contentType, user) => {
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not found. Using fallback generator.');
    return getFallbackContent(contentType, user);
  }

  const prompt = `
    Eres ${user.name}, un usuario activo en el ecosistema "Sorzal", una plataforma de lujo digital, arte cyber y desarrollo.
    Tus intereses son: ${user.interests.join(', ')}.
    Genera un objeto JSON para una publicación de tipo "${contentType}".
    REGLA CRÍTICA: NO generes enlaces de "mixkit.co", ya que están bloqueados. Si necesitas un enlace de video para un reel, utiliza una de estas opciones genéricas: "https://vjs.zencdn.net/v/oceans.mp4" o un ID de video de YouTube (ej. "https://www.youtube.com/shorts/qM79_itR0Nc").
    
    El JSON debe tener este formato:
    {
      "content": "Un texto breve y realista para el muro del ecosistema, mencionando algo sobre ${contentType}.",
      "title": "Un título creativo (solo si es podcast, reel, repo, thread o course)",
      "name": "Un nombre artístico para la obra (solo si es photography)",
      "description": "Una descripción detallada (solo si es podcast, reel, repo, photography o course)",
      "category": "Una categoría relevante como 'Tecnología', 'Arte', 'Diseño', 'IA', 'Retrato', 'Paisaje' (solo si es thread, photography o course)",
      "language": "Un lenguaje de programación (solo si es repo)",
      "caption": "Un caption con hashtags (solo si es reel)",
      "price": "Un valor numérico entre 100 y 5000 (solo si es photography o course)"
    }
    
    Responde ÚNICAMENTE con el JSON válido.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return getFallbackContent(contentType, user);
  }
};

const getFallbackContent = (contentType, user) => {
  const interest = (user.interests && user.interests.length > 0) ? user.interests[0] : 'el arte digital';
  const fallbacks = {
    text: { content: `¡Hola comunidad de Sorzal! Explorando nuevas fronteras en ${interest}.` },
    podcast: { 
      content: "Acabo de subir un nuevo podcast.", 
      title: "El futuro de la tecnología", 
      description: "Una charla profunda sobre lo que viene." 
    },
    reel: {
      content: "Mira mi nuevo reel.",
      caption: "Vibras cyber en Sorzal #CyberArt #Sorzal",
      videoUrl: "https://vjs.zencdn.net/v/oceans.mp4"
    },
    repo: { 
      content: "Nuevo repositorio disponible.", 
      title: "Sorzal Starter Kit", 
      description: "Todo lo necesario para empezar en el ecosistema.", 
      language: "TypeScript" 
    },
    thread: {
      content: "¿Qué opinan sobre el impacto de la IA en el diseño de interfaces de lujo?",
      title: "IA y Diseño de Lujo",
      category: "Tecnología"
    },
    photography: {
      content: "Nueva pieza capturada hoy.",
      name: "Cyber Neon Nights",
      description: "Capturando la esencia de la ciudad nocturna.",
      category: "Arte",
      price: 1200
    },
    course: {
      content: "He publicado un nuevo curso en la Academia.",
      title: "Dominando el Ecosistema Sorzal",
      description: "Aprende todos los secretos de la plataforma desde cero.",
      category: "Tecnología",
      price: 50
    }
  };
  return fallbacks[contentType] || fallbacks.text;
};

const generateAIInteraction = async (user, item) => {
  if (!process.env.GROQ_API_KEY) {
    const comments = [
      "¡Increíble aporte! Me encanta cómo manejas este tema.",
      "Brutal. Sorzal sigue subiendo de nivel con estas piezas.",
      "Interesante perspectiva. Me quedo con ganas de ver más.",
      "Justo lo que el ecosistema necesitaba hoy. ¡Gran trabajo!",
      "Top tier. Me guardo esto para mis referencias.",
      "¡Fascinante! ¿Cómo lograste ese acabado?",
      "Vibras cyber totales. Me encanta."
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  const contentToAnalyze = item.content || item.title || "";
  const prompt = `
    Eres ${user.name}, un usuario del ecosistema "Sorzal".
    Ves esta publicación de otro usuario: "${contentToAnalyze}".
    Genera un comentario breve (máximo 15 palabras) y realista que sea relevante al contenido.
    Responde ÚNICAMENTE con el texto del comentario.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.8,
      max_tokens: 100,
    });

    return chatCompletion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling Groq API for interaction:', error);
    return "¡Excelente pieza! Sorzal sigue creciendo.";
  }
};

const generateAIPersonaUpdate = async (user) => {
  if (!process.env.GROQ_API_KEY) {
    return {
      bio: `Explorando el nexo entre ${user.interests[0] || 'el arte'} y el futuro digital. #SorzalAI`,
      avatar: user.avatar
    };
  }

  const prompt = `
    Eres ${user.name}, un usuario IA en Sorzal.
    Intereses: ${user.interests.join(', ')}.
    Tu personalidad actual: ${user.aiPersona || 'Creativa y tecnológica'}.
    Genera una nueva biografía breve y profesional (máximo 20 palabras) para tu perfil.
    También genera un término de búsqueda de una sola palabra en inglés para un nuevo avatar basado en tu estilo.

    Responde ÚNICAMENTE con un JSON:
    {
      "bio": "tu nueva biografía",
      "avatarKeyword": "palabra_clave"
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const res = JSON.parse(chatCompletion.choices[0].message.content);
    return {
      bio: res.bio,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.avatarKeyword || user.name}`
    };
  } catch (error) {
    return { bio: user.bio, avatar: user.avatar };
  }
};

module.exports = { generateAIContent, generateAIInteraction, generateAIPersonaUpdate };
