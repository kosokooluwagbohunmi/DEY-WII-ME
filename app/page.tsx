 "use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Grid2X2, LayoutList, LockKeyhole, Search, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Post = {
  id: string; title: string; narrative: string | null; image_url: string;
  category: string | null; created_at: string;
};

const samples: Post[] = [
  { id: "sample-1", title: "Somewhere in the in-between", narrative: "A moment that didn't ask to be explained.", image_url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1000", category: "MOMENTS", created_at: "2026-10-01" },
  { id: "sample-2", title: "The city keeps its own time", narrative: "Movement, noise, and the beauty of passing through.", image_url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1000&sat=-80", category: "PLACES", created_at: "2026-10-02" },
  { id: "sample-3", title: "Quiet details", narrative: "The little things have a way of staying.", image_url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1000", category: "DETAILS", created_at: "2026-10-03" },
  { id: "sample-4", title: "After hours", narrative: "A different kind of stillness.", image_url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1000&blur=1", category: "NIGHTS", created_at: "2026-10-04" },
  { id: "sample-5", title: "A study in light", narrative: "Chasing the way light changes a familiar scene.", image_url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000", category: "STUDIES", created_at: "2026-10-05" },
  { id: "sample-6", title: "No particular reason", narrative: "Collected because it felt like something.", image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000", category: "MOMENTS", created_at: "2026-10-06" }
];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>(samples);
  const [layout, setLayout] = useState<"grid" | "magazine">("grid");
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const supabase = getSupabase();
      supabase.from("posts").select("*").order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setPosts(data as Post[]);
          setLoading(false);
        });
    } catch { setLoading(false); }
  }, []);

  const categories = useMemo(() => ["ALL", ...Array.from(new Set(posts.map(p => p.category).filter(Boolean) as string[]))], [posts]);
  const filtered = posts.filter(p =>
    (category === "ALL" || p.category === category) &&
    `${p.title} ${p.narrative ?? ""} ${p.category ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <header className="topbar">
        <a className="wordmark" href="/">DEY WII ME<span>.</span></a>
        <nav><a href="#journal">THE JOURNAL</a><a href="#about">ABOUT</a><a className="admin-link" href="/admin"><LockKeyhole size={13}/> ADMIN</a></nav>
      </header>

      <section className="hero">
        <p className="eyebrow">AN ONGOING VISUAL JOURNAL <span>— EST. 2026</span></p>
        <h1>DEY WII ME<span>.</span></h1>
        <div className="hero-bottom">
          <p>Pictures. Perspectives.<br/>Pieces of life.</p>
          <p className="hero-note">A collection of things<br/>worth remembering.</p>
        </div>
      </section>

      <section className="journal" id="journal">
        <div className="section-head">
          <div><p className="eyebrow">THE COLLECTION</p><h2>Recent entries<span>.</span></h2></div>
          <div className="view-controls">
            <button className={layout === "grid" ? "active" : ""} onClick={() => setLayout("grid")} aria-label="Masonry layout"><Grid2X2 size={17}/></button>
            <button className={layout === "magazine" ? "active" : ""} onClick={() => setLayout("magazine")} aria-label="Magazine layout"><LayoutList size={17}/></button>
          </div>
        </div>

        <div className="filters">
          <div className="categories">{categories.map(c => <button key={c} className={category === c ? "chosen" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div>
          <label className="search"><Search size={15}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find something..." /></label>
        </div>

        <div className={`post-grid ${layout === "magazine" ? "magazine" : ""}`}>
          {filtered.map((post, i) => (
            <button className={`post-card card-${i % 3}`} key={post.id} onClick={() => setSelected(post)}>
              <div className="image-wrap"><img src={post.image_url} alt={post.title}/><span className="open-icon"><ArrowUpRight size={17}/></span></div>
              <div className="post-meta"><span>{post.category || "UNCATEGORIZED"}</span><span>{new Date(post.created_at).toLocaleDateString("en", { month: "short", year: "numeric" })}</span></div>
              <h3>{post.title}</h3>
              {layout === "magazine" && <p className="post-narrative">{post.narrative}</p>}
            </button>
          ))}
          {!filtered.length && <p className="empty">Nothing here yet. Try another search.</p>}
        </div>
        {loading && <p className="loading">Gathering the collection…</p>}
      </section>

      <section className="about" id="about"><p className="eyebrow">A NOTE TO SELF</p><p className="about-line">Not everything needs a reason.<br/><span>Some things just deserve a place.</span></p></section>
      <footer><a className="wordmark" href="/">DEY WII ME<span>.</span></a><span>AN ONGOING VISUAL JOURNAL</span><span>© 2026</span></footer>

      {selected && <div className="modal" onClick={() => setSelected(null)}><button className="close" aria-label="Close"><X/></button><article className="modal-content" onClick={e => e.stopPropagation()}><img src={selected.image_url} alt={selected.title}/><div className="modal-copy"><p className="eyebrow">{selected.category || "ENTRY"}</p><h2>{selected.title}</h2><p>{selected.narrative}</p></div></article></div>}
    </main>
  );
}
