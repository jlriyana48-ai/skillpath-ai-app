import { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Code2,
  FileText,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { ResourceType, RoadmapItem, StudentWorkspace } from '../types';

interface RoadmapViewProps {
  workspace: StudentWorkspace;
  onToggleLesson: (itemId: string) => void;
  onRegenerateRoadmap: () => void;
  onAskMentorAboutItem: (item: RoadmapItem) => void;
  isBusy: boolean;
}

function ResourceIcon({ type }: { type: ResourceType }) {
  if (type === 'Course') return <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />;
  if (type === 'Tutorial') return <FileText className="w-4 h-4 text-amber-600 shrink-0" />;
  return <Code2 className="w-4 h-4 text-emerald-600 shrink-0" />;
}

export function RoadmapView({
  workspace,
  onToggleLesson,
  onRegenerateRoadmap,
  onAskMentorAboutItem,
  isBusy,
}: RoadmapViewProps) {
  const { roadmap, profile } = workspace;
  const [typeFilter, setTypeFilter] = useState<'All' | ResourceType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

  const allItems = useMemo(() => roadmap.phases.flatMap((p) => p.items), [roadmap]);
  const completedCount = allItems.filter((i) => i.completed).length;
  const completedHours = allItems
    .filter((i) => i.completed)
    .reduce((sum, i) => sum + i.estimatedHours, 0);
  const totalHours = allItems.reduce((sum, i) => sum + i.estimatedHours, 0);
  const progressPct =
    allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Roadmap Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-blue-600">Learning Roadmap Agent</p>
            <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
              {roadmap.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Target: {profile.targetCareer}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{roadmap.totalWeeks} weeks planned</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {completedHours} / {totalHours} hours completed
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isBusy}
            onClick={onRegenerateRoadmap}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Regenerate Roadmap</span>
          </button>
        </div>

        {/* Overall Completion Bar + Filters */}
        <div className="pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-md space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">
                Overall Lesson Completion ({completedCount} of {allItems.length})
              </span>
              <span className="font-mono tabular-nums font-semibold text-blue-600">
                {progressPct}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['All', 'Course', 'Tutorial', 'Practical Exercise'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    typeFilter === type
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['All', 'Pending', 'Completed'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Phased Learning Plan */}
      {roadmap.phases.length === 0 ? (
        <section className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="text-base font-display font-semibold text-slate-900">
            No learning roadmap generated yet
          </h2>
          <p className="text-sm text-slate-500">
            Click Regenerate Roadmap above or Run AI Agents to generate courses, tutorials, and practical exercises.
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {roadmap.phases.map((phase) => {
            const filteredItems = phase.items.filter((item) => {
              const matchesType = typeFilter === 'All' || item.type === typeFilter;
              const matchesStatus =
                statusFilter === 'All' ||
                (statusFilter === 'Completed' && item.completed) ||
                (statusFilter === 'Pending' && !item.completed);
              return matchesType && matchesStatus;
            });

            const phaseDone = phase.items.filter((i) => i.completed).length;

            return (
              <section
                key={phase.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono tabular-nums">
                        {phase.durationWeeks} weeks
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {phaseDone}/{phase.items.length} completed
                      </span>
                    </div>
                    <h2 className="text-lg font-display font-bold text-slate-900 mt-1">
                      {phase.title}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">{phase.objective}</p>
                  </div>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="p-6 text-xs text-slate-500">
                    No items in this phase match the active filter.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-4 transition-colors ${
                          item.completed ? 'bg-slate-50/60' : 'hover:bg-slate-50/40'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 max-w-3xl">
                          <button
                            type="button"
                            onClick={() => onToggleLesson(item.id)}
                            aria-label={
                              item.completed
                                ? `Mark ${item.title} incomplete`
                                : `Mark ${item.title} completed`
                            }
                            className="mt-0.5 shrink-0 cursor-pointer"
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 hover:text-blue-600 transition-colors" />
                            )}
                          </button>

                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                                <ResourceIcon type={item.type} />
                                {item.type}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{item.targetSkill}</span>
                              <span aria-hidden="true">·</span>
                              <span>{item.providerOrFormat}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                {item.estimatedHours} hrs
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{item.difficulty}</span>
                            </div>

                            <h3
                              className={`text-base font-display font-semibold ${
                                item.completed
                                  ? 'text-slate-500 line-through'
                                  : 'text-slate-900'
                              }`}
                            >
                              {item.title}
                            </h3>

                            <p className="text-sm text-slate-600 leading-relaxed">
                              {item.description}
                            </p>

                            <p className="text-xs text-slate-600">
                              <span className="font-semibold text-slate-800">Deliverable: </span>
                              {item.deliverable}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pl-8 lg:pl-0">
                          <button
                            type="button"
                            onClick={() => onToggleLesson(item.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              item.completed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {item.completed ? 'Completed' : 'Mark Complete'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onAskMentorAboutItem(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Mentor Help</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
