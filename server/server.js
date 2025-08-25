import express from 'express';
import cors from 'cors';
import ollama from 'ollama';
const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware to allow cross-origin requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

let currentQuiz = null;

app.post('/api/quiz', async (req, res) => {
  const { topic, questionCount } = req.body;

  const output = await ollama.generate({
    model: 'teacher',
    prompt: `Topic: ${topic}, ${questionCount} questions`,
    // stream: true
  })


  currentQuiz = JSON.parse(output.response);

  
  res.status(201).json({
    success: true,
    message: 'Quiz created successfully',
    data: currentQuiz
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
