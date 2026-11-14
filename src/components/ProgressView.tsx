import { CheckCircle2, Circle, Clock, RefreshCw, TrendingUp } from 'lucide-react';
import { StudentWorkspace } from '../types';

interface ProgressViewProps {
  workspace: StudentWorkspace;
  onToggleLesson: (itemId: string) => void;
  onRunProgressAgent: () => void;
  isBusy: boolean;
}

export function ProgressView({
  workspace,
  onToggleLesson,
  onRunProgressAgent,
  isBusy,
}: ProgressViewProps) {
  const { roadmap, progressEvaluation, profile } = workspace;

  const allItems = roadmap.phases.flatMap((p) => p.items);
  const completedItems = allItems.filter((i) => i.completed);
  const pendingItems = allItems.filter((i) => !i.completed);

  const completedHours = completedItems.reduce((sum, i) => sum + i.estimatedHours, 0);
  const totalHours = allItems.reduce((sum, i) => sum + i.estimatedHours, 0);
  const pct = allItems.length > 0 ? Math.round((completedItems.length / allItems.length) * 100) : 0;

  const maxWeekHours = Math.max(
    profile.weeklyHoursAvailable,
    ...progressEvaluation.weeklyMilestones.map((w) => Math.max(w.plannedHours, w.completedHours)),
    10
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-medium text-blue-600">Progress Tracking Agent</p>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Learning Progress & Study Momentum
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">{progressEvaluation.summary}</p>
        </div>

        <button
          type="button"
          disabled={isBusy}
          onClick={onRunProgressAgent}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Re-evaluate Progress</span>
        </button>
      </section>

      {/* Metrics Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Overall Completion</p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900 font-mono tabular-nums">
            {pct}%
          </p>
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Lessons Completed</p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900 font-mono tabular-nums">
            {completedItems.length} / {allItems.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {pendingItems.length} remaining milestones
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Study Hours Logged</p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900 font-mono tabular-nums">
            {completedHours} / {totalHours} hrs
          </p>
          <p className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            {Math.max(0, totalHours - completedHours)} hrs left in plan
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Momentum Status</p>
          <div className="mt-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-xl font-display font-bold text-slate-900">
              {progressEvaluation.momentumStatus}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            Target pace: {profile.weeklyHoursAvailable} hrs/wk
          </p>
        </div>
      </section>

      {/* Weekly Pace Chart + AI Coaching Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-display font-semibold text-slate-900">
                  Weekly Study Pace
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Planned weekly study budget vs. completed hours
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
                  Planned
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                  Completed
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {progressEvaluation.weeklyMilestones.map((week) => {
                const plannedPct = Math.round((week.plannedHours / maxWeekHours) * 100);
                const completedWeekPct = Math.round((week.completedHours / maxWeekHours) * 100);

                return (
                  <div key={week.weekLabel} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{week.weekLabel}</span>
                      <span className="font-mono tabular-nums text-slate-600">
                        {week.completedHours}h / {week.plannedHours}h planned
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-300 rounded-full"
                          style={{ width: `${plannedPct}%` }}
                        />
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${completedWeekPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-900">Pending Priority Skills</h3>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
              {progressEvaluation.pendingPrioritySkills.length > 0 ? (
                progressEvaluation.pendingPrioritySkills.map((skill, idx) => (
                  <span key={skill}>
                    {idx > 0 && <span className="mr-3 text-slate-300">·</span>}
                    {skill}
                  </span>
                ))
              ) : (
                <span>All priority skills covered!</span>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-display font-semibold text-slate-900">
                Agent Next-Step Coaching
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Guidance generated from your completed and remaining lessons
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <p className="text-xs font-semibold text-blue-700">Next Recommended Action</p>
              <p className="text-sm text-slate-800 leading-relaxed">
                {progressEvaluation.nextRecommendedAction}
              </p>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-900">Practical Study Suggestions</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {progressEvaluation.coachingTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {idx + 1}. {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Check off any lesson below and click Re-evaluate Progress to update coaching.</span>
          </div>
        </section>
      </div>

      {/* Completed vs Pending Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-display font-semibold text-slate-900">
              Completed Lessons ({completedItems.length})
            </h2>
            <span className="text-xs text-emerald-700 font-medium font-mono tabular-nums">
              {completedHours} hrs earned
            </span>
          </div>
          {completedItems.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">
              No lessons marked complete yet. Check off your first lesson in the Learning Roadmap or Pending list.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 mt-2">
              {completedItems.map((item) => (
                <li key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleLesson(item.id)}
                    className="flex items-start gap-3 text-left cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.targetSkill} · {item.type}
                      </p>
                    </div>
                  </button>
                  <span className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
                    {item.estimatedHours} hrs
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-display font-semibold text-slate-900">
              Pending Lessons ({pendingItems.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {Math.max(0, totalHours - completedHours)} hrs remaining
            </span>
          </div>
          {pendingItems.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">
              Every milestone in your current roadmap is complete!
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 mt-2">
              {pendingItems.map((item) => (
                <li key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleLesson(item.id)}
                    className="flex items-start gap-3 text-left cursor-pointer group"
                  >
                    <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-600 shrink-0 mt-0.5 transition-colors" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.targetSkill} · {item.type}
                      </p>
                    </div>
                  </button>
                  <span className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
                    {item.estimatedHours} hrs
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
