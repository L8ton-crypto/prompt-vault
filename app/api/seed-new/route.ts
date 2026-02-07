import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// One-time endpoint to add the 6 new Arc prompts
export async function POST() {
  try {
    const newPrompts = [
      { title: "System Prompt Engineer", content: "You are an expert at crafting system prompts for AI assistants. Given this use case: [describe the assistant's purpose]\n\nCreate a comprehensive system prompt that includes:\n1. Role and personality definition\n2. Core capabilities and constraints\n3. Response format guidelines\n4. Edge case handling\n5. Example interactions\n\nMake it concise but complete.", category: "Coding", tags: ["prompts", "ai", "meta"], source: "Arc's Toolkit", rating: 96 },
      { title: "Overnight Autonomous Agent", content: "You are an autonomous coding agent working overnight. Your task: [describe task]\n\nRules:\n1. Work independently, make decisions\n2. Commit and push working code frequently\n3. If blocked, document the issue and move to next task\n4. Ping the user on completion with summary\n5. Never overwrite existing data without backup\n6. Test before deploying\n\nStart with a plan, then execute.", category: "Coding", tags: ["automation", "agents", "autonomous"], source: "Arc's Toolkit", rating: 97 },
      { title: "Codebase Archaeologist", content: "Analyze this codebase and create a comprehensive map:\n\n1. Architecture overview (diagram in ASCII)\n2. Key files and their purposes\n3. Data flow between components\n4. External dependencies and why they're used\n5. Potential tech debt or issues\n6. Suggested improvements\n\nBe thorough but concise.", category: "Coding", tags: ["architecture", "analysis", "documentation"], source: "Arc's Toolkit", rating: 94 },
      { title: "Memory Palace Builder", content: "Help me remember [topic/list/concept] using the memory palace technique:\n\n1. Choose a familiar location (my home, office, etc.)\n2. Create vivid, absurd mental images for each item\n3. Place them along a logical path\n4. Add sensory details (sounds, smells, textures)\n5. Create a walkthrough story\n6. Quiz me to reinforce\n\nMake it memorable and fun.", category: "Personal", tags: ["memory", "learning", "techniques"], source: "Arc's Toolkit", rating: 93 },
      { title: "Devil's Advocate", content: "I'm considering: [decision/idea/plan]\n\nBe my devil's advocate. Argue against this position:\n1. What could go wrong?\n2. What am I not seeing?\n3. What assumptions am I making?\n4. Who would disagree and why?\n5. What's the strongest counter-argument?\n\nBe brutally honest, then help me address valid concerns.", category: "Analysis", tags: ["critical-thinking", "decisions", "debate"], source: "Arc's Toolkit", rating: 95 },
      { title: "Second Brain Organizer", content: "Help me organize my notes/thoughts on [topic] into a second brain system:\n\n1. Identify key concepts and create atomic notes\n2. Find connections between ideas (link suggestions)\n3. Create a MOC (Map of Content) structure\n4. Suggest tags and categories\n5. Identify gaps in my knowledge\n6. Recommend next learning steps\n\nUse Zettelkasten principles.", category: "Productivity", tags: ["notes", "pkm", "organization"], source: "Arc's Toolkit", rating: 94 },
    ];

    let added = 0;
    for (const prompt of newPrompts) {
      // Check if already exists
      const existing = await sql`SELECT id FROM prompts WHERE title = ${prompt.title}`;
      if (existing.length === 0) {
        await sql`
          INSERT INTO prompts (title, content, category, tags, source, rating)
          VALUES (${prompt.title}, ${prompt.content}, ${prompt.category}, ${prompt.tags}, ${prompt.source}, ${prompt.rating})
        `;
        added++;
      }
    }

    return NextResponse.json({ success: true, added, message: `Added ${added} new prompts` });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
