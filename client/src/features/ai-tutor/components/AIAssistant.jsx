import { Textarea } from '../../../components/ui/TextArea.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tab.jsx';
import { Brain, FileText, CheckSquare, HelpCircle, Download, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select.jsx';
import { useState, useEffect } from 'react'; 
import { useSyllabus } from '../../../features/syllabus/api/useSyllabus.js';
import { useQuestionGenerator } from '../../../hooks/useQuestionGenerator.jsx';
import { useAnswerEvaluator } from '../../../hooks/useAnswerEvaluator.jsx';
import { useDoubtSolver } from '../../../hooks/useDoubtSolver.jsx';

export function AIAssistant({ userBranch, userSemester }) {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [questionPaperType, setQuestionPaperType] = useState('mid-term');
  const [numQuestions, setNumQuestions] = useState('10');
  const [userAnswer, setUserAnswer] = useState('');
  const [doubt, setDoubt] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [doubtResponse, setDoubtResponse] = useState('');
  const [evalQuestion, setEvalQuestion] = useState('Explain the difference between Array and Linked List data structures. Discuss their advantages and disadvantages with time complexity analysis.');
  
  const { syllabus, loading: loadingSyllabus } = useSyllabus(userBranch, userSemester);
  const { generateQuestions, isLoading: isGenerating, error: generationError } = useQuestionGenerator();
  const { evaluateAnswer, isLoading: isEvaluating, error: evaluationError } = useAnswerEvaluator();
  const { solveDoubt, isLoading: isSolvingDoubt, error: doubtError } = useDoubtSolver();

  useEffect(() => {
    if (syllabus && syllabus.length > 0) setSelectedSubject(syllabus[0].name);
  }, [syllabus]);

  const handleGenerateQuestions = async () => {
    const questions = await generateQuestions(selectedSubject, questionPaperType, parseInt(numQuestions));
    if (questions) setGeneratedQuestions(questions);
  };

  const handleEvaluateAnswer = async () => {
    const result = await evaluateAnswer(evalQuestion, userAnswer);
    if (result) setEvaluation(result);
  };

  const handleAskDoubt = async () => {
    const answer = await solveDoubt(selectedSubject, doubt);
    if (answer) setDoubtResponse(answer);
  };

  return (
    <div className="pb-12">
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-8 flex items-start gap-4">
          <div className="p-3 bg-[#18181b] border border-zinc-800/80 rounded-xl shadow-inner">
            <Brain className="w-6 h-6 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">AI Tutor</h1>
            <p className="text-sm text-zinc-400">Generate tests, evaluate answers, and solve doubts instantly.</p>
          </div>
        </div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-[#18181b] border border-zinc-800/60 p-1 rounded-xl">
            <TabsTrigger value="questions" className="text-zinc-400 data-[state=active]:bg-[#27272a] data-[state=active]:text-purple-400 rounded-lg py-2 gap-2 text-xs font-semibold">
              <FileText className="w-4 h-4" /> Generator
            </TabsTrigger>
            <TabsTrigger value="evaluate" className="text-zinc-400 data-[state=active]:bg-[#27272a] data-[state=active]:text-purple-400 rounded-lg py-2 gap-2 text-xs font-semibold">
              <CheckSquare className="w-4 h-4" /> Evaluator
            </TabsTrigger>
            <TabsTrigger value="doubt" className="text-zinc-400 data-[state=active]:bg-[#27272a] data-[state=active]:text-purple-400 rounded-lg py-2 gap-2 text-xs font-semibold">
              <HelpCircle className="w-4 h-4" /> Doubts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] pointer-events-none"></div>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" /> Test Settings
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Subject</label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="bg-[#0a0a0a] text-zinc-200 border-zinc-800 h-11 focus:ring-purple-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                          {loadingSyllabus ? <SelectItem value="loading" disabled>Loading...</SelectItem> : syllabus?.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Format</label>
                      <Select value={questionPaperType} onValueChange={setQuestionPaperType}>
                        <SelectTrigger className="bg-[#0a0a0a] text-zinc-200 border-zinc-800 h-11 focus:ring-purple-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                          <SelectItem value="mid-term">Mid-Term Exam</SelectItem>
                          <SelectItem value="end-term">End-Term Exam</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Count</label>
                      <input type="number" min="1" max="20" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} className="w-full bg-[#0a0a0a] text-zinc-200 border border-zinc-800 rounded-md h-11 px-3 outline-none focus:border-purple-500/50" />
                    </div>
                    <button onClick={handleGenerateQuestions} disabled={isGenerating} className="w-full h-11 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50">
                      {isGenerating ? 'Generating...' : 'Generate Questions'}
                    </button>
                    {generationError && <p className="text-xs text-rose-500">{generationError}</p>}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 shadow-lg h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-white">Generated Paper</h3>
                    {generatedQuestions.length > 0 && (
                      <button className="flex items-center gap-2 text-xs font-semibold bg-[#27272a] hover:bg-[#3f3f46] text-white px-3 py-1.5 rounded-lg transition-colors">
                        <Download className="w-3 h-3" /> Download
                      </button>
                    )}
                  </div>
                  {generatedQuestions.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {generatedQuestions.map((q, index) => (
                        <div key={index} className="p-4 bg-[#121212] rounded-xl border border-zinc-800/80">
                          <p className="text-zinc-100 font-medium mb-3 text-sm">{index + 1}. {q.questionText}</p>
                          <div className="pl-3 border-l-2 border-purple-500/50 bg-purple-500/5 py-2 rounded-r-md">
                            <p className="text-xs text-zinc-400 leading-relaxed"><span className="font-bold text-purple-400">Ans:</span> {q.correctAnswer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                      <FileText className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm">Configure settings to generate a paper</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evaluate">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6">
                <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 shadow-lg">
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-purple-500" /> Submit Answer
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Question</label>
                      <Textarea rows={3} value={evalQuestion} onChange={(e) => setEvalQuestion(e.target.value)} className="resize-none bg-[#0a0a0a] text-zinc-200 border-zinc-800 focus:ring-purple-500/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Your Answer</label>
                      <Textarea rows={8} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} className="resize-none bg-[#0a0a0a] text-zinc-200 border-zinc-800 focus:ring-purple-500/30" />
                    </div>
                    <button onClick={handleEvaluateAnswer} disabled={isEvaluating} className="w-full h-11 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 rounded-xl font-semibold transition-colors disabled:opacity-50">
                      {isEvaluating ? 'Evaluating...' : 'Evaluate Answer'}
                    </button>
                    {evaluationError && <p className="text-xs text-rose-500">{evaluationError}</p>}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 shadow-lg h-full">
                  <h3 className="font-bold text-white mb-6">AI Evaluation Report</h3>
                  {evaluation ? (
                    <div className="space-y-6">
                      <div className="text-center p-6 bg-[#0a0a0a] rounded-xl border border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Score</p>
                        <p className="text-5xl font-bold text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{evaluation.score}<span className="text-xl text-zinc-600">/100</span></p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#121212] p-4 rounded-xl border border-emerald-500/20">
                          <h4 className="text-xs font-bold text-emerald-500 mb-3 uppercase tracking-wider">Strengths</h4>
                          <ul className="space-y-2 text-xs text-zinc-300">
                            {evaluation.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">✓</span> {s}</li>)}
                          </ul>
                        </div>
                        <div className="bg-[#121212] p-4 rounded-xl border border-rose-500/20">
                          <h4 className="text-xs font-bold text-rose-500 mb-3 uppercase tracking-wider">Missing</h4>
                          <ul className="space-y-2 text-xs text-zinc-300">
                            {evaluation.improvements.map((s, i) => <li key={i} className="flex gap-2"><span className="text-rose-500">→</span> {s}</li>)}
                          </ul>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                        <h4 className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">Summary Feedback</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">{evaluation.feedback}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                      <CheckSquare className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm">Submit an answer to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="doubt">
            <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 shadow-lg max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-purple-500" /> Ask a Question
                  </h2>
                  <div className="space-y-5 mb-6">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="bg-[#0a0a0a] text-zinc-200 border-zinc-800 h-11"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                      <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                        {syllabus?.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Textarea rows={6} placeholder="Describe what you are stuck on..." value={doubt} onChange={(e) => setDoubt(e.target.value)} className="bg-[#0a0a0a] text-zinc-200 border-zinc-800 focus:ring-purple-500/30 resize-none" />
                    <button onClick={handleAskDoubt} disabled={isSolvingDoubt} className="w-full h-11 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-all">
                      {isSolvingDoubt ? 'Thinking...' : 'Get Explanation'}
                    </button>
                    {doubtError && <p className="text-xs text-rose-500">{doubtError}</p>}
                  </div>
                </div>
                <div className="bg-[#121212] border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden flex flex-col">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                   <h3 className="font-bold text-white mb-4">AI Response</h3>
                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                     {doubtResponse ? (
                       <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{doubtResponse}</div>
                     ) : (
                       <div className="h-full flex items-center justify-center text-zinc-500 text-sm">Awaiting your question...</div>
                     )}
                   </div>
                </div>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}