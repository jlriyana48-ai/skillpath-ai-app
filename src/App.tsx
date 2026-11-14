import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  Layers,
  Loader2,
  Menu,
  MessageSquare,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import {
  AgentKey,
  AgentPipelineStatus,
  AgentStatusState,
  NavSection,
  RoadmapItem,
  StudentProfile,
  StudentWorkspace,
} from './types';
import { createBlankWorkspace, SAMPLE_WORKSPACES } from './data/sampleStudents';
import {
  askMentorAgent,
  orchestrateAllAgents,
  runCareerAgent,
  runProfileAgent,
  runProgressAgent,
  runRoadmapAgent,
  runSkillGapAgent,
} from './services/agentApi';
import { StudentAvatar } from './components/StudentAvatar';
import { OverviewView } from './components/OverviewView';
import { ProfileView } from './components/ProfileView';
import { SkillGapView } from './components/SkillGapView';
import { CareersView } from './components/CareersView';
import { RoadmapView } from './components/RoadmapView';
import { ProgressView } from './components/ProgressView';
import { MentorView } from './components/MentorView';

const STORAGE_KEY = 'skillpath_ai_workspaces_v1';

const NAV_ITEMS: Array<{ id: NavSection; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Student Profile', icon: User },
  { id: 'skill-gap', label: 'Skill Gap Analysis', icon: Layers },
  { id: 'careers', label: 'Career Matching', icon: Compass },
  { id: 'roadmap', label: 'Learning Roadmap', icon: BookOpen },
  { id: 'progress', label: 'Progress Tracking', icon: BarChart3 },
  { id: 'mentor', label: 'AI Mentor', icon: MessageSquare },
];

const AGENT_LABELS: Array<{ key: AgentKey; label: string }> = [
  { key: 'profile', label: 'Profile Analysis Agent' },
  { key: 'skill-gap', label: 'Skill Gap Analysis Agent' },
  { key: 'careers', label: 'Career Recommendation Agent' },
  { key: 'roadmap', label: 'Learning Roadmap Agent' },
  { key: 'progress', label: 'Progress Tracking Agent' },
];

const INITIAL_STATUS: AgentPipelineStatus = {
  profile: 'idle',
  'skill-gap': 'idle',
  careers: 'idle',
  roadmap: 'idle',
  progress: 'idle',
};

function loadInitialWorkspaces(): StudentWorkspace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE_WORKSPACES;
    const parsed = JSON.parse(raw) as StudentWorkspace[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // Fallback to clean sample data
  }
  return SAMPLE_WORKSPACES;
}

function nowTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function App() {
  const [workspaces, setWorkspaces] = useState<StudentWorkspace[]>(loadInitialWorkspaces);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [agentStatus, setAgentStatus] = useState<AgentPipelineStatus>(INITIAL_STATUS);
  const [showPipelineBanner, setShowPipelineBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mentorSending, setMentorSending] = useState(false);
  const [mentorDraftPrompt, setMentorDraftPrompt] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
    } catch {
      // Ignore storage quota errors
    }
  }, [workspaces]);

  const activeWorkspace = workspaces[activeIndex] ?? workspaces[0];
  const isBusy = Object.values(agentStatus).some((s) => s === 'running');

  const updateActiveWorkspace = (updater: (ws: StudentWorkspace) => StudentWorkspace) => {
    setWorkspaces((prev) =>
      prev.map((ws, idx) => (idx === activeIndex ? updater(ws) : ws))
    );
  };

  const handleSetAgentStatus = (agent: AgentKey, status: AgentStatusState) => {
    setAgentStatus((prev) => ({ ...prev, [agent]: status }));
  };

  const handleRunAllAgents = async (overrideProfile?: StudentProfile) => {
    const targetProfile = overrideProfile ?? activeWorkspace.profile;
    setErrorMessage(null);
    setShowPipelineBanner(true);
    setAgentStatus(INITIAL_STATUS);

    try {
      const results = await orchestrateAllAgents(targetProfile, handleSetAgentStatus);
      updateActiveWorkspace((ws) => ({
        ...ws,
        profile: targetProfile,
        profileAnalysis: results.profileAnalysis,
        skillGap: results.skillGap,
        careers: results.careers,
        roadmap: results.roadmap,
        progressEvaluation: results.progressEvaluation,
        lastAnalyzedAt: `Updated today at ${nowTimestamp()}`,
      }));
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to complete AI agent analysis.'
      );
    }
  };

  const handleRunSingleAgent = async (agent: AgentKey) => {
    setErrorMessage(null);
    setShowPipelineBanner(true);
    handleSetAgentStatus(agent, 'running');

    try {
      if (agent === 'profile') {
        const res = await runProfileAgent(activeWorkspace.profile);
        updateActiveWorkspace((ws) => ({
          ...ws,
          profileAnalysis: res,
          lastAnalyzedAt: `Profile analyzed at ${nowTimestamp()}`,
        }));
      } else if (agent === 'skill-gap') {
        const res = await runSkillGapAgent(activeWorkspace.profile);
        updateActiveWorkspace((ws) => ({
          ...ws,
          skillGap: res,
          lastAnalyzedAt: `Skill gaps refreshed at ${nowTimestamp()}`,
        }));
      } else if (agent === 'careers') {
        const res = await runCareerAgent(activeWorkspace.profile);
        updateActiveWorkspace((ws) => ({
          ...ws,
          careers: res,
          lastAnalyzedAt: `Career matches refreshed at ${nowTimestamp()}`,
        }));
      } else if (agent === 'roadmap') {
        const res = await runRoadmapAgent(activeWorkspace.profile, activeWorkspace.skillGap);
        updateActiveWorkspace((ws) => ({
          ...ws,
          roadmap: res,
          lastAnalyzedAt: `Roadmap regenerated at ${nowTimestamp()}`,
        }));
      } else if (agent === 'progress') {
        const res = await runProgressAgent(
          activeWorkspace.profile,
          activeWorkspace.roadmap,
          activeWorkspace.skillGap
        );
        updateActiveWorkspace((ws) => ({
          ...ws,
          progressEvaluation: res,
          lastAnalyzedAt: `Progress evaluated at ${nowTimestamp()}`,
        }));
      }
      handleSetAgentStatus(agent, 'completed');
    } catch (err) {
      handleSetAgentStatus(agent, 'error');
      setErrorMessage(err instanceof Error ? err.message : 'Agent execution failed.');
    }
  };

  const handleToggleLesson = (itemId: string) => {
    updateActiveWorkspace((ws) => ({
      ...ws,
      roadmap: {
        ...ws.roadmap,
        phases: ws.roadmap.phases.map((phase) => ({
          ...phase,
          items: phase.items.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        })),
      },
    }));
  };

  const handleSelectTargetCareer = async (careerTitle: string) => {
    const updatedProfile: StudentProfile = {
      ...activeWorkspace.profile,
      targetCareer: careerTitle,
    };
    updateActiveWorkspace((ws) => ({ ...ws, profile: updatedProfile }));

    setErrorMessage(null);
    setShowPipelineBanner(true);
    setAgentStatus({
      profile: 'completed',
      'skill-gap': 'running',
      careers: 'completed',
      roadmap: 'idle',
      progress: 'idle',
    });

    try {
      const skillGap = await runSkillGapAgent(updatedProfile);
      handleSetAgentStatus('skill-gap', 'completed');

      handleSetAgentStatus('roadmap', 'running');
      const roadmap = await runRoadmapAgent(updatedProfile, skillGap);
      handleSetAgentStatus('roadmap', 'completed');

      handleSetAgentStatus('progress', 'running');
      const progressEvaluation = await runProgressAgent(updatedProfile, roadmap, skillGap);
      handleSetAgentStatus('progress', 'completed');

      updateActiveWorkspace((ws) => ({
        ...ws,
        profile: updatedProfile,
        skillGap,
        roadmap,
        progressEvaluation,
        lastAnalyzedAt: `Updated for ${careerTitle} at ${nowTimestamp()}`,
      }));
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update learning plan for selected career.'
      );
    }
  };

  const handleCreateNewStudent = () => {
    const blank = createBlankWorkspace();
    setWorkspaces((prev) => [...prev, blank]);
    setActiveIndex(workspaces.length);
    setActiveSection('profile');
  };

  const handleResetDemoData = () => {
    setWorkspaces(SAMPLE_WORKSPACES);
    setActiveIndex(0);
    setAgentStatus(INITIAL_STATUS);
    setShowPipelineBanner(false);
    setErrorMessage(null);
  };

  const handleSendMentorMessage = async (message: string) => {
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: nowTimestamp(),
    };

    const historySnapshot = [
      ...activeWorkspace.mentorMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    updateActiveWorkspace((ws) => ({
      ...ws,
      mentorMessages: [...ws.mentorMessages, userMsg],
    }));

    setMentorSending(true);
    setErrorMessage(null);

    try {
      const res = await askMentorAgent(message, historySnapshot, activeWorkspace);
      const mentorMsg = {
        id: `mentor-${Date.now()}`,
        role: 'mentor' as const,
        content: res.reply,
        timestamp: nowTimestamp(),
        suggestedFollowUps: res.suggestedFollowUps,
      };
      updateActiveWorkspace((ws) => ({
        ...ws,
        mentorMessages: [...ws.mentorMessages, mentorMsg],
      }));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'AI Mentor could not respond.');
    } finally {
      setMentorSending(false);
    }
  };

  const handleAskMentorAboutGap = (skillName: string) => {
    setMentorDraftPrompt(
      `How should I start learning "${skillName}" for my ${activeWorkspace.profile.targetCareer} goal? Give me a beginner-friendly 1-week starter plan.`
    );
    setActiveSection('mentor');
  };

  const handleAskMentorAboutItem = (item: RoadmapItem) => {
    setMentorDraftPrompt(
      `Can you guide me through "${item.title}" (${item.type} for ${item.targetSkill}) and suggest how to complete its deliverable: "${item.deliverable}"?`
    );
    setActiveSection('mentor');
  };

  const navigateTo = (section: NavSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => navigateTo('overview')}
            className="text-lg font-display font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            SkillPath AI
          </button>
        </div>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'skill-gap', label: 'Skill Gap' },
              { id: 'careers', label: 'Careers' },
              { id: 'roadmap', label: 'Roadmap' },
              { id: 'mentor', label: 'AI Mentor' },
            ] as const
          ).map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => navigateTo(link.id)}
                className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-slate-900 border-blue-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="shrink-0">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void handleRunAllAgents()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isBusy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isBusy ? 'Analyzing...' : 'Run AI Agents'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white px-4 py-6">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-xs font-semibold text-slate-400 mb-2">Workspace</p>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Sample Student Switcher */}
            <div className="pt-4 border-t border-slate-100">
              <div className="px-3 flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-400">Sample Students</p>
                <button
                  type="button"
                  onClick={() => navigateTo('profile')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Manage
                </button>
              </div>
              <div className="space-y-1">
                {workspaces.map((ws, idx) => {
                  const selected = idx === activeIndex;
                  return (
                    <button
                      key={ws.profile.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        selected
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <StudentAvatar
                        name={ws.profile.name}
                        avatarUrl={ws.profile.avatarUrl}
                        sizeClass="w-7 h-7 text-[11px]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{ws.profile.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {ws.profile.targetCareer}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 px-3">
            <p className="text-xs text-slate-500">
              5 specialized Gemini agents · Instant demo presets
            </p>
          </div>
        </aside>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/30"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-white h-full border-r border-slate-200 p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-base font-display font-bold text-slate-900">
                    SkillPath AI
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <p className="px-3 text-xs font-semibold text-slate-400">Sample Students</p>
                  {workspaces.map((ws, idx) => (
                    <button
                      key={ws.profile.id}
                      type="button"
                      onClick={() => {
                        setActiveIndex(idx);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left cursor-pointer ${
                        idx === activeIndex ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      <StudentAvatar
                        name={ws.profile.name}
                        avatarUrl={ws.profile.avatarUrl}
                        sizeClass="w-7 h-7 text-[11px]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{ws.profile.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {ws.profile.targetCareer}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-2.5 text-sm text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">AI Agent Error</p>
                  <p className="text-xs mt-0.5">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Live Multi-Agent Execution Progress Strip */}
          {showPipelineBanner && (
            <section className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-xs font-semibold text-slate-900">
                  {isBusy
                    ? 'Multi-Agent Pipeline Running...'
                    : 'Multi-Agent Analysis Status'}
                </p>
                {!isBusy && (
                  <button
                    type="button"
                    onClick={() => setShowPipelineBanner(false)}
                    className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Dismiss
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {AGENT_LABELS.map((agent) => {
                  const status = agentStatus[agent.key];
                  return (
                    <div
                      key={agent.key}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70"
                    >
                      {status === 'running' && (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                      )}
                      {status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      {status === 'idle' && (
                        <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">
                          {agent.label}
                        </p>
                        <p className="text-[11px] text-slate-500 capitalize">{status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeSection === 'overview' && (
            <OverviewView
              workspace={activeWorkspace}
              onNavigate={navigateTo}
              onToggleLesson={handleToggleLesson}
              onRunSingleAgent={(agent) => void handleRunSingleAgent(agent)}
              isBusy={isBusy}
            />
          )}

          {activeSection === 'profile' && (
            <ProfileView
              workspace={activeWorkspace}
              allWorkspaces={workspaces}
              activeIndex={activeIndex}
              onSelectStudent={(idx) => setActiveIndex(idx)}
              onCreateNewStudent={handleCreateNewStudent}
              onResetDemoData={handleResetDemoData}
              onUpdateProfile={(updated) =>
                updateActiveWorkspace((ws) => ({ ...ws, profile: updated }))
              }
              onRunAllAgents={() => void handleRunAllAgents()}
              isBusy={isBusy}
            />
          )}

          {activeSection === 'skill-gap' && (
            <SkillGapView
              workspace={activeWorkspace}
              onRunSkillGapAgent={() => void handleRunSingleAgent('skill-gap')}
              onAskMentorAboutGap={handleAskMentorAboutGap}
              isBusy={isBusy}
            />
          )}

          {activeSection === 'careers' && (
            <CareersView
              workspace={activeWorkspace}
              onSelectTargetCareer={(title) => void handleSelectTargetCareer(title)}
              onRunCareerAgent={() => void handleRunSingleAgent('careers')}
              isBusy={isBusy}
            />
          )}

          {activeSection === 'roadmap' && (
            <RoadmapView
              workspace={activeWorkspace}
              onToggleLesson={handleToggleLesson}
              onRegenerateRoadmap={() => void handleRunSingleAgent('roadmap')}
              onAskMentorAboutItem={handleAskMentorAboutItem}
              isBusy={isBusy}
            />
          )}

          {activeSection === 'progress' && (
            <ProgressView
              workspace={activeWorkspace}
              onToggleLesson={handleToggleLesson}
              onRunProgressAgent={() => void handleRunSingleAgent('progress')}
              isBusy={isBusy}
            />
          )}

          {activeSection === 'mentor' && (
            <MentorView
              workspace={activeWorkspace}
              draftPrompt={mentorDraftPrompt}
              onClearDraftPrompt={() => setMentorDraftPrompt('')}
              onSendMessage={handleSendMentorMessage}
              isSending={mentorSending}
            />
          )}
        </main>
      </div>
    </div>
  );
}
