import { useState, useEffect } from 'react';
import AdminModal from './AdminModal';
import { supabase } from '../../supabaseClient';

export default function EditCategoryModal({ show, onHide, category, groupId, refetch }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setSlug(category.slug);
    } else {
      setTitle('');
      setSlug('');
    }
  }, [category]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!category) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSubmit = async () => {
    if (category) {
      await supabase.from('categories').update({ title, slug }).eq('id', category.id);
    } else {
      const { data } = await supabase.from('categories').select('sort_order').eq('group_id', groupId).order('sort_order', { ascending: false }).limit(1);
      const nextSort = data && data.length > 0 ? data[0].sort_order + 1 : 0;
      await supabase.from('categories').insert({ group_id: groupId, title, section_title: title, slug, sort_order: nextSort });
    }
    refetch();
    onHide();
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)',
    backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', outline: 'none'
  };

  return (
    <AdminModal show={show} onHide={onHide} title={category ? 'Edit Link' : 'Add Link'} onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600' }}>Link Title</label>
          <input type="text" value={title} onChange={handleTitleChange} style={inputStyle} required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600' }}>Slug</label>
          <input type="text" value={slug} onChange={e => setSlug(e.target.value)} style={inputStyle} required />
        </div>
      </div>
    </AdminModal>
  );
}
