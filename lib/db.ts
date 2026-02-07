import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: string | null;
  rating: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS prompts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      tags TEXT[] DEFAULT '{}',
      source VARCHAR(255),
      rating INTEGER DEFAULT 0,
      is_favorite BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Check if we need to seed
  const count = await sql`SELECT COUNT(*) as count FROM prompts`;
  if (parseInt(count[0].count) === 0) {
    await seedPrompts();
  }
}

export async function getPrompts(category?: string, search?: string): Promise<Prompt[]> {
  if (category && category !== "all" && search) {
    return sql`
      SELECT * FROM prompts 
      WHERE category = ${category} 
      AND (title ILIKE ${'%' + search + '%'} OR content ILIKE ${'%' + search + '%'})
      ORDER BY rating DESC, created_at DESC
    ` as unknown as Prompt[];
  } else if (category && category !== "all") {
    return sql`SELECT * FROM prompts WHERE category = ${category} ORDER BY rating DESC, created_at DESC` as unknown as Prompt[];
  } else if (search) {
    return sql`
      SELECT * FROM prompts 
      WHERE title ILIKE ${'%' + search + '%'} OR content ILIKE ${'%' + search + '%'}
      ORDER BY rating DESC, created_at DESC
    ` as unknown as Prompt[];
  }
  return sql`SELECT * FROM prompts ORDER BY rating DESC, created_at DESC` as unknown as Prompt[];
}

export async function getFavorites(): Promise<Prompt[]> {
  return sql`SELECT * FROM prompts WHERE is_favorite = true ORDER BY updated_at DESC` as unknown as Prompt[];
}

export async function toggleFavorite(id: number): Promise<void> {
  await sql`UPDATE prompts SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
}

export async function getCategories(): Promise<string[]> {
  const result = await sql`SELECT DISTINCT category FROM prompts ORDER BY category`;
  return result.map(r => r.category);
}

async function seedPrompts() {
  const prompts = [
    // Coding prompts
    { title: "Code Review Expert", content: "You are a senior software engineer conducting a code review. Analyze the following code for:\n1. Bugs and potential issues\n2. Performance optimizations\n3. Security vulnerabilities\n4. Code style and best practices\n5. Suggestions for improvement\n\nProvide specific, actionable feedback with examples.", category: "Coding", tags: ["code-review", "debugging"], source: "Reddit r/ChatGPT", rating: 95 },
    { title: "Explain Code Like I'm 5", content: "Explain the following code in simple terms that a beginner could understand. Use analogies and real-world examples. Break down each part step by step:\n\n[paste code here]", category: "Coding", tags: ["learning", "explanation"], source: "Twitter", rating: 92 },
    { title: "Debug Assistant", content: "I'm getting this error: [error message]\n\nHere's my code: [paste code]\n\nPlease:\n1. Explain what the error means\n2. Identify the root cause\n3. Provide the corrected code\n4. Explain how to prevent this in the future", category: "Coding", tags: ["debugging", "errors"], source: "Reddit r/programming", rating: 94 },
    { title: "Convert Code Between Languages", content: "Convert the following [source language] code to [target language]. Maintain the same functionality and follow idiomatic patterns for the target language. Add comments explaining any significant differences:\n\n[paste code]", category: "Coding", tags: ["conversion", "translation"], source: "HackerNews", rating: 88 },
    { title: "Write Unit Tests", content: "Write comprehensive unit tests for the following function/class. Include:\n- Happy path tests\n- Edge cases\n- Error handling tests\n- Boundary conditions\n\nUse [testing framework] and follow best practices:\n\n[paste code]", category: "Coding", tags: ["testing", "quality"], source: "Reddit r/programming", rating: 91 },
    { title: "Refactor for Clean Code", content: "Refactor the following code following clean code principles:\n- Single Responsibility\n- DRY (Don't Repeat Yourself)\n- KISS (Keep It Simple)\n- Meaningful naming\n- Small functions\n\nExplain each change:\n\n[paste code]", category: "Coding", tags: ["refactoring", "clean-code"], source: "Twitter", rating: 90 },
    { title: "SQL Query Optimizer", content: "Optimize this SQL query for better performance. Explain:\n1. Current issues\n2. Indexing recommendations\n3. Query restructuring\n4. The optimized query with comments\n\n[paste query]", category: "Coding", tags: ["sql", "optimization"], source: "Reddit r/Database", rating: 87 },
    { title: "API Design Review", content: "Review this API design for:\n1. RESTful best practices\n2. Naming conventions\n3. Error handling\n4. Versioning strategy\n5. Security considerations\n\nProvide recommendations:\n\n[paste API spec]", category: "Coding", tags: ["api", "design"], source: "HackerNews", rating: 86 },
    { title: "Regex Generator", content: "Create a regex pattern that matches: [describe what you want to match]\n\nProvide:\n1. The regex pattern\n2. Explanation of each part\n3. Test cases that match\n4. Test cases that don't match\n5. Common edge cases to consider", category: "Coding", tags: ["regex", "patterns"], source: "StackOverflow", rating: 89 },
    { title: "Git Commit Message", content: "Write a clear, conventional commit message for the following changes. Follow the format: type(scope): description\n\nChanges made:\n[describe changes]", category: "Coding", tags: ["git", "workflow"], source: "Twitter", rating: 82 },
    
    // Writing prompts
    { title: "Email Rewriter - Professional", content: "Rewrite this email to be more professional and polished while maintaining the core message. Improve clarity, tone, and structure:\n\n[paste email]", category: "Writing", tags: ["email", "professional"], source: "Reddit r/ChatGPT", rating: 93 },
    { title: "Blog Post Outline", content: "Create a detailed blog post outline for the topic: [topic]\n\nInclude:\n- Attention-grabbing title options (3)\n- Introduction hook\n- 5-7 main sections with subpoints\n- Key takeaways\n- Call to action\n- SEO keywords to target", category: "Writing", tags: ["blog", "content"], source: "Twitter", rating: 91 },
    { title: "Summarize Long Text", content: "Summarize the following text in:\n1. One sentence (TL;DR)\n2. One paragraph (executive summary)\n3. Bullet points (key points)\n\nMaintain accuracy and capture the main ideas:\n\n[paste text]", category: "Writing", tags: ["summary", "condensing"], source: "Reddit r/productivity", rating: 94 },
    { title: "Improve My Writing", content: "Improve this text for clarity, flow, and engagement. Fix grammar and spelling. Maintain my voice but make it more compelling:\n\n[paste text]\n\nProvide the improved version and explain key changes.", category: "Writing", tags: ["editing", "improvement"], source: "Twitter", rating: 92 },
    { title: "LinkedIn Post Creator", content: "Write an engaging LinkedIn post about [topic]. Make it:\n- Hook in the first line\n- Use short paragraphs\n- Include a personal story or insight\n- End with a question to drive engagement\n- Add relevant hashtags", category: "Writing", tags: ["linkedin", "social"], source: "Reddit r/linkedin", rating: 88 },
    { title: "Technical Documentation", content: "Write clear technical documentation for [feature/API/system]. Include:\n- Overview and purpose\n- Prerequisites\n- Step-by-step instructions\n- Code examples\n- Troubleshooting section\n- FAQ", category: "Writing", tags: ["docs", "technical"], source: "HackerNews", rating: 87 },
    { title: "Meeting Notes to Action Items", content: "Convert these meeting notes into:\n1. Clear action items with owners and deadlines\n2. Key decisions made\n3. Open questions/blockers\n4. Next steps\n\nMeeting notes:\n[paste notes]", category: "Writing", tags: ["meetings", "productivity"], source: "Reddit r/productivity", rating: 90 },
    { title: "Persuasive Copy", content: "Write persuasive copy for [product/service] that:\n- Addresses pain points\n- Highlights benefits (not just features)\n- Includes social proof elements\n- Has a clear CTA\n- Uses power words\n\nTarget audience: [describe audience]", category: "Writing", tags: ["copywriting", "marketing"], source: "Twitter", rating: 89 },
    
    // Analysis prompts
    { title: "SWOT Analysis", content: "Perform a detailed SWOT analysis for [company/product/idea]:\n\nStrengths - internal positive factors\nWeaknesses - internal negative factors\nOpportunities - external positive factors\nThreats - external negative factors\n\nProvide specific, actionable insights for each.", category: "Analysis", tags: ["business", "strategy"], source: "Reddit r/business", rating: 91 },
    { title: "Pros and Cons List", content: "Create a comprehensive pros and cons analysis for [decision/option]. Consider:\n- Short-term vs long-term impacts\n- Financial implications\n- Time investment\n- Risk factors\n- Hidden considerations\n\nWeight each factor by importance.", category: "Analysis", tags: ["decision-making", "evaluation"], source: "Reddit r/productivity", rating: 90 },
    { title: "Root Cause Analysis", content: "Perform a root cause analysis for this problem: [describe problem]\n\nUse the 5 Whys technique and fishbone diagram approach. Identify:\n1. Symptoms vs root causes\n2. Contributing factors\n3. Recommended solutions\n4. Prevention measures", category: "Analysis", tags: ["problem-solving", "debugging"], source: "HackerNews", rating: 88 },
    { title: "Competitor Analysis", content: "Analyze [competitor] compared to [your company/product]:\n- Product/service comparison\n- Pricing strategy\n- Target market\n- Strengths and weaknesses\n- Market positioning\n- What can we learn from them?", category: "Analysis", tags: ["business", "competitive"], source: "Reddit r/startups", rating: 87 },
    { title: "Data Interpretation", content: "Analyze this data and provide insights:\n\n[paste data]\n\nInclude:\n1. Key trends and patterns\n2. Anomalies or outliers\n3. Correlations\n4. Actionable recommendations\n5. Limitations of the analysis", category: "Analysis", tags: ["data", "insights"], source: "Twitter", rating: 89 },
    { title: "Risk Assessment", content: "Assess the risks for [project/decision]:\n- Identify potential risks\n- Rate likelihood (1-5)\n- Rate impact (1-5)\n- Mitigation strategies\n- Contingency plans\n- Risk priority matrix", category: "Analysis", tags: ["risk", "planning"], source: "Reddit r/projectmanagement", rating: 86 },
    
    // Productivity prompts  
    { title: "Break Down Complex Task", content: "Break down this complex task into manageable steps: [task]\n\nFor each step provide:\n- Clear action item\n- Estimated time\n- Dependencies\n- Potential blockers\n- Definition of done", category: "Productivity", tags: ["planning", "tasks"], source: "Reddit r/productivity", rating: 93 },
    { title: "Daily Planning Assistant", content: "Help me plan my day. Here are my tasks and priorities:\n[list tasks]\n\nCreate a time-blocked schedule that:\n- Groups similar tasks\n- Includes breaks\n- Accounts for energy levels\n- Leaves buffer time\n- Identifies the MIT (Most Important Task)", category: "Productivity", tags: ["planning", "time-management"], source: "Twitter", rating: 92 },
    { title: "Weekly Review Template", content: "Guide me through a weekly review:\n\n1. What did I accomplish this week?\n2. What didn't get done and why?\n3. What did I learn?\n4. What are my priorities for next week?\n5. What habits am I building/breaking?\n6. What am I grateful for?\n7. What needs to change?", category: "Productivity", tags: ["review", "reflection"], source: "Reddit r/productivity", rating: 90 },
    { title: "Goal Setting (SMART)", content: "Help me create SMART goals for: [area of life/work]\n\nFor each goal, ensure it is:\n- Specific: What exactly?\n- Measurable: How will I track?\n- Achievable: Is it realistic?\n- Relevant: Why does it matter?\n- Time-bound: By when?\n\nInclude milestones and potential obstacles.", category: "Productivity", tags: ["goals", "planning"], source: "Reddit r/getdisciplined", rating: 91 },
    { title: "Decision Matrix", content: "Help me decide between these options: [list options]\n\nCriteria to consider: [list criteria or let AI suggest]\n\nCreate a weighted decision matrix, score each option, and provide a recommendation with reasoning.", category: "Productivity", tags: ["decision-making", "analysis"], source: "HackerNews", rating: 88 },
    { title: "Learning Plan Creator", content: "Create a learning plan for: [skill/topic]\n\nInclude:\n- Prerequisites\n- Resources (free and paid)\n- Milestones and timeline\n- Practice projects\n- How to measure progress\n- Common pitfalls to avoid", category: "Productivity", tags: ["learning", "education"], source: "Reddit r/learnprogramming", rating: 89 },
    
    // Creative prompts
    { title: "Brainstorm Ideas", content: "Generate 20 creative ideas for [topic/problem]. Include:\n- 10 conventional approaches\n- 5 unconventional/wild ideas\n- 5 combinations of existing ideas\n\nFor each, briefly explain the core concept.", category: "Creative", tags: ["brainstorming", "ideation"], source: "Twitter", rating: 91 },
    { title: "Explain Like Different Personas", content: "Explain [concept] from these perspectives:\n1. A 5-year-old\n2. A teenager\n3. A busy executive\n4. A skeptical expert\n5. An enthusiastic beginner\n\nAdapt language, analogies, and depth for each.", category: "Creative", tags: ["explanation", "teaching"], source: "Reddit r/ChatGPT", rating: 90 },
    { title: "Analogy Generator", content: "Create 5 different analogies to explain [complex concept] to someone unfamiliar with the field. Use analogies from:\n1. Everyday life\n2. Sports\n3. Cooking\n4. Nature\n5. Building/construction", category: "Creative", tags: ["analogies", "teaching"], source: "Twitter", rating: 87 },
    { title: "Story Framework", content: "Create a story framework for [topic/message] using the hero's journey:\n1. Ordinary world\n2. Call to adventure\n3. Challenges and allies\n4. The ordeal\n5. Transformation\n6. Return with wisdom", category: "Creative", tags: ["storytelling", "narrative"], source: "Reddit r/writing", rating: 86 },
    { title: "Name Generator", content: "Generate creative names for [product/company/project]:\n- 10 descriptive names\n- 10 abstract/invented names\n- 10 metaphorical names\n- 5 acronym-based names\n\nFor each, check if the .com domain might be available.", category: "Creative", tags: ["naming", "branding"], source: "HackerNews", rating: 85 },
    
    // Business prompts
    { title: "Elevator Pitch", content: "Create a 30-second elevator pitch for [product/idea/company]. Include:\n- Hook/attention grabber\n- Problem statement\n- Solution\n- Unique value proposition\n- Call to action\n\nMake it memorable and conversational.", category: "Business", tags: ["pitch", "sales"], source: "Reddit r/startups", rating: 92 },
    { title: "Customer Persona", content: "Create a detailed customer persona for [product/service]:\n- Demographics\n- Goals and motivations\n- Pain points and challenges\n- Buying behavior\n- Information sources\n- Objections to purchase\n- Day in the life narrative", category: "Business", tags: ["marketing", "customer"], source: "Twitter", rating: 89 },
    { title: "Pricing Strategy Analysis", content: "Analyze pricing strategy for [product/service]:\n- Current market rates\n- Value-based pricing considerations\n- Cost-plus analysis\n- Competitive positioning\n- Price sensitivity factors\n- Recommended pricing tiers", category: "Business", tags: ["pricing", "strategy"], source: "Reddit r/startups", rating: 87 },
    { title: "OKR Generator", content: "Create OKRs (Objectives and Key Results) for [team/company/individual]:\n\nFor each objective:\n- Clear, inspiring objective statement\n- 3-5 measurable key results\n- Initiatives to achieve them\n- Timeline\n- Success criteria", category: "Business", tags: ["okrs", "goals"], source: "HackerNews", rating: 88 },
    { title: "Stakeholder Communication", content: "Draft a stakeholder update for [project/initiative]:\n- Executive summary (2-3 sentences)\n- Progress and milestones\n- Key metrics\n- Risks and mitigation\n- Next steps\n- Ask/support needed\n\nAdjust tone for [audience].", category: "Business", tags: ["communication", "stakeholders"], source: "Reddit r/projectmanagement", rating: 86 },
    
    // Personal prompts
    { title: "Difficult Conversation Prep", content: "Help me prepare for a difficult conversation about [topic] with [person/role]:\n- Key points to make\n- Potential objections and responses\n- Questions to ask\n- How to stay calm\n- Desired outcome\n- Best/worst case scenarios", category: "Personal", tags: ["communication", "relationships"], source: "Reddit r/socialskills", rating: 91 },
    { title: "Self-Reflection Questions", content: "Guide me through deep self-reflection on [area of life]. Ask me thoughtful questions about:\n- Current state\n- Desired state\n- Obstacles\n- Values alignment\n- Past patterns\n- Action steps\n\nPause between each for my response.", category: "Personal", tags: ["reflection", "growth"], source: "Twitter", rating: 89 },
    { title: "Habit Tracker Setup", content: "Help me design a habit tracking system for [habits I want to build]:\n- Habit stacking opportunities\n- Implementation intentions (when, where, how)\n- Tracking method\n- Reward system\n- Accountability measures\n- Failure recovery plan", category: "Personal", tags: ["habits", "self-improvement"], source: "Reddit r/getdisciplined", rating: 88 },
    { title: "Feedback Request", content: "Help me ask for feedback on [topic/work/behavior] from [person/group]:\n- Specific questions to ask\n- How to frame the request\n- Making it safe to be honest\n- Follow-up questions\n- How to receive feedback gracefully", category: "Personal", tags: ["feedback", "growth"], source: "HackerNews", rating: 85 },
  ];

  for (const prompt of prompts) {
    await sql`
      INSERT INTO prompts (title, content, category, tags, source, rating)
      VALUES (${prompt.title}, ${prompt.content}, ${prompt.category}, ${prompt.tags}, ${prompt.source}, ${prompt.rating})
    `;
  }
}

export { sql };
