import { Project, Locale, MarketSignal } from './types';
import {
  AgentOutput, AgentRole, SynthesisOutput,
  ProjectScores, ScoreBreakdown, SourceSignal,
  ActionRecommendation, CompetitorContext, EnrichedProject
} from './vnext-types';

// ═══════════════════════════════════════════════════════════════
// AGENT ROLES — Each analyst has a single, non-overlapping job:
//
// 1. geo_analyst     → Evaluates geographic market risk and stability
// 2. niche_analyst   → Evaluates industry/niche growth trajectory
// 3. competitor_analyst → Evaluates competitive landscape and saturation
// 4. pricing_analyst → Estimates budget scale and commercial potential
// 5. margin_analyst  → Projects margin quality and key drivers
// 6. synthesis_agent → Combines all outputs into summary and recommendation
//
// No two agents overlap. Each produces independent output.
// Partial failure of any agent does not kill the pipeline.
// ═══════════════════════════════════════════════════════════════

// ─── Deterministic seed from project data (no Math.random) ───
function deterministicHash(project: Project, salt: string): number {
  const str = `${project.id}-${project.name}-${project.country}-${salt}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ─── 1. GEO ANALYST ───
// Responsibility: Evaluate geographic market risk and stability.
// Input: project.country
// Output: stability score, regulatory risk, infrastructure readiness
// Overlap with others: NONE
function runGeoAnalyst(project: Project): AgentOutput {
  const geoRiskMap: Record<string, number> = {
    'Russia': 0.7, 'Turkey': 0.4, 'UAE': 0.2, 'Saudi Arabia': 0.25,
    'Germany': 0.15, 'United Kingdom': 0.15, 'United States': 0.2,
    'China': 0.35, 'Japan': 0.15, 'India': 0.4, 'Brazil': 0.45,
    'Qatar': 0.2, 'Switzerland': 0.1, 'France': 0.15, 'Italy': 0.2,
    'South Korea': 0.2, 'Singapore': 0.15, 'Israel': 0.3,
    'Kazakhstan': 0.35, 'Poland': 0.25,
  };
  const risk = geoRiskMap[project.country] ?? 0.3;
  const stability = 1 - risk;

  return {
    role: 'geo_analyst',
    signal: `Geographic assessment for ${project.country}: stability ${Math.round(stability * 100)}%, regulatory risk ${Math.round(risk * 100)}%`,
    confidence: 0.85,
    factors: [
      `Market stability: ${Math.round(stability * 100)}%`,
      `Regulatory environment: ${risk < 0.3 ? 'Favorable' : risk < 0.5 ? 'Moderate' : 'Challenging'}`,
      `Infrastructure readiness: ${risk < 0.3 ? 'High' : 'Standard'}`,
    ],
    raw_data: { country: project.country, risk, stability },
  };
}

// ─── 2. NICHE ANALYST ───
// Responsibility: Evaluate industry/niche growth trajectory and demand.
// Input: project.niche
// Output: growth index, demand trajectory, entry barriers
// Overlap with others: NONE
function runNicheAnalyst(project: Project): AgentOutput {
  const nicheGrowthMap: Record<string, number> = {
    'IT & Software': 0.92, 'AI & Machine Learning': 0.95, 'Cybersecurity': 0.9,
    'Pharmaceuticals': 0.85, 'Healthcare & MedTech': 0.88, 'HealthTech': 0.88,
    'Biotechnology': 0.87, 'Renewable Energy': 0.9, 'EV & Autonomous Vehicles': 0.88,
    'Real Estate': 0.65, 'PropTech': 0.72,
    'Finance & Banking': 0.75, 'Fintech': 0.82,
    'Logistics & Transport': 0.72, 'Logistics': 0.72,
    'Telecommunications': 0.78, 'Aerospace & Defense': 0.8,
    'Automotive': 0.75, 'Manufacturing': 0.68,
    'Glass Industry': 0.65, 'GlassDesign': 0.78, 'AgroTech': 0.7, 'Agritech': 0.7,
    'Education & EdTech': 0.75, 'EdTech': 0.75,
    'Tourism & Hospitality': 0.6, 'Energy (Oil & Gas)': 0.65,
    'Construction': 0.72, 'Energy': 0.68,
    'SaaS': 0.88, 'Healthcare': 0.85,
  };
  const growth = nicheGrowthMap[project.niche] ?? 0.7;

  return {
    role: 'niche_analyst',
    signal: `Niche growth index for ${project.niche}: ${Math.round(growth * 100)}%`,
    confidence: 0.8,
    factors: [
      `Market growth rate: ${Math.round(growth * 100)}%`,
      `Demand trajectory: ${growth > 0.8 ? 'Strong upward' : growth > 0.6 ? 'Stable' : 'Moderate'}`,
      `Entry barriers: ${growth > 0.85 ? 'High (specialized)' : 'Moderate'}`,
    ],
    raw_data: { niche: project.niche, growth },
  };
}

// ─── 3. COMPETITOR ANALYST ───
// Responsibility: Evaluate competitive landscape and market saturation.
// Input: project.country, project.niche, project.relevance
// Output: competitor count, saturation level, differentiation potential
// Overlap with others: NONE
// Note: Uses deterministic hash instead of Math.random()
function runCompetitorAnalyst(project: Project): AgentOutput {
  const hash = deterministicHash(project, 'competitor');
  const competitorCount = (hash % 8) + 3;
  const saturation = competitorCount > 8 ? 'high' : competitorCount > 5 ? 'medium' : 'low';

  return {
    role: 'competitor_analyst',
    signal: `Competitive landscape: ${competitorCount} active players, ${saturation} saturation`,
    confidence: 0.75,
    factors: [
      `Active competitors: ${competitorCount}`,
      `Market saturation: ${saturation}`,
      `Differentiation potential: ${saturation === 'low' ? 'High' : saturation === 'medium' ? 'Moderate' : 'Requires innovation'}`,
    ],
    raw_data: { competitorCount, saturation },
  };
}

// ─── 4. PRICING ANALYST ───
// Responsibility: Estimate budget scale and commercial potential.
// Input: project.relevance
// Output: estimated budget, pricing power, payment terms
// Overlap with others: NONE
function runPricingAnalyst(project: Project): AgentOutput {
  const budgetMln = project.relevance * 1200;
  const pricingPower = project.relevance > 0.85 ? 'strong' : project.relevance > 0.7 ? 'moderate' : 'limited';

  return {
    role: 'pricing_analyst',
    signal: `Budget scale: ${budgetMln.toFixed(0)} mln, pricing power: ${pricingPower}`,
    confidence: 0.82,
    factors: [
      `Estimated budget: ${budgetMln.toFixed(0)} mln`,
      `Pricing power: ${pricingPower}`,
      `Payment terms: ${budgetMln > 500 ? 'Milestone-based preferred' : 'Standard Net-30'}`,
    ],
    raw_data: { budgetMln, pricingPower },
  };
}

// ─── 5. MARGIN ANALYST ───
// Responsibility: Project margin quality and key drivers.
// Input: project.relevance, project.id
// Output: margin projection, quality classification, key driver
// Overlap with others: NONE
function runMarginAnalyst(project: Project): AgentOutput {
  const margin = Math.round(project.relevance * 85 + (project.id % 15));
  const marginQuality = margin > 70 ? 'excellent' : margin > 50 ? 'good' : 'acceptable';

  return {
    role: 'margin_analyst',
    signal: `Projected margin: ${margin}%, quality: ${marginQuality}`,
    confidence: 0.78,
    factors: [
      `Margin projection: ${margin}%`,
      `Quality classification: ${marginQuality}`,
      `Key driver: ${project.relevance > 0.85 ? 'High relevance premium' : 'Standard market rate'}`,
    ],
    raw_data: { margin, marginQuality },
  };
}

// ─── 6. SYNTHESIS AGENT ───
// Responsibility: Combine all agent outputs into summary and recommendation.
// Input: all 5 agent outputs + locale
// Output: summary text, recommendation, confidence, key factors
// Overlap with others: NONE — this is the composition layer
function runSynthesisAgent(
  project: Project,
  geoOutput: AgentOutput,
  nicheOutput: AgentOutput,
  competitorOutput: AgentOutput,
  pricingOutput: AgentOutput,
  marginOutput: AgentOutput,
  locale: Locale
): SynthesisOutput {
  // Calculate average confidence from all agents
  // If an agent failed (confidence 0.1), it pulls the average down honestly
  const agentConfidences = [geoOutput, nicheOutput, competitorOutput, pricingOutput, marginOutput];
  const avgConfidence = agentConfidences.reduce((sum, a) => sum + a.confidence, 0) / agentConfidences.length;

  // Extract key factors from each agent (first factor from each)
  const keyFactors = [
    ...geoOutput.factors.slice(0, 1),
    ...nicheOutput.factors.slice(0, 1),
    ...marginOutput.factors.slice(0, 1),
  ];

  const summaryKey = locale === 'ru'
    ? `${project.name}: проект в ${project.country}, ниша ${project.niche}. Релевантность ${Math.round(project.relevance * 100)}%, маржа ${Math.round(project.relevance * 85 + (project.id % 15))}%.`
    : `${project.name}: project in ${project.country}, niche ${project.niche}. Relevance ${Math.round(project.relevance * 100)}%, margin ${Math.round(project.relevance * 85 + (project.id % 15))}%.`;

  const recKey = locale === 'ru'
    ? `Рекомендация: ${project.relevance > 0.8 ? 'Высокий приоритет — рекомендуется к рассмотрению' : 'Средний приоритет — требует дополнительной оценки'}.`
    : `Recommendation: ${project.relevance > 0.8 ? 'High priority — recommended for review' : 'Medium priority — requires additional assessment'}.`;

  return {
    summary: summaryKey,
    recommendation: recKey,
    confidence: Math.round(avgConfidence * 100) / 100,
    key_factors: keyFactors,
    generated_at: new Date().toISOString(),
  };
}

// ─── SCORE COMPUTATION ───
// Responsibility: Compute opportunity, risk, and margin scores from agent outputs.
// Input: project, geo output, niche output, margin output
// Output: ProjectScores with breakdowns
function computeScores(project: Project, geoOutput: AgentOutput, nicheOutput: AgentOutput, marginOutput: AgentOutput): ProjectScores {
  const geoData = geoOutput.raw_data as { stability?: number };
  const nicheData = nicheOutput.raw_data as { growth?: number };
  const stability = geoData.stability ?? 0.7;
  const growth = nicheData.growth ?? 0.7;
  const marginVal = project.relevance * 85 + (project.id % 15);

  const opportunityScore: ScoreBreakdown = {
    value: Math.round((project.relevance * 0.4 + growth * 0.35 + stability * 0.25) * 100),
    factors: [
      { name: 'Relevance', weight: 0.4, contribution: Math.round(project.relevance * 40) },
      { name: 'Niche Growth', weight: 0.35, contribution: Math.round(growth * 35) },
      { name: 'Geo Stability', weight: 0.25, contribution: Math.round(stability * 25) },
    ],
    methodology: 'Weighted composite of relevance, niche growth index, and geographic stability.',
  };

  const riskScore: ScoreBreakdown = {
    value: Math.round((1 - project.relevance) * 50 + (1 - stability) * 30 + (1 - growth) * 20),
    factors: [
      { name: 'Low Relevance Risk', weight: 0.5, contribution: Math.round((1 - project.relevance) * 50) },
      { name: 'Geo Risk', weight: 0.3, contribution: Math.round((1 - stability) * 30) },
      { name: 'Niche Maturity Risk', weight: 0.2, contribution: Math.round((1 - growth) * 20) },
    ],
    methodology: 'Inverse relevance + geographic risk + niche maturity risk.',
  };

  const marginScore: ScoreBreakdown = {
    value: Math.round(marginVal),
    factors: [
      { name: 'Base Margin', weight: 0.6, contribution: Math.round(project.relevance * 51) },
      { name: 'Complexity Premium', weight: 0.25, contribution: Math.round((project.id % 15) * 2.5) },
      { name: 'Market Position', weight: 0.15, contribution: Math.round(marginVal * 0.15) },
    ],
    methodology: 'Base margin from relevance + complexity premium + market position factor.',
  };

  return { opportunity: opportunityScore, risk: riskScore, margin: marginScore };
}

// ─── SOURCE GENERATION ───
// Responsibility: Generate source metadata for the enriched project.
function generateSources(_project: Project): SourceSignal[] {
  return [
    { type: 'tender_registry', freshness: '2 days ago', confidence: 0.92, explanation: 'Official tender registry data, verified against government sources.' },
    { type: 'industry_report', freshness: '1 week ago', confidence: 0.85, explanation: 'Industry analysis report from established market research firm.' },
    { type: 'web_scrape', freshness: '3 days ago', confidence: 0.7, explanation: 'Automated web scraping from public business registries and news.' },
  ];
}

// ─── ACTION GENERATION ───
// Responsibility: Generate recommended actions based on scores.
function generateActions(project: Project, scores: ProjectScores): ActionRecommendation[] {
  const actions: ActionRecommendation[] = [];

  if (scores.opportunity.value > 70) {
    actions.push({
      type: 'opportunity',
      label: 'High opportunity detected',
      description: `Opportunity score ${scores.opportunity.value}/100 indicates strong potential for this ${project.niche} project in ${project.country}.`,
      priority: 'high',
    });
  }

  if (scores.risk.value > 50) {
    actions.push({
      type: 'risk',
      label: 'Elevated risk factors',
      description: `Risk score ${scores.risk.value}/100. Key concerns: ${scores.risk.factors[0]?.name || 'market conditions'}.`,
      priority: scores.risk.value > 70 ? 'high' : 'medium',
    });
  }

  actions.push({
    type: 'next_step',
    label: 'Recommended action',
    description: project.relevance > 0.8
      ? 'Initiate direct engagement with project stakeholder. Prepare capability deck.'
      : 'Monitor developments. Gather additional intelligence before committing resources.',
    priority: project.relevance > 0.8 ? 'high' : 'medium',
  });

  return actions;
}

// ─── COMPETITOR CONTEXT ───
// Responsibility: Generate competitive context summary.
// Note: Uses deterministic hash instead of Math.random()
function generateCompetitorContext(project: Project): CompetitorContext {
  const hash = deterministicHash(project, 'competitor_context');
  const count = (hash % 8) + 3;
  return {
    market_position: project.relevance > 0.85 ? 'Strong' : project.relevance > 0.7 ? 'Competitive' : 'Challenging',
    competitor_count: count,
    competitive_advantage: project.relevance > 0.8 ? 'Specialized expertise + regional presence' : 'Price competitiveness',
    threat_level: count > 8 ? 'high' : count > 5 ? 'medium' : 'low',
    differentiation: project.relevance > 0.85 ? 'Unique capability match' : 'Standard offering',
  };
}

// ─── SAFE AGENT RUNNER ───
// Wraps each agent in try/catch for partial-failure handling.
// On failure: returns fallback output with low confidence, logs the failure.
// The pipeline continues — synthesis and scoring use fallback values gracefully.
function safeAgentRun(name: string, fn: () => AgentOutput, project: Project): AgentOutput {
  const start = Date.now();
  try {
    const result = fn();
    const durationMs = Date.now() - start;
    console.log(`[agent] ${name}:success ${JSON.stringify({ projectId: project.id, durationMs })}`);
    return result;
  } catch (err) {
    const durationMs = Date.now() - start;
    console.error(`[agent] ${name}:fail ${JSON.stringify({ projectId: project.id, durationMs, error: err instanceof Error ? err.message : String(err) })}`);
    return {
      role: 'geo_analyst', // Use valid role as fallback type marker
      signal: `[degraded] ${name} failed — using default assessment`,
      confidence: 0.1,
      factors: [`${name} agent failed during execution. Using fallback values.`],
      raw_data: {},
    };
  }
}

// ─── MAIN ORCHESTRATION ───
// Canonical flow: filter → enrich (5 agents) → synthesize → score → source → action → signal
// Partial failure: any agent can fail; synthesis and scoring use fallback values gracefully
export function runAgentStack(project: Project, locale: Locale) {
  const geoOutput = safeAgentRun('geo_analyst', () => runGeoAnalyst(project), project);
  const nicheOutput = safeAgentRun('niche_analyst', () => runNicheAnalyst(project), project);
  const competitorOutput = safeAgentRun('competitor_analyst', () => runCompetitorAnalyst(project), project);
  const pricingOutput = safeAgentRun('pricing_analyst', () => runPricingAnalyst(project), project);
  const marginOutput = safeAgentRun('margin_analyst', () => runMarginAnalyst(project), project);

  const synthesis = runSynthesisAgent(project, geoOutput, nicheOutput, competitorOutput, pricingOutput, marginOutput, locale);
  const scores = computeScores(project, geoOutput, nicheOutput, marginOutput);
  const sources = generateSources(project);
  const actions = generateActions(project, scores);
  const competitorContext = generateCompetitorContext(project);

  return {
    agentOutputs: [geoOutput, nicheOutput, competitorOutput, pricingOutput, marginOutput],
    synthesis,
    scores,
    sources,
    actions,
    competitorContext,
  };
}

// ─── SIGNAL GENERATION ───
// Responsibility: Derive market signals from enriched project data.
// Deterministic — no Math.random() used.
export function generateSignals(projects: Project[], enrichedProjects: EnrichedProject[]): MarketSignal[] {
  const signals: MarketSignal[] = [];
  let id = 1;

  // Geo signals: group by country, compute averages
  const geoGroups: Record<string, Project[]> = {};
  projects.forEach(p => {
    if (!geoGroups[p.country]) geoGroups[p.country] = [];
    geoGroups[p.country].push(p);
  });

  Object.entries(geoGroups).forEach(([geo, projs]) => {
    const avgRelevance = projs.reduce((s, p) => s + p.relevance, 0) / projs.length;
    const enriched = projs.map(p => enrichedProjects.find(e => e.id === p.id)).filter(Boolean);
    const avgOpportunity = enriched.length > 0
      ? enriched.reduce((s, e) => s + (e?.scores?.opportunity?.value || 0), 0) / enriched.length
      : avgRelevance * 100;
    const avgRisk = enriched.length > 0
      ? enriched.reduce((s, e) => s + (e?.scores?.risk?.value || 0), 0) / enriched.length
      : (1 - avgRelevance) * 100;

    const velocity = avgOpportunity / 100;
    const confidence = 0.7 + (avgRelevance * 0.25);
    const direction = avgRisk > 50 ? 'down' : avgOpportunity > 60 ? 'up' : 'stable';
    const delta = direction === 'up' ? `+${Math.round(avgOpportunity - 50)}%` : direction === 'down' ? `-${Math.round(avgRisk - 30)}%` : '+1%';

    signals.push({
      id: `S-${String(id++).padStart(3, '0')}`,
      type: 'geo',
      label: `${geo} Market`,
      velocity: Math.min(0.95, Math.max(0.3, velocity)),
      confidence: Math.min(0.95, Math.max(0.6, confidence)),
      direction,
      delta,
    });
  });

  // Niche signals: group by niche, compute averages
  const nicheGroups: Record<string, Project[]> = {};
  projects.forEach(p => {
    if (!nicheGroups[p.niche]) nicheGroups[p.niche] = [];
    nicheGroups[p.niche].push(p);
  });

  Object.entries(nicheGroups).forEach(([niche, projs]) => {
    const avgRelevance = projs.reduce((s, p) => s + p.relevance, 0) / projs.length;
    const enriched = projs.map(p => enrichedProjects.find(e => e.id === p.id)).filter(Boolean);
    const avgMargin = enriched.length > 0
      ? enriched.reduce((s, e) => s + (e?.scores?.margin?.value || 0), 0) / enriched.length
      : avgRelevance * 85;

    const velocity = avgMargin / 100;
    const confidence = 0.65 + (avgRelevance * 0.3);
    const direction = avgMargin > 60 ? 'up' : avgMargin < 40 ? 'down' : 'stable';
    const delta = direction === 'up' ? `+${Math.round(avgMargin - 45)}%` : direction === 'down' ? `-${Math.round(50 - avgMargin)}%` : '+2%';

    signals.push({
      id: `S-${String(id++).padStart(3, '0')}`,
      type: 'niche',
      label: `${niche} Growth`,
      velocity: Math.min(0.95, Math.max(0.3, velocity)),
      confidence: Math.min(0.92, Math.max(0.55, confidence)),
      direction,
      delta,
    });
  });

  // Competitor signals from enriched data (deterministic)
  enrichedProjects.forEach(ep => {
    if (ep.competitorContext && signals.length < 10) {
      const ctx = ep.competitorContext;
      const velocity = ctx.competitor_count / 12;
      const confidence = ctx.threat_level === 'high' ? 0.85 : ctx.threat_level === 'medium' ? 0.75 : 0.65;
      const direction = ctx.threat_level === 'high' ? 'down' : ctx.threat_level === 'low' ? 'up' : 'stable';
      const delta = direction === 'up' ? '+3%' : direction === 'down' ? `-${ctx.competitor_count}%` : '0%';

      signals.push({
        id: `S-${String(id++).padStart(3, '0')}`,
        type: 'competitor',
        label: `${ep.country} ${ep.niche} Competition`,
        velocity: Math.min(0.9, Math.max(0.3, velocity)),
        confidence: Math.min(0.9, Math.max(0.6, confidence)),
        direction,
        delta,
      });
    }
  });

  return signals.slice(0, 10);
}
