import { Check, Compass, RefreshCw, Target } from 'lucide-react';
import { StudentWorkspace } from '../types';

interface CareersViewProps {
  workspace: StudentWorkspace;
  onSelectTargetCareer: (careerTitle: string) => void;
  onRunCareerAgent: () => void;
  isBusy: boolean;
}

export function CareersView({
  workspace,
  onSelectTargetCareer,
  onRunCareerAgent,
  isBusy,
}: CareersViewProps) {
  const { profile, careers } = workspace;

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-medium text-blue-600">Career Recommendation Agent</p>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Recommended Career Paths
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ranked by overlap with {profile.name}&rsquo;s skills, {profile.education}, and stated interests. Select any path to rebuild your Skill Gap and Learning Roadmap around it.
          </p>
        </div>

        <button
          type="button"
          disabled={isBusy}
          onClick={onRunCareerAgent}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Career Matches</span>
        </button>
      </section>

      {careers.length === 0 ? (
        <section className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
          <Compass className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="text-base font-display font-semibold text-slate-900">
            No career matches generated yet
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Click Refresh Career Matches above or Run AI Agents in the top bar to evaluate matching career paths.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {careers.map((career) => {
            const isCurrentTarget =
              career.title.toLowerCase() === profile.targetCareer.toLowerCase();

            return (
              <article
                key={career.id || career.title}
                className={`bg-white rounded-xl p-6 flex flex-col justify-between border transition-colors ${
                  isCurrentTarget ? 'border-blue-600' : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{career.growthOutlook}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{career.typicalEntryRange}</span>
                        <span aria-hidden="true">·</span>
                        <span>Ready in {career.estimatedTimeToReady}</span>
                      </div>
                      <h2 className="text-lg font-display font-bold text-slate-900 mt-1">
                        {career.title}
                      </h2>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-2xl font-display font-bold text-blue-600 font-mono tabular-nums">
                        {career.matchScore}%
                      </span>
                      <p className="text-xs text-slate-500">Profile fit</p>
                    </div>
                  </div>

                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${career.matchScore}%` }}
                    />
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">{career.rationale}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <h3 className="text-xs font-semibold text-emerald-700 mb-1.5">
                        Skills You Already Have
                      </h3>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {career.alignedSkills.map((skill) => (
                          <li key={skill}>· {skill}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-amber-700 mb-1.5">
                        Key Skills to Learn
                      </h3>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {career.skillsToAcquire.map((skill) => (
                          <li key={skill}>· {skill}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {isCurrentTarget ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                      <Check className="w-4 h-4" />
                      <span>Active Target Career</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">
                      Switch focus to regenerate roadmap
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={isBusy || isCurrentTarget}
                    onClick={() => onSelectTargetCareer(career.title)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isCurrentTarget
                        ? 'bg-slate-100 text-slate-500 cursor-default'
                        : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>{isCurrentTarget ? 'Selected' : 'Set as Target Career'}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
