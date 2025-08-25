import { useState } from "react";
import "./App.css";

function App() {
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    if (questionCount < 1 || questionCount > 20) {
      setError("Please enter a number of questions between 1 and 20");
      return;
    }

    setLoading(true);
    setError("");
    setQuiz(null);
    setUserAnswers({});
    setShowResults(false);

    try {
      const response = await fetch("http://localhost:3000/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          questionCount: questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      console.log(data.data);
      setQuiz(data.data);
    } catch (err) {
      setError("Failed to generate quiz. Please try again.");
      console.error("Error generating quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedAnswer,
    }));
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!quiz || !userAnswers) return 0;

    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });

    return Math.round((correct / quiz.questions.length) * 100);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setUserAnswers({});
    setShowResults(false);
    setTopic("");
    setQuestionCount(5);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 AI Quiz Generator</h1>
        <p>Generate custom quizzes on any topic using AI</p>
      </header>

      <main className="app-main">
        {!quiz ? (
          <div className="quiz-form">
            <div className="form-group">
              <label htmlFor="topic">Topic:</label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., JavaScript, World History, Biology..."
                className="topic-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="questionCount">Number of Questions:</label>
              <input
                id="questionCount"
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(parseInt(e.target.value) || 1)
                }
                className="question-count-input"
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              onClick={generateQuiz}
              disabled={loading || !topic.trim()}
              className="generate-btn"
            >
              {loading ? "Generating Quiz..." : "Generate Quiz"}
            </button>
          </div>
        ) : (
          <div className="quiz-container">
            <div className="quiz-header">
              <h2>{quiz.title}</h2>
              <button onClick={resetQuiz} className="new-quiz-btn">
                Generate New Quiz
              </button>
            </div>

            <div className="questions-container">
              {quiz.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="question-card">
                  <h3>Question {questionIndex + 1}</h3>
                  <p className="question-text">{question.question}</p>

                  <div className="options-container">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="option-label">
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          value={optionIndex}
                          checked={userAnswers[questionIndex] === optionIndex}
                          onChange={() =>
                            handleAnswerSelect(questionIndex, optionIndex)
                          }
                          disabled={showResults}
                          className="option-radio"
                        />
                        <span
                          className={`option-text ${
                            showResults
                              ? optionIndex === question.correctAnswer
                                ? "correct"
                                : userAnswers[questionIndex] === optionIndex
                                ? "incorrect"
                                : ""
                              : ""
                          }`}
                        >
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>

                  {showResults && (
                    <div className="feedback">
                      {userAnswers[questionIndex] === question.correctAnswer ? (
                        <span className="correct-feedback">✅ Correct!</span>
                      ) : (
                        <span className="incorrect-feedback">
                          ❌ Incorrect. The correct answer is:{" "}
                          {question.options[question.correctAnswer]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!showResults ? (
              <button
                onClick={submitQuiz}
                disabled={
                  Object.keys(userAnswers).length < quiz.questions.length
                }
                className="submit-btn"
              >
                Submit Quiz
              </button>
            ) : (
              <div className="results">
                <h3>Quiz Results</h3>
                <div className="score">
                  <span className="score-text">
                    Your Score: {calculateScore()}%
                  </span>
                  <span className="score-detail">
                    (
                    {
                      Object.values(userAnswers).filter(
                        (answer, index) =>
                          answer === quiz.questions[index].correctAnswer
                      ).length
                    }{" "}
                    out of {quiz.questions.length} correct)
                  </span>
                </div>
                <button onClick={resetQuiz} className="new-quiz-btn">
                  Generate New Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
