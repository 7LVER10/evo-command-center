import { getDb, seedDatabase } from './db';
import type { Project, AnalysisResult, ProjectStatus } from './types';

export function getAllProjects(): Project[] {
  const db = getDb();
  seedDatabase(db);
  const rows = db.prepare('SELECT * FROM projects ORDER BY id').all() as Project[];
  return rows;
}

export function getFilteredProjects(
  query: string,
  country: string,
  niche: string,
  stage: string
): Project[] {
  const db = getDb();
  seedDatabase(db);

  let sql = 'SELECT * FROM projects WHERE 1=1';
  const params: (string | number)[] = [];

  if (query) {
    sql += ' AND (name LIKE ? OR country LIKE ? OR niche LIKE ? OR grp LIKE ?)';
    const q = `%${query}%`;
    params.push(q, q, q, q);
  }
  if (country && country !== 'all') {
    sql += ' AND country = ?';
    params.push(country);
  }
  if (niche && niche !== 'all') {
    sql += ' AND niche = ?';
    params.push(niche);
  }
  if (stage && stage !== 'all') {
    sql += ' AND stage = ?';
    params.push(stage);
  }

  sql += ' ORDER BY id';
  return db.prepare(sql).all(...params) as Project[];
}

export function runAnalysis(
  query: string,
  country: string,
  niche: string,
  stage: string
): AnalysisResult {
  const items = getFilteredProjects(query, country, niche, stage);
  const total = items.length;
  const avgRelevance = total > 0
    ? parseFloat((items.reduce((a, c) => a + c.relevance, 0) / total).toFixed(2))
    : 0;
  const highPriorityCount = items.filter(p => p.priority === 'high').length;

  return { items, metrics: { total, avgRelevance, highPriorityCount } };
}

export function updateProjectStatus(id: number, status: ProjectStatus): void {
  const db = getDb();
  db.prepare("UPDATE projects SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
}

export function deleteProject(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}
