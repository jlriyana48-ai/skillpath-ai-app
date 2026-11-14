export type NavSection =
  | 'overview'
  | 'profile'
  | 'skill-gap'
  | 'careers'
  | 'roadmap'
  | 'progress'
  | 'mentor';

export interface StudentSkill {
  name: string;
  level: number; // 1 to 100
}

export interface StudentProfile {
  id: string;
  name: string;
  avatarUrl: string;
  education: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  weeklyHoursAvailable: number;
  currentSkills: StudentSkill[];
  interests: string[];
  targetCareer: string;
  bio: string;
}

export interface ProfileAnalysis {
  learnerSummary: string;
  learningPersona: string;
  coreStrengths: string[];
  transferableAssets: string[];
  recommendedStudyCadence: string;
  readinessPercent: number;
}

export interface EvaluatedSkill {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  note: string;
}

export interface MissingSkill {
  skill: string;
  requiredLevel: number;
  priority: 'High' | 'Medium' | 'Foundational';
  reason: string;
}

export interface SkillGapAnalysis {
  targetRoleSummary: string;
  overallCoveragePercent: number;
  strengths: EvaluatedSkill[];
  weaknesses: EvaluatedSkill[];
  missingSkills: MissingSkill[];
}

export interface CareerRecommendation {
  id: string;
  title: string;
  matchScore: number;
  growthOutlook: string;
  typicalEntryRange: string;
  rationale: string;
  alignedSkills: string[];
  skillsToAcquire: string[];
  estimatedTimeToReady: string;
}

export type ResourceType = 'Course' | 'Tutorial' | 'Practical Exercise';

export interface RoadmapItem {
  id: string;
  title: string;
  type: ResourceType;
  targetSkill: string;
  providerOrFormat: string;
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  deliverable: string;
  completed: boolean;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  durationWeeks: number;
  objective: string;
  items: RoadmapItem[];
}

export interface LearningRoadmap {
  title: string;
  totalWeeks: number;
  totalHours: number;
  phases: RoadmapPhase[];
}

export interface WeeklyMilestone {
  weekLabel: string;
  plannedHours: number;
  completedHours: number;
}

export interface ProgressEvaluation {
  momentumStatus: 'On Track' | 'Ahead of Schedule' | 'Needs Focus' | 'Getting Started';
  summary: string;
  nextRecommendedAction: string;
  pendingPrioritySkills: string[];
  weeklyMilestones: WeeklyMilestone[];
  coachingTips: string[];
}

export interface MentorMessage {
  id: string;
  role: 'user' | 'mentor';
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

export interface StudentWorkspace {
  profile: StudentProfile;
  profileAnalysis: ProfileAnalysis;
  skillGap: SkillGapAnalysis;
  careers: CareerRecommendation[];
  roadmap: LearningRoadmap;
  progressEvaluation: ProgressEvaluation;
  mentorMessages: MentorMessage[];
  lastAnalyzedAt: string;
}

export type AgentKey =
  | 'profile'
  | 'skill-gap'
  | 'careers'
  | 'roadmap'
  | 'progress';

export type AgentStatusState = 'idle' | 'running' | 'completed' | 'error';

export interface AgentPipelineStatus {
  profile: AgentStatusState;
  'skill-gap': AgentStatusState;
  careers: AgentStatusState;
  roadmap: AgentStatusState;
  progress: AgentStatusState;
}
