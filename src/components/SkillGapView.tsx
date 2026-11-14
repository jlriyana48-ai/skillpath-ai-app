import { AlertTriangle, CheckCircle2, HelpCircle, RefreshCw } from 'lucide-react';
import { StudentWorkspace } from '../types';

interface SkillGapViewProps {
  workspace: StudentWorkspace;
  onRunSkillGapAgent: () => void;
  onAskMentorAboutGap: (skillName: string) => void;
  isBusy: boolean;
}

export function SkillGapView({
  workspace,
  onRunSkillGapAgent,
  onAskMentorAboutGap,
  isBusy,
}: SkillGapViewProps) {
  const { profile, skillGap } = workspace;

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs font-medium text-blue-600">Skill Gap Analysis Agent</p>
            <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
              Skill Benchmarks for {profile.targetCareer}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">{skillGap.targetRoleSummary}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-500">Benchmark Coverage</p>
              <p className="text-xl font-display font-bold text-slate-900 font-mono tabular-nums">
                {skillGap.overallCoveragePercent}%
              </p>
            </div>
            <button
              type="button"
              disabled={isBusy}
              onClick={onRunSkillGapAgent}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-run Skill Gap Agent</span>
            </button>
          </div>
        </div>
      </section>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Strengths */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-display font-semibold text-slate-900">
                Verified Strengths
              </h2>
            </div>
            <span className="text-xs text-emerald-700 font-medium">
              {skillGap.strengths.length} skills meeting benchmark
            </span>
          </div>

          {skillGap.strengths.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              Run the Skill Gap Analysis Agent to evaluate your strongest skills.
            </p>
          ) : (
            <div className="space-y-5">
              {skillGap.strengths.map((item) => (
                <div key={item.skill} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">{item.skill}</span>
                    <span className="text-xs text-emerald-700 font-medium font-mono tabular-nums">
                      Current {item.currentLevel}% · Target {item.requiredLevel}%
                    </span>
                  </div>
                  <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${item.currentLevel}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-900/60"
                      style={{ left: `${item.requiredLevel}%` }}
                      title={`Benchmark: ${item.requiredLevel}%`}
                    />
                  </div>
                  <p className="text-xs text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Developing Skills / Weaknesses */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-display font-semibold text-slate-900">
                Developing Skills (Needs Practice)
              </h2>
            </div>
            <span className="text-xs text-amber-700 font-medium">
              {skillGap.weaknesses.length} skills below target
            </span>
          </div>

          {skillGap.weaknesses.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              Run the Skill Gap Analysis Agent to uncover skills that need extra practice.
            </p>
          ) : (
            <div className="space-y-5">
              {skillGap.weaknesses.map((item) => {
                const delta = Math.max(0, item.requiredLevel - item.currentLevel);
                return (
                  <div key={item.skill} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">{item.skill}</span>
                      <span className="text-xs text-amber-700 font-medium font-mono tabular-nums">
                        {item.currentLevel}% / {item.requiredLevel}% (−{delta} pts)
                      </span>
                    </div>
                    <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${item.currentLevel}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900/70"
                        style={{ left: `${item.requiredLevel}%` }}
                        title={`Target Benchmark: ${item.requiredLevel}%`}
                      />
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-slate-600">{item.note}</p>
                      <button
                        type="button"
                        onClick={() => onAskMentorAboutGap(item.skill)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Study advice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Missing Critical Skills Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-display font-semibold text-slate-900">
              Missing Skills to Acquire
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Skills expected for {profile.targetCareer} that are not yet in your current skill set
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {skillGap.missingSkills.length} missing competencies
          </span>
        </div>

        {skillGap.missingSkills.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No missing skills listed yet. Click Re-run Skill Gap Agent to generate a complete list.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {skillGap.missingSkills.map((item) => {
              const priorityColor =
                item.priority === 'High'
                  ? 'text-rose-700'
                  : item.priority === 'Medium'
                  ? 'text-amber-700'
                  : 'text-slate-600';

              return (
                <div
                  key={item.skill}
                  className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{item.skill}</span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className={`text-xs font-semibold ${priorityColor}`}>
                        {item.priority} Priority
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-xs text-slate-500 font-mono tabular-nums">
                        Target {item.requiredLevel}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.reason}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAskMentorAboutGap(item.skill)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50/60 hover:bg-blue-100/70 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start md:self-center cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Ask Mentor How to Learn</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
