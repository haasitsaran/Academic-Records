import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, X, Bot, User as UserIcon, BookOpen } from "lucide-react";

interface StudentSkill {
  id: string;
  skill_name: string;
  proficiency_level?: string;
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: number;
}

const COURSE_LIBRARY: Record<string, { title: string; url: string }[]> = {
  python: [
    { title: "Python for Everybody (Coursera)", url: "https://www.coursera.org/specializations/python" },
    { title: "Automate the Boring Stuff with Python", url: "https://automatetheboringstuff.com/" },
  ],
  dsa: [
    { title: "Data Structures & Algorithms (NeetCode)", url: "https://neetcode.io/" },
    { title: "Algorithms, Part I (Princeton)", url: "https://www.coursera.org/learn/algorithms-part1" },
  ],
  "data structures": [
    { title: "Grokking Algorithms", url: "https://www.manning.com/books/grokking-algorithms" },
  ],
  react: [
    { title: "React – The Complete Guide (Udemy)", url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/" },
    { title: "Epic React", url: "https://epicreact.dev/" },
  ],
  node: [
    { title: "Node.js, Express, MongoDB & More", url: "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/" },
  ],
  javascript: [
    { title: "JavaScript: The Hard Parts", url: "https://frontendmasters.com/courses/hard-parts" },
  ],
  typescript: [
    { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
  ],
  sql: [
    { title: "SQL for Data Science", url: "https://www.coursera.org/learn/sql-for-data-science" },
  ],
  "machine learning": [
    { title: "Machine Learning (Andrew Ng)", url: "https://www.coursera.org/learn/machine-learning" },
    { title: "fast.ai Practical Deep Learning", url: "https://course.fast.ai/" },
  ],
  devops: [
    { title: "Docker & Kubernetes (Udemy)", url: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/" },
  ],
  docker: [
    { title: "Docker for Developers", url: "https://docker-curriculum.com/" },
  ],
  kubernetes: [
    { title: "Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" },
  ],
  linux: [
    { title: "Linux Journey", url: "https://linuxjourney.com/" },
  ],
  git: [
    { title: "Pro Git Book", url: "https://git-scm.com/book/en/v2" },
  ],
  html: [
    { title: "MDN HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics" },
  ],
  css: [
    { title: "MDN CSS Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS" },
  ],
  frontend: [
    { title: "Frontend Developer Roadmap", url: "https://roadmap.sh/frontend" },
  ],
  backend: [
    { title: "Backend Developer Roadmap", url: "https://roadmap.sh/backend" },
  ],
  "web development": [
    { title: "The Odin Project - Full Stack", url: "https://www.theodinproject.com/" },
  ],
  cloud: [
    { title: "AWS Cloud Practitioner Essentials", url: "https://www.aws.training/Details/Curriculum?id=20685" },
  ],
  aws: [
    { title: "AWS Certified Solutions Architect - Associate", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
  ],
  azure: [
    { title: "Microsoft Learn Azure Fundamentals", url: "https://learn.microsoft.com/en-us/azure/?product=popular" },
  ],
  gcp: [
    { title: "Google Cloud Training", url: "https://cloud.google.com/training" },
  ],
  android: [
    { title: "Android Basics with Compose", url: "https://developer.android.com/courses" },
  ],
  kotlin: [
    { title: "Kotlin Language Docs", url: "https://kotlinlang.org/docs/home.html" },
  ],
  ios: [
    { title: "Stanford CS193p (Developing Apps for iOS)", url: "https://cs193p.sites.stanford.edu/" },
  ],
  swift: [
    { title: "The Swift Programming Language", url: "https://docs.swift.org/swift-book/" },
  ],
  cybersecurity: [
    { title: "Intro to Cybersecurity (Cisco)", url: "https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity" },
  ],
  security: [
    { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
  ],
  "data science": [
    { title: "Data Science Roadmap", url: "https://roadmap.sh/datascience" },
  ],
};

function matchCourses(skills: string[], query?: string) {
  const lower = (s: string) => s.toLowerCase();
  const allKeys = Object.keys(COURSE_LIBRARY);
  const terms = new Set(
    [
      ...skills.map(lower),
      ...(query ? query.split(/[,\s]+/).map(lower) : []),
    ]
  );

  const matched: { title: string; url: string }[] = [];
  for (const key of allKeys) {
    for (const term of terms) {
      if (term.includes(key) || key.includes(term)) {
        matched.push(...COURSE_LIBRARY[key]);
        break;
      }
    }
  }
  // Deduplicate by title
  const seen = new Set<string>();
  return matched.filter(c => (seen.has(c.title) ? false : (seen.add(c.title), true))).slice(0, 8);
}

export const ChatAssistant = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await supabase
          .from("student_skills")
          .select("id, skill_name, proficiency_level")
          .eq("student_id", user.id)
          .eq("is_technical", true)
          .order("created_at", { ascending: false });
        setSkills((data as StudentSkill[]) || []);
      } catch (e) {
        console.warn("chat assistant skills fetch error", e);
      }
    })();
  }, [user?.id]);

  // (Reverted draggable/resize logic)

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const skillNames = useMemo(() => skills.map(s => s.skill_name), [skills]);

  const initialHint = useMemo(() => {
    const base = skillNames.length
      ? `I can see skills like ${skillNames.slice(0,5).join(", ")}. Ask me for course paths or learning tracks.`
      : "Tell me your interests or skills, and I will suggest a learning path.";
    return base;
  }, [skillNames]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simple intent detection for static responses
    const lower = text.toLowerCase();
    const isGreet = /\b(hi|hello|hey|good\s*(morning|evening|afternoon))\b/.test(lower);
    const isThanks = /\b(thanks|thank you|ty|appreciate)\b/.test(lower);
    const isHelp = /\b(help|how (do|to)|what can you do)\b/.test(lower);
    const isBye = /\b(bye|goodbye|see (ya|you)|close (chat|assistant))\b/.test(lower);
    const isWho = /\b(who are you|about (you|yourself)|what are you)\b/.test(lower);
    const isSuggest = /\b(give me (some )?course suggestions|suggest (some )?courses|recommend (a )?course|course (ideas|paths|suggestions))\b/.test(lower);

    let reply: string | null = null;
    if (isGreet) {
      reply = `Hello! 👋 I can suggest courses based on your skills${skillNames.length ? ` like ${skillNames.slice(0,5).join(', ')}` : ''}.\nTry: "Suggest courses" or ask for a path, e.g., "React path".`;
    } else if (isThanks) {
      reply = "You're welcome! If you want more ideas, say 'Suggest courses'.";
    } else if (isHelp) {
      reply = "I help with learning paths. Ask things like: 'Suggest courses', 'React path', 'Python for data', or 'SQL basics'.";
    } else if (isWho) {
      reply = "I'm your in-app learning assistant. I scan your saved technical skills and your question to recommend relevant courses and learning paths.";
    } else if (isBye) {
      reply = "Goodbye! Come back anytime for course suggestions.";
      const botMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: reply, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      setTimeout(() => setOpen(false), 400);
      return;
    }

    if (isSuggest || reply === null) {
      const courses = matchCourses(skillNames, isSuggest ? undefined : text);
      if (courses.length === 0) {
        reply = reply ?? "I couldn’t match that to your current skills. Try mentioning a technology like React, Python, SQL, or Machine Learning.";
      } else {
        const header = isSuggest ? "Here are some course suggestions based on your skills:" : "Here are some course suggestions:";
        reply = reply ? `${reply}\n\n${header}\n${courses.map(c => `• ${c.title} — ${c.url}`).join("\n")}` : `${header}\n${courses.map(c => `• ${c.title} — ${c.url}`).join("\n")}`;
      }
    }
    const botMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: reply, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
  };

  const openAndGreet = () => {
    setOpen(true);
    if (messages.length === 0) {
      const greet: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hi! I’m your learning assistant. ${initialHint}`,
        timestamp: Date.now(),
      };
      setMessages([greet]);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={openAndGreet}
          className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full bg-primary text-primary-foreground p-4 hover:opacity-90"
          aria-label="Open Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[95vw]">
          <Card className="p-0 overflow-hidden card-gradient">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-semibold">Learning Assistant</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-3 py-2 text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  Click the button below to start chatting.
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Skill chips */}
            {skillNames.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1">
                {skillNames.slice(0,6).map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" /> {s}
                  </Badge>
                ))}
              </div>
            )}

            {/* Quick actions */}
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => { setInput("Suggest courses"); setTimeout(() => send(), 0); }}>
                Suggest courses
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setInput("Hello"); setTimeout(() => send(), 0); }}>
                Say Hi
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setInput("Help"); setTimeout(() => send(), 0); }}>
                Help
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setInput("web development courses"); setTimeout(() => send(), 0); }}>
                Web Dev
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setInput("data science path"); setTimeout(() => send(), 0); }}>
                Data Science
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setInput("devops courses"); setTimeout(() => send(), 0); }}>
                DevOps
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setInput("cloud learning path"); setTimeout(() => send(), 0); }}>
                Cloud
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setInput("cybersecurity basics"); setTimeout(() => send(), 0); }}>
                Cybersecurity
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setInput("android development track"); setTimeout(() => send(), 0); }}>
                Android
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setInput("ios swift course path"); setTimeout(() => send(), 0); }}>
                iOS
              </Button>
            </div>

            <div className="flex items-center gap-2 p-3 border-t bg-background/80 backdrop-blur">
              <Input
                placeholder="Ask for courses, e.g., React path"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              />
              <Button onClick={send} disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
