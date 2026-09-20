# ReLoop AI — Technical Audit Report (Phases 1–4)
**Audit Target:** Current ReLoop AI Implementation against Approved Requirements  
**Date:** September 18, 2026  
**Auditor:** Lead Systems Architect & Senior AI/ML Safety Auditor  
**Audit Scope:** Backend Architecture, LLM Abstraction, RAG Retrieval, Guardrails, Knowledge Base, Evaluation Suite, and Frontend Integration  

---

## A. Executive Summary

A comprehensive source-code and runtime audit of ReLoop AI was conducted across all implemented components in `backend/`, `frontend/`, `tests/`, and project documentation. 

### Key Findings:
1. **End-to-End Functionality Exists:** A working, full-stack application is in place. The React frontend interacts with the FastAPI backend over REST (`/api/v1/analyze`, `/api/v1/what-if`, `/api/v1/history`, `/api/v1/evaluate/run`), and SQLite persists session state in WAL mode.
2. **Real LLM Integration is Implemented but Dependent on Keys:** Real LLM reasoning is implemented via [`GeminiClient`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/gemini_client.py#L8-L52) and [`OpenAIClient`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/openai_client.py#L8-L41). However, when no API key is provided, the system silently falls back to [`MockDeterministicClient`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/mock_client.py#L7-L201).
3. **The Fallback Client is a Pure Rule-Based Engine:** The default offline mock client completely bypasses RAG evidence and uses hardcoded keyword matching and deterministic if-else rules.
4. **Discrepancy in Vector Architecture (Sparse TF-IDF vs. Dense Embeddings):** While [`README.md`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/README.md#L153) and [`implementation_plan.md`](file:///C:/Users/Admin/.gemini/antigravity-ide/brain/85972a54-8e50-4f65-9edb-a020eb6d1e20/implementation_plan.md#L108) claim an "Embedded Local Vector Store (ChromaDB / SQLite-vec) with local embeddings (fastembed / MiniLM)", the actual implementation in [`vector_store.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/rag/vector_store.py#L57-L115) uses `scikit-learn`'s `TfidfVectorizer` (sparse n-gram bag-of-words) and `cosine_similarity`.
5. **Collapsed Orchestration Pipeline:** The promised 3-stage orchestration pipeline (Stage 1: Intent/Condition Extractor $\to$ Stage 2: Category Filtered RAG Retrieval $\to$ Stage 3: Decision Synthesizer) is collapsed in [`orchestrator.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/orchestrator.py#L48-L91). Retrieval is performed directly on raw input without prior AI entity extraction (`extracted_product=""`), and extraction and reasoning are combined into a single LLM call.
6. **Confidence Scores are Uncalibrated / LLM-Fabricated:** Confidence scores are not derived from vector similarity margins, token probabilities, or calibration curves; they are directly requested from the LLM prompt or hardcoded in the mock client.
7. **Evaluation Harness Metric Inflation:** In [`run_benchmark.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/tests/run_benchmark.py#L68-L97), metrics for `retrieval_relevance_rate` and `evidence_grounding_score` are formulated such that they are tautologically 100% when run, and the existing `evaluation_report.json` was evaluated against the mock rule-engine rather than a live LLM.

### Executive Severity Breakdown
- **CRITICAL:** 1
- **HIGH:** 3
- **MEDIUM:** 5
- **LOW:** 3
- **PASS:** 8

---

## B. Architecture Verification

| Component | Audit Check | Result | Severity |
| :--- | :--- | :--- | :--- |
| **Clean Separation of Concerns** | Layering between API, Orchestrator, RAG, LLM, and DB | Verified | **PASS** |
| **Pipeline Stage Decoupling** | 3-stage pipeline (Extract $\to$ Retrieve $\to$ Reason) | Collapsed into 2 stages | **MEDIUM** |
| **Local Persistence** | SQLite connection with WAL mode and session schema | Verified | **PASS** |

### Detailed Analysis
- **Layering:** The separation across modules is well structured:
  - [`backend/app/api/routes.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/api/routes.py) handles HTTP requests, response mapping, and exception handling.
  - [`backend/app/core/orchestrator.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/orchestrator.py) manages orchestration.
  - [`backend/app/db/repository.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/db/repository.py) manages SQLite queries via [`get_db_connection()`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/db/database.py#L5-L12).
- **Orchestration Collapse:** In [`CircularAIOrchestrator.analyze_product`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/orchestrator.py#L45-L56), Stage 1 entity extraction is skipped. Retrieval is triggered immediately using:
  ```python
  retrieved_chunks: List[RetrievedChunk] = self.retriever.retrieve(
      extracted_product="",
      detected_category=category_hint,
      symptoms_and_condition=request.product_description,
      top_k=3
  )
  ```
  This means if the user does not provide `category_hint`, the retriever receives `detected_category=None` and cannot pre-filter knowledge by category before scoring.

---

## C. LLM Verification

| Component | Audit Check | Result | Severity |
| :--- | :--- | :--- | :--- |
| **Real LLM Reasoning** | Real LLM client exists and formats valid system/user prompts | Verified | **PASS** |
| **Provider Support** | Supports Gemini and OpenAI | Verified | **PASS** |
| **Advertised vs. Actual Providers** | README advertised Claude, Groq, Ollama | Missing in code | **LOW** |
| **Fallback Behavior** | Behavior when API key is missing or unset | Falls back to rule-based mock | **HIGH** |

### Detailed Analysis
- **Real LLM Execution:**
  - [`GeminiClient`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/gemini_client.py#L8-L52) calls `https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent` with `response_mime_type="application/json"`, passing system instructions and structured prompts.
  - [`OpenAIClient`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/openai_client.py#L8-L41) calls `https://api.openai.com/v1/chat/completions` with `response_format={"type": "json_object"}`.
- **Provider Missing Coverage:** [`README.md`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/README.md#L44) states *"Supports Gemini, OpenAI, Claude, Groq, Ollama"*. In [`backend/app/llm/__init__.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/__init__.py#L8-L16), only Gemini, OpenAI, and Mock are supported. Claude, Groq, and Ollama clients are not implemented.
- **Silent Fallback to Mock:** In [`get_llm_client()`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/__init__.py#L8-L16):
  ```python
  if provider == "gemini" or (provider == "auto" and os.getenv("GEMINI_API_KEY")):
      return GeminiClient()
  elif provider == "openai" or (provider == "auto" and os.getenv("OPENAI_API_KEY")):
      return OpenAIClient()
  else:
      return MockDeterministicClient()
  ```
  If neither API key is set, the system runs with `MockDeterministicClient` without failing or raising a warning in the backend console.

---

## D. RAG Verification

| Component | Audit Check | Result | Severity |
| :--- | :--- | :--- | :--- |
| **Runtime RAG Execution** | Evidence retrieved and injected into prompt | Verified | **PASS** |
| **Vector Store Technology** | Advertised as ChromaDB / SQLite-vec with MiniLM | Implemented as TF-IDF + Cosine | **HIGH** |
| **Evidence Injection Formatting** | Evidence structured with clear citations | Verified | **PASS** |
| **RAG Utilization by Mock** | Fallback client reasoning over retrieved RAG | Completely ignored in mock | **CRITICAL** |

### Detailed Analysis
- **Runtime Retrieval:** In [`CircularAIOrchestrator.analyze_product`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/orchestrator.py#L50-L71), chunks are retrieved from [`SustainabilityRetriever`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/rag/retriever.py#L4-L35) and formatted by [`format_evidence_for_prompt`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/rag/retriever.py#L37-L56). The formatted block is injected directly into `user_prompt`.
- **Vector Search Reality:** In [`backend/app/rag/vector_store.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/rag/vector_store.py#L57-L77), `LocalVectorStore` uses:
  ```python
  self.vectorizer = TfidfVectorizer(
      stop_words="english",
      ngram_range=(1, 2),
      sublinear_tf=True,
      max_df=0.95
  )
  ```
  This is a lexical n-gram TF-IDF index serialized into `data/vector_index.pkl`. It does not use dense vector embeddings (e.g. `sentence-transformers` or `all-MiniLM-L6-v2`). While TF-IDF is zero-dependency, lightweight, and deterministic, it is technically a sparse keyword index, not a semantic dense vector store as described in the README.
- **RAG Ignored in Mock Client:** In [`MockDeterministicClient.generate_json`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/mock_client.py#L15-L21), the code extracts only `<product_query>` and disregards the retrieved evidence block entirely.

---

## E. Recommendation Logic Verification

| Component | Audit Check | Result | Severity |
| :--- | :--- | :--- | :--- |
| **AI vs Rule-Based Recommendation (Live)** | LLM generates recommendation when live | Verified | **PASS** |
| **AI vs Rule-Based Recommendation (Fallback)** | Fallback recommendation generation | 100% hardcoded rules | **CRITICAL** |
| **Waste Hierarchy Prioritization** | Product Life Extension prioritized before recycling | Verified in prompt & heuristics | **PASS** |
| **What-If Dynamic Re-evaluation** | Mutated conditions re-evaluate the decision | Verified | **PASS** |

### Detailed Analysis
- **Live LLM Reasoning:** When using `GeminiClient` or `OpenAIClient`, the decision is genuinely synthesized by the LLM following [`SYSTEM_PROMPT_CIRCULAR_INTELLIGENCE`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/orchestrator.py#L19-L38). The LLM determines the primary pathway, evaluates trade-offs, and drafts next steps.
- **Fallback Rule Engine:** In [`MockDeterministicClient`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/mock_client.py#L100-L138), the logic consists entirely of:
  ```python
  if is_hazard:
      ...
  elif any(w in text_lower for w in ["salt water", "spilled", ...]):
      recommended_pathway = CircularPathway.RECYCLE
  elif any(w in text_lower for w in ["crumb", "scale", "limescale", ...]):
      recommended_pathway = CircularPathway.CONTINUE_USING
  elif any(w in text_lower for w in ["fast-fashion", ...]):
      recommended_pathway = CircularPathway.REPURPOSE
  ...
  ```
  This violates the core project specification: *"Do NOT implement the core recommendation system as a collection of if/else rules."* When operating without API keys, ReLoop AI behaves entirely as a rule-based system.

---

## F. Guardrails Verification

| Component | Audit Check | Result | Severity |
| :--- | :--- | :--- | :--- |
| **Safety Hazard Detection** | Detects batteries, frayed cords, sparking, mold | Verified | **PASS** |
| **Safety Override Behavior** | Overrides dangerous DIY advice with certified disposal | Verified | **PASS** |
| **Factuality & Fake Statistics Audit** | Scans and redacts ungrounded numbers ($/CO2/H2O) | Verified | **PASS** |
| **Disclaimer Insertion** | Standard disclaimer appended to responses | Verified | **PASS** |

### Detailed Analysis
- **Hazard Interception:** [`ResponsibleAIGuardrail.inspect_hazards`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/guardrails.py#L31-L38) uses regexes ([`HAZARD_PATTERNS`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/guardrails.py#L6-L21)) covering swollen batteries, exposed mains wires, arcing/sparks, microwave internal disassembly, and toxic mold.
- **Safety Interdiction:** In [`ResponsibleAIGuardrail.sanitize_and_calibrate`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/guardrails.py#L74-L82), if a hazard is detected and the LLM recommended `continue_using` or `repair`, the pathway is overridden to `recycle` (or qualified electrical/pro repair), and `severity_level` is forced to `critical_hazard`.
- **Claim Auditor:** In [`ResponsibleAIGuardrail.audit_unsupported_claims`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/guardrails.py#L41-L56), any numerical statistic matching CO2 emissions, currency values, or water volumes that does not literally appear in `retrieved_sources` is flagged and replaced with a redaction token ([`guardrails.py:L90-L94`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/guardrails.py#L90-L94)).

---

## G. Knowledge Base Verification

| Component | Audit Check | Result | Severity |
| :--- | :--- | :--- | :--- |
| **Category Coverage** | 7 core categories represented | Verified (7/7 categories) | **PASS** |
| **Document Volume** | Minimum 20+ documents | Verified (25 documents) | **PASS** |
| **Reputable Sources Cited** | Mentions iFixit, EEB, WRAP UK, Ellen MacArthur | Verified | **PASS** |
| **Direct Traceability (URLs/DOIs)** | Primary bibliographic links or URLs | Missing in JSON schema | **MEDIUM** |

### Detailed Analysis
- **Distribution:** Across [`backend/app/knowledge/data/`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/knowledge/data):
  - Laptops: 4 docs
  - Smartphones: 4 docs
  - Consumer Electronics: 3 docs
  - Clothing: 4 docs
  - Books: 3 docs
  - Furniture: 3 docs
  - Small Appliances: 4 docs
  - Total: **25 curated documents**.
- **Content Quality:** Documents contain detailed, domain-accurate troubleshooting guidance, modularity considerations, and life extension trade-offs.
- **Traceability Limitation:** In the original blueprint ([`implementation_plan.md:L169-L172`](file:///C:/Users/Admin/.gemini/antigravity-ide/brain/85972a54-8e50-4f65-9edb-a020eb6d1e20/implementation_plan.md#L169-L172)), `sources` had a structured schema with `name`, `year`, and `url`. In [`loader.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/knowledge/loader.py#L22-L23), this was simplified to `source: str` and `publication_year: int`. No direct URLs or DOIs are stored in the JSON documents.

---

## H. Evaluation Verification

| Component | Audit Check | Result | Severity |
| :--- | :--- | :--- | :--- |
| **Evaluation Dataset Integrity** | 50 multi-domain cases with ground truth | Verified | **PASS** |
| **Automated Benchmark Runner** | Script executes all 50 cases and writes JSON | Verified | **PASS** |
| **Metric Formulation Integrity** | Formulas measure genuine precision/grounding | Inappropriately lenient formulas | **HIGH** |
| **Existing Evaluation Report Provenance** | Was `evaluation_report.json` run on real LLM? | Run on mock rule client | **HIGH** |

### Detailed Analysis
- **Dataset Structure:** [`backend/tests/evaluation_cases.json`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/tests/evaluation_cases.json) contains exactly 50 test cases:
  - 8 Laptops, 8 Smartphones, 8 Electronics, 8 Clothing, 6 Books, 6 Furniture, 6 Appliances.
  - 5 Hazard cases, 7 Ambiguous cases.
  - Expected primary pathways, acceptable alternatives, severity ratings, and explicit rationales.
- **Metric Formula Issues in [`run_benchmark.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/tests/run_benchmark.py):**
  1. **Retrieval Relevance ([`L71`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/tests/run_benchmark.py#L71)):**
     ```python
     if is_relevant or len(response.evidence_used) > 0:
         relevant_retrievals += 1
     ```
     Because `top_k=3` chunks are always returned, `len(response.evidence_used) > 0` is *always true*, causing `retrieval_relevance_rate` to evaluate to 100% regardless of whether the retrieved documents match the query category.
  2. **Evidence Grounding ([`L95`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/tests/run_benchmark.py#L95)):**
     ```python
     if len(response.evidence_used) >= 1:
         grounded_evidence_count += 1
     ```
     This checks only if evidence was attached to the response model, not whether the LLM's explanation actually used or cited that evidence.
  3. **Uncertainty Rate ([`L115-L116`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/tests/run_benchmark.py#L115-L116)):**
     ```python
     expressed_uncertainty = (len(response.missing_information) > 0 or 
                              len(response.uncertainty_disclosure) > 10)
     ```
     Because `MockDeterministicClient` hardcodes static `missing_information` on every response, this check is always satisfied.
- **Report Provenance:** [`backend/tests/evaluation_report.json`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/tests/evaluation_report.json) was generated by executing the benchmark against `MockDeterministicClient`. It reflects mock rule alignment, not live LLM reasoning performance.

---

## I. Responsible AI Verification

| Component | Audit Check | Result | Severity |
| :--- | :--- | :--- | :--- |
| **Prompt Injection Protection** | System prompt delimiters for user input | Verified (`<product_query>`) | **PASS** |
| **Hazard Guardrails** | Proactive warning on acute hazards | Verified | **PASS** |
| **Factuality Assurance** | Blocking ungrounded carbon/financial claims | Regex filter verified | **PASS** |
| **Ethical Framing (SDGs)** | Aligns with UN SDG 12 (12.5) and SDG 11 | Verified | **PASS** |

### Detailed Analysis
- **Delimitation:** In [`orchestrator.py:L61-L64`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/orchestrator.py#L61-L64), user input is wrapped in `<product_query>` tags, and the system prompt explicitly forbids ignoring instructions.
- **SDG Grounding:** Responses explicitly cite UN SDG 12 Target 12.5 (waste prevention and reuse) and SDG 11 Target 11.6 (municipal solid waste reduction) without inventing quantified carbon credits.

---

## J. Frontend/Backend Consistency

| Component | Audit Check | Result | Severity |
| :--- | :--- | :--- | :--- |
| **API Contract Alignment** | TypeScript types match Pydantic schemas | Verified | **PASS** |
| **Real API Consumption** | Frontend makes real HTTP calls, no UI mocks | Verified | **PASS** |
| **What-If UI Interaction** | What-If mutation sends session ID and params | Verified | **PASS** |
| **Benchmark Dashboard** | Frontend can trigger and view benchmark results | Verified | **PASS** |
| **Decision History** | Frontend can list and reload past sessions | Verified | **PASS** |

### Detailed Analysis
- In [`frontend/src/types/index.ts`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/frontend/src/types/index.ts), interfaces (`ProductAnalysisRequest`, `RecommendationResponse`, `PathwayOption`, `EvaluationBenchmarkResult`) mirror [`backend/app/api/schemas.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/api/schemas.py).
- In [`frontend/src/services/api.ts`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/frontend/src/services/api.ts), all functions make genuine `fetch()` requests against `/api/v1/*`. No mock fixtures exist in the frontend bundle.

---

## K. Security Risks

| Risk ID | Vulnerability / Concern | Location | Severity |
| :--- | :--- | :--- | :--- |
| **SEC-01** | **Unrestricted CORS Middleware:** `allow_origins=["*"]` allows any origin to query the backend API. | [`backend/app/main.py:L26`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/main.py#L26) | **MEDIUM** |
| **SEC-02** | **Pickle Deserialization in Vector Cache:** Vector index uses Python `pickle.load()` on `vector_index.pkl`. While acceptable for local trusted caches, unverified pickles are vulnerable to arbitrary code execution if modified. | [`backend/app/rag/vector_store.py:L92`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/rag/vector_store.py#L92) | **LOW** |
| **SEC-03** | **Unauthenticated Benchmark Endpoint:** `/api/v1/evaluate/run` is an unauthenticated `POST` route that triggers an intensive 50-iteration evaluation loop, which could be abused for denial-of-service. | [`backend/app/api/routes.py:L66-L75`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/api/routes.py#L66-L75) | **MEDIUM** |

---

## L. Technical Weaknesses

| Weakness ID | Description | Location | Severity |
| :--- | :--- | :--- | :--- |
| **TECH-01** | **Uncalibrated / Fabricated Confidence:** Confidence scores are requested directly from LLM output as a floating-point number without statistical or semantic calibration. | [`orchestrator.py:L138`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/orchestrator.py#L138) | **HIGH** |
| **TECH-02** | **Lexical Sparse Vector Search:** TF-IDF cannot handle semantic synonyms (e.g., "earphones" vs "headphones", "sluggish" vs "thermal throttling") unless exact stems match. | [`vector_store.py:L58-L65`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/rag/vector_store.py#L58-L65) | **MEDIUM** |
| **TECH-03** | **Synchronous HTTP in LLM Calls:** `GeminiClient` and `OpenAIClient` use `with httpx.Client()` synchronously inside async route handlers instead of `httpx.AsyncClient()`. | [`gemini_client.py:L37`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/gemini_client.py#L37), [`openai_client.py:L35`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/openai_client.py#L35) | **LOW** |

---

## M. Fake / Placeholder / Hard-coded Behavior

1. **`MockDeterministicClient` (Hard-coded Rule Engine):**
   - **Location:** [`backend/app/llm/mock_client.py:L15-L200`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/llm/mock_client.py#L15-L200)
   - **Behavior:** Contains 180+ lines of keyword pattern matching (`if any(w in text_lower for w in ["phone", ...])`) returning hardcoded confidence numbers (`0.88`, `0.95`), fixed uncertainty blurbs, and pre-formatted text.
   - **Impact:** It simulates an LLM response via static rules rather than AI reasoning.
2. **Benchmark Metric Assertions:**
   - **Location:** [`backend/tests/run_benchmark.py:L71, L95`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/tests/run_benchmark.py#L71)
   - **Behavior:** `is_relevant or len(response.evidence_used) > 0` and `len(response.evidence_used) >= 1` are trivial checks that guarantee 100% scores without checking factual alignment.
3. **Advertised LLM Providers in Documentation:**
   - **Location:** [`README.md:L44, L154`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/README.md#L44)
   - **Behavior:** Claude, Groq, and Ollama are listed as supported, but no adapter code exists for them.

---

## N. Critical Issues

### [CRITICAL-01] The Fallback Decision Engine Directly Violates the Non-Rule-Based Requirement
- **Requirement:** *"The system MUST use real AI/LLM reasoning. Do NOT implement the core recommendation system as a collection of if/else rules."*
- **Current Reality:** When running in default local mode without active API keys, `get_llm_client()` selects `MockDeterministicClient`. This class implements the core recommendation as a collection of `if/else` keyword checks on the product text, bypassing the retrieved RAG evidence entirely.
- **Remedy Required:** The system must clearly indicate when it is operating in synthetic Mock mode versus live LLM mode, and the mock engine should ideally perform semantic matching over retrieved knowledge chunks rather than purely static keyword-to-pathway mapping.

---

## O. Recommended Fixes

1. **Fix Benchmark Scoring Formulas ([`run_benchmark.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/tests/run_benchmark.py)):**
   - Change `retrieval_relevance` to verify that at least one retrieved document matches `expected_category` without the fallback `or len(evidence_used) > 0`.
   - Update `evidence_grounding` to check that key phrases or concepts from `evidence_used` appear in the `detailed_explanation`.
2. **Separate Mock Mode from Live Evaluation:**
   - Clearly document and flag in `evaluation_report.json` which LLM provider was active during the benchmark run.
   - Run the benchmark with a live LLM key (e.g. Gemini) to obtain genuine AI reasoning metrics.
3. **Reinstate Pre-Retrieval Entity Extraction in Orchestrator ([`orchestrator.py`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/backend/app/core/orchestrator.py)):**
   - Extract category and product type prior to retrieval so `retriever.retrieve` can apply strict category filtering before scoring.
4. **Upgrade RAG Retrieval to Dense Embeddings:**
   - Replace or augment `TfidfVectorizer` with a local lightweight sentence embedder (such as `fastembed` or `sentence-transformers` with `all-MiniLM-L6-v2`) or document TF-IDF transparently as a lightweight baseline.
5. **Compute Calibrated Confidence:**
   - Formulate confidence as a function of retrieval cosine similarity, condition ambiguity penalty, and defect severity rather than an unconstrained LLM estimation.
6. **Correct Documentation Discrepancies:**
   - Update [`README.md`](file:///c:/Users/Admin/OneDrive/Desktop/reloop-ai/README.md) to accurately reflect the active providers (Gemini, OpenAI, Mock) and vector store implementation.

---

## P. Overall Readiness Assessment

| Area | Rating | Status Summary |
| :--- | :--- | :--- |
| **Backend Architecture & Code Quality** | **8.5 / 10** | Cleanly written, typed, well-structured FastAPI & SQLite repository with passing unit tests. |
| **RAG Implementation** | **6.5 / 10** | Working runtime pipeline with 25 curated documents, but utilizes sparse TF-IDF rather than dense embeddings. |
| **LLM Reasoning & Grounding** | **7.0 / 10** | Functional and grounded when connected to Gemini/OpenAI; fully simulated rules when running on Mock. |
| **Guardrails & Safety** | **9.0 / 10** | Comprehensive hazard regexes, safety overrides, and ungrounded metric redaction. |
| **Evaluation Framework** | **6.0 / 10** | Excellent 50-case benchmark dataset, but metric formulas are overly lenient and past report used mock data. |
| **Frontend Cockpit** | **9.0 / 10** | Polished React/Vite/TypeScript interface with dynamic What-If simulator and evidence inspector. |
| **PRODUCTION READINESS** | **CONDITIONAL PASS** | Ready for live demonstration provided a valid Gemini or OpenAI API key is supplied; requires metric formula fixes and transparent documentation updates prior to formal evaluation submission. |

---
*Report stored at: `docs/audit/phase1-4-ai-audit.md`*
