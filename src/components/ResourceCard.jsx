import { supabase } from '../supabaseClient';

export default function ResourceCard({ item, onClick, isAdmin, onEdit, refetch }) {
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this resource?")) {
      await supabase.from('resources').delete().eq('id', item.id);
      refetch();
    }
  };

  return (
    <div 
      className="resource-card" 
      role="button" 
      tabIndex="0"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <style>{`
        .resource-card .card-admin-actions { opacity: 0; transition: opacity 0.2s; display: flex; gap: 0.5rem; margin-left: 0.5rem; }
        .resource-card:hover .card-admin-actions { opacity: 1; }
      `}</style>
      
      <div className="resource-header">
          <div className="resource-brand">
              <div className="resource-logo">{item.name.charAt(0)}</div>
              <div className="resource-title">{item.name}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {item.badges && item.badges.length > 0 && (
              <div className="resource-badges">
                  {item.badges.map(b => (
                    <span key={b} className={`badge-${b.toLowerCase()}`}>{b}</span>
                  ))}
              </div>
            )}
            {isAdmin && (
              <div className="card-admin-actions">
                <span onClick={onEdit} style={{ cursor: 'pointer', fontSize: '1rem', opacity: 0.7 }}>✏️</span>
                <span onClick={handleDelete} style={{ cursor: 'pointer', fontSize: '1rem', opacity: 0.7 }}>🗑️</span>
              </div>
            )}
          </div>
      </div>
      <p className="resource-desc">{item.description}</p>
      <div className="resource-footer">
          {item.tags?.map(t => (
            <span key={t} className="resource-tag">{t}</span>
          ))}
      </div>
    </div>
  );
}
