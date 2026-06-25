import { useEffect, useRef } from 'react';
import { createDefaultPopupDetails, categoryModels } from '../data';

export default function ResourceModal({ show, onHide, resource, category }) {
  const overlayRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && show) {
        onHide();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, onHide]);

  if (!resource && !show) return null;

  const title = resource?.name || 'Resource details';
  const description = resource?.description || 'Choose a resource option below.';
  const actions = [];
  if (resource?.pptUrl) actions.push({ label: 'PPT', url: resource.pptUrl });
  if (resource?.docUrl) actions.push({ label: 'DOC', url: resource.docUrl });
  if (resource?.url) actions.push({ label: 'Link', url: resource.url });

  let sectionsToRender = [];
  let overview = '';
  
  if (resource) {
    const defaultDetails = createDefaultPopupDetails(resource);
    const models = categoryModels[category] || categoryModels['default'];

    const custom = resource.popupDetails || {};
    const customSections = custom.sections || [];

    const hasModelsInCustom = customSections.some(s => s.title && s.title.toLowerCase().trim() === 'models');
    const mergedSections = [];
    
    if (hasModelsInCustom) {
        mergedSections.push(...customSections);
    } else {
        mergedSections.push({ title: 'Models', table: models });
        mergedSections.push(...customSections);
    }

    const presentTitles = mergedSections.map(s => s.title);
    for (const def of defaultDetails.sections) {
        if (!presentTitles.includes(def.title)) mergedSections.push(def);
    }

    overview = custom.overview || defaultDetails.overview;
    sectionsToRender = mergedSections.filter(section =>
        section.title.toLowerCase().trim() !== 'documentation & best practices'
    );
  }

  return (
    <div 
      className={`modal-overlay ${!show ? 'hidden' : ''}`} 
      id="resource-modal" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onHide();
        }
      }}
    >
      <div className="modal-panel">
        <button type="button" className="modal-close" id="modal-close" aria-label="Close resource details" onClick={onHide}>×</button>
        <div className="modal-summary">
          <div className="modal-summary-info">
            <div className="resource-logo" id="modal-logo" style={{minWidth: '52px', width: '52px', height: '52px', borderRadius: '1rem', display: 'grid', placeItems: 'center', background: 'var(--hover-bg)', color: 'var(--primary-color)', fontWeight: 700, fontSize: '1.1rem'}}>
              {title.charAt(0)}
            </div>
            <div className="modal-summary-text">
              <div className="modal-title-row">
                <h2 id="modal-title">{title}</h2>
                <div className="modal-badges" id="modal-badges">
                  {resource?.badges?.map(b => (
                    <span key={b} className={`badge-${b.toLowerCase()}`}>{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="f-row" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between'}}>
            <p className="modal-resource-subtitle" id="modal-description" style={{margin: '0.5rem 0 0', color: 'var(--text-muted)', lineHeight: '1.7'}}>{description}</p>
            {actions.length > 0 && (
              <button 
                type="button" 
                className="resource-action-btn resource-action-primary" 
                id="modal-primary-action"
                onClick={() => window.open(actions[0].url, '_blank', 'noopener')}
              >
                {actions[0].label === 'Link' ? 'Visit' : actions[0].label}
              </button>
            )}
          </div>
        </div>
        
        <div className="modal-details" id="modal-details">
          {resource && (
            <>
              <div className="detail-heading">Documentation & Best Practices</div>
              <p className="detail-overview">{overview}</p>
              
              {sectionsToRender.map((section, idx) => (
                <div key={idx} className="detail-section">
                  <div className="detail-section-title">{section.title}</div>
                  
                  {section.table ? (
                    <div className="detail-table-wrapper">
                      <table className="detail-table">
                        <thead>
                          <tr>
                            {section.table.headers.map((h, i) => <th key={i}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : section.html ? (
                    <div className="detail-section-content" dangerouslySetInnerHTML={{ __html: section.html }} />
                  ) : (
                    <div className="detail-section-content"><p>{section.content}</p></div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
