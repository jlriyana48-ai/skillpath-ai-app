import {
  AgentKey,
  AgentStatusState,
  CareerRecommendation,
  LearningRoadmap,
  ProfileAnalysis,
  ProgressEvaluation,
  SkillGapAnalysis,
  StudentProfile,
  StudentWorkspace,
} from '../types';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `Request to ${url} failed with status ${res.status}`);
  }
  return data as T;
}

export async function runProfileAgent(profile: StudentProfile): Promise<ProfileAnalysis> {
  return postJson<ProfileAnalysis>('/api/agents/profile', { profile });
}

export async function runSkillGapAgent(profile: StudentProfile): Promise<SkillGapAnalysis> {
  return postJson<SkillGapAnalysis>('/api/agents/skill-gap', { profile });
}

export async function runCareerAgent(profile: StudentProfile): Promise<CareerRecommendation[]> {
  return postJson<CareerRecommendation[]>('/api/agents/careers', { profile });
}

export async function runRoadmapAgent(
  profile: StudentProfile,
  skillGap: SkillGapAnalysis
): Promise<LearningRoadmap> {
  return postJson<LearningRoadmap>('/api/agents/roadmap', { profile, skillGap });
}

export async function runProgressAgent(
  profile: StudentProfile,
  roadmap: LearningRoadmap,
  skillGap: SkillGapAnalysis
): Promise<ProgressEvaluation> {
  return postJson<ProgressEvaluation>('/api/agents/progress', {
    profile,
    roadmap,
    skillGap,
  });
}

export async function askMentorAgent(
  message: string,
  history: Array<{ role: 'user' | 'mentor'; content: string }>,
  workspace: StudentWorkspace
): Promise<{ reply: string; suggestedFollowUps: string[] }> {
  const allItems = workspace.roadmap.phases.flatMap((p) => p.items);
  const completedTitles = allItems.filter((i) => i.completed).map((i) => i.title);
  const pendingTitles = allItems.filter((i) => !i.completed).slice(0, 6).map((i) => i.title);

  const workspaceContext = {
    studentName: workspace.profile.name,
    education: workspace.profile.education,
    experienceLevel: workspace.profile.experienceLevel,
    weeklyHoursAvailable: workspace.profile.weeklyHoursAvailable,
    targetCareer: workspace.profile.targetCareer,
    currentSkills: workspace.profile.currentSkills,
    strengths: workspace.skillGap.strengths.map((s) => s.skill),
    missingSkills: workspace.skillGap.missingSkills.map((m) => `${m.skill} (${m.priority})`),
    completedLessons: completedTitles,
    upcomingLessons: pendingTitles,
    momentumStatus: workspace.progressEvaluation.momentumStatus,
  };

  return postJson<{ reply: string; suggestedFollowUps: string[] }>('/api/agents/mentor', {
    message,
    history,
    workspaceContext,
  });
}

export async function orchestrateAllAgents(
  profile: StudentProfile,
  onStatusChange: (agent: AgentKey, status: AgentStatusState) => void
): Promise<{
  profileAnalysis: ProfileAnalysis;
  skillGap: SkillGapAnalysis;
  careers: CareerRecommendation[];
  roadmap: LearningRoadmap;
  progressEvaluation: ProgressEvaluation;
}> {
  // Stage 1: Profile Analysis Agent
  onStatusChange('profile', 'running');
  const profileAnalysis = await runProfileAgent(profile).catch((err) => {
    onStatusChange('profile', 'error');
    throw err;
  });
  onStatusChange('profile', 'completed');

  // Stage 2: Skill Gap Analysis Agent + Career Recommendation Agent (parallel)
  onStatusChange('skill-gap', 'running');
  onStatusChange('careers', 'running');

  const [skillGap, careers] = await Promise.all([
    runSkillGapAgent(profile).then((res) => {
      onStatusChange('skill-gap', 'completed');
      return res;
    }).catch((err) => {
      onStatusChange('skill-gap', 'error');
      throw err;
    }),
    runCareerAgent(profile).then((res) => {
      onStatusChange('careers', 'completed');
      return res;
    }).catch((err) => {
      onStatusChange('careers', 'error');
      throw err;
    }),
  ]);

  // Stage 3: Learning Roadmap Agent
  onStatusChange('roadmap', 'running');
  const roadmap = await runRoadmapAgent(profile, skillGap).catch((err) => {
    onStatusChange('roadmap', 'error');
    throw err;
  });
  onStatusChange('roadmap', 'completed');

  // Stage 4: Progress Tracking Agent
  onStatusChange('progress', 'running');
  const progressEvaluation = await runProgressAgent(profile, roadmap, skillGap).catch((err) => {
    onStatusChange('progress', 'error');
    throw err;
  });
  onStatusChange('progress', 'completed');

  return {
    profileAnalysis,
    skillGap,
    careers,
    roadmap,
    progressEvaluation,
  };
}
