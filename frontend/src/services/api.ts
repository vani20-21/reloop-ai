import {
  ProductAnalysisRequest,
  WhatIfRequest,
  RecommendationResponse,
  SessionSummary,
  CategoryMetadata,
  EvaluationBenchmarkResult,
  HealthStatusResponse,
} from '../types';

const API_BASE = '/api/v1';

export async function analyzeProduct(request: ProductAnalysisRequest): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail || `Analysis failed (HTTP ${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export async function whatIfAnalysis(request: WhatIfRequest): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail || `What-if re-evaluation failed (HTTP ${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export async function getHistory(): Promise<SessionSummary[]> {
  const res = await fetch(`${API_BASE}/history?limit=25`);
  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
}

export async function getHistoryDetail(sessionId: string): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/history/${sessionId}`);
  if (!res.ok) throw new Error('Failed to load session details');
  return res.json();
}

export async function getCategories(): Promise<CategoryMetadata[]> {
  const res = await fetch(`${API_BASE}/knowledge/categories`);
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function runBenchmark(): Promise<EvaluationBenchmarkResult> {
  const res = await fetch(`${API_BASE}/evaluate/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to run benchmark');
  }
  return res.json();
}

export async function getHealth(): Promise<HealthStatusResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend offline');
  return res.json();
}
