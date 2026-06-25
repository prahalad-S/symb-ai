import { useState } from 'react';
import EditGroupModal from './modals/EditGroupModal';
import EditCategoryModal from './modals/EditCategoryModal';
import { supabase } from '../supabaseClient';

export default function Sidebar({ activeCategory, setActiveCategory, groups, categories, resources, allCount, isAdmin, refetch }) {
  const [editingGroup, setEditingGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [targetGroupId, setTargetGroupId] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleEditGroup = (group) => { setEditingGroup(group); setShowGroupModal(true); };
  const handleAddGroup = () => { setEditingGroup(null); setShowGroupModal(true); };
  
  const handleEditCategory = (cat) => { setEditingCategory(cat); setShowCategoryModal(true); };
  const handleAddCategory = (groupId) => { setEditingCategory(null); setTargetGroupId(groupId); setShowCategoryModal(true); };

  const handleDeleteGroup = async (id) => {
    if (window.confirm("Are you sure you want to delete this group and all its links?")) {
      await supabase.from('sidebar_groups').delete().eq('id', id);
      refetch();
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this link and all its resources?")) {
      await supabase.from('categories').delete().eq('id', id);
      refetch();
    }
  };

  const ActionIcon = ({ icon, onClick }) => (
    <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} style={{ cursor: 'pointer', marginLeft: '0.5rem', opacity: 0.6, fontSize: '0.85rem' }}>{icon}</span>
  );

  return (
    <aside className="sidebar">
      <style>{`
        .nav-link .admin-actions-hover { opacity: 0; transition: opacity 0.2s; }
        .nav-link:hover .admin-actions-hover { opacity: 1; }
      `}</style>

      <a 
        href="#all"
        className={`nav-link ${activeCategory === 'all' ? 'active' : ''}`}
        style={{ marginBottom: '1.5rem' }}
        onClick={(e) => { e.preventDefault(); setActiveCategory('all'); }}
      >
        <span>All Resources</span><span className="badge">{allCount}</span>
      </a>

      {groups.map(group => {
        const groupCategories = categories.filter(c => c.group_id === group.id).sort((a,b) => a.sort_order - b.sort_order);
        
        return (
          <div key={group.id} className="nav-section">
            <div className="nav-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{group.title}</span>
              {isAdmin && (
                <div>
                  <ActionIcon icon="✏️" onClick={() => handleEditGroup(group)} />
                  <ActionIcon icon="🗑️" onClick={() => handleDeleteGroup(group.id)} />
                </div>
              )}
            </div>
            
            {groupCategories.map(cat => {
              const isActive = activeCategory === cat.slug;
              const itemCount = resources ? resources.filter(r => r.category_id === cat.id).length : 0;
              return (
                <a 
                  href={`#${cat.slug}`}
                  key={cat.id}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setActiveCategory(cat.slug); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{cat.title}</span>
                    {isAdmin && (
                      <span className="admin-actions-hover" style={{ display: 'inline-flex', marginLeft: '0.5rem' }}>
                        <ActionIcon icon="✏️" onClick={() => handleEditCategory(cat)} />
                        <ActionIcon icon="🗑️" onClick={() => handleDeleteCategory(cat.id)} />
                      </span>
                    )}
                  </div>
                  <span className="badge">{itemCount}</span>
                </a>
              );
            })}
            
            {isAdmin && (
              <button 
                className="resource-action-btn" 
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginTop: '0.5rem', marginLeft: '0.75rem', background: 'transparent', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}
                onClick={() => handleAddCategory(group.id)}
              >
                + Add Link
              </button>
            )}
          </div>
        );
      })}

      {isAdmin && (
        <button 
          className="resource-action-btn" 
          style={{ width: '100%', padding: '0.5rem', marginTop: '1rem', border: '1px dashed var(--border-color)', background: 'transparent', color: 'var(--text-muted)' }}
          onClick={handleAddGroup}
        >
          + Add Section
        </button>
      )}

      <EditGroupModal show={showGroupModal} onHide={() => setShowGroupModal(false)} group={editingGroup} refetch={refetch} />
      <EditCategoryModal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} category={editingCategory} groupId={targetGroupId || editingCategory?.group_id} refetch={refetch} />
    </aside>
  );
}
