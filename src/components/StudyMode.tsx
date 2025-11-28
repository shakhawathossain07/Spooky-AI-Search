import { useState, useRef, useCallback, memo } from 'react';
import { performSearch, type SearchResponse } from '../lib/search';
import { StudyIcon, UploadIcon, DocumentIcon, ResearchIcon, AIIcon, CheckIcon, IdeaIcon, ExternalLinkIcon, LoadingIcon } from './Icons';

interface StudyTopic {
  topic: string;
  searchResults?: SearchResponse;
  isSearching: boolean;
  error?: string;
}

interface ExtractedContent {
  text: string;
  pageCount: number;
}

function StudyModeComponent() {
  const [pdfText, setPdfText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract text from PDF using PDF.js with dynamic import
  const extractTextFromPDF = useCallback(async (file: File): Promise<ExtractedContent> => {
    setProcessingStatus('Loading PDF library...');
    
    // Dynamic import of PDF.js to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up worker dynamically
    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href;
    
    setProcessingStatus('Reading PDF file...');
    const arrayBuffer = await file.arrayBuffer();
    
    setProcessingStatus('Parsing PDF document...');
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const totalPages = pdf.numPages;
    const maxPages = Math.min(totalPages, 50); // Limit to 50 pages
    let fullText = '';

    for (let i = 1; i <= maxPages; i++) {
      setProcessingStatus(`Extracting text from page ${i}/${maxPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return { text: fullText.trim(), pageCount: totalPages };
  }, []);

  // Extract topics using Gemini AI
  const extractTopicsWithAI = useCallback(async (text: string): Promise<string[]> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    setProcessingStatus('Analyzing content with AI...');

    // Truncate text to avoid token limits
    const truncatedText = text.slice(0, 15000);

    const prompt = `You are an educational content analyzer. Analyze this study material and extract 5-8 key topics that a student should research further to understand the material better.

Focus on:
- Main concepts and theories
- Important terms and definitions
- Key figures, events, or processes
- Practical applications

Content to analyze:
"""
${truncatedText}
"""

Return ONLY a valid JSON array of topic strings. Each topic should be specific enough to search for but broad enough to find good resources.

Example format: ["Topic 1", "Topic 2", "Topic 3"]

JSON array:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.95,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      throw new Error(
        errorData.error?.message || 
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected API response:', data);
      throw new Error('Invalid response from Gemini API. Please try again.');
    }
    
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON array from response (handle various formats)
    const jsonMatch = aiResponse.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        const topics = JSON.parse(jsonMatch[0]);
        if (Array.isArray(topics) && topics.length > 0) {
          return topics.filter((t: any) => typeof t === 'string' && t.trim().length > 0);
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }
    }
    
    // Fallback: try to extract topics from plain text
    const lines = aiResponse.split('\n')
      .map((line: string) => line.replace(/^[\d\-\*\•\.]+\s*/, '').trim())
      .filter((line: string) => line.length > 5 && line.length < 100);
    
    if (lines.length >= 3) {
      return lines.slice(0, 8);
    }
    
    throw new Error('Could not extract topics from AI response. Please try a different document.');
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file. Other formats are not supported.');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File is too large. Please upload a PDF under 50MB.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setFileName(file.name);
    setTopics([]);
    setPdfText('');

    try {
      // Step 1: Extract text from PDF
      const { text, pageCount: pages } = await extractTextFromPDF(file);
      setPageCount(pages);
      
      if (!text || text.trim().length < 100) {
        throw new Error(
          'PDF appears to be empty or contains very little text. ' +
          'Please use a text-based PDF (not a scanned image). ' +
          'If your PDF is scanned, try using OCR software first.'
        );
      }
      
      setPdfText(text);

      // Step 2: Extract key topics using AI
      const extractedTopics = await extractTopicsWithAI(text);
      
      if (!extractedTopics || extractedTopics.length === 0) {
        throw new Error(
          'Could not identify study topics from the PDF. ' +
          'Please try a document with clearer educational content.'
        );
      }
      
      setTopics(extractedTopics.map(topic => ({ 
        topic, 
        isSearching: false 
      })));
      
      setProcessingStatus('');
    } catch (err) {
      console.error('PDF processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF. Please try again.');
      setPdfText('');
      setTopics([]);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const searchTopic = async (index: number) => {
    const topic = topics[index];
    if (!topic || topic.searchResults || topic.isSearching) return;

    // Update searching state
    setTopics(prev => prev.map((t, i) => 
      i === index ? { ...t, isSearching: true, error: undefined } : t
    ));

    try {
      const results = await performSearch(topic.topic);
      setTopics(prev => prev.map((t, i) => 
        i === index ? { ...t, searchResults: results, isSearching: false } : t
      ));
    } catch (err) {
      console.error(`Error searching topic "${topic.topic}":`, err);
      setTopics(prev => prev.map((t, i) => 
        i === index ? { 
          ...t, 
          isSearching: false, 
          error: err instanceof Error ? err.message : 'Search failed' 
        } : t
      ));
    }
  };

  const searchAllTopics = async () => {
    for (let i = 0; i < topics.length; i++) {
      if (!topics[i].searchResults && !topics[i].error) {
        await searchTopic(i);
        // Delay between searches to avoid rate limiting
        if (i < topics.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }
  };

  const resetStudyMode = () => {
    setPdfText('');
    setTopics([]);
    setFileName('');
    setPageCount(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-4 mb-4">
          <StudyIcon size={48} />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Study & Focus Mode
          </h2>
          <AIIcon size={48} />
        </div>
        <p className="text-gray-400 text-lg">
          Upload your lecture slides or study materials to get AI-powered research assistance
        </p>
      </div>

      {/* Upload Section */}
      {!pdfText && (
        <div className="mb-8">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isProcessing}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full group relative px-8 py-12 bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-2xl border-2 border-dashed border-purple-500/50 hover:border-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center gap-4">
                {isProcessing ? (
                  <>
                    <LoadingIcon size={64} className="text-purple-400" />
                    <p className="text-xl text-purple-400 font-semibold">Processing PDF...</p>
                    <p className="text-sm text-gray-400">{processingStatus || 'Please wait...'}</p>
                  </>
                ) : (
                  <>
                    <div className="group-hover:scale-110 transition-transform">
                      <UploadIcon size={64} />
                    </div>
                    <p className="text-xl text-white font-semibold">Upload PDF or Lecture Slides</p>
                    <p className="text-sm text-gray-400">Click to browse or drag and drop</p>
                    <p className="text-xs text-gray-500">Maximum 50 pages • PDF format only • Up to 50MB</p>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <div>
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Topics Section */}
      {topics.length > 0 && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between p-4 bg-gray-900/60 backdrop-blur-xl rounded-xl border border-purple-500/30">
            <div className="flex items-center gap-3">
              <DocumentIcon size={28} />
              <div>
                <p className="text-sm font-semibold text-white">{fileName}</p>
                <p className="text-xs text-gray-400">
                  {pageCount} pages • {topics.length} key topics identified
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={searchAllTopics}
                disabled={topics.every(t => t.searchResults || t.isSearching)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                <ResearchIcon size={18} />
                Research All Topics
              </button>
              <button
                onClick={resetStudyMode}
                className="px-4 py-2 bg-gray-700 rounded-lg font-semibold text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <UploadIcon size={18} />
                Upload New PDF
              </button>
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="p-6 bg-gray-900/60 backdrop-blur-xl rounded-xl border border-purple-500/30 transition-all duration-300 hover:border-purple-400/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{topic.topic}</h3>
                      {!topic.searchResults && !topic.isSearching && !topic.error && (
                        <p className="text-sm text-gray-400">Click "Research" to find the best online resources</p>
                      )}
                      {topic.error && (
                        <p className="text-sm text-red-400">❌ {topic.error}</p>
                      )}
                    </div>
                  </div>
                  {!topic.searchResults && (
                    <button
                      onClick={() => searchTopic(index)}
                      disabled={topic.isSearching}
                      className="px-4 py-2 bg-purple-600 rounded-lg font-semibold text-white hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {topic.isSearching ? (
                        <>
                          <LoadingIcon size={16} />
                          Researching...
                        </>
                      ) : (
                        <>
                          <ResearchIcon size={16} />
                          Research
                        </>
                      )}
                    </button>
                  )}
                  {topic.searchResults && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckIcon size={16} />
                      Researched
                    </span>
                  )}
                </div>

                {/* Search Results */}
                {topic.searchResults && (
                  <div className="mt-4 space-y-4">
                    {/* AI Summary */}
                    {topic.searchResults.aiSummary && (
                      <div className="p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AIIcon size={20} />
                          <span className="text-sm font-semibold text-purple-300">AI Summary</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {topic.searchResults.aiSummary}
                        </p>
                      </div>
                    )}

                    {/* Top Resources */}
                    {topic.searchResults.results.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                          <StudyIcon size={16} /> Top Resources
                        </p>
                        {topic.searchResults.results.slice(0, 4).map((result, idx) => (
                          <a
                            key={idx}
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center text-blue-400 text-xs font-bold">
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                                  {result.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{result.displayLink}</p>
                                {result.snippet && (
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{result.snippet}</p>
                                )}
                              </div>
                              <ExternalLinkIcon size={16} className="text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Related Images */}
                    {topic.searchResults.images && topic.searchResults.images.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                          <span>🖼️</span> Related Images
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {topic.searchResults.images.slice(0, 4).map((img, idx) => (
                            <a
                              key={idx}
                              href={img.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="aspect-video bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-400 transition-all"
                            >
                              <img
                                src={img.thumbnail}
                                alt={img.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="p-4 bg-gray-900/40 backdrop-blur-xl rounded-xl border border-gray-700/50 text-center">
            <p className="text-sm text-gray-400">
              {topics.filter(t => t.searchResults).length} of {topics.length} topics researched
              {topics.filter(t => t.error).length > 0 && (
                <span className="text-red-400 ml-2">
                  • {topics.filter(t => t.error).length} failed
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Help Section */}
      {!pdfText && !isProcessing && (
        <div className="mt-12 p-6 bg-gray-900/40 backdrop-blur-xl rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <IdeaIcon size={24} /> How it works
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl mb-2">1️⃣</div>
              <p className="text-sm text-gray-300 font-medium">Upload your PDF</p>
              <p className="text-xs text-gray-500 mt-1">Lecture slides, textbook chapters, or study guides</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl mb-2">2️⃣</div>
              <p className="text-sm text-gray-300 font-medium">AI extracts key topics</p>
              <p className="text-xs text-gray-500 mt-1">Gemini AI identifies important concepts to study</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl mb-2">3️⃣</div>
              <p className="text-sm text-gray-300 font-medium">Research each topic</p>
              <p className="text-xs text-gray-500 mt-1">Get AI summaries and curated resources</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-300">
              <strong>Tip:</strong> For best results, use text-based PDFs (not scanned images). 
              Digital lecture slides and textbook chapters work great!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const StudyMode = memo(StudyModeComponent);
export default StudyMode;
