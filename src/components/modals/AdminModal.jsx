export default function AdminModal({ show, onHide, title, children, onSubmit }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={(e) => { if (e.target.className.includes('modal-overlay')) onHide() }}>
      <div className="modal-panel" style={{ maxWidth: '500px' }}>
        <button type="button" className="modal-close" onClick={onHide}>×</button>
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>{title}</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          {children}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onHide} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" className="resource-action-btn" style={{ padding: '0.5rem 1rem' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
