/**
 * NailCarousel — horizontal scrollable nail design picker.
 * Each item shows a preview rendered from the same programmatic
 * canvas as the live overlay — so what you see is exactly what you get.
 */

import { useRef, useEffect } from 'react';

export default function NailCarousel({ designs, selected, onSelect }) {
  const scrollRef = useRef(null);

  // Auto-scroll to selected item
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const item = el.querySelector(`[data-idx="${selected}"]`);
    if (item) {
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selected]);

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        padding: '0 16px 6px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {designs.map((d, i) => {
        const isSelected = selected === i;
        return (
          <button
            key={d.id ?? i}
            data-idx={i}
            onClick={() => onSelect(i)}
            style={{
              flexShrink: 0,
              width: 58,
              background: 'rgba(26,26,46,0.9)',
              border: `2px solid ${isSelected ? d.accent : 'transparent'}`,
              borderRadius: 14,
              padding: '5px 4px 5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transform: isSelected ? 'translateY(-5px)' : 'none',
              boxShadow: isSelected ? `0 0 16px ${d.accent}88, 0 0 32px ${d.accent}33` : 'none',
              transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
              position: 'relative',
            }}
          >
            {/* Design preview canvas */}
            <CanvasPreview canvas={d.canvas} accent={d.accent} isSelected={isSelected} />

            {/* Check badge */}
            {isSelected && (
              <div style={{
                position: 'absolute', top: 4, right: 4,
                width: 16, height: 16, borderRadius: '50%',
                background: d.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#fff', fontWeight: 800,
                boxShadow: `0 0 6px ${d.accent}`,
              }}>
                ✓
              </div>
            )}

            {/* Design name */}
            <span style={{
              fontSize: 8,
              color: isSelected ? '#FFB3D1' : '#C084A8',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: 50,
            }}>
              {d.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Renders a design's canvas element as an img inside the carousel item */
function CanvasPreview({ canvas, accent, isSelected }) {
  const imgRef = useRef(null);

  useEffect(() => {
    if (!canvas || !imgRef.current) return;
    try {
      imgRef.current.src = canvas.toDataURL('image/png');
    } catch { /* canvas not ready */ }
  }, [canvas]);

  return (
    <div style={{
      width: 50, height: 76,
      borderRadius: 10,
      overflow: 'hidden',
      border: isSelected ? `1px solid ${accent}66` : '1px solid rgba(255,255,255,0.06)',
      background: '#1E1E35',
    }}>
      <img
        ref={imgRef}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}
