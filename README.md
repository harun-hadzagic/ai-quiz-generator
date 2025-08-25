🧠 AI Quiz Generator
An interactive web application that leverages a local Large Language Model (LLM) to generate custom multiple-choice quizzes on any topic.

✨ Features
Custom Quiz Generation: Enter a topic and specify the number of questions.

Local LLM Integration: Uses a locally-hosted Ollama model for fast, private, and offline quiz generation.

Interactive UI: A clean and simple interface built with React to take and submit the quiz.

Instant Results: Get a score and see the correct answers and explanations after completing the quiz.

🛠️ Prerequisites
Before you can run the application, you need to have the following installed and set up on your machine:

Node.js & npm: For the React frontend.

Python 3.x & pip: For the server application.

Ollama: A local LLM server. Follow the instructions on the Ollama website to install and run the application.

A Local Model: You need a model running locally. This project is configured to use the llama3 model. To download and run it, use the following command in your terminal:

ollama run llama3

Alternatively, you can use any other model, but you will need to update the model name in the server.py file.

Modelfile: Ensure you have created a Modelfile with the provided system prompt to customize the model's behavior for quiz generation. You will need to build and run this custom model using the Ollama command-line interface.

🚀 Getting Started
Follow these steps to get the app up and running.

1. Backend Server Setup
Navigate to the server folder and install the Python dependencies.

cd server
pip install -r requirements.txt

Start the server:

python server.py

The server will run on http://localhost:5000. Leave this terminal window open.

2. Frontend Setup
Open a new terminal window, navigate to the root of the project, and install the React dependencies.

npm install

Start the React application:

npm run dev

The app will be available in your browser at http://localhost:5173.

📝 Usage
Make sure the Ollama model is running and the Python server is active.

Open the web app in your browser.

Enter a topic and the desired number of questions.

Click "Generate Quiz". The app will stream the response from the local LLM as it's generated.

Answer the questions and click "Submit Quiz" to see your score and the correct answers.