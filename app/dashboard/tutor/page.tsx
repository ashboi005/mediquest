"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logQuiz } from "@/lib/actions/quiz";

type TutorMode = "general" | "learn_quiz" | "quiz_learn";

interface Message {
  role: "user" | "assistant";
  content: string;
  quiz?: Quiz;
}

interface Quiz {
  questions: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizState {
  answers: number[];
  submitted: boolean;
  score?: number;
}

const MAX_MESSAGES = 10; // Store max 10 messages from each side

export default function TutorPage() {
  const [mode, setMode] = useState<TutorMode | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({ answers: [], submitted: false });
  const [showQuizButton, setShowQuizButton] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [postQuizExplanation, setPostQuizExplanation] = useState<string | null>(null);

  const modes = [
    {
      id: "general" as TutorMode,
      name: "General Chat",
      description: "Have a conversation about any genetics topic",
      icon: MessageSquare,
      color: "emerald",
    },
    {
      id: "learn_quiz" as TutorMode,
      name: "Learn → Quiz",
      description: "Get an explanation first, then test your knowledge",
      icon: BookOpen,
      color: "purple",
    },
    {
      id: "quiz_learn" as TutorMode,
      name: "Quiz → Learn",
      description: "Test yourself first, then learn from your mistakes",
      icon: HelpCircle,
      color: "amber",
    },
  ];

  const handleModeSelect = (selectedMode: TutorMode) => {
    setMode(selectedMode);
    setMessages([]);
    setCurrentQuiz(null);
    setQuizState({ answers: [], submitted: false });
    setShowQuizButton(false);
    setCurrentTopic("");
    setPostQuizExplanation(null);
  };

  // Trim messages to max limit
  const trimMessages = (msgs: Message[]) => {
    if (msgs.length <= MAX_MESSAGES * 2) return msgs;
    return msgs.slice(-MAX_MESSAGES * 2);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Track topic for quiz logging
    if (!currentTopic && (mode === "learn_quiz" || mode === "quiz_learn")) {
      setCurrentTopic(userMessage);
    }
    
    setMessages((prev) => trimMessages([...prev, { role: "user", content: userMessage }]));
    setLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          message: userMessage,
          history: trimMessages(messages),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => trimMessages([
          ...prev,
          { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
        ]));
      } else {
        // For learn_quiz mode, show explanation and then quiz
        if (mode === "learn_quiz" && data.guardrail) {
          setMessages((prev) => trimMessages([
            ...prev,
            { role: "assistant", content: data.explanation || "I can only help with clinical genetics topics." },
          ]));
          setCurrentQuiz(null);
          setQuizState({ answers: [], submitted: false });
          setPostQuizExplanation(null);
        } else if (mode === "learn_quiz" && data.explanation && data.quiz) {
          setMessages((prev) => trimMessages([
            ...prev,
            { role: "assistant", content: data.explanation },
          ]));
          setCurrentQuiz(data.quiz);
          setQuizState({ answers: new Array(data.quiz.questions.length).fill(-1), submitted: false });
          setPostQuizExplanation(null);
        } else {
          if (mode === "quiz_learn" && data.message && !data.quiz) {
            setMessages((prev) => trimMessages([
              ...prev,
              { role: "assistant", content: data.message },
            ]));
            setCurrentQuiz(null);
            setQuizState({ answers: [], submitted: false });
            setPostQuizExplanation(null);
          } else if (mode === "quiz_learn" && data.quiz) {
            setMessages((prev) => trimMessages([
              ...prev,
              { role: "assistant", content: "Quiz generated! Answer the questions below.", quiz: data.quiz },
            ]));
            setCurrentQuiz(data.quiz);
            setQuizState({ answers: new Array(data.quiz.questions.length).fill(-1), submitted: false });
            setPostQuizExplanation(null);
          } else {
            setMessages((prev) => trimMessages([
              ...prev,
              { role: "assistant", content: data.explanation || data.response, quiz: data.quiz },
            ]));
          }
        }
      }
    } catch (error) {
      setMessages((prev) => trimMessages([
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]));
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.quiz) {
      setCurrentQuiz(lastMessage.quiz);
      setQuizState({ answers: new Array(lastMessage.quiz.questions.length).fill(-1), submitted: false });
      setShowQuizButton(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (quizState.submitted) return;
    const newAnswers = [...quizState.answers];
    newAnswers[questionIndex] = answerIndex;
    setQuizState({ ...quizState, answers: newAnswers });
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    const score = currentQuiz.questions.reduce((acc, q, i) => {
      return acc + (quizState.answers[i] === q.correctAnswer ? 1 : 0);
    }, 0);

    setQuizState({ ...quizState, submitted: true, score });

    // Calculate XP: 10 XP per correct answer
    const xpEarned = score * 10;

    // Log quiz to database
    try {
      await logQuiz(
        mode || "general",
        currentTopic || "Unknown Topic",
        currentQuiz,
        quizState.answers,
        score,
        xpEarned
      );
    } catch (error) {
      console.error("Error logging quiz:", error);
    }

    // For both modes, get explanation after quiz
    if (mode === "quiz_learn" || mode === "learn_quiz") {
      setLoading(true);
      try {
        const response = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "quiz_learn_explain",
            quiz: currentQuiz,
            userAnswers: quizState.answers,
            score,
          }),
        });

        const data = await response.json();
        if (data.explanation) {
          setPostQuizExplanation(data.explanation);
        }
      } catch (error) {
        console.error("Error getting explanation:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetChat = () => {
    setMode(null);
    setMessages([]);
    setCurrentQuiz(null);
    setQuizState({ answers: [], submitted: false });
    setShowQuizButton(false);
    setCurrentTopic("");
    setPostQuizExplanation(null);
  };

  // Mode Selection Screen
  if (!mode) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tutor Lab</h1>
          <p className="text-slate-400">Choose your learning mode</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {modes.map((m) => (
            <Card
              key={m.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:-translate-y-1",
                m.color === "emerald" && "hover:border-emerald-500/50",
                m.color === "purple" && "hover:border-purple-500/50",
                m.color === "amber" && "hover:border-amber-500/50"
              )}
              onClick={() => handleModeSelect(m.id)}
            >
              <CardContent className="p-8 text-center">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                    m.color === "emerald" && "bg-emerald-500/20",
                    m.color === "purple" && "bg-purple-500/20",
                    m.color === "amber" && "bg-amber-500/20"
                  )}
                >
                  <m.icon
                    className={cn(
                      "w-8 h-8",
                      m.color === "emerald" && "text-emerald-400",
                      m.color === "purple" && "text-purple-400",
                      m.color === "amber" && "text-amber-400"
                    )}
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{m.name}</h3>
                <p className="text-slate-400">{m.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              mode === "general" && "bg-emerald-500/20",
              mode === "learn_quiz" && "bg-purple-500/20",
              mode === "quiz_learn" && "bg-amber-500/20"
            )}
          >
            <Brain
              className={cn(
                "w-5 h-5",
                mode === "general" && "text-emerald-400",
                mode === "learn_quiz" && "text-purple-400",
                mode === "quiz_learn" && "text-amber-400"
              )}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {modes.find((m) => m.id === mode)?.name}
            </h1>
            <p className="text-sm text-slate-400">
              {modes.find((m) => m.id === mode)?.description}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={resetChat}>
          Change Mode
        </Button>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">
                  {mode === "general" && "Ask me anything about clinical genetics!"}
                  {mode === "learn_quiz" && "Enter a topic to learn about, then take a quiz!"}
                  {mode === "quiz_learn" && "Enter a topic to test yourself on!"}
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === "user"
                    ? "bg-emerald-500/20 text-white"
                    : "bg-slate-800 text-slate-100"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Quiz Button for learn_quiz mode */}
          {showQuizButton && (
            <div className="flex justify-center">
              <Button onClick={handleStartQuiz} className="gap-2">
                <HelpCircle className="w-4 h-4" />
                Take Quiz
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Quiz Display */}
          {currentQuiz && (
            <Card className="border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  Quiz Time
                  {quizState.submitted && (
                    <Badge variant={quizState.score === currentQuiz.questions.length ? "default" : "secondary"}>
                      {quizState.score}/{currentQuiz.questions.length} Correct
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentQuiz.questions.map((q, qIndex) => (
                  <div key={qIndex} className="space-y-3">
                    <p className="font-medium text-white">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="grid gap-2">
                      {q.options.map((option, oIndex) => {
                        const isSelected = quizState.answers[qIndex] === oIndex;
                        const isCorrect = q.correctAnswer === oIndex;
                        const showResult = quizState.submitted;

                        return (
                          <button
                            key={oIndex}
                            onClick={() => handleAnswerSelect(qIndex, oIndex)}
                            disabled={quizState.submitted}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-lg border transition-all",
                              !showResult && isSelected && "border-purple-500 bg-purple-500/10",
                              !showResult && !isSelected && "border-slate-700 hover:border-slate-600",
                              showResult && isCorrect && "border-emerald-500 bg-emerald-500/10",
                              showResult && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                              showResult && !isSelected && !isCorrect && "border-slate-700 opacity-50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-slate-200">{option}</span>
                              {showResult && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              )}
                              {showResult && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!quizState.submitted && (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={quizState.answers.includes(-1)}
                    className="w-full"
                  >
                    Submit Answers
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {currentQuiz && quizState.submitted && postQuizExplanation && (
            <Card className="border-amber-500/40 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-300">
                  <Sparkles className="w-5 h-5" />
                  Topic Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-100 text-sm whitespace-pre-wrap leading-relaxed">
                  {postQuizExplanation}
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "general"
                  ? "Ask about any genetics topic..."
                  : "Enter a topic (e.g., 'Down Syndrome', 'Mendelian Inheritance')..."
              }
              className="min-h-[60px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="px-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
