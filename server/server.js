import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
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



// Basic GET endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the AI Quiz Generator API!',
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /': 'This welcome message',
      'GET /health': 'Health check endpoint',
      'GET /api/quiz': 'Get a sample quiz',
      'POST /api/quiz': 'Create a new quiz',
      'GET /api/quiz/:id': 'Get quiz by ID',
      'PUT /api/quiz/:id': 'Update quiz by ID',
      'DELETE /api/quiz/:id': 'Delete quiz by ID'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Sample quiz data
let quizzes = [
  {
    id: 1,
    title: 'JavaScript Basics',
    questions: [
      {
        question: 'What is JavaScript?',
        options: ['A programming language', 'A markup language', 'A styling language', 'A database'],
        correctAnswer: 0
      },
      {
        question: 'Which keyword is used to declare a variable in JavaScript?',
        options: ['var', 'let', 'const', 'All of the above'],
        correctAnswer: 3
      }
    ]
  },
  {
    id: 2,
    title: 'Node.js Fundamentals',
    questions: [
      {
        question: 'What is Node.js?',
        options: ['A JavaScript runtime', 'A database', 'A web browser', 'A programming language'],
        correctAnswer: 0
      }
    ]
  }
];

// GET all quizzes
app.get('/api/quiz', (req, res) => {
  res.json({
    success: true,
    data: quizzes,
    count: quizzes.length
  });
});

// GET quiz by ID
app.get('/api/quiz/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const quiz = quizzes.find(q => q.id === id);
  
  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: 'Quiz not found'
    });
  }
  
  res.json({
    success: true,
    data: quiz
  });
});
const callOllamaApi = async () => {
  // Set the timeout in milliseconds. 15 seconds is 15000 ms.
  const timeoutMs = 25000;
  
  // Create a timeout controller to abort the fetch request if it takes too long.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3',
        messages: [{ role: 'user', content: 'What is python' }]
      }),
      // Pass the signal from the controller to the fetch request.
      signal: controller.signal
    });

    // Check if the response was successful.
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Await the JSON data from the response.
    const data = await response.json();

    // Log the received data. This will now work because the process is kept
    // alive until the fetch promise resolves.
    console.log(data);

  } catch (error) {
    // Check if the error is due to the timeout.
    if (error.name === 'AbortError') {
      console.error(`Request timed out after ${timeoutMs / 1000} seconds.`);
    } else {
      // Catch and log any other errors that occurred during the fetch.
      console.error("Failed to fetch from Ollama API:", error);
    }
  } finally {
    // Always clear the timeout to prevent it from running after the request completes.
    clearTimeout(timeoutId);
  }
};

// POST create new quiz
app.post('/api/quiz', async (req, res) => {
  const { title, questions } = req.body;
  
  // if (!title || !questions || !Array.isArray(questions)) {
  //   return res.status(400).json({
  //     success: false,
  //     message: 'Title and questions array are required'
  //   });
  // }
  console.log("calling ollama api")
  await callOllamaApi()
  console.log("ollama api called")
  
  const newQuiz = {
    id: quizzes.length + 1,
    title,
    questions
  };
  
  quizzes.push(newQuiz);
  
  res.status(201).json({
    success: true,
    message: 'Quiz created successfully',
    data: newQuiz
  });
});


// POST generate quiz using AI
app.post('/api/generate-quiz', async (req, res) => {
  const { topic, questionCount } = req.body;
  
  if (!topic || !questionCount) {
    return res.status(400).json({
      success: false,
      message: 'Topic and question count are required'
    });
  }
  
  if (questionCount < 1 || questionCount > 20) {
    return res.status(400).json({
      success: false,
      message: 'Question count must be between 1 and 20'
    });
  }
  
  try {
    // Generate quiz using AI (simulated for now)
    const generatedQuiz = await generateQuizWithAI(topic, questionCount);
    
    res.json({
      success: true,
      quiz: generatedQuiz
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz'
    });
  }
});

// AI Quiz Generation Function
async function generateQuizWithAI(topic, questionCount) {
  try {
    // Create a prompt for Ollama to generate a quiz
    const prompt = `Create a ${questionCount}-question multiple choice quiz about ${topic}. 
    
    Return ONLY a valid JSON object in this exact format:
    {
      "title": "Quiz Title",
      "questions": [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0
        }
      ]
    }
    
    Make sure:
    - correctAnswer is the index (0-3) of the correct option
    - Each question has exactly 4 options
    - The JSON is valid and properly formatted
    - Questions are relevant to the topic: ${topic}`;

    // Call Ollama API
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3',
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Ollama response:', data);

    // Extract the content from Ollama response
    const content = data.message?.content || data.response || '';
    
    // Try to parse the JSON from the response
    let quizData;
    try {
      // Look for JSON in the response (sometimes LLMs add extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        quizData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON from Ollama response:', parseError);
      console.log('Raw content:', content);
      
      // Fallback to sample questions if parsing fails
      return generateFallbackQuiz(topic, questionCount);
    }

    // Validate the quiz structure
    if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
      console.error('Invalid quiz structure from Ollama');
      return generateFallbackQuiz(topic, questionCount);
    }

    // Ensure we have the right number of questions
    quizData.questions = quizData.questions.slice(0, questionCount);

    return quizData;

  } catch (error) {
    console.error('Error calling Ollama API:', error);
    // Fallback to sample questions if Ollama fails
    return generateFallbackQuiz(topic, questionCount);
  }
}

// Fallback function for when Ollama fails
function generateFallbackQuiz(topic, questionCount) {
  const sampleQuestions = {
    'javascript': [
      {
        question: 'What is JavaScript?',
        options: ['A programming language', 'A markup language', 'A styling language', 'A database'],
        correctAnswer: 0
      },
      {
        question: 'Which keyword is used to declare a variable in JavaScript?',
        options: ['var', 'let', 'const', 'All of the above'],
        correctAnswer: 3
      },
      {
        question: 'What is the purpose of the `typeof` operator?',
        options: ['To create variables', 'To check data types', 'To loop through arrays', 'To define functions'],
        correctAnswer: 1
      },
      {
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 0
      },
      {
        question: 'What is the result of `2 + "2"` in JavaScript?',
        options: ['4', '22', 'NaN', 'Error'],
        correctAnswer: 1
      }
    ],
    'python': [
      {
        question: 'What is Python?',
        options: ['A snake', 'A programming language', 'A database', 'A web browser'],
        correctAnswer: 1
      },
      {
        question: 'Which symbol is used for comments in Python?',
        options: ['//', '/*', '#', '--'],
        correctAnswer: 2
      },
      {
        question: 'What is the correct way to create a function in Python?',
        options: ['function myFunc():', 'def myFunc():', 'create myFunc():', 'func myFunc():'],
        correctAnswer: 1
      },
      {
        question: 'Which data type is used to store a sequence of characters?',
        options: ['int', 'float', 'str', 'bool'],
        correctAnswer: 2
      },
      {
        question: 'What is the output of `print(type([]))`?',
        options: ['<class \'list\'>', '<class \'array\'>', '<class \'tuple\'>', '<class \'set\'>'],
        correctAnswer: 0
      }
    ],
    'history': [
      {
        question: 'In which year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctAnswer: 2
      },
      {
        question: 'Who was the first President of the United States?',
        options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'],
        correctAnswer: 2
      },
      {
        question: 'Which ancient wonder was located in Alexandria?',
        options: ['Colossus of Rhodes', 'Lighthouse of Alexandria', 'Hanging Gardens', 'Temple of Artemis'],
        correctAnswer: 1
      },
      {
        question: 'What year did Columbus discover America?',
        options: ['1490', '1491', '1492', '1493'],
        correctAnswer: 2
      },
      {
        question: 'Which empire was ruled by Genghis Khan?',
        options: ['Roman Empire', 'Mongol Empire', 'Ottoman Empire', 'British Empire'],
        correctAnswer: 1
      }
    ]
  };
  
  // Determine which sample questions to use based on topic
  let selectedQuestions = [];
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('javascript') || topicLower.includes('js')) {
    selectedQuestions = sampleQuestions.javascript;
  } else if (topicLower.includes('python')) {
    selectedQuestions = sampleQuestions.python;
  } else if (topicLower.includes('history') || topicLower.includes('world war') || topicLower.includes('ancient')) {
    selectedQuestions = sampleQuestions.history;
  } else {
    // Default to JavaScript questions for unknown topics
    selectedQuestions = sampleQuestions.javascript;
  }
  
  // Take only the requested number of questions
  const questions = selectedQuestions.slice(0, questionCount);
  
  // Generate a title based on the topic
  const title = `${topic.charAt(0).toUpperCase() + topic.slice(1)} Quiz`;
  
  return {
    title,
    questions
  };
}

// PUT update quiz
app.put('/api/quiz/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, questions } = req.body;
  
  const quizIndex = quizzes.findIndex(q => q.id === id);
  
  if (quizIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Quiz not found'
    });
  }
  
  quizzes[quizIndex] = {
    ...quizzes[quizIndex],
    title: title || quizzes[quizIndex].title,
    questions: questions || quizzes[quizIndex].questions
  };
  
  res.json({
    success: true,
    message: 'Quiz updated successfully',
    data: quizzes[quizIndex]
  });
});

// DELETE quiz
app.delete('/api/quiz/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const quizIndex = quizzes.findIndex(q => q.id === id);
  
  if (quizIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Quiz not found'
    });
  }
  
  const deletedQuiz = quizzes.splice(quizIndex, 1)[0];
  
  res.json({
    success: true,
    message: 'Quiz deleted successfully',
    data: deletedQuiz
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/quiz`);
  console.log(`   POST http://localhost:${PORT}/api/quiz`);
  console.log(`   POST http://localhost:${PORT}/api/generate-quiz`);
  console.log(`   GET  http://localhost:${PORT}/api/quiz/:id`);
  console.log(`   PUT  http://localhost:${PORT}/api/quiz/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/quiz/:id`);
});
