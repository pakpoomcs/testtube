import React, { useMemo } from "react";
import { usePreferences } from "../context/PreferencesContext";

const MOCK_NEWS = [
  {
    id: "ielts-1",
    title: "IELTS Test Dates 2026 Announced",
    source: "Test Updates",
    category: "tests",
    date: Date.now() - 2 * 24 * 60 * 60 * 1000,
    excerpt: "New IELTS test dates released for 2026. Check your preferred testing center.",
    tags: ["IELTS", "Important"],
    url: "#",
  },
  {
    id: "sat-1",
    title: "SAT Score Reports Now Available Online",
    source: "Test Updates",
    category: "tests",
    date: Date.now() - 3 * 24 * 60 * 60 * 1000,
    excerpt: "SAT scores can now be accessed immediately after test completion.",
    tags: ["SAT"],
    url: "#",
  },
  {
    id: "thai-1",
    title: "Thailand's New Education Reform Focus",
    source: "Thailand Education",
    category: "local",
    date: Date.now() - 1 * 24 * 60 * 60 * 1000,
    excerpt: "Government announces new policies for English language education in schools.",
    tags: ["Thailand", "Policy"],
    url: "#",
  },
  {
    id: "tcas-1",
    title: "TCAS Registration Opens Next Month",
    source: "Test Updates",
    category: "tests",
    date: Date.now() - 5 * 24 * 60 * 60 * 1000,
    excerpt: "Mark your calendars - TCAS 2026 registration will open February 15.",
    tags: ["TCAS", "Important"],
    url: "#",
  },
  {
    id: "edu-1",
    title: "Top Study Tips from Education Experts",
    source: "Education",
    category: "general",
    date: Date.now() - 4 * 24 * 60 * 60 * 1000,
    excerpt: "Learn effective study strategies that boost retention and test performance.",
    tags: ["Tips", "Study"],
    url: "#",
  },
  {
    id: "toefl-1",
    title: "TOEFL iBT Changes Coming in 2026",
    source: "Test Updates",
    category: "tests",
    date: Date.now() - 6 * 24 * 60 * 60 * 1000,
    excerpt: "Major format updates announced for TOEFL. Learn what's changing.",
    tags: ["TOEFL"],
    url: "#",
  },
];

function formatDate(ts) {
  const now = Date.now();
  const diff = now - ts;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ExploreFeed() {
  const { preferences } = usePreferences();
  const news = MOCK_NEWS;

  // Filter news based on preferences
  const filteredNews = useMemo(() => {
    let filtered = [...news];

    // Prioritize test updates
    filtered.sort((a, b) => {
      const aIsTest = a.category === "tests" ? 0 : 1;
      const bIsTest = b.category === "tests" ? 0 : 1;
      if (aIsTest !== bIsTest) return aIsTest - bIsTest;
      return b.date - a.date;
    });

    // If user has target exams, prioritize relevant news
    if (preferences.target_exams.length > 0) {
      filtered.sort((a, b) => {
        const aHasExam = preferences.target_exams.some((exam) =>
          a.tags.includes(exam)
        );
        const bHasExam = preferences.target_exams.some((exam) =>
          b.tags.includes(exam)
        );
        if (aHasExam && !bHasExam) return -1;
        if (!aHasExam && bHasExam) return 1;
        return 0;
      });
    }

    return filtered;
  }, [news, preferences]);

  const isImportant = (article) => {
    return article.tags.includes("Important") || article.category === "tests";
  };

  const relevantToUser = (article) => {
    if (preferences.target_exams.length === 0) return false;
    return preferences.target_exams.some((exam) => article.tags.includes(exam));
  };

  return (
    <div className="tt-page">
      <div className="mx-auto max-w-[980px] px-4 pt-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-[32px] leading-tight tracking-[0.5px] text-text-primary">
            Explore
          </h1>
          <p className="mt-2 font-body text-[14px] text-text-secondary">
            {preferences.target_exams.length > 0
              ? `Personalized news for ${preferences.target_exams.join(", ")}`
              : "Education news and test updates"}
          </p>
        </div>

        {/* News Feed */}
        <div className="space-y-3">
            {filteredNews.map((article) => {
              const important = isImportant(article);
              const relevant = relevantToUser(article);

              return (
                <a
                  key={article.id}
                  href={article.url}
                  className={`tt-panel tt-interactive block transition-all hover:shadow-lg ${
                    important ? "border-l-[3px] border-l-yellow-400/60" : ""
                  } ${relevant ? "border border-cyan-400/30 bg-cyan-500/8" : ""}`}
                >
                  <div className="p-4 sm:p-5">
                    {/* Top metadata */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-card/70 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.5px] text-text-tertiary">
                        {article.source}
                      </span>
                      {important && (
                        <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.5px] text-yellow-300">
                          Important
                        </span>
                      )}
                      {relevant && (
                        <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.5px] text-cyan-300">
                          For You
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-1 text-[12px] text-text-tertiary">
                        {formatDate(article.date)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 font-heading text-[18px] leading-snug tracking-[0.3px] text-text-primary">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mt-2 font-body text-[14px] leading-relaxed text-text-secondary">
                      {article.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {article.tags.map((tag) => {
                        const isExam = preferences.target_exams.includes(tag);
                        return (
                          <span
                            key={tag}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              isExam
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-card/70 text-text-tertiary"
                            }`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
      </div>
    </div>
  );
}

export default ExploreFeed;
