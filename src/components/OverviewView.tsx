import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  Layers,
  MessageSquare,
  RefreshCw,
  Target,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { AgentKey, NavSection, StudentWorkspace } from '../types';
import { StudentAvatar } from './StudentAvatar';

interface OverviewViewProps {
  workspace: StudentWorkspace;
  onNavigate: (section: NavSection) => void;
  onToggleLesson: (itemId: string) => void;
  onRunSingleAgent: (agent: AgentKey) => void;
  isBusy: boolean;
}

export function OverviewView({
  workspace,
  onNavigate,
  onToggleLesson,
  onRunSingleAgent,
  isBusy,
}: OverviewViewProps) {
  const { profile, profileAnalysis, skillGap, careers, roadmap, progressEvaluation } = workspace;

  const allItems = roadmap.phases.flatMap((p) => p.items);
  const completedItems = allItems.filter((item) => item.completed);
  const nextPendingItems = allItems.filter((item) => !item.completed).slice(0, 4);

  const totalHours = allItems.reduce((sum, item) => sum + item.estimatedHours, 0);
  const completedHours = completedItems.reduce((sum, item) => sum + item.estimatedHours, 0);
  const completionPct =
    allItems.length > 0 ? Math.round((completedItems.length / allItems.length) * 100) : 0;

  const topCareer = careers[0];

  const agentSummaries: Array<{
    key: AgentKey;
    name: string;
    role: string;
    output: string;
    target: NavSection;
  }> = [
    {
      key: 'profile',
      name: 'Profile Analysis Agent',
      role: 'Evaluates background, study capacity & readiness',
      output: `${profileAnalysis.learningPersona} · ${profileAnalysis.readinessPercent}% readiness`,
      target: 'profile',
    },
    {
      key: 'skill-gap',
      name: 'Skill Gap Analysis Agent',
      role: 'Benchmarks strengths, weak spots & missing skills',
      output: `${skillGap.strengths.length} strengths · ${skillGap.missingSkills.length} missing skills identified`,
      target: 'skill-gap',
    },
    {
      key: 'careers',
      name: 'Career Recommendation Agent',
      role: 'Matches profile to realistic career trajectories',
      output: topCareer
        ? `Top match: ${topCareer.title} (${topCareer.matchScore}% fit)`
        : 'Ready to match career paths',
      target: 'careers',
    },
    {
      key: 'roadmap',
      name: 'Learning Roadmap Agent',
      role: 'Generates phased courses, tutorials & exercises',
      output: `${roadmap.phases.length} phases · ${allItems.length} milestones (${totalHours} hrs)`,
      target: 'roadmap',
    },
    {
      key: 'progress',
      name: 'Progress Tracking Agent',
      role: 'Monitors pace, completed lessons & next step',
      output: `${progressEvaluation.momentumStatus} · ${completedItems.length}/${allItems.length} lessons done`,
      target: 'progress',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Student Readiness Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <StudentAvatar
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              sizeClass="w-16 h-16 text-lg"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{profile.education}</span>
                <span aria-hidden="true">·</span>
                <span>{profile.experienceLevel} Level</span>
                <span aria-hidden="true">·</span>
                <span>Target: {profile.targetCareer}</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight text-balance">
                {profile.name}&rsquo;s Personalized Learning Path
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                {profileAnalysis.learnerSummary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => onNavigate('mentor')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Mentor</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Career Readiness</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-slate-900 font-mono tabular-nums">
              {profileAnalysis.readinessPercent}%
            </span>
            <span className="text-xs text-slate-500">for {profile.targetCareer}</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${profileAnalysis.readinessPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Skill Benchmark Coverage</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-slate-900 font-mono tabular-nums">
              {skillGap.overallCoveragePercent}%
            </span>
            <span className="text-xs text-slate-500">
              {skillGap.missingSkills.length} gaps to close
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${skillGap.overallCoveragePercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Roadmap Progress</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-slate-900 font-mono tabular-nums">
              {completedItems.length}/{allItems.length}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {completedHours} / {totalHours} hrs
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Learning Momentum</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-display font-bold text-slate-900">
              {progressEvaluation.momentumStatus}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            {profile.weeklyHoursAvailable} hrs/week study budget
          </p>
        </div>
      </section>

      {/* Two-Column Core Insights: Skill Gap Snapshot + Up Next in Roadmap */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Skill Gap Snapshot */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-display font-semibold text-slate-900">
                  Skill Gap Snapshot
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Strengths vs. priority skills needed for {profile.targetCareer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('skill-gap')}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Full analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {skillGap.strengths.slice(0, 2).map((item) => (
                <div key={item.skill} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{item.skill}</span>
                    <span className="text-xs text-emerald-700 font-medium font-mono tabular-nums">
                      Strength · {item.currentLevel}% / {item.requiredLevel}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${item.currentLevel}%` }}
                    />
                  </div>
                </div>
              ))}

              {skillGap.weaknesses.slice(0, 2).map((item) => (
                <div key={item.skill} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{item.skill}</span>
                    <span className="text-xs text-amber-700 font-medium font-mono tabular-nums">
                      Needs Practice · {item.currentLevel}% / {item.requiredLevel}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${item.currentLevel}%` }}
                    />
                  </div>
                </div>
              ))}

              {skillGap.missingSkills.slice(0, 2).map((item) => (
                <div key={item.skill} className="pt-2 border-t border-slate-100 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.skill}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.reason}</p>
                  </div>
                  <span className="text-xs font-medium text-rose-700 whitespace-nowrap shrink-0">
                    Missing · {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Top Career Fit: {topCareer ? `${topCareer.title} (${topCareer.matchScore}%)` : 'Run Career Agent'}</span>
            <button
              type="button"
              onClick={() => onNavigate('careers')}
              className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Compare Careers</span>
            </button>
          </div>
        </div>

        {/* Up Next in Learning Roadmap */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-display font-semibold text-slate-900">
                  Next Recommended Lessons
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check off milestones as you complete them
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('roadmap')}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Open roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {nextPendingItems.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-medium text-slate-900">
                  {allItems.length > 0
                    ? 'All roadmap milestones completed!'
                    : 'No roadmap generated yet.'}
                </p>
                <p className="text-xs text-slate-500">
                  {allItems.length > 0
                    ? 'Ask your AI Mentor for advanced capstone ideas or explore another target role.'
                    : 'Click Run AI Agents in the top bar to build your personalized study plan.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 mt-2">
                {nextPendingItems.map((item) => (
                  <li key={item.id} className="py-3.5 flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleLesson(item.id)}
                      aria-label={`Mark ${item.title} completed`}
                      className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span>{item.type}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.targetSkill}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{item.estimatedHours} hrs</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
            <UserCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Next Coach Tip: </span>
              <span>{progressEvaluation.nextRecommendedAction}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Multi-Agent Architecture Overview */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-display font-semibold text-slate-900">
              Specialized AI Agents Orchestration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Each module is powered by a dedicated Gemini agent that you can inspect or re-run individually
            </p>
          </div>
          <span className="text-xs text-slate-500">Last updated: {workspace.lastAnalyzedAt}</span>
        </div>

        <div className="divide-y divide-slate-100 mt-1">
          {agentSummaries.map((agent) => (
            <div
              key={agent.key}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{agent.name}</span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-xs text-slate-500">{agent.role}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{agent.output}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onRunSingleAgent(agent.key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-run</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate(agent.target)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
