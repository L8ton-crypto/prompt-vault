"use client";

import { useState, useEffect } from "react";

interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: string | null;
  rating: number;
  is_favorite: boolean;
}

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, [selectedCategory, search]);

  async function fetchPrompts() {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (search) params.set("search", search);
      
      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      setPrompts(data.prompts || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function copyPrompt(prompt: Prompt) {
    await navigator.clipboard.writeText(prompt.content);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function toggleFavorite(id: number) {
    try {
      await fetch("/api/prompts/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setPrompts(prompts.map(p => 
        p.id === id ? { ...p, is_favorite: !p.is_favorite } : p
      ));
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  }

  const displayedPrompts = showFavorites 
    ? prompts.filter(p => p.is_favorite) 
    : prompts;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-lg">
                📝
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">PromptVault</h1>
                <p className="text-[11px] text-gray-500">50+ curated AI prompts</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts..."
                className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <button
              onClick={() => setShowFavorites(false)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                !showFavorites ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              All ({prompts.length})
            </button>
            <button
              onClick={() => setShowFavorites(true)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                showFavorites ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              ⭐ Favorites ({prompts.filter(p => p.is_favorite).length})
            </button>
            
            <div className="h-4 w-px bg-gray-700 mx-2" />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p>Loading prompts...</p>
          </div>
        ) : displayedPrompts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">🔍</div>
            <p>{showFavorites ? "No favorites yet. Star some prompts!" : "No prompts found."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-purple-400">{prompt.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-700/80 text-gray-300">
                        {prompt.category}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        ⭐ {prompt.rating}
                      </span>
                      {prompt.source && (
                        <span className="text-[10px] text-gray-600">
                          via {prompt.source}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(prompt.id)}
                    className={`text-lg transition-colors ${
                      prompt.is_favorite ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"
                    }`}
                  >
                    {prompt.is_favorite ? "★" : "☆"}
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 mb-3 line-clamp-3">
                  {prompt.content.substring(0, 200)}...
                </p>
                
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {prompt.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <button
                  onClick={() => copyPrompt(prompt)}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${
                    copiedId === prompt.id
                      ? "bg-green-600 text-white"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  }`}
                >
                  {copiedId === prompt.id ? "✓ Copied!" : "📋 Copy Prompt"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-gray-600">
          <p>Curated prompts from Reddit, Twitter/X, HackerNews & more</p>
        </div>
      </footer>
    </div>
  );
}
