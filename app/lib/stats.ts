"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState, useCallback, useRef } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } } // tidak pakai auth sama sekali
);

export type Stats = { views: number; likes: Record<string, number>; mine: string[] };

function getVisitorId(): string {
  try {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("visitor_id", id);
    }
    return id;
  } catch {
    return ((window as any).__vid ??= crypto.randomUUID());
  }
}

// Satu fetch dibagi untuk Hero dan Slide4
let shared: Promise<Stats | null> | null = null;
function loadStats(): Promise<Stats | null> {
  if (!shared) {
    const id = getVisitorId();
    shared = (async () => {
      try {
        await supabase.rpc("register_view", { p_visitor: id });
        const { data, error } = await supabase.rpc("get_stats", { p_visitor: id });
        return error ? null : (data as Stats);
      } catch {
        return null;
      }
    })();
  }
  return shared;
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    loadStats().then(setStats);
  }, []);
  return stats; // null = belum siap/gagal -> UI sembunyikan angka
}

export function useLikes() {
  const stats = useStats();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const pending = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (stats) {
      setCounts(stats.likes);
      setMine(stats.mine);
      setReady(true);
    }
  }, [stats]);

  const toggle = useCallback(
    async (projectId: string) => {
      if (!ready || pending.current.has(projectId)) return; // cegah klik ganda
      pending.current.add(projectId);

      const prevMine = mine;
      const prevCounts = counts;
      const wasLiked = mine.includes(projectId);

      // optimistic
      setMine(wasLiked ? mine.filter((x) => x !== projectId) : [...mine, projectId]);
      setCounts({ ...counts, [projectId]: Math.max(0, (counts[projectId] ?? 0) + (wasLiked ? -1 : 1)) });

      try {
        const { data, error } = await supabase.rpc("toggle_like", {
          p_project: projectId,
          p_visitor: getVisitorId(),
        });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        setMine((m) =>
          row.liked ? (m.includes(projectId) ? m : [...m, projectId]) : m.filter((x) => x !== projectId)
        );
        setCounts((c) => ({ ...c, [projectId]: Number(row.total) }));
      } catch {
        setMine(prevMine); // rollback
        setCounts(prevCounts);
      } finally {
        pending.current.delete(projectId);
      }
    },
    [ready, mine, counts]
  );

  return { ready, counts, mine, toggle };
}