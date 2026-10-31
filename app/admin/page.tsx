 "use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, LogOut, Plus, Trash2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Post = { id: string; title: string; narrative: string | null; image_url: string; category: string | null; created_at: string };

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [narrative, setNarrative] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = (() => { try { return getSupabase(); } catch { return null; } })();

  async function refresh() {
    if (!supabase) return;
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    setPosts((data || []) as Post[]);
  }

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) { setSignedIn(true); await refresh(); }
      setChecking(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(e: FormEvent) {
    e.preventDefault(); setMessage("");
    if (!supabase) { setMessage("Add your Supabase environment variables first."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage(error.message); return; }
    setSignedIn(true); await refresh();
  }

  async function publish(e: FormEvent) {
    e.preventDefault(); setMessage("");
    if (!supabase || !file) { setMessage("Choose an image before publishing."); return; }
    setBusy(true);
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from("journal-images").upload(safeName, file);
    if (uploadError) { setMessage(uploadError.message); setBusy(false); return; }
    const { data: publicData } = supabase.storage.from("journal-images").getPublicUrl(safeName);
    const { error } = await supabase.from("posts").insert({
      title, narrative, category: category.trim().toUpperCase() || "MOMENTS", image_url: publicData.publicUrl
    });
    if (error) setMessage(error.message);
    else { setTitle(""); setNarrative(""); setCategory(""); setFile(null); setMessage("Your entry is published."); await refresh(); }
    setBusy(false);
  }

  async function remove(post: Post) {
    if (!supabase || !confirm(`Delete "${post.title}"?`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    setMessage(error ? error.message : "Entry deleted.");
    await refresh();
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setSignedIn(false); setPosts([]);
  }

  if (checking) return <main className="admin-page"><p className="loading">Opening studio…</p></main>;

  return <main className="admin-page">
    <header className="admin-top"><Link href="/" className="back"><ArrowLeft size={16}/> VIEW WEBSITE</Link><span className="wordmark">DEY WII ME<span>.</span></span>{signedIn ? <button className="logout" onClick={logout}><LogOut size={15}/> SIGN OUT</button> : <span/>}</header>
    <section className="admin-intro"><p className="eyebrow">THE BACK ROOM</p><h1>Admin studio<span>.</span></h1><p>Only your authorised account can manage the journal.</p></section>
    {!signedIn ? <form className="admin-panel login-panel" onSubmit={login}>
      <p className="eyebrow">ADMIN ACCESS</p><h2>Sign in.</h2>
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Your admin email"/></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Your password"/></label>
      <button className="publish-btn" type="submit">ENTER STUDIO</button>
      {message && <p className="notice">{message}</p>}
      <p className="hint">Your account must be added to the admin allowlist in Supabase before it can publish.</p>
    </form> : <div className="admin-columns">
      <form className="admin-panel" onSubmit={publish}>
        <p className="eyebrow">NEW ENTRY</p><h2>Put something out there<span>.</span></h2>
        <label className="upload-box"><ImagePlus size={25}/><strong>{file ? file.name : "Choose a photograph"}</strong><span>JPG, PNG or WEBP</span><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required/></label>
        <label>Title<input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Give this moment a name"/></label>
        <label>Category<input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. PLACES, MOMENTS, NIGHTS"/></label>
        <label>Narrative<textarea value={narrative} onChange={e => setNarrative(e.target.value)} rows={5} placeholder="What's the story behind it?"/></label>
        <button className="publish-btn" disabled={busy}>{busy ? "PUBLISHING…" : <><Plus size={16}/> PUBLISH ENTRY</>}</button>
        {message && <p className="notice">{message}</p>}
      </form>
      <section className="admin-panel entries-panel"><p className="eyebrow">YOUR COLLECTION</p><h2>Published entries <span>({posts.length})</span></h2>
        {posts.map(post => <div className="entry-row" key={post.id}><img src={post.image_url} alt=""/><div><strong>{post.title}</strong><span>{post.category}</span></div><button onClick={() => remove(post)} aria-label={`Delete ${post.title}`}><Trash2 size={16}/></button></div>)}
        {!posts.length && <p className="hint">Your published entries will appear here.</p>}
      </section>
    </div>}
  </main>;
}
