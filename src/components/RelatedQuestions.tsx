interface RelatedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export default function RelatedQuestions({ questions, onQuestionClick }: RelatedQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl"></div>
      <div className="relative bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <span>Related Questions</span>
        </h3>
        <div className="space-y-2">
          {questions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => onQuestionClick(question)}
              className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all group flex items-start gap-3"
            >
              <span className="text-blue-400 font-bold text-sm mt-0.5">{idx + 1}</span>
              <span className="text-gray-300 group-hover:text-blue-400 transition-colors flex-1">
                {question}
              </span>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
