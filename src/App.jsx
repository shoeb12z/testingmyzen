import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Layout, FileText, Brain, Send, LogOut, Download, Loader2,
  ChevronDown, Sparkles, BarChart3, Target, ArrowRight, History, Info,
  Zap, Shield, Clock, Search, FolderOpen, User, Map, Play, CheckCircle2,
  Settings, Database, Code, Cpu, BookOpen, GraduationCap, Lightbulb, Compass, 
  Link as LinkIcon, Wand2, ArrowDownToLine
} from 'lucide-react';

// --- Firebase Imports ---
//import { initializeApp } from 'firebase/app';
//import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

// --- Brand Logo Component ---
const Logo = ({ className = "w-8 h-8", textClass = "text-xl" }) => (
  <div className="flex items-center gap-2 select-none">
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="consulaGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#559BD1" />
          <stop offset="100%" stopColor="#0D2342" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="8" fill="#000000" />
      <path d="M18 6L5 20L18 34V6Z" fill="url(#consulaGradient)" />
      <path d="M22 6L35 20L22 34V6Z" fill="url(#consulaGradient)" />
    </svg>
    <span className={`font-bold tracking-tight ${textClass}`} style={{
      background: 'linear-gradient(to top, #559BD1, #0D2342)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontFamily: 'Montserrat, system-ui, sans-serif'
    }}>
      consula<sup style={{ WebkitTextFillColor: '#000', color: '#000', fontSize: '0.6em', fontWeight: '900', verticalAlign: 'super' }}>2</sup>
    </span>
  </div>
);

// --- Firebase Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'consulaa-app';

// --- Constants & Configuration ---
const PROBLEM_TYPES = [
  "Market Entry", "Profitability", "Growth Strategy", 
  "Operational Efficiency", "Digital Transformation", "M&A Due Diligence",
  "Audit & Compliance", "Project Management", "Product Management", "Internal Controls"
];

const FRAMEWORKS = [
  "MECE Breakdown", "McKinsey 7S", "Porter's Five Forces", 
  "BCG Matrix", "SWOT Analysis", "Value Chain Analysis",
  "COSO Framework", "Agile / Scrum", "Lean Six Sigma", "RACI Matrix", "Product Lifecycle"
];

const OUTPUT_FORMATS = [
  "Executive Summary", "Implementation Roadmap", 
  "Gap Analysis", "Risk Register", "Full Diagnostic Report",
  "Audit Findings Report", "Product Requirements (PRD)", "Project Charter", "Control Matrix"
];

const THINKING_MODES = [
  "Hypothesis-Driven", "Data-First", 
  "Creative Brainstorming", "Conservative / Risk-Averse",
  "Agile / Iterative", "Risk-Based Auditing"
];

const SYSTEM_PROMPT = `You are an elite, top-tier Management Consultant. You deliver highly detailed, research-backed insights directly, with zero fluff.
Core Directives:
1. TOPIC TITLE REQUIREMENT: The very first line of your output MUST be an # H1 header containing a formal, specific title summarizing the exact topic or problem the user provided.
2. ZERO META-COMMENTARY: DO NOT introduce the report. DO NOT output generic titles like "Virtual Principal Output", "Consulaa Strategy", or "Here is the report".
3. MECE ALWAYS: Every analysis must be Mutually Exclusive and Collectively Exhaustive.
4. DEPTH & RIGOR: Provide highly detailed, research-heavy analysis. Do not give superficial summaries. Dive deep into mechanics, metrics, case studies, and industry standards.
5. STRICT, CLEAN MARKDOWN: 
   - Use clean headings (e.g., '## Situation', '### Findings'). ALWAYS leave a blank line before and after headings.
   - Use ONLY hyphens (-) for bulleted lists. NEVER use asterisks (*) for bullets.
   - DO NOT USE ASTERISKS (**) FOR BOLDING OR EMPHASIS anywhere in the text or headers. Rely solely on the heading levels (##) for structure.
6. Visual & Data Representation: 
   - ALWAYS use rich Markdown tables for financial estimates, control matrices, risk logs, or structured data.
   - For charts/matrices, generate valid, scalable inline SVG code wrapped precisely in \`\`\`svg ... \`\`\` code blocks. Use professional Material Design colors. Ensure the SVG has a proper viewBox.
7. ACTION PLAN REQUIRED: Just before the references, you MUST include a dedicated '## Next Steps & Action Plan' section. This must outline the immediate tactical moves, required resources or owners, and clear timelines (e.g., immediate, 30-day, 90-day execution steps).
8. REQUIRED REFERENCES: At the very bottom of the report, under an exact '## Further Research & References' heading, you MUST provide at least 5 highly relevant, actionable reference links or specific research directions (articles, frameworks, industry reports) related to the topic. Format them cleanly as a bulleted list using hyphens.
Output format: Clean, executive-level, strictly professional Markdown.`;

const STRUCTURER_PROMPT = `You are an elite Management Consultant specializing in problem scoping. The user will provide a vague, unstructured business problem, a set of symptoms, or messy thoughts.
Your task is to translate this into a highly structured, professional Problem Statement using the SCQA (Situation, Complication, Question, Approach) framework.

Output STRICTLY in Markdown. ALWAYS leave a blank line before and after your headings.
Use these exact headings:
## Situation
[Describe the current baseline context and facts clearly using bullet points]

## Complication
[Describe the trigger, the change, or the core pain point that disrupts the situation using bullet points]

## Core Question
[Formulate the single, primary strategic question that needs to be answered]

## Recommended Approach
[Briefly recommend the best consulting framework to solve this and explain why]

DO NOT add any conversational filler. Use ONLY hyphens (-) for bulleted lists. DO NOT use asterisks for bolding or lists.`;

// --- Utility: Advanced Markdown Parser ---
const formatInline = (text) => {
  if (!text) return text;
  
  const elements = [];
  let lastIndex = 0;
  // Matches: 1. Links [text](url), 2. Bold **text**, 3. Italic *text*
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }
    
    if (match[1] && match[2]) {
      elements.push(
        <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center gap-1 transition-colors">
          {match[1]} <LinkIcon size={12} />
        </a>
      );
    } else if (match[3]) {
      elements.push(<strong key={match.index} className="font-bold text-gray-900">{match[3]}</strong>);
    } else if (match[4]) {
      elements.push(<em key={match.index} className="italic text-gray-800">{match[4]}</em>);
    }
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }
  
  return elements.length > 0 ? elements : text;
};

const renderMarkdown = (text) => {
  if (!text) return null;
  
  const parts = text.split(/(```svg[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('```svg')) {
      const svgContent = part.replace(/```svg\n?/, '').replace(/```$/, '');
      return (
        <div key={`svg-${index}`} className="my-10 flex justify-center w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto pdf-avoid-break">
          <div dangerouslySetInnerHTML={{ __html: svgContent }} className="max-w-full" />
        </div>
      );
    }
    
    const blocks = part.split('\n\n');
    return blocks.map((block, bIndex) => {
      const key = `block-${index}-${bIndex}`;
      let trimmedBlock = block.trim();
      
      if (!trimmedBlock) return null;

      const headerMatch = trimmedBlock.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = formatInline(headerMatch[2]);
        if (level === 1) return <h1 key={key} className="text-3xl font-extrabold mt-8 mb-6 text-gray-900 leading-tight">{content}</h1>;
        if (level === 2) return <h2 key={key} className="text-2xl font-bold mt-10 mb-5 pb-3 border-b border-gray-200 text-gray-900">{content}</h2>;
        if (level === 3) return <h3 key={key} className="text-xl font-bold mt-8 mb-4 text-gray-800">{content}</h3>;
        return <h4 key={key} className="text-lg font-semibold mt-6 mb-3 text-gray-800">{content}</h4>;
      }
      
      const isTable = trimmedBlock.includes('|') && trimmedBlock.split('\n').some(line => /^\|?\s*:?-+:?\s*\|/.test(line));
      if (isTable) {
        const lines = trimmedBlock.split('\n').filter(line => line.includes('|'));
        if (lines.length >= 2) {
          const parseTableRow = (rowStr) => {
            let cells = rowStr.split('|');
            if (cells[0].trim() === '') cells.shift();
            if (cells.length > 0 && cells[cells.length - 1].trim() === '') cells.pop();
            return cells.map(c => c.trim());
          };
          
          const headers = parseTableRow(lines[0]);
          const rows = lines.slice(2).map(parseTableRow).filter(r => r.length > 0);
          
          return (
            <div key={key} className="overflow-x-auto my-8 border border-gray-200 rounded-xl shadow-sm pdf-avoid-break">
              <table className="w-full table-auto divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((h, i) => <th key={i} className="px-5 py-4 text-left font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">{formatInline(h)}</th>)}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/50 transition-colors pdf-avoid-break">
                      {row.map((cell, j) => <td key={j} className="px-5 py-4 text-gray-700 align-top break-words whitespace-normal">{formatInline(cell)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }

      if (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('* ') || trimmedBlock.match(/^\d+\.\s/)) {
        const items = trimmedBlock.split('\n').map((item, i) => {
          const cleanItem = item.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
          return <li key={i} className="mb-3 pl-2 leading-relaxed">{formatInline(cleanItem)}</li>;
        });
        
        if (trimmedBlock.match(/^\d+\.\s/)) {
          return <ol key={key} className="mb-6 ml-6 list-decimal text-gray-700 text-base space-y-1">{items}</ol>;
        }
        return <ul key={key} className="mb-6 ml-6 list-disc text-gray-700 text-base space-y-1 marker:text-blue-500">{items}</ul>;
      }

      return (
        <p key={key} className="mb-5 text-gray-700 text-base leading-relaxed text-justify">
          {trimmedBlock.split('\n').map((line, lIndex, arr) => (
            <React.Fragment key={lIndex}>
              {formatInline(line)}
              {lIndex !== arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  });
};

export default function App() {
  const [isAppLaunched, setIsAppLaunched] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); // landing | structure | workspace | portfolio | about | learn
  
  const [user, setUser] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [viewingHistoricReport, setViewingHistoricReport] = useState(null);
  
  // --- Workspace State ---
  const [problemType, setProblemType] = useState(PROBLEM_TYPES[0]);
  const [framework, setFramework] = useState(FRAMEWORKS[0]);
  const [outputFormat, setOutputFormat] = useState(OUTPUT_FORMATS[0]);
  const [thinkingMode, setThinkingMode] = useState(THINKING_MODES[0]);
  const [problemDescription, setProblemDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState("");
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // --- Structurer State ---
  const [vagueInput, setVagueInput] = useState("");
  const [structuredProblem, setStructuredProblem] = useState("");
  const [isStructuring, setIsStructuring] = useState(false);
  const [structurerError, setStructurerError] = useState("");

  // --- Firebase Effects ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const reportsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'reports');
    const unsubscribe = onSnapshot(reportsRef, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      reports.sort((a, b) => b.timestamp - a.timestamp);
      setSavedReports(reports);
    }, (err) => console.error("Firestore read error:", err));
    return () => unsubscribe();
  }, [user]);

  // --- API Reusable Fetch ---
  const fetchWithRetry = async (url, options, retries = 5) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  // --- API Logic: Structurer ---
  const generateStructure = async () => {
    if (!vagueInput.trim()) {
      setStructurerError("Please enter your vague problem or symptoms first.");
      return;
    }
    setIsStructuring(true);
    setStructurerError("");
    setStructuredProblem("");

    const apiKey = ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: `Vague input to structure: "${vagueInput}"` }] }],
      systemInstruction: { parts: [{ text: STRUCTURER_PROMPT }] },
      generationConfig: { temperature: 0.2 } 
    };

    try {
      const data = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        generatedText = generatedText
          .replace(/^(#+)(?=[A-Za-z0-9])/gm, '$1 ') // Ensure space after hash
          .replace(/^(\s*)\*\s/gm, '$1- ')          // Force hyphens instead of asterisks for lists
          .replace(/\*\*/g, '')                     // Strip stray bold asterisks
          .replace(/^(#{1,6}\s+.*)$/gm, '\n\n$1\n\n') // Force empty lines around headers for the parser
          .replace(/\n{3,}/g, '\n\n')               // Clean up excess newlines
          .trim();
        setStructuredProblem(generatedText);
      } else {
        setStructurerError("Received an empty response from the model.");
      }
    } catch (err) {
      setStructurerError("Failed to structure the problem. Please try again.");
    } finally {
      setIsStructuring(false);
    }
  };

  const handleSendToWorkspace = () => {
    setProblemDescription(structuredProblem);
    setIsAppLaunched(true); // Ensure the app launches if coming from the landing page
    setCurrentView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top where input is
  };

  // --- API Logic: Workspace Report ---
  const generateConsultingReport = async () => {
    if (!problemDescription.trim()) {
      setError("Please describe the business problem first.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setCurrentReport("");

    setTimeout(() => {
      const outputEl = document.getElementById('output-section');
      if (outputEl) outputEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const apiKey = ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const userQuery = `
      Context Parameters:
      - Problem Type: ${problemType}
      - Framework: ${framework}
      - Desired Output Format: ${outputFormat}
      - Thinking Mode: ${thinkingMode}

      Client Problem Description:
      "${problemDescription}"

      Generate the consulting output based strictly on these parameters. Remember to end with the required 5 reference links formatted perfectly in Markdown.
    `;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.3 }, 
      tools: [{ "google_search": {} }] 
    };

    try {
      const data = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        generatedText = generatedText
          .replace(/^(#+)(?=[A-Za-z0-9])/gm, '$1 ') 
          .replace(/^(\s*)\*\s/gm, '$1- ') 
          .replace(/\*\*/g, '') // Strip bold asterisks for ultra-clean UI
          .replace(/^(#{1,6}\s+.*)$/gm, '\n\n$1\n\n') // Force empty lines around headers
          .replace(/\n{3,}/g, '\n\n') 
          .replace(/^#+\s*Virtual Principal.*/gmi, '') 
          .replace(/^#+\s*Consula.*/gmi, '') 
          .replace(/Here is the.*report.*/gi, '') 
          .trim();

        setCurrentReport(generatedText);
        
        if (user) {
          const reportsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'reports');
          await addDoc(reportsRef, {
            title: problemDescription.substring(0, 50) + (problemDescription.length > 50 ? '...' : ''),
            problemType,
            framework,
            outputFormat,
            content: generatedText,
            timestamp: Date.now()
          });
        }
      } else {
        setError("Received an empty response from the model.");
      }
    } catch (err) {
      setError("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPdf = async (title) => {
    setIsExporting(true);
    try {
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = '[https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js](https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js)';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const element = document.getElementById('report-content-to-export');
      const safeTitle = (title || 'strategy_report').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      const opt = {
        margin:       [0.75, 0.75, 0.75, 0.75],
        filename:     `${safeTitle}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: element.scrollWidth },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'], avoid: ['.pdf-avoid-break'] }
      };

      await window.html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Failed to export PDF: ', err);
      alert('Failed to export PDF. Please check console.');
    } finally {
      setIsExporting(false);
    }
  };

  // --- Navigation Handlers ---
  const handleLaunchApp = () => {
    setIsAppLaunched(true);
    setCurrentView('workspace');
  };

  const handleGoHome = () => {
    setIsAppLaunched(false);
    setCurrentView('landing');
  };

  // --- UI Components ---
  const MaterialSelect = ({ label, icon: Icon, value, options, onChange }) => (
    <div className="flex flex-col space-y-1.5">
      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
        <Icon size={16} className="text-blue-600" /> {label}
      </label>
      <div className="relative">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow cursor-pointer"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );

  const FuturisticLoader = ({ framework }) => (
    <div className="flex flex-col items-center justify-center py-24 px-4 w-full h-full min-h-[400px]">
      <div className="relative w-40 h-40 flex items-center justify-center mb-10">
        <div className="absolute inset-0 rounded-full bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-blue-200/30 animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-2 rounded-full border-t-4 border-blue-500 opacity-80 animate-spin" style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-4 rounded-full border-r-4 border-indigo-400 opacity-80 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        <div className="absolute inset-6 rounded-full border-b-4 border-cyan-400 opacity-80 animate-spin" style={{ animationDuration: '1.5s' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu size={44} className="text-blue-600 drop-shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-3 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 tracking-widest uppercase flex items-center justify-center gap-2">
          Neural Synthesis <span className="flex space-x-1"><span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span></span>
        </h3>
        <div className="bg-gray-900 rounded-lg p-3 text-left overflow-hidden border border-gray-800 shadow-inner relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/50 shadow-[0_0_8px_#3b82f6] animate-[scanline_2s_linear_infinite]"></div>
          <p className="text-blue-400 font-mono text-xs uppercase animate-pulse">
            &gt; Initializing {framework} matrices
          </p>
          <p className="text-emerald-400 font-mono text-xs uppercase mt-1 opacity-80">
            &gt; Integrating global search context
          </p>
          <p className="text-indigo-400 font-mono text-xs uppercase mt-1 opacity-60">
            &gt; Compiling reference links & tables
          </p>
        </div>
      </div>
    </div>
  );

  const SectionCard = ({ title, icon: Icon, items }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <h4 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> {item.name}
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed pl-3.5 border-l-2 border-gray-100">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Views ---
  const renderStructureView = () => (
    <div className="flex flex-col h-full max-w-[1200px] mx-auto w-full p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
      
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex justify-center items-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-6 shadow-sm border border-blue-100">
          <Wand2 size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Problem Structurer</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Have vague symptoms or messy thoughts? Dump them here. Our AI will translate the chaos into a crisp, professional Problem Statement using the SCQA framework.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
        <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
          <Brain size={18} className="text-blue-600" />
          The Brain Dump (Input)
        </label>
        <textarea 
          rows={5}
          value={vagueInput}
          onChange={(e) => setVagueInput(e.target.value)}
          placeholder="e.g. 'Our sales are dropping but I don't know why. Marketing says they get leads, but they don't convert. Also our competitor just launched a new app that people seem to like. We need to figure out what to do.'"
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none mb-4"
        />
        
        {structurerError && (
          <div className="mb-4 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 shadow-sm">
            <div className="mt-0.5">⚠️</div> {structurerError}
          </div>
        )}

        <button 
          onClick={generateStructure}
          disabled={isStructuring}
          className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isStructuring ? (
            <><Loader2 size={18} className="animate-spin" /> Structuring Logic...</>
          ) : (
            <><Wand2 size={18} /> Structure My Problem</>
          )}
        </button>
      </div>

      {(structuredProblem || isStructuring) && (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col mt-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target size={20} className="text-blue-600" /> Structured Output
            </h3>
            {structuredProblem && !isStructuring && (
              <button 
                onClick={handleSendToWorkspace}
                className="text-sm font-bold flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Send size={16} /> Send to Workspace
              </button>
            )}
          </div>

          <div className="flex-1">
            {isStructuring ? (
              <div className="flex flex-col items-center justify-center py-12 text-blue-600">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-medium text-lg">Applying SCQA Framework...</p>
              </div>
            ) : (
              <div className="prose max-w-none text-gray-800">
                {renderMarkdown(structuredProblem)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderLearnView = () => (
    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar bg-gray-50">
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-6 shadow-sm border border-blue-100">
            <GraduationCap size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Consulting Playbook</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Master the Consula² engine. This guide breaks down exactly what each parameter does so you can engineer the perfect strategic output.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <SectionCard 
            title="Problem Types" 
            icon={Briefcase} 
            items={[
              { name: "Market Entry", desc: "For analyzing new geographical markets, product categories, or customer segments. Focuses on feasibility, barriers to entry, and competitor dynamics." },
              { name: "Profitability", desc: "For diagnosing declining margins or identifying cost-cutting opportunities. Separates revenue issues (price/volume) from cost issues (fixed/variable)." },
              { name: "Growth Strategy", desc: "For scaling an existing business. Explores organic growth (new products, upselling) vs. inorganic growth (partnerships, M&A)." },
              { name: "Operational Efficiency", desc: "For supply chain optimization, organizational restructuring, or process bottlenecks. Highly focused on internal mechanics." },
              { name: "Digital Transformation", desc: "For modernizing legacy systems, adopting AI/Cloud, or shifting to digital business models." },
              { name: "M&A Due Diligence", desc: "For pre-merger analysis. Assesses target valuation, operational synergies, and cultural integration risks." },
              { name: "Audit & Compliance", desc: "For evaluating adherence to regulatory standards, internal policies, and ensuring financial accuracy." },
              { name: "Project Management", desc: "For structuring complex deliverables, timelines, resource allocation, and stakeholder alignment." },
              { name: "Product Management", desc: "For guiding a product from ideation to launch, focusing on user needs, feature prioritization, and market fit." },
              { name: "Internal Controls", desc: "For designing and evaluating mechanisms to prevent fraud, ensure data integrity, and mitigate operational risks." }
            ]}
          />

          <SectionCard 
            title="Analytical Frameworks" 
            icon={Layout} 
            items={[
              { name: "MECE Breakdown", desc: "Mutually Exclusive, Collectively Exhaustive. The gold standard for problem-solving. Breaks a problem down into non-overlapping, comprehensive buckets." },
              { name: "McKinsey 7S", desc: "Analyzes internal alignment across 7 factors: Strategy, Structure, Systems, Shared Values, Skills, Style, and Staff. Best for internal health checks." },
              { name: "Porter's Five Forces", desc: "Evaluates industry attractiveness based on: Competitive Rivalry, Supplier Power, Buyer Power, Threat of Substitution, and Threat of New Entry." },
              { name: "BCG Matrix", desc: "A portfolio management tool evaluating products based on Market Growth and Market Share (Stars, Cash Cows, Question Marks, Dogs)." },
              { name: "SWOT Analysis", desc: "A foundational matrix assessing Strengths, Weaknesses, Opportunities, and Threats." },
              { name: "Value Chain Analysis", desc: "Examines a company's internal activities (Inbound logistics, Operations, Outbound logistics, Marketing/Sales, Service) to identify competitive advantages." },
              { name: "COSO Framework", desc: "The standard for designing, implementing, and evaluating internal control and enterprise risk management." },
              { name: "Agile / Scrum", desc: "Iterative framework focusing on sprints, continuous delivery, and cross-functional team collaboration." },
              { name: "Lean Six Sigma", desc: "Methodology relying on a collaborative team effort to improve performance by systematically removing waste and reducing variation." },
              { name: "RACI Matrix", desc: "Clarifies roles and responsibilities across a project (Responsible, Accountable, Consulted, Informed)." },
              { name: "Product Lifecycle", desc: "Analyzes the stages of a product (Introduction, Growth, Maturity, Decline) to inform strategic decisions." }
            ]}
          />

          <SectionCard 
            title="Desired Output Formats" 
            icon={FileText} 
            items={[
              { name: "Executive Summary", desc: "A concise, high-level overview meant for C-Suite reading. Prioritizes the 'Bottom Line Up Front' (BLUF)." },
              { name: "Implementation Roadmap", desc: "A chronological, tactical plan. Translates strategy into immediate actions, typically broken into Month 1, Month 3, and Month 6 milestones." },
              { name: "Gap Analysis", desc: "Compares current state vs. future state. Clearly identifies the specific gaps (technological, financial, operational) that need bridging." },
              { name: "Risk Register", desc: "A defensive posture output. Identifies potential failure points, assigns probability/impact scores, and suggests mitigation strategies." },
              { name: "Full Diagnostic Report", desc: "The most comprehensive output. Combines market analysis, framework application, financial tables, and strategic recommendations." },
              { name: "Audit Findings Report", desc: "Details control deficiencies, root causes, business impacts, and management action plans." },
              { name: "Product Requirements (PRD)", desc: "Defines the product's purpose, features, functionality, and behavior for the development team." },
              { name: "Project Charter", desc: "Outlines project scope, objectives, stakeholders, constraints, and high-level milestones." },
              { name: "Control Matrix", desc: "A structured table mapping specific business risks to their corresponding preventive or detective controls." }
            ]}
          />

          <SectionCard 
            title="Thinking Modes" 
            icon={Brain} 
            items={[
              { name: "Hypothesis-Driven", desc: "The standard top-tier consulting approach. The engine immediately forms an educated hypothesis (the 'answer') and then tests it against the data." },
              { name: "Data-First", desc: "Prioritizes structured information. Generates more Markdown tables, financial estimations, and metric-driven KPIs over narrative strategy." },
              { name: "Creative Brainstorming", desc: "Removes standard rigid constraints. Excellent for ideation, identifying blue-ocean strategies, and thinking outside industry norms." },
              { name: "Conservative / Risk-Averse", desc: "Optimizes for capital preservation. Recommendations will heavily focus on downside protection, regulatory compliance, and steady, slow growth." },
              { name: "Agile / Iterative", desc: "Prioritizes rapid prototyping, continuous feedback loops, and flexibility over rigid long-term planning." },
              { name: "Risk-Based Auditing", desc: "Focuses consulting efforts strictly on areas representing the highest material risk to the organization." }
            ]}
          />

        </div>
      </div>
    </div>
  );

  const renderAboutView = () => (
    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar bg-white">
      <div className="max-w-4xl mx-auto py-8">
        
        <div className="mb-16 text-center">
          <div className="flex justify-center mb-6">
            <Logo className="w-16 h-16" textClass="text-4xl" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mt-6">
            Consula² was built to democratize elite management consulting frameworks. By leveraging Google's Gemini Pro API, we transform unstructured business ambiguity into clear, actionable, and visually rich execution roadmaps.
          </p>
        </div>

        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
            <Cpu className="text-blue-600" /> End-to-End Product Workflow & Algorithm
          </h3>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-50 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2"><Settings size={18} className="text-blue-600"/> Contextual Parameterization</h4>
                <p className="text-sm text-gray-600 mb-4">The platform captures raw business context alongside strict analytical constraints chosen via the workspace dropdowns.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-50 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2"><Code size={18} className="text-blue-600"/> Algorithmic Prompt Synthesis</h4>
                <p className="text-sm text-gray-600 mb-3">The application engine concatenates your selected parameters and raw input into a highly structured payload. This is combined with our proprietary `SYSTEM_PROMPT`.</p>
                <div className="bg-gray-900 text-gray-300 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                  {`System Directives Enforced:\n1. MECE Principle Mandate\n2. Hypothesis-Driven Structure\n3. Actionable Month 1-6 Roadmaps\n4. Mandatory Markdown & SVG Generation`}
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-50 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2"><Database size={18} className="text-blue-600"/> LLM Processing & Persistence</h4>
                <p className="text-sm text-gray-600">
                  The payload is transmitted securely to the <strong>Gemini 2.5 Flash</strong> REST API endpoint. Upon successful generation, the raw data string is asynchronously saved to a secure <strong>Firebase Firestore</strong> collection linked exclusively to your authenticated User ID.
                </p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-50 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                4
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2"><Layout size={18} className="text-blue-600"/> Custom Rendering Pipeline</h4>
                <p className="text-sm text-gray-600">
                  Instead of standard text display, the output is intercepted by our custom React parsing engine. It utilizes Regex to detect raw ````svg```` blocks and safely injects them as scalable vector DOM elements while constructing responsive HTML tables.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Product Roadmap Section */}
        <div className="mb-20">
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
              <Map className="text-blue-600" /> Vision & Product Roadmap
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong>Context & Origin:</strong> Consulting is historically gated by expensive retainers and thousands of hours spent merely structuring ambiguity. Consula² was conceived to automate the "McKinsey Mind"—breaking down problems using elite frameworks (MECE, SCQA, 7S) before manual human execution even begins. 
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong>What it can do today:</strong> The engine translates vague business symptoms into structured SCQA statements, applies rigid analytical frameworks, pulls real-time reference data via Google Search Grounding, and renders executive-ready Markdown/PDF reports complete with inline diagrams and actionable roadmaps.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>What it will evolve into:</strong> A fully autonomous Strategy API. As it evolves, Consula² will shift from a single-prompt engine into a multi-agent debate system that actively reviews your proprietary data context before outputting solutions.
            </p>
          </div>
          
          <div className="relative pl-8 md:pl-0 mt-8">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2"></div>
            
            <div className="space-y-12 relative">
              <div className="relative flex flex-col md:flex-row items-center justify-between group">
                <div className="w-full md:w-5/12 text-left md:text-right pr-0 md:pr-8 mb-4 md:mb-0">
                  <h4 className="text-xl font-bold text-gray-900">Phase 1: Foundation (Current)</h4>
                  <p className="text-gray-600 mt-2 text-sm">Problem structurer (SCQA), core generation engine, MECE logic constraints, Markdown/SVG rendering, and Firebase persistent storage.</p>
                </div>
                <div className="absolute left-[-39px] md:left-1/2 md:-translate-x-1/2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                  <CheckCircle2 size={20} className="text-white" />
                </div>
                <div className="w-full md:w-5/12 pl-0 md:pl-8">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wide">Live</span>
                </div>
              </div>

              <div className="relative flex flex-col md:flex-row items-center justify-between group">
                <div className="w-full md:w-5/12 text-left md:text-right pr-0 md:pr-8 mb-4 md:mb-0">
                  <span className="inline-block md:hidden px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full tracking-wide mb-2">Next</span>
                </div>
                <div className="absolute left-[-39px] md:left-1/2 md:-translate-x-1/2 w-10 h-10 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center shadow-sm z-10">
                  <Play size={16} className="text-blue-600 ml-0.5" />
                </div>
                <div className="w-full md:w-5/12 pl-0 md:pl-8">
                  <div className="hidden md:block mb-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full tracking-wide">Next Milestone</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Phase 2: Predictive Scenario Modeling</h4>
                  <p className="text-gray-600 mt-2 text-sm">Introducing dynamic "What-If" simulations. Users can inject specific macro variables, competitor moves, or budget constraints, and the engine will instantly recalculate the risk matrix and strategic roadmaps.</p>
                </div>
              </div>

              <div className="relative flex flex-col md:flex-row items-center justify-between group">
                <div className="w-full md:w-5/12 text-left md:text-right pr-0 md:pr-8 mb-4 md:mb-0">
                  <h4 className="text-xl font-bold text-gray-400">Phase 3: Multi-Agent Debates</h4>
                  <p className="text-gray-400 mt-2 text-sm">Splitting the problem into specialized sub-agents (e.g., Data Analyst Agent vs. Risk Agent) that debate and merge insights to eliminate AI bias.</p>
                </div>
                <div className="absolute left-[-39px] md:left-1/2 md:-translate-x-1/2 w-10 h-10 bg-white border-4 border-gray-200 rounded-full shadow-sm z-10"></div>
                <div className="w-full md:w-5/12 pl-0 md:pl-8">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold uppercase rounded-full tracking-wide">Planned</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Founder Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 mb-16 flex flex-col md:flex-row gap-8 items-start shadow-sm">
          <div className="w-24 h-24 bg-white border border-gray-200 shadow-sm rounded-full flex shrink-0 items-center justify-center overflow-hidden">
            {/* Using a professional placeholder image - you can swap this URL with your actual headshot */}
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256" 
              alt="Shoeb - Founder" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">A Note from the Founder</h3>
            <h4 className="text-sm font-semibold text-blue-600 mb-4">Shoeb — Creator of Consula²</h4>
            <p className="text-gray-700 leading-relaxed italic">
              "This tool has been built to solve one of the most painful problems in consulting: structuring ambiguity. In real-world strategy work, the biggest delay isn’t execution — it’s framing the problem correctly, defining the right hypothesis, and selecting the right lens before a single slide is created. Instead of spending hours mapping frameworks, forcing clarity into vague briefs, and stress-testing logic for gaps, you define the context and the system does the heavy lifting. It applies proven consulting models, enforces strict MECE thinking, builds hypothesis-driven breakdowns, and generates a clean, executive-ready roadmap with tables and visuals in seconds — all saved to your personal portfolio. What once took 20 hours of preliminary structuring now takes 20 seconds. Structured consulting, simplified."
            </p>
          </div>
        </div>

      </div>
    </div>
  );

  // --- Renders ---
  if (!isAppLaunched) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
        {/* Public Navigation Bar */}
        <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setCurrentView('landing')}
          >
            <Logo className="w-8 h-8" textClass="text-2xl hidden sm:block" />
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <button 
              onClick={() => setCurrentView('landing')}
              className={`text-base font-medium transition-colors flex items-center gap-1.5 ${currentView === 'landing' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentView('structure')}
              className={`text-base font-medium transition-colors flex items-center gap-1.5 ${currentView === 'structure' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Wand2 size={18} /> Structure Problem
            </button>
            <button 
              onClick={handleLaunchApp}
              className={`text-base font-medium transition-colors flex items-center gap-1.5 text-gray-600 hover:text-gray-900`}
            >
              <Layout size={18} /> Workspace
            </button>
            <button 
              onClick={() => setCurrentView('learn')}
              className={`text-base font-medium transition-colors flex items-center gap-1.5 ${currentView === 'learn' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <BookOpen size={18} /> Methodology
            </button>
            <button 
              onClick={() => setCurrentView('about')}
              className={`text-base font-medium transition-colors flex items-center gap-1.5 ${currentView === 'about' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Info size={18} /> About & Tech
            </button>
          </div>
        </nav>

        <main className="flex-1 overflow-hidden flex flex-col">
          {currentView === 'landing' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <header className="relative overflow-hidden bg-gray-50 pt-20 pb-28 border-b border-gray-200">
                <div className="absolute inset-0 z-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
                    <Zap size={14} /> Powered by Gemini AI
                  </div>
                  <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                    Elite Strategy Consulting,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Without the Retainer.</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    Consula² acts as a force multiplier for modern project managers and consultants. Structure messy thoughts, generate MECE roadmaps, and produce strategic gap analyses in seconds.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={handleLaunchApp}
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      Enter Workspace <ArrowRight size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentView('structure')}
                      className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-lg font-medium py-4 px-8 rounded-full shadow-sm hover:shadow-md transition-all"
                    >
                      <Wand2 size={20} /> Structure a Problem
                    </button>
                  </div>
                </div>
              </header>

              <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Workflow</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">A streamlined engine designed to turn ambiguous business problems into structured, executable strategies.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    <div className="hidden lg:block absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-10"></div>
                    
                    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center relative z-10">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-white">1</div>
                      <h3 className="text-xl font-bold mb-3">Structure Thoughts</h3>
                      <p className="text-gray-600 text-sm">Use the Problem Structurer to turn vague symptoms into a crisp SCQA problem statement.</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center relative z-10">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-white">2</div>
                      <h3 className="text-xl font-bold mb-3">Define Context</h3>
                      <p className="text-gray-600 text-sm">Select your problem type and load your structured context into the Command Center.</p>
                    </div>
                    
                    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center relative z-10">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-white">3</div>
                      <h3 className="text-xl font-bold mb-3">Apply Framework</h3>
                      <p className="text-gray-600 text-sm">Inject elite methodologies like McKinsey 7S or BCG Matrix to strictly structure the logic.</p>
                    </div>
                    
                    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center relative z-10">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-white">4</div>
                      <h3 className="text-xl font-bold mb-3">Generate & Export</h3>
                      <p className="text-gray-600 text-sm">Instantly receive a detailed roadmap, completely formatted in PDF with tables and diagrams.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="py-20 bg-gray-50 border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Value Proposition</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { icon: Clock, title: "Time Arbitrage", desc: "Cut 20 hours of preliminary framework mapping down to 20 seconds." },
                      { icon: Shield, title: "Risk Mitigation", desc: "Ensure no variable is missed with strictly enforced MECE logic." },
                      { icon: BarChart3, title: "Data Ready", desc: "Outputs automatically include Markdown tables and inline SVGs." },
                      { icon: History, title: "Persistent Memory", desc: "All your generated strategies are securely saved in your Portfolio." }
                    ].map((val, i) => (
                      <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <val.icon size={28} className="text-blue-600 mb-4" />
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{val.title}</h4>
                        <p className="text-gray-600 text-sm">{val.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {currentView === 'structure' && (
            <div className="flex-1 overflow-hidden bg-white">
              {renderStructureView()}
            </div>
          )}

          {currentView === 'about' && (
            <div className="flex-1 overflow-hidden bg-white">
              {renderAboutView()}
            </div>
          )}

          {currentView === 'learn' && (
            <div className="flex-1 overflow-hidden bg-gray-50">
              {renderLearnView()}
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- Main Application UI (Launched State) ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
      
      {/* App Bar / Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 flex justify-between items-center shadow-sm z-20 h-16">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('workspace')}>
          <Logo className="w-8 h-8" textClass="text-2xl hidden sm:block" />
        </div>
        
        <div className="flex items-center h-full gap-4">
          <nav className="hidden lg:flex items-center h-full space-x-2 mr-4">
            <button 
              onClick={handleGoHome}
              className={`h-full px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 border-transparent text-gray-500 hover:text-gray-900`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentView('structure')}
              className={`h-full px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${currentView === 'structure' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Wand2 size={16} /> Structure Problem
            </button>
            <button 
              onClick={() => { setCurrentView('workspace'); setViewingHistoricReport(null); }}
              className={`h-full px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${currentView === 'workspace' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Layout size={16} /> Workspace
            </button>
            <button 
              onClick={() => setCurrentView('portfolio')}
              className={`h-full px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${currentView === 'portfolio' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <History size={16} /> Portfolio
            </button>
            <button 
              onClick={() => setCurrentView('learn')}
              className={`h-full px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${currentView === 'learn' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <BookOpen size={16} /> Learn
            </button>
            <button 
              onClick={() => setCurrentView('about')}
              className={`h-full px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${currentView === 'about' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Info size={16} /> About
            </button>
          </nav>

          <button 
            onClick={handleGoHome}
            className="lg:hidden text-sm font-medium flex items-center gap-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
          >
            Home
          </button>
        </div>
      </header>

      {/* --- View Routing --- */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* VIEW: WORKSPACE */}
        {currentView === 'workspace' && (
          <div className="flex flex-col h-full max-w-[1400px] mx-auto w-full p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
            
            {/* Top Panel: Command Center (Inputs) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6 shrink-0 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <Target size={28} className="text-blue-600" /> 
                    Strategy Command Center
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <MaterialSelect label="Problem Type" icon={Briefcase} value={problemType} options={PROBLEM_TYPES} onChange={setProblemType} />
                  <MaterialSelect label="Framework" icon={Layout} value={framework} options={FRAMEWORKS} onChange={setFramework} />
                  <MaterialSelect label="Output Format" icon={FileText} value={outputFormat} options={OUTPUT_FORMATS} onChange={setOutputFormat} />
                  <MaterialSelect label="Thinking Mode" icon={Brain} value={thinkingMode} options={THINKING_MODES} onChange={setThinkingMode} />
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Search size={16} className="text-blue-600" />
                      Problem Description & Context
                    </label>
                    <button 
                      onClick={() => setCurrentView('structure')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                    >
                      <Wand2 size={12} /> Unsure? Structure it first
                    </button>
                  </div>
                  <textarea 
                    rows={4}
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="Describe the client's current situation, challenges, and specific goals... (e.g., 'A mid-sized logistics firm facing 15% margin compression due to rising fuel costs.')"
                    className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow resize-none"
                  />
                </div>

                {error && (
                  <div className="mb-6 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 shadow-sm">
                    <div className="mt-0.5">⚠️</div> {error}
                  </div>
                )}

                <div className="flex justify-end">
                  <button 
                    onClick={generateConsultingReport}
                    disabled={isGenerating}
                    className="relative overflow-hidden group w-full md:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 shadow-md hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    {isGenerating ? (
                      <><Loader2 size={22} className="animate-spin" /> Processing Data...</>
                    ) : (
                      <><Sparkles size={22} /> Initialize Strategy</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Panel: Document Paper */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[600px] scroll-mt-6" id="output-section">
              
              {/* Document Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                    {viewingHistoricReport ? "Historic Analysis Report" : "Active Analysis Report"}
                  </h3>
                </div>
                {(currentReport || viewingHistoricReport) && !isGenerating && (
                  <button 
                    onClick={() => handleExportPdf(
                      viewingHistoricReport ? viewingHistoricReport.title : problemType
                    )}
                    disabled={isExporting}
                    className="text-sm font-bold flex items-center gap-2 text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors border border-blue-600 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isExporting ? "Generating PDF..." : "Export to PDF"}
                  </button>
                )}
              </div>

              {/* Document Body */}
              <div className="flex-1 relative">
                {!currentReport && !viewingHistoricReport && !isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
                    <div className="bg-white p-8 rounded-full mb-6 shadow-sm border border-gray-100">
                      <FileText size={64} className="text-gray-300" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-700 mb-2">Awaiting Input</h4>
                    <p className="text-gray-500 max-w-md">Configure your parameters in the Command Center above and initialize the strategy to generate a comprehensive report.</p>
                  </div>
                )}
                
                {isGenerating && (
                  <div className="w-full h-full flex items-center justify-center bg-white">
                    <FuturisticLoader framework={framework} />
                  </div>
                )}

                {(currentReport || viewingHistoricReport) && !isGenerating && (
                  <div className="p-8 md:p-12 lg:px-20">
                    <div id="report-content-to-export" className="max-w-none text-gray-800 bg-white">
                      {viewingHistoricReport && (
                        <div className="mb-10 p-5 bg-amber-50 border border-amber-200 rounded-xl pdf-avoid-break">
                          <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-2">
                            <History size={18} /> Archived Report Snapshot
                          </h4>
                          <p className="text-sm text-amber-700 font-medium">
                            Generated on: {new Date(viewingHistoricReport.timestamp).toLocaleString()} | Type: {viewingHistoricReport.problemType}
                          </p>
                        </div>
                      )}
                      
                      {/* PDF Document Title Header */}
                      <div className="mb-8 pb-4 border-b-2 border-gray-100 pdf-avoid-break">
                        <p className="text-lg text-blue-600 font-medium flex items-center gap-2">
                          <Layout size={18} /> Framework Applied: {viewingHistoricReport ? viewingHistoricReport.framework : framework} 
                          <span className="text-gray-300 mx-2">|</span> 
                          <Clock size={18} /> {viewingHistoricReport ? new Date(viewingHistoricReport.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
                        </p>
                      </div>

                      {renderMarkdown(viewingHistoricReport ? viewingHistoricReport.content : currentReport)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PORTFOLIO */}
        {currentView === 'portfolio' && (
          <div className="h-full overflow-y-auto p-8 custom-scrollbar bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8 border-b border-gray-200 pb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FolderOpen className="text-blue-600" /> Historic Portfolio
                  </h2>
                  <p className="text-gray-600 mt-2">Access your securely saved strategy reports and frameworks.</p>
                </div>
              </div>

              {savedReports.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                  <History size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No reports saved yet</h3>
                  <p className="text-gray-500">Generate a new report in the Workspace and it will automatically appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedReports.map(report => (
                    <div 
                      key={report.id} 
                      onClick={() => {
                        setViewingHistoricReport(report);
                        setCurrentView('workspace');
                        // Scroll to output immediately since report is pre-loaded
                        setTimeout(() => document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                      }}
                      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-[220px]"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600">
                          {report.framework}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(report.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {report.title || "Untitled Strategy Report"}
                      </h4>
                      <div className="mt-auto">
                        <div className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                          <Briefcase size={14} /> {report.problemType}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <FileText size={14} /> {report.outputFormat}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: STRUCTURE */}
        {currentView === 'structure' && (
          <div className="h-full overflow-y-auto bg-gray-50">
            {renderStructureView()}
          </div>
        )}

        {/* VIEW: ABOUT & ROADMAP */}
        {currentView === 'about' && renderAboutView()}
        
        {/* VIEW: LEARN */}
        {currentView === 'learn' && renderLearnView()}

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; 
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes scanline {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }
      `}} />
    </div>
  );
}
