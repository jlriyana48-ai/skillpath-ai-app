import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function handleAgentError(res: express.Response, agentName: string, err: unknown) {
  console.error(`[${agentName}] Error:`, err);
  const message = err instanceof Error ? err.message : 'Unexpected agent execution error.';
  const status = message.includes('GEMINI_API_KEY') ? 500 : 502;
  res.status(status).json({
    error: `${agentName} failed: ${message}`,
  });
}

async function generateStructuredJson<T>(
  systemInstruction: string,
  prompt: string,
  responseSchema: Record<string, unknown>,
  thinkingLevel: ThinkingLevel = ThinkingLevel.LOW
): Promise<T> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
      thinkingConfig: { thinkingLevel },
    },
  });

  const rawText = (response.text ?? '').trim();
  if (!rawText) {
    throw new Error('Model returned an empty response.');
  }
  return JSON.parse(rawText) as T;
}

const app = express();
app.use(express.json({ limit: '2mb' }));

// 1. Profile Analysis Agent
app.post('/api/agents/profile', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile || !profile.name || !profile.targetCareer) {
      return res.status(400).json({ error: 'Student profile with name and targetCareer is required.' });
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        learnerSummary: {
          type: Type.STRING,
          description: '2-3 beginner-friendly sentences summarizing the student profile, education, and readiness for their target career.',
        },
        learningPersona: {
          type: Type.STRING,
          description: 'A crisp 3-6 word learner archetype label (e.g., "Analytical Builder with Python Roots").',
        },
        coreStrengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 to 4 concise bullet points highlighting their strongest current assets.',
        },
        transferableAssets: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '2 to 3 transferable skills or interests that accelerate their path.',
        },
        recommendedStudyCadence: {
          type: Type.STRING,
          description: 'A practical weekly study cadence matching their weeklyHoursAvailable (e.g., "10 hrs/week · 3 evening sessions + weekend project").',
        },
        readinessPercent: {
          type: Type.INTEGER,
          description: 'Estimated current readiness percentage from 10 to 95 for the target career.',
        },
      },
      required: [
        'learnerSummary',
        'learningPersona',
        'coreStrengths',
        'transferableAssets',
        'recommendedStudyCadence',
        'readinessPercent',
      ],
    };

    const prompt = `Analyze this student profile for personalized learning readiness:
Name: ${profile.name}
Education: ${profile.education}
Experience Level: ${profile.experienceLevel}
Weekly Hours Available: ${profile.weeklyHoursAvailable} hours/week
Current Skills (1-100 scale): ${JSON.stringify(profile.currentSkills)}
Interests: ${JSON.stringify(profile.interests)}
Target Career: ${profile.targetCareer}
Bio / Context: ${profile.bio || 'Not provided'}`;

    const result = await generateStructuredJson(
      'You are the Profile Analysis Agent inside SkillPath AI. Be encouraging, plain-spoken, accurate, and beginner-friendly. Never invent credentials the student does not have.',
      prompt,
      schema,
      ThinkingLevel.LOW
    );

    res.json(result);
  } catch (err) {
    handleAgentError(res, 'Profile Analysis Agent', err);
  }
});

// 2. Skill Gap Analysis Agent
app.post('/api/agents/skill-gap', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile || !profile.targetCareer) {
      return res.status(400).json({ error: 'Student profile and targetCareer are required.' });
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        targetRoleSummary: {
          type: Type.STRING,
          description: 'Short 1-2 sentence overview of what core competencies the target career expects at entry/junior level.',
        },
        overallCoveragePercent: {
          type: Type.INTEGER,
          description: 'Percentage (0-100) of target role competencies the student currently covers.',
        },
        strengths: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skill: { type: Type.STRING },
              currentLevel: { type: Type.INTEGER },
              requiredLevel: { type: Type.INTEGER },
              note: { type: Type.STRING },
            },
            required: ['skill', 'currentLevel', 'requiredLevel', 'note'],
          },
          description: '2 to 4 skills where the student meets or approaches the target requirement.',
        },
        weaknesses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skill: { type: Type.STRING },
              currentLevel: { type: Type.INTEGER },
              requiredLevel: { type: Type.INTEGER },
              note: { type: Type.STRING },
            },
            required: ['skill', 'currentLevel', 'requiredLevel', 'note'],
          },
          description: '2 to 4 existing skills that need deeper practice to reach job-ready proficiency.',
        },
        missingSkills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skill: { type: Type.STRING },
              requiredLevel: { type: Type.INTEGER },
              priority: { type: Type.STRING, enum: ['High', 'Medium', 'Foundational'] },
              reason: { type: Type.STRING },
            },
            required: ['skill', 'requiredLevel', 'priority', 'reason'],
          },
          description: '3 to 5 essential skills for the target role that are currently missing from the student profile.',
        },
      },
      required: ['targetRoleSummary', 'overallCoveragePercent', 'strengths', 'weaknesses', 'missingSkills'],
    };

    const prompt = `Perform a clear Skill Gap Analysis comparing the student's current skills against the industry baseline for "${profile.targetCareer}".
Student Education: ${profile.education}
Experience Level: ${profile.experienceLevel}
Current Skills (1-100): ${JSON.stringify(profile.currentSkills)}
Interests: ${JSON.stringify(profile.interests)}`;

    const result = await generateStructuredJson(
      'You are the Skill Gap Analysis Agent inside SkillPath AI. Identify strengths, developing skills (weaknesses), and missing skills honestly and constructively with realistic 1-100 proficiency benchmarks.',
      prompt,
      schema,
      ThinkingLevel.LOW
    );

    res.json(result);
  } catch (err) {
    handleAgentError(res, 'Skill Gap Analysis Agent', err);
  }
});

// 3. Career Recommendation Agent
app.post('/api/agents/careers', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Student profile is required.' });
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        careers: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              matchScore: { type: Type.INTEGER, description: 'Fit score from 50 to 99.' },
              growthOutlook: { type: Type.STRING, description: 'Concise outlook e.g. "+24% 5-year demand".' },
              typicalEntryRange: { type: Type.STRING, description: 'Realistic entry compensation band e.g. "$85k – $115k".' },
              rationale: { type: Type.STRING, description: 'Why this role fits the student background and interests.' },
              alignedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              skillsToAcquire: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedTimeToReady: { type: Type.STRING, description: 'Estimated study timeframe e.g. "12 weeks".' },
            },
            required: [
              'id',
              'title',
              'matchScore',
              'growthOutlook',
              'typicalEntryRange',
              'rationale',
              'alignedSkills',
              'skillsToAcquire',
              'estimatedTimeToReady',
            ],
          },
          description: 'Provide 4 distinct, well-matched career recommendations sorted highest matchScore first. Include the targetCareer if relevant plus adjacent high-fit paths.',
        },
      },
      required: ['careers'],
    };

    const prompt = `Recommend 4 suitable tech or domain career paths for this student:
Name: ${profile.name}
Education: ${profile.education}
Current Skills: ${JSON.stringify(profile.currentSkills)}
Interests: ${JSON.stringify(profile.interests)}
Stated Target Career: ${profile.targetCareer}
Weekly Hours Available: ${profile.weeklyHoursAvailable}`;

    const result = await generateStructuredJson<{ careers: unknown[] }>(
      'You are the Career Recommendation Agent inside SkillPath AI. Match the student with realistic, motivating career paths grounded in their skills, education, and interests.',
      prompt,
      schema,
      ThinkingLevel.LOW
    );

    res.json(result.careers ?? []);
  } catch (err) {
    handleAgentError(res, 'Career Recommendation Agent', err);
  }
});

// 4. Learning Roadmap Agent
app.post('/api/agents/roadmap', async (req, res) => {
  try {
    const { profile, skillGap } = req.body;
    if (!profile || !profile.targetCareer) {
      return res.status(400).json({ error: 'Student profile and targetCareer are required.' });
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        totalWeeks: { type: Type.INTEGER },
        totalHours: { type: Type.INTEGER },
        phases: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              phaseNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              durationWeeks: { type: Type.INTEGER },
              objective: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['Course', 'Tutorial', 'Practical Exercise'] },
                    targetSkill: { type: Type.STRING },
                    providerOrFormat: { type: Type.STRING },
                    estimatedHours: { type: Type.INTEGER },
                    difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
                    description: { type: Type.STRING },
                    deliverable: { type: Type.STRING },
                  },
                  required: [
                    'id',
                    'title',
                    'type',
                    'targetSkill',
                    'providerOrFormat',
                    'estimatedHours',
                    'difficulty',
                    'description',
                    'deliverable',
                  ],
                },
              },
            },
            required: ['id', 'phaseNumber', 'title', 'durationWeeks', 'objective', 'items'],
          },
          description: '3 progressive learning phases (Foundations, Core Build, Portfolio Capstone), each containing 3 items mixing Courses, Tutorials, and Practical Exercises.',
        },
      },
      required: ['title', 'totalWeeks', 'totalHours', 'phases'],
    };

    const prompt = `Build a step-by-step personalized learning roadmap for ${profile.name} targeting "${profile.targetCareer}".
Weekly Hours Available: ${profile.weeklyHoursAvailable} hours/week
Experience Level: ${profile.experienceLevel}
Current Skills: ${JSON.stringify(profile.currentSkills)}
Identified Skill Gaps: ${JSON.stringify(skillGap ?? {})}`;

    const result = await generateStructuredJson<{
      title: string;
      totalWeeks: number;
      totalHours: number;
      phases: Array<{
        id: string;
        phaseNumber: number;
        title: string;
        durationWeeks: number;
        objective: string;
        items: Array<Record<string, unknown>>;
      }>;
    }>(
      'You are the Learning Roadmap Agent inside SkillPath AI. Design an actionable, beginner-friendly 3-phase learning plan with real-world courses, focused tutorials, and hands-on practical exercises that close the student skill gaps.',
      prompt,
      schema,
      ThinkingLevel.MEDIUM
    );

    const normalized = {
      ...result,
      phases: (result.phases ?? []).map((phase, pIdx) => ({
        ...phase,
        id: phase.id || `phase-${pIdx + 1}`,
        items: (phase.items ?? []).map((item, iIdx) => ({
          ...item,
          id: (item.id as string) || `item-${pIdx + 1}-${iIdx + 1}`,
          completed: false,
        })),
      })),
    };

    res.json(normalized);
  } catch (err) {
    handleAgentError(res, 'Learning Roadmap Agent', err);
  }
});

// 5. Progress Tracking Agent
app.post('/api/agents/progress', async (req, res) => {
  try {
    const { profile, roadmap, skillGap } = req.body;
    if (!profile || !roadmap) {
      return res.status(400).json({ error: 'Student profile and roadmap are required.' });
    }

    const allItems = (roadmap.phases ?? []).flatMap((p: { items: Array<{ title: string; completed: boolean; estimatedHours: number; targetSkill: string }> }) => p.items ?? []);
    const completedCount = allItems.filter((i: { completed: boolean }) => i.completed).length;
    const completedHours = allItems
      .filter((i: { completed: boolean }) => i.completed)
      .reduce((sum: number, i: { estimatedHours: number }) => sum + (i.estimatedHours || 0), 0);
    const totalHours = allItems.reduce((sum: number, i: { estimatedHours: number }) => sum + (i.estimatedHours || 0), 0);

    const schema = {
      type: Type.OBJECT,
      properties: {
        momentumStatus: {
          type: Type.STRING,
          enum: ['On Track', 'Ahead of Schedule', 'Needs Focus', 'Getting Started'],
        },
        summary: {
          type: Type.STRING,
          description: '2-sentence clear assessment of current learning momentum and completed lessons.',
        },
        nextRecommendedAction: {
          type: Type.STRING,
          description: 'Specific next lesson or exercise the student should tackle today.',
        },
        pendingPrioritySkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Top 3-4 pending skills still awaiting completion.',
        },
        weeklyMilestones: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              weekLabel: { type: Type.STRING },
              plannedHours: { type: Type.INTEGER },
              completedHours: { type: Type.INTEGER },
            },
            required: ['weekLabel', 'plannedHours', 'completedHours'],
          },
          description: '4 recent/upcoming weekly study snapshots (e.g. Week 1..Week 4) reflecting actual completedHours.',
        },
        coachingTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 practical, beginner-friendly study suggestions.',
        },
      },
      required: [
        'momentumStatus',
        'summary',
        'nextRecommendedAction',
        'pendingPrioritySkills',
        'weeklyMilestones',
        'coachingTips',
      ],
    };

    const prompt = `Evaluate learning progress for ${profile.name} targeting "${profile.targetCareer}".
Weekly Hours Budget: ${profile.weeklyHoursAvailable} hrs/week
Completed Lessons: ${completedCount} of ${allItems.length}
Completed Study Hours: ${completedHours} of ${totalHours} hrs
Roadmap Items Status: ${JSON.stringify(allItems.map((i: { title: string; targetSkill: string; completed: boolean; estimatedHours: number }) => ({ title: i.title, targetSkill: i.targetSkill, completed: i.completed, estimatedHours: i.estimatedHours })))}
Missing Skills: ${JSON.stringify((skillGap?.missingSkills ?? []).map((m: { skill: string }) => m.skill))}`;

    const result = await generateStructuredJson(
      'You are the Progress Tracking Agent inside SkillPath AI. Analyze completed lessons, pending skills, and study pace to give motivating, concrete next steps.',
      prompt,
      schema,
      ThinkingLevel.LOW
    );

    res.json(result);
  } catch (err) {
    handleAgentError(res, 'Progress Tracking Agent', err);
  }
});

// 6. AI Mentor Endpoint (Conversational personalized guidance)
app.post('/api/agents/mentor', async (req, res) => {
  try {
    const { message, history, workspaceContext } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A message string is required.' });
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        reply: {
          type: Type.STRING,
          description: 'Warm, structured, actionable mentor guidance tailored to the student profile, skill gaps, and roadmap progress. Use plain paragraphs and short bulleted lines.',
        },
        suggestedFollowUps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 concise follow-up questions the student could ask next.',
        },
      },
      required: ['reply', 'suggestedFollowUps'],
    };

    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    const prompt = `Student Context:
${JSON.stringify(workspaceContext ?? {}, null, 2)}

Recent Conversation:
${recentHistory.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Student' : 'AI Mentor'}: ${m.content}`).join('\n')}

Student Question: ${message}`;

    const result = await generateStructuredJson(
      'You are the SkillPath AI Mentor—an encouraging, practical career & study coach. Reference the student’s actual skills, missing skills, completed lessons, and target career in your advice. Keep explanations beginner-friendly, clear, and actionable.',
      prompt,
      schema,
      ThinkingLevel.LOW
    );

    res.json(result);
  } catch (err) {
    handleAgentError(res, 'AI Mentor', err);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillPath AI server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
