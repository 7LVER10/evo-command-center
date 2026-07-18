import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'evo.db');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let _db: Database.Database | null = null;
let _initialized = false;

export function getDb(): Database.Database {
  if (!_db) {
    const start = Date.now();
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);

    const count = _db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number };
    if (count.c === 0) {
      logger.info('db', 'init:seed_required', { reason: 'projects table empty' });
      seedDatabase(_db);
      logger.info('db', 'init:seed_complete', { durationMs: Date.now() - start });
    } else {
      logger.info('db', 'init:seed_skipped', { reason: 'projects table has data', rowCount: count.c });
    }

    _initialized = true;
    logger.info('db', 'init:complete', { durationMs: Date.now() - start });
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      niche TEXT NOT NULL,
      grp TEXT NOT NULL,
      relevance REAL NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'active',
      stage TEXT NOT NULL DEFAULT 'intake',
      summary_en TEXT NOT NULL DEFAULT '',
      summary_ru TEXT NOT NULL DEFAULT '',
      summary_de TEXT NOT NULL DEFAULT '',
      summary_tr TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analysis_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL DEFAULT '',
      country_filter TEXT NOT NULL DEFAULT 'all',
      niche_filter TEXT NOT NULL DEFAULT 'all',
      group_filter TEXT NOT NULL DEFAULT 'all',
      result_count INTEGER NOT NULL DEFAULT 0,
      avg_relevance REAL NOT NULL DEFAULT 0,
      high_priority_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analysis_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      geo TEXT NOT NULL DEFAULT 'all',
      niche TEXT NOT NULL DEFAULT 'all',
      query TEXT NOT NULL DEFAULT '',
      result_count INTEGER NOT NULL DEFAULT 0,
      avg_opportunity INTEGER NOT NULL DEFAULT 0,
      avg_risk INTEGER NOT NULL DEFAULT 0,
      avg_margin INTEGER NOT NULL DEFAULT 0,
      top_project_id INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analysis_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT NOT NULL DEFAULT 'owner',
      filters_summary TEXT NOT NULL DEFAULT '{}',
      locale TEXT NOT NULL DEFAULT 'en',
      cache_status TEXT NOT NULL DEFAULT 'miss',
      project_count INTEGER NOT NULL DEFAULT 0,
      signal_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'success',
      duration_ms INTEGER NOT NULL DEFAULT 0,
      error_summary TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

const AUDIT_MAX_ROWS = 500;
const HISTORY_MAX_ROWS = 200;

function pruneAuditTable(db: Database.Database) {
  try {
    const count = db.prepare('SELECT COUNT(*) as c FROM analysis_audits').get() as { c: number };
    if (count.c > AUDIT_MAX_ROWS) {
      const deleted = db.prepare(`DELETE FROM analysis_audits WHERE id NOT IN (SELECT id FROM analysis_audits ORDER BY id DESC LIMIT ?)`).run(AUDIT_MAX_ROWS);
      logger.info('db', 'audit.retention.prune', { deleted: deleted.changes });
    }
  } catch (err) {
    logger.warn('db', 'audit.retention.prune_failed', { error: err instanceof Error ? err.message : String(err) });
  }
}

function pruneHistoryTable(db: Database.Database) {
  try {
    const count = db.prepare('SELECT COUNT(*) as c FROM analysis_history').get() as { c: number };
    if (count.c > HISTORY_MAX_ROWS) {
      const deleted = db.prepare(`DELETE FROM analysis_history WHERE id NOT IN (SELECT id FROM analysis_history ORDER BY id DESC LIMIT ?)`).run(HISTORY_MAX_ROWS);
      logger.info('db', 'history.retention.prune', { deleted: deleted.changes });
    }
  } catch (err) {
    logger.warn('db', 'history.retention.prune_failed', { error: err instanceof Error ? err.message : String(err) });
  }
}

export function insertAnalysisAudit(record: {
  actor?: string;
  filtersSummary: string;
  locale: string;
  cacheStatus: string;
  projectCount: number;
  signalCount: number;
  status: string;
  durationMs: number;
  errorSummary?: string;
}) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO analysis_audits (actor, filters_summary, locale, cache_status, project_count, signal_count, status, duration_ms, error_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.actor || 'owner',
      record.filtersSummary,
      record.locale,
      record.cacheStatus,
      record.projectCount,
      record.signalCount,
      record.status,
      record.durationMs,
      record.errorSummary || null
    );
    pruneAuditTable(db);
  } catch (err) {
    logger.error('db', 'audit_insert_failed', { error: err instanceof Error ? err.message : String(err) });
  }
}

export function insertHistoryEntry(record: {
  geo: string;
  niche: string;
  query: string;
  result_count: number;
  avg_opportunity: number;
  avg_risk: number;
  avg_margin: number;
  top_project_id: number;
}) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO analysis_history (geo, niche, query, result_count, avg_opportunity, avg_risk, avg_margin, top_project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(record.geo, record.niche, record.query, record.result_count, record.avg_opportunity, record.avg_risk, record.avg_margin, record.top_project_id);
    pruneHistoryTable(db);
  } catch (err) {
    logger.error('db', 'history_insert_failed', { error: err instanceof Error ? err.message : String(err) });
  }
}

export function getHistoryEntries(limit = 100): Array<{
  id: number;
  geo: string;
  niche: string;
  query: string;
  result_count: number;
  avg_opportunity: number;
  avg_risk: number;
  avg_margin: number;
  top_project_id: number;
  created_at: string;
}> {
  const db = getDb();
  return db.prepare('SELECT * FROM analysis_history ORDER BY id DESC LIMIT ?').all(limit) as any[];
}

export function deleteHistoryEntry(id: number) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM analysis_history WHERE id = ?').run(id);
  } catch (err) {
    logger.error('db', 'history_delete_failed', { error: err instanceof Error ? err.message : String(err) });
  }
}

export function clearHistoryEntries() {
  try {
    const db = getDb();
    db.prepare('DELETE FROM analysis_history').run();
  } catch (err) {
    logger.error('db', 'history_clear_failed', { error: err instanceof Error ? err.message : String(err) });
  }
}

export function seedDatabase(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT INTO projects (name, country, niche, grp, relevance, priority, status, stage, summary_en, summary_ru, summary_de, summary_tr)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const projects = [
    ['Северсталь-Цифра', 'Russia', 'Manufacturing', 'Enterprise', 0.88, 'high', 'active', 'scoring', 'Digital transformation assessment for Severstal.', 'Цифровая трансформация Северстали.', 'Digitale Transformation der Severstal.', 'Severstal dijital dönüşüm değerlendirmesi.'],
    ['TechFlow Systems', 'Germany', 'SaaS', 'Mid-Market', 0.82, 'high', 'active', 'synthesis', 'SaaS platform scaling analysis.', 'Анализ масштабирования SaaS платформы.', 'SaaS-Plattform-Skalierungsanalyse.', 'SaaS platform ölçeklendirme analizi.'],
    ['АльфаЛогистик', 'Russia', 'Logistics', 'Enterprise', 0.79, 'medium', 'active', 'enrichment', 'Logistics network optimization review.', 'Обзор оптимизации логистической сети.', 'Logistiknetzwerk-Optimierungsüberprüfung.', 'Lojistik ağ optimizasyonu incelemesi.'],
    ['Istanbul FinTech', 'Turkey', 'Fintech', 'Mid-Market', 0.75, 'medium', 'pending', 'intake', 'Fintech regulatory compliance check.', 'Проверка соответствия нормативам FinTech.', 'FinTech-Compliance-Prüfung.', 'FinTech düzenleyici uyumluluk kontrolü.'],
    ['KazAgro Digital', 'Kazakhstan', 'AgroTech', 'SMB', 0.71, 'medium', 'active', 'scoring', 'Agritech modernization assessment.', 'Оценка модернизации agritech.', 'Agritech-Modernisierungsbewertung.', 'Agritech modernizasyon değerlendirmesi.'],
    ['Gulf PropVentures', 'UAE', 'PropTech', 'Mid-Market', 0.85, 'high', 'active', 'synthesis', 'Real estate technology investment review.', 'Обзор инвестиций в proptech.', 'Immobilien-Technologie-Investitionsprüfung.', 'Gayrimenkul teknolojisi yatırım incelemesi.'],
    ['MedLine AI', 'United States', 'HealthTech', 'Enterprise', 0.91, 'high', 'active', 'review', 'Healthcare AI deployment readiness.', 'Готовность внедрения AI в здравоохранении.', 'Gesundheitswesen AI-Bereitschaft.', 'Sağlık sektörü AI uygulama hazırlığı.'],
    ['EduSphere Pro', 'Poland', 'EdTech', 'SMB', 0.68, 'low', 'pending', 'intake', 'EdTech market expansion analysis.', 'Анализ расширения рынка EdTech.', 'EdTech-Markterweiterungsanalyse.', 'EdTech pazar genişletme analizi.'],
    ['БалтПром', 'Russia', 'Manufacturing', 'Mid-Market', 0.77, 'medium', 'active', 'enrichment', 'Industrial automation assessment.', 'Оценка автоматизации производства.', 'Industrie-Automatisierungsbewertung.', 'Endüstriyel otomasyon değerlendirmesi.'],
    ['BerlinStack', 'Germany', 'SaaS', 'Enterprise', 0.89, 'high', 'active', 'scoring', 'Enterprise SaaS growth analysis.', 'Анализ роста enterprise SaaS.', 'Enterprise SaaS-Wachstumsanalyse.', 'Kurumsal SaaS büyüme analizi.'],
    ['LogiTrans KZ', 'Kazakhstan', 'Logistics', 'SMB', 0.65, 'low', 'archived', 'export-ready', 'Cross-border logistics optimization.', 'Оптимизация трансграничной логистики.', 'Grenzüberschreitende Logistikoptimierung.', 'Sınır ötesi lojistik optimizasyonu.'],
    ['AnatoliaPay', 'Turkey', 'Fintech', 'Mid-Market', 0.83, 'high', 'active', 'synthesis', 'Digital payment ecosystem review.', 'Обзор экосистемы цифровых платежей.', 'Digitales Zahlungssystem-Review.', 'Dijital ödeme ekosistemi incelemesi.'],
    ['São Paulo Agro', 'Brazil', 'AgroTech', 'Enterprise', 0.76, 'medium', 'active', 'scoring', 'Agritech scalability assessment.', 'Оценка масштабируемости agritech.', 'Agritech-Skalierbarkeitsbewertung.', 'Agritech ölçeklenebilirlik değerlendirmesi.'],
    ['Dubai Estates', 'UAE', 'PropTech', 'Enterprise', 0.87, 'high', 'active', 'review', 'PropTech deployment strategy.', 'Стратегия внедрения proptech.', 'PropTech-Bereitstellungsstrategie.', 'PropTech uygulama stratejisi.'],
    ['Warsaw SaaS Lab', 'Poland', 'SaaS', 'SMB', 0.62, 'low', 'pending', 'intake', 'SaaS product-market fit analysis.', 'Анализ product-market fit SaaS.', 'SaaS Product-Market-Fit-Analyse.', 'SaaS ürün-pazar uyumu analizi.'],
    ['ТехноПром', 'Russia', 'Manufacturing', 'Enterprise', 0.92, 'high', 'active', 'export-ready', 'Industrial IoT readiness assessment.', 'Оценка готовности промышленного IoT.', 'Industrielles IoT-Bereitschaftsbewertung.', 'Endüstriyel IoT hazırlık değerlendirmesi.'],
    ['HealthBridge DE', 'Germany', 'HealthTech', 'Mid-Market', 0.78, 'medium', 'active', 'enrichment', 'Healthcare data integration review.', 'Обзор интеграции данных здравоохранения.', 'Gesundheitsdaten-Integrationsprüfung.', 'Sağlık verisi entegrasyonu incelemesi.'],
    ['FinEdge US', 'United States', 'Fintech', 'Enterprise', 0.94, 'high', 'active', 'synthesis', 'Fintech innovation pipeline assessment.', 'Оценка инновационного pipeline FinTech.', 'FinTech-Innovations-Pipeline-Bewertung.', 'FinTech inovasyon hattı değerlendirmesi.'],
    ['GlassVision Arch', 'Turkey', 'GlassDesign', 'Enterprise', 0.87, 'high', 'active', 'synthesis', 'Architectural glass facade system design and production.', 'Проектирование и производство архитектурных стеклянных фасадных систем.', 'Planung und Produktion architektonischer Glasfassadensysteme.', 'Mimari cam cephe sistemi tasarımı ve üretimi.'],
    ['Dubai Facade Studio', 'UAE', 'GlassDesign', 'Mid-Market', 0.82, 'high', 'active', 'scoring', 'Premium hotel glass partition and facade solutions.', 'Премиальные стеклянные перегородки и фасадные решения для отелей.', 'Premium-Hotel-Glaswände und Fassadenlösungen.', 'Premium otel cam bölme ve cephe çözümleri.'],
    ['Alanya Cam Premium', 'Turkey', 'GlassDesign', 'Mid-Market', 0.79, 'medium', 'active', 'enrichment', 'Designer glass tableware and decorative production.', 'Дизайнерская стеклянная посуда и декоративное производство.', 'Designer-Glasmöbel und dekorative Produktion.', 'Tasarımcı cam sofra takımı ve dekoratif üretim.'],
    ['Balkan Construct', 'Turkey', 'Construction', 'Enterprise', 0.81, 'high', 'active', 'scoring', 'Construction materials procurement and supply chain.', 'Закупки строительных материалов и цепочка поставок.', 'Beschaffung von Baustoffen und Lieferkette.', 'İnşaat malzemesi tedarik ve tedarik zinciri.'],
    ['KazEnergy Systems', 'Kazakhstan', 'Energy', 'Mid-Market', 0.74, 'medium', 'pending', 'intake', 'Energy infrastructure modernization assessment.', 'Оценка модернизации энергетической инфраструктуры.', 'Bewertung der Modernisierung der Energieinfrastruktur.', 'Enerji altyapısı modernizasyon değerlendirmesi.'],
  ];

  const insertMany = db.transaction(() => {
    for (const p of projects) insert.run(...p);
  });
  insertMany();
}
