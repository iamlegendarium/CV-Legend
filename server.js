// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// // Groq API endpoint proxy
// app.post('/api/groq', async (req, res) => {
//   try {
//     const { messages, model = 'llama-3.3-70b-versatile', max_tokens = 1500, temperature = 0.7 } = req.body;
    
//     const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
//       },
//       body: JSON.stringify({
//         model,
//         messages,
//         max_tokens,
//         temperature
//       })
//     });

//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     console.error('Proxy error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Groq API endpoint proxy
app.post('/api/groq', async (req, res) => {
  try {
    const { messages, model = 'llama-3.3-70b-versatile', max_tokens = 1500, temperature = 0.7 } = req.body;
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// For Vercel, we don't listen on a port - we export the app
export default app;