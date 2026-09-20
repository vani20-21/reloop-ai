import React, { useState } from 'react';
import { EffortLevel, ProductAnalysisRequest, CategoryMetadata } from '../types';
import { 
  IconArrowRight, 
  IconChevronRight,
  IconPrompt,
  IconInfo
} from './Icons';

interface IntakeCockpitProps {
  categories: CategoryMetadata[];
  isLoading: boolean;
  aiAvailable?: boolean;
  onAnalyze: (request: ProductAnalysisRequest) => void;
}

interface SampleExample {
  title: string;
  imageSrc: string;
  text: string;
  category: string;
}

const PRIMARY_EXAMPLES: SampleExample[] = [
  {
    title: "Laptop with weak battery",
    imageSrc: "/assets/thumb_laptop.jpg",
    text: "My 4-year-old laptop still works, but the battery lasts only about one hour and it has become slow. I was thinking of replacing it.",
    category: "laptops"
  },
  {
    title: "Working smartphone being replaced",
    imageSrc: "/assets/thumb_phone.jpg",
    text: "I have a working smartphone that I want to replace because I bought a newer one. The phone has no major problems.",
    category: "smartphones"
  },
  {
    title: "Sweater with a small tear",
    imageSrc: "/assets/thumb_sweater.jpg",
    text: "I have a wool sweater with a small tear. I don't want it anymore, but it is otherwise usable.",
    category: "clothing"
  }
];

export const IntakeCockpit: React.FC<IntakeCockpitProps> = ({
  categories,
  isLoading,
  aiAvailable,
  onAnalyze
}) => {
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [effort, setEffort] = useState<EffortLevel>('medium');
  const [willingToSpend, setWillingToSpend] = useState<boolean>(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showTechnicalDiag, setShowTechnicalDiag] = useState(false);
  const [activeExampleIdx, setActiveExampleIdx] = useState<number | null>(null);

  // Optional Multimodal Image Analysis State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageFile = (file: File) => {
    setImageError(null);
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setImageError('Supported formats: JPG, PNG, WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be under 5MB.');
      return;
    }
    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
    setImageError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    const textToAnalyze = description.trim() || "My 4-year-old laptop still works, but the battery lasts only about one hour and it has become slow.";
    if (!description.trim()) {
      setDescription(textToAnalyze);
    }
    onAnalyze({
      product_description: textToAnalyze,
      category_hint: selectedCategory || null,
      user_effort_preference: effort,
      willing_to_spend_small_amount: willingToSpend,
      image_base64: imageBase64,
      image_mime_type: imageMimeType
    });
  };

  const handleSelectExample = (ex: SampleExample, idx: number) => {
    setDescription(ex.text);
    setSelectedCategory(ex.category);
    setActiveExampleIdx(idx);
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.45rem' }}>
      {/* Eyebrow & Hero Heading */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          color: '#a7b7ac',
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '0.9rem'
        }}>
          <span>A MORE</span>
          <span style={{ color: '#34d399' }}>CIRCULAR</span>
          <span>TOMORROW</span>
        </div>

        <h1 className="hero-heading" style={{ margin: 0, marginBottom: '0.95rem' }}>
          Should This Product<br />
          Be <span className="text-gradient-emerald">Discarded At All?</span>
        </h1>

        <p style={{
          fontSize: '0.96rem',
          color: '#a7b7ac',
          lineHeight: 1.62,
          maxWidth: '510px'
        }}>
          Describe something you no longer need. ReLoop AI uses evidence-grounded AI to help you find its most appropriate next life — repair, reuse, donate, repurpose, or recycle.
        </p>
      </div>

      {/* Large Glass Input Card */}
      <div className="glass-panel" style={{
        padding: '1.4rem 1.6rem',
        borderRadius: '18px',
        background: 'rgba(8, 22, 14, 0.52)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
      }}>
        {/* Discreet, Compact AI Status (accurately states engine status without silent fallback) */}
        {aiAvailable === false && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.18)',
            borderRadius: '6px',
            padding: '0.35rem 0.75rem',
            marginBottom: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fcd34d' }}>
              <IconInfo className="w-3 h-3" />
              <span>AI Engine Unavailable: Live LLM key required</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTechnicalDiag(!showTechnicalDiag)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.7rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showTechnicalDiag ? 'Hide' : 'Diag'}
            </button>
          </div>
        )}

        {showTechnicalDiag && (
          <div style={{
            marginBottom: '0.65rem',
            padding: '0.45rem 0.7rem',
            background: 'rgba(4, 12, 8, 0.9)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.7rem',
            color: '#94a3b8',
            fontFamily: 'monospace'
          }}>
            Configure GEMINI_API_KEY or OPENAI_API_KEY in backend/.env for live inference. Silent mock fallback is disabled.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Card Header: Prompt Icon + Label */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '0.75rem',
            color: '#ffffff'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1'
            }}>
              <IconPrompt className="w-3.5 h-3.5" />
            </div>
            <span style={{ fontSize: '0.94rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Tell us about your product...
            </span>
          </div>

          {/* Textarea */}
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <textarea
              id="product-input-textarea"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '0.25rem 0',
                color: '#ffffff',
                fontFamily: 'inherit',
                fontSize: '0.94rem',
                lineHeight: 1.6,
                resize: 'none',
                minHeight: '88px',
                outline: 'none'
              }}
              placeholder="Example: My 4-year-old laptop still works, but the battery lasts only about one hour and it has become slow."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setActiveExampleIdx(null);
              }}
              disabled={isLoading}
              maxLength={1000}
              required
            />

            {/* Character counter at bottom right */}
            <div style={{
              textAlign: 'right',
              fontSize: '0.72rem',
              color: '#64748b',
              marginTop: '0.25rem'
            }}>
              {description.length}/1000
            </div>
          </div>

          {/* Compact Optional Product Photo Dropzone */}
          <div style={{ marginBottom: '0.75rem' }}>
            {!imagePreview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleImageFile(e.dataTransfer.files[0]);
                  }
                }}
                style={{
                  border: isDragOver ? '1.5px dashed #34d399' : '1px dashed rgba(255, 255, 255, 0.16)',
                  background: isDragOver ? 'rgba(52, 211, 153, 0.08)' : 'rgba(4, 14, 9, 0.45)',
                  borderRadius: '10px',
                  padding: '0.55rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => document.getElementById('product-image-file-input')?.click()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <span style={{ fontSize: '1rem' }}>📷</span>
                  <span><strong>Add product photo (optional)</strong> — Drag & drop or browse</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>JPG, PNG, WEBP (max 5MB)</span>
                <input
                  type="file"
                  id="product-image-file-input"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  disabled={isLoading}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            ) : (
              <div style={{
                background: 'rgba(9, 24, 15, 0.75)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                borderRadius: '10px',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#34d399' }}>
                      Product photo attached
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Ready for OpenRouter free vision analysis
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    borderRadius: '6px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.74rem',
                    cursor: 'pointer'
                  }}
                >
                  Remove photo
                </button>
              </div>
            )}

            {imageError && (
              <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '0.35rem' }}>
                {imageError}
              </div>
            )}
          </div>


          {/* Expandable Optional Details Drawer inside Card */}
          {isDetailsOpen && (
            <div style={{
              margin: '0.85rem 0',
              background: 'rgba(4, 14, 9, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Category Hint
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Auto-Detect from Description</option>
                  {categories.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({c.document_count} docs)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Effort Preference
                </label>
                <select
                  value={effort}
                  onChange={(e) => setEffort(e.target.value as EffortLevel)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  <option value="low">Low (Drop-off, donate, sell as-is)</option>
                  <option value="medium">Medium (Clean, basic tools, minor part)</option>
                  <option value="high">High (DIY repair, soldering, upcycling)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1' }}>
                <input
                  type="checkbox"
                  id="spend-checkbox"
                  checked={willingToSpend}
                  onChange={(e) => setWillingToSpend(e.target.checked)}
                  disabled={isLoading}
                  style={{ width: '15px', height: '15px', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
                />
                <label htmlFor="spend-checkbox" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Open to small replacement part purchase ($5–$30)
                </label>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Action Row below Input Card: Left (+ Add more details) | Right (Analyze Button) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left: (+ Add more details (optional) ->) */}
        <button
          type="button"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          style={{
            background: 'rgba(9, 24, 15, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '9999px',
            padding: '0.65rem 1.15rem',
            color: '#ffffff',
            fontSize: '0.86rem',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
        >
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            lineHeight: 1
          }}>
            {isDetailsOpen ? '−' : '+'}
          </div>
          <span>Add more details (optional)</span>
          <IconChevronRight className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
        </button>

        {/* Right: Radiant Glowing Emerald Button */}
        <button
          type="button"
          id="analyze-submit-button"
          onClick={handleSubmit}
          className="btn-primary"
          disabled={isLoading}
          style={{
            padding: '0.75rem 1.65rem',
            fontSize: '0.94rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 22px rgba(16, 185, 129, 0.48)'
          }}
        >
          {isLoading ? (
            <>
              <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spinSlow 1s linear infinite' }} />
              <span>Analyzing its next life...</span>
            </>
          ) : (
            <>
              <span>Analyze its next life</span>
              <IconArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Try An Example Section */}
      <div style={{ marginTop: '0.2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.84rem',
          fontWeight: 600,
          color: '#cbd5e1',
          marginBottom: '0.75rem'
        }}>
          <span>Try an example</span>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>›</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem'
        }}>
          {PRIMARY_EXAMPLES.map((ex, idx) => {
            const isSelected = activeExampleIdx === idx;
            return (
              <div
                key={idx}
                onClick={() => handleSelectExample(ex, idx)}
                style={{
                  background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(9, 22, 14, 0.55)',
                  border: `1px solid ${isSelected ? '#34d399' : 'rgba(255, 255, 255, 0.1)'}`,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '12px',
                  padding: '0.7rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.35)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Product Photo Thumbnail */}
                <img
                  src={ex.imageSrc}
                  alt={ex.title}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    flexShrink: 0
                  }}
                />

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: isSelected ? '#34d399' : '#ffffff',
                    lineHeight: 1.25,
                    marginBottom: '0.25rem',
                    whiteSpace: 'normal'
                  }}>
                    {ex.title}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <span>See example</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
