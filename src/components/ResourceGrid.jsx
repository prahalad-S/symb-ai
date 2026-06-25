import { useState } from 'react';
import ResourceCard from './ResourceCard';
import EditContentSectionModal from './modals/EditContentSectionModal';
import EditResourceModal from './modals/EditResourceModal';

export default function ResourceGrid({ title, sectionTitle, items, searchQuery, setSearchQuery, onItemClick, isAdmin, activeCategoryObj, refetch }) {
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const handleEditSection = () => setShowSectionModal(true);
  const handleAddCard = () => { setEditingResource(null); setShowResourceModal(true); };
  const handleEditCard = (e, item) => { e.stopPropagation(); setEditingResource(item); setShowResourceModal(true); };

  const ActionIcon = ({ icon, onClick }) => (
    <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} style={{ cursor: 'pointer', marginLeft: '0.5rem', opacity: 0.6, fontSize: '1rem' }}>{icon}</span>
  );

  return (
    <>
      <header className="page-header">
          <h1 className="page-title" id="page-title">{title}</h1>
          <p className="page-subtitle" id="page-subtitle">{items.length} resources</p>
          
          <div className="search-container">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                className="search-input" 
                id="search-input" 
                placeholder="Search resources…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
      </header>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center' }} id="section-title">
            {sectionTitle}
            {isAdmin && activeCategoryObj && !searchQuery && (
              <span style={{ marginLeft: '1rem' }}>
                <ActionIcon icon="✏️" onClick={handleEditSection} />
              </span>
            )}
          </h2>
      </div>

      <div className="resources-grid" id="resources-grid">
        {items.map((item, idx) => (
          <ResourceCard 
            key={`${item.name}-${idx}`} 
            item={item} 
            onClick={() => onItemClick(item)} 
            isAdmin={isAdmin} 
            onEdit={(e) => handleEditCard(e, item)}
            refetch={refetch}
          />
        ))}
        {items.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.25rem' }}>No resources found.</p>
          </div>
        )}
        {isAdmin && activeCategoryObj && !searchQuery && (
          <div 
            onClick={handleAddCard}
            style={{ 
              gridColumn: '1 / -1', border: '2px dashed var(--border-color)', borderRadius: '0.75rem', 
              padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', cursor: 'pointer' 
            }}
          >
            <p style={{ fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>+ Add Card</p>
          </div>
        )}
      </div>

      <EditContentSectionModal show={showSectionModal} onHide={() => setShowSectionModal(false)} category={activeCategoryObj} refetch={refetch} />
      <EditResourceModal show={showResourceModal} onHide={() => { setShowResourceModal(false); setEditingResource(null); }} resource={editingResource} categoryId={activeCategoryObj?.id} refetch={refetch} />
    </>
  );
}
