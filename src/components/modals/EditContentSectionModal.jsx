import { useState, useEffect } from 'react';
import AdminModal from './AdminModal';
import { supabase } from '../../supabaseClient';

export default function EditContentSectionModal({ show, onHide, category, refetch }) {
  const [sectionTitle, setSectionTitle] = useState('');

  useEffect(() => {
    if (category) setSectionTitle(category.section_title);
    else setSectionTitle('');
  }, [category]);

  const handleSubmit = async () => {
    if (category) {
      await supabase.from('categories').update({ section_title: sectionTitle }).eq('id', category.id);
      refetch();
    }
    onHide();
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)',
    backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', outline: 'none'
  };

  return (
    <AdminModal show={show} onHide={onHide} title="Edit Content Section Title" onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontWeight: '600' }}>Section Title</label>
        <input 
          type="text" 
          value={sectionTitle} 
          onChange={e => setSectionTitle(e.target.value)} 
          style={inputStyle}
          required 
        />
      </div>
    </AdminModal>
  );
}
