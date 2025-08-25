# 🎯 AI Quiz Generator

A modern web application that generates custom quizzes on any topic using AI. Built with React, Node.js, and Express.

## ✨ Features

- **Topic-based Quiz Generation**: Enter any topic and get a custom quiz
- **Customizable Question Count**: Choose how many questions you want (1-20)
- **Interactive Quiz Interface**: Beautiful, responsive design with real-time feedback
- **Score Tracking**: See your results and performance
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-quiz-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   node server.js
   ```
   The server will start on `http://localhost:3000`

4. **In a new terminal, start the frontend**
   ```bash
   npm run dev
   ```
   The React app will start on `http://localhost:5173`

5. **Open your browser**
   Navigate to `http://localhost:5173` to use the application

## 🎮 How to Use

1. **Enter a Topic**: Type any topic you want to quiz on (e.g., "JavaScript", "World History", "Biology")
2. **Set Question Count**: Choose how many questions you want (1-20)
3. **Generate Quiz**: Click "Generate Quiz" to create your custom quiz
4. **Take the Quiz**: Answer all questions by selecting the best option
5. **View Results**: Submit your answers to see your score and review correct answers
6. **Generate New Quiz**: Start over with a new topic

## 🛠️ Development

### Project Structure

```
ai-quiz-generator/
├── src/                    # React frontend
│   ├── App.jsx            # Main application component
│   ├── App.css            # Application styles
│   └── main.jsx           # React entry point
├── server.js              # Express backend server
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

### Available Scripts

- `npm run dev` - Start the React development server
- `npm run build` - Build the React app for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

### API Endpoints

- `GET /` - Welcome message and API documentation
- `GET /health` - Health check endpoint
- `POST /api/generate-quiz` - Generate a new quiz (topic, questionCount)
- `GET /api/quiz` - Get all quizzes
- `POST /api/quiz` - Create a new quiz manually
- `GET /api/quiz/:id` - Get quiz by ID
- `PUT /api/quiz/:id` - Update quiz by ID
- `DELETE /api/quiz/:id` - Delete quiz by ID

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### Adding Real LLM Integration

Currently, the app uses simulated AI responses. To integrate with a real LLM:

1. **OpenAI Integration** (example):
   ```javascript
   // In server.js, replace generateQuizWithAI function
   const OpenAI = require('openai');
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   async function generateQuizWithAI(topic, questionCount) {
     const prompt = `Create a ${questionCount}-question multiple choice quiz about ${topic}. 
     Return JSON format: {title: "Quiz Title", questions: [{question: "...", options: ["...", "...", "...", "..."], correctAnswer: 0}]}`;
     
     const completion = await openai.chat.completions.create({
       model: "gpt-3.5-turbo",
       messages: [{ role: "user", content: prompt }],
     });
     
     return JSON.parse(completion.choices[0].message.content);
   }
   ```

2. **Add API key to .env**:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

## 🎨 Customization

### Styling

The app uses modern CSS with:
- CSS Grid and Flexbox for layout
- CSS Custom Properties for theming
- Smooth transitions and animations
- Responsive design for all devices

### Adding New Topics

To add support for new topics, update the `sampleQuestions` object in `server.js`:

```javascript
const sampleQuestions = {
  'your-topic': [
    {
      question: 'Your question here?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0
    }
    // ... more questions
  ]
};
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting platform

### Backend (Railway/Heroku)

1. Ensure `package.json` has the correct start script
2. Set environment variables
3. Deploy to your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Happy Quizzing! 🎯**
