import { useState } from 'react';
import { Plus, RotateCcw, Sparkles, Trash2, UserPlus } from 'lucide-react';
import { StudentProfile, StudentWorkspace } from '../types';
import { StudentAvatar } from './StudentAvatar';

interface ProfileViewProps {
  workspace: StudentWorkspace;
  allWorkspaces: StudentWorkspace[];
  activeIndex: number;
  onSelectStudent: (index: number) => void;
  onCreateNewStudent: () => void;
  onResetDemoData: () => void;
  onUpdateProfile: (profile: StudentProfile) => void;
  onRunAllAgents: () => void;
  isBusy: boolean;
}

const POPULAR_CAREERS = [
  'Machine Learning Engineer',
  'Full-Stack Web Developer',
  'Product Data Scientist',
  'Cloud Security Analyst',
  'UX / Product Designer',
  'AI Application Engineer',
];

function levelLabel(level: number): string {
  if (level >= 75) return 'Proficient';
  if (level >= 45) return 'Intermediate';
  return 'Beginner';
}

export function ProfileView({
  workspace,
  allWorkspaces,
  activeIndex,
  onSelectStudent,
  onCreateNewStudent,
  onResetDemoData,
  onUpdateProfile,
  onRunAllAgents,
  isBusy,
}: ProfileViewProps) {
  const { profile, profileAnalysis } = workspace;
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(50);
  const [newInterest, setNewInterest] = useState('');

  const updateField = <K extends keyof StudentProfile>(field: K, value: StudentProfile[K]) => {
    onUpdateProfile({
      ...profile,
      [field]: value,
    });
  };

  const handleAddSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    if (profile.currentSkills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    updateField('currentSkills', [...profile.currentSkills, { name: trimmed, level: newSkillLevel }]);
    setNewSkillName('');
    setNewSkillLevel(50);
  };

  const handleSkillLevelChange = (index: number, level: number) => {
    const updated = profile.currentSkills.map((s, idx) => (idx === index ? { ...s, level } : s));
    updateField('currentSkills', updated);
  };

  const handleRemoveSkill = (index: number) => {
    updateField(
      'currentSkills',
      profile.currentSkills.filter((_, idx) => idx !== index)
    );
  };

  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (!trimmed) return;
    if (profile.interests.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    updateField('interests', [...profile.interests, trimmed]);
    setNewInterest('');
  };

  const handleRemoveInterest = (index: number) => {
    updateField(
      'interests',
      profile.interests.filter((_, idx) => idx !== index)
    );
  };

  return (
    <div className="space-y-6">
      {/* Hackathon Sample Student Switcher */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-sm font-display font-semibold text-slate-900">
              Demo Student Profiles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between pre-loaded sample learners or create a custom profile to test all AI agents live
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onCreateNewStudent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Custom Student</span>
            </button>
            <button
              type="button"
              onClick={onResetDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allWorkspaces.map((ws, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={ws.profile.id}
                type="button"
                onClick={() => onSelectStudent(idx)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <StudentAvatar
                  name={ws.profile.name}
                  avatarUrl={ws.profile.avatarUrl}
                  sizeClass="w-10 h-10 text-xs"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{ws.profile.name}</p>
                  <p className="text-xs text-slate-500 truncate">{ws.profile.targetCareer}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Editable Student Profile Form */}
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-lg font-display font-bold text-slate-900">
                Student Profile Configuration
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Update skills, education, or target career, then run AI agents to regenerate your plan
              </p>
            </div>
            <button
              type="button"
              disabled={isBusy}
              onClick={onRunAllAgents}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isBusy ? 'Running AI Agents...' : 'Save & Run AI Agents'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Student Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Maya Chen"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Education Background
              </label>
              <input
                type="text"
                value={profile.education}
                onChange={(e) => updateField('education', e.target.value)}
                placeholder="e.g., B.S. Computer Science"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Target Career Goal
              </label>
              <input
                type="text"
                value={profile.targetCareer}
                onChange={(e) => updateField('targetCareer', e.target.value)}
                placeholder="e.g., Machine Learning Engineer"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {POPULAR_CAREERS.map((career) => (
                  <button
                    key={career}
                    type="button"
                    onClick={() => updateField('targetCareer', career)}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      profile.targetCareer === career
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {career}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Starting Experience Level
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateField('experienceLevel', lvl)}
                      className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        profile.experienceLevel === lvl
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <label htmlFor="weekly-hours">Weekly Study Availability</label>
                  <span className="font-mono tabular-nums text-blue-700">
                    {profile.weeklyHoursAvailable} hrs / week
                  </span>
                </div>
                <input
                  id="weekly-hours"
                  type="range"
                  min={2}
                  max={40}
                  step={1}
                  value={profile.weeklyHoursAvailable}
                  onChange={(e) => updateField('weeklyHoursAvailable', Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Short Learning Context / Goals
            </label>
            <textarea
              rows={2}
              value={profile.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Briefly describe what you have built or studied so far and what you hope to achieve..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          {/* Current Skills List */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-display font-semibold text-slate-900">
                  Current Skills & Self-Rated Proficiency
                </h2>
                <p className="text-xs text-slate-500">
                  Adjust sliders honestly—our Skill Gap Analysis Agent benchmarks these against industry expectations
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {profile.currentSkills.length} skills
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {profile.currentSkills.map((skill, idx) => (
                <div
                  key={`${skill.name}-${idx}`}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="sm:w-48 shrink-0">
                    <p className="text-sm font-medium text-slate-900">{skill.name}</p>
                    <p className="text-xs text-slate-500">
                      {levelLabel(skill.level)} ·{' '}
                      <span className="font-mono tabular-nums">{skill.level}%</span>
                    </p>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={skill.level}
                    aria-label={`${skill.name} proficiency`}
                    onChange={(e) => handleSkillLevelChange(idx, Number(e.target.value))}
                    className="flex-1 accent-blue-600 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    aria-label={`Remove ${skill.name}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-50 transition-colors self-end sm:self-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {profile.currentSkills.length === 0 && (
                <div className="p-4 text-xs text-slate-500 text-center">
                  No skills added yet. Add 2 or more skills below so the AI agents can evaluate your starting point.
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Add a skill (e.g., Python, React, Excel, Docker)"
                className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-600 whitespace-nowrap">Level:</span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                  className="w-24 accent-blue-600 cursor-pointer"
                />
                <span className="text-xs font-mono tabular-nums text-slate-700 w-9 text-right">
                  {newSkillLevel}%
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Interests */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h2 className="text-sm font-display font-semibold text-slate-900">
              Domain & Topic Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, idx) => (
                <button
                  key={`${interest}-${idx}`}
                  type="button"
                  onClick={() => handleRemoveInterest(idx)}
                  title="Click to remove"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <span>{interest}</span>
                  <span aria-hidden="true" className="text-slate-400">
                    ×
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                placeholder="Add an interest (e.g., Healthcare AI, Fintech, Climate Tech)"
                className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Interest</span>
              </button>
            </div>
          </div>
        </section>

        {/* Profile Analysis Agent Summary Card */}
        <aside className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <p className="text-xs font-medium text-blue-600">Profile Analysis Agent</p>
            <h2 className="text-lg font-display font-bold text-slate-900 mt-1">
              {profileAnalysis.learningPersona}
            </h2>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span>Current Target Readiness</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {profileAnalysis.readinessPercent}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${profileAnalysis.readinessPercent}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{profileAnalysis.learnerSummary}</p>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-semibold text-slate-900">Core Strengths Identified</h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {profileAnalysis.coreStrengths.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  · {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-semibold text-slate-900">Transferable Assets</h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {profileAnalysis.transferableAssets.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  · {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-900">Recommended Study Rhythm</p>
            <p className="text-xs text-slate-600 mt-1">{profileAnalysis.recommendedStudyCadence}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
