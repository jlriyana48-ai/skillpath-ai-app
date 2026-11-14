import { useEffect, useRef, useState } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { StudentWorkspace } from '../types';

interface MentorViewProps {
  workspace: StudentWorkspace;
  draftPrompt: string;
  onClearDraftPrompt: () => void;
  onSendMessage: (message: string) => Promise<void>;
  isSending: boolean;
}

const STARTER_PROMPTS = [
  'Explain my biggest skill gap in simple, beginner-friendly terms.',
  'Create a realistic 7-day study schedule based on my weekly hours.',
  'What portfolio project should I build first to impress recruiters?',
  'Quiz me on 3 interview concepts for my target career.',
];

export function MentorView({
  workspace,
  draftPrompt,
  onClearDraftPrompt,
  onSendMessage,
  isSending,
}: MentorViewProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (draftPrompt) {
      setInput(draftPrompt);
      onClearDraftPrompt();
    }
  }, [draftPrompt, onClearDraftPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [workspace.mentorMessages, isSending]);

  const handleSubmit = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || isSending) return;
    if (!text) setInput('');
    await onSendMessage(query);
  };

  const allItems = workspace.roadmap.phases.flatMap((p) => p.items);
  const completedCount = allItems.filter((i) => i.completed).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Main Conversational AI Mentor Thread */}
      <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl flex flex-col h-[640px]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-display font-bold text-slate-900">
              AI Career & Study Mentor
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized guidance grounded in {workspace.profile.name}&rsquo;s profile, skill gaps, and roadmap progress
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
          {workspace.mentorMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="mt-1 text-xs text-slate-400">
                  {isUser ? workspace.profile.name : 'SkillPath AI Mentor'} · {msg.timestamp}
                </span>

                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.suggestedFollowUps.map((followUp) => (
                      <button
                        key={followUp}
                        type="button"
                        disabled={isSending}
                        onClick={() => handleSubmit(followUp)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left cursor-pointer disabled:opacity-50"
                      >
                        {followUp}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>AI Mentor is reviewing your learning path...</span>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for study plans, concept explanations, project tips, or interview prep..."
              disabled={isSending}
              className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </section>

      {/* Right Context & Quick Prompts Sidebar */}
      <aside className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-display font-semibold text-slate-900">
            Active Mentor Context
          </h2>
          <dl className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <dt className="text-slate-500">Student</dt>
              <dd className="font-medium text-slate-900">{workspace.profile.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <dt className="text-slate-500">Target Career</dt>
              <dd className="font-medium text-slate-900">{workspace.profile.targetCareer}</dd>
            </div>
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <dt className="text-slate-500">Weekly Pace</dt>
              <dd className="font-mono tabular-nums text-slate-900">
                {workspace.profile.weeklyHoursAvailable} hrs/wk
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-500">Roadmap Done</dt>
              <dd className="font-mono tabular-nums text-slate-900">
                {completedCount} / {allItems.length} lessons
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-display font-semibold text-slate-900">
            Beginner-Friendly Starter Prompts
          </h2>
          <div className="space-y-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isSending}
                onClick={() => handleSubmit(prompt)}
                className="w-full text-left p-3 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
