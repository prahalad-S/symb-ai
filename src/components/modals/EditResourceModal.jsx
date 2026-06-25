import { useState, useEffect } from 'react';
import AdminModal from './AdminModal';
import { supabase } from '../../supabaseClient';

export default function EditResourceModal({ show, onHide, resource, categoryId, refetch }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [badges, setBadges] = useState([]);
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (resource) {
      setName(resource.name || '');
      setDescription(resource.description || '');
      setUrl(resource.url || '');
      setBadges(resource.badges || []);
      setTags((resource.tags || []).join(', '));
    } else {
      setName('');
      setDescription('');
      setUrl('');
      setBadges([]);
      setTags('');
    }
  }, [resource]);

  const handleSubmit = async () => {
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const data = {
      name, description, url, badges, tags: tagsArray
    };

    try {
      if (resource) {
        const { error } = await supabase.from('resources').update(data).eq('id', resource.id);
        if (error) throw error;
      } else {
        const { data: maxSortData } = await supabase.from('resources').select('sort_order').eq('category_id', categoryId).order('sort_order', { ascending: false }).limit(1);
        const nextSort = maxSortData && maxSortData.length > 0 ? maxSortData[0].sort_order + 1 : 0;
        data.category_id = categoryId;
        data.sort_order = nextSort;
        const { error } = await supabase.from('resources').insert(data);
        if (error) throw error;
      }
      refetch();
      onHide();
    } catch (err) {
      console.error(err);
      alert('Error saving resource: ' + err.message + '\n\nMake sure you have run schema.sql in your Supabase SQL Editor and seeded the database.');
    }
  };

  const handleBadgeToggle = (badge) => {
    if (badges.includes(badge)) setBadges(badges.filter(b => b !== badge));
    else setBadges([...badges, badge]);
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)',
    backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', outline: 'none'
  };

  return (
    <AdminModal show={show} onHide={onHide} title={resource ? 'Edit Resource' : 'Add Resource'} onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600' }}>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600' }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{...inputStyle, minHeight: '80px'}} required />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600' }}>URL</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} style={inputStyle} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600' }}>Badges</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={badges.includes('NEW')} onChange={() => handleBadgeToggle('NEW')} /> NEW
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={badges.includes('DOCS')} onChange={() => handleBadgeToggle('DOCS')} /> DOCS
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600' }}>Tags (comma-separated)</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} style={inputStyle} placeholder="e.g. Frontend, Web, UI" />
        </div>
      </div>
    </AdminModal>
  );
}
