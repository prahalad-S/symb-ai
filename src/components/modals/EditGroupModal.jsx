import { useState, useEffect } from 'react';
import AdminModal from './AdminModal';
import { supabase } from '../../supabaseClient';

export default function EditGroupModal({ show, onHide, group, refetch }) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (group) setTitle(group.title);
    else setTitle('');
  }, [group]);

  const handleSubmit = async () => {
    if (group) {
      await supabase.from('sidebar_groups').update({ title }).eq('id', group.id);
    } else {
      const { data } = await supabase.from('sidebar_groups').select('sort_order').order('sort_order', { ascending: false }).limit(1);
      const nextSort = data && data.length > 0 ? data[0].sort_order + 1 : 0;
      await supabase.from('sidebar_groups').insert({ title, sort_order: nextSort });
    }
    refetch();
    onHide();
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)',
    backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', outline: 'none'
  };

  return (
    <AdminModal show={show} onHide={onHide} title={group ? 'Edit Group' : 'Add Group'} onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontWeight: '600' }}>Group Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          style={inputStyle}
          required 
        />
      </div>
    </AdminModal>
  );
}
