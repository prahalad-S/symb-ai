import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ResourceGrid from './components/ResourceGrid';
import ResourceModal from './components/ResourceModal';
import { useData } from './hooks/useData';
import { database as staticDatabase } from './data';
import { supabase } from './supabaseClient';

// Convert static database into flat normalized shape matching Supabase shape
function buildStaticNormalized() {
  const staticSections = [
    { title: "AI & AUTOMATION", categories: ["ai-tools", "frameworks-agents", "mcp-tools"] },
    { title: "DATA & ANALYTICS", categories: ["data-analytics", "web-analytics"] },
    { title: "BACKEND & INFRA", categories: ["backend-infra", "hosting-domains", "web-scraping", "erp-business", "payments"] },
    { title: "CLOUD PLATFORMS", categories: ["azure", "aws"] },
    { title: "FRONTEND & FRAMEWORKS", categories: ["react"] },
    { title: "MOBILE", categories: ["mobile-frameworks", "cicd-distribution"] },
    { title: "DEV TOOLS", categories: ["source-control", "iac"] },
    { title: "TESTING", categories: ["testing"] },
    { title: "DESIGN & ANIMATION", categories: ["design-tools", "animation", "colors", "icons"] },
    { title: "PRODUCTIVITY", categories: ["note-taking", "task-management"] }
  ];

  const groups = [];
  const categories = [];
  const resources = [];

  staticSections.forEach((sec, i) => {
    const groupId = `static-group-${i}`;
    groups.push({ id: groupId, title: sec.title, sort_order: i });

    sec.categories.forEach((slug, j) => {
      const catData = staticDatabase[slug];
      if (!catData) return;
      const catId = `static-cat-${slug}`;
      categories.push({ id: catId, group_id: groupId, title: catData.title, section_title: catData.sectionTitle, slug, sort_order: j });

      catData.items.forEach((item, k) => {
        resources.push({
          id: `static-res-${slug}-${k}`,
          category_id: catId,
          name: item.name,
          description: item.description,
          url: item.url,
          ppt_url: item.pptUrl,
          doc_url: item.docUrl,
          badges: item.badges || [],
          tags: item.tags || [],
          popup_details: item.popupDetails || null,
          sort_order: k,
          _isStatic: true,
        });
      });
    });
  });

  return { groups, categories, resources };
}

const staticNormalized = buildStaticNormalized();

function App() {
  const { groups: dbGroups, categories: dbCategories, resources: dbResources, loading, session, isAdmin, refetch } = useData();

  // Use live Supabase data when available, otherwise fall back to static
  const isSeeded = dbGroups.length > 0;
  const groups = isSeeded ? dbGroups : staticNormalized.groups;
  const categories = isSeeded ? dbCategories : staticNormalized.categories;
  const resources = isSeeded ? dbResources : staticNormalized.resources;

  const [theme, setTheme] = useState('light');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const filteredItems = useMemo(() => {
    let items = [];
    if (activeCategory === 'all') {
      items = resources;
    } else {
      const categoryObj = categories.find(c => c.slug === activeCategory);
      if (categoryObj) {
        items = resources.filter(r => r.category_id === categoryObj.id);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = resources.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }
    return [...items].sort((a, b) => a.sort_order - b.sort_order);
  }, [activeCategory, searchQuery, resources, categories]);

  const activeCategoryObj = categories.find(c => c.slug === activeCategory);
  const categoryTitle = searchQuery ? 'Search Results' : (activeCategory === 'all' ? 'All Resources' : activeCategoryObj?.title);
  const categorySectionTitle = searchQuery ? `Results for "${searchQuery}"` : (activeCategory === 'all' ? 'All Resources' : activeCategoryObj?.section_title);

  const handleSeedDatabase = async () => {
    const confirmed = window.confirm("This will upload all static resources to your Supabase database. Continue?");
    if (!confirmed) return false;

    try {
      // Test if tables exist first
      const { error: testError } = await supabase.from('sidebar_groups').select('id').limit(1);
      if (testError) {
        alert(
          "❌ Database tables not found!\n\nPlease run the schema.sql file in your Supabase SQL Editor first:\n" +
          "1. Go to https://supabase.com → your project → SQL Editor\n" +
          "2. Paste the contents of schema.sql and click Run\n" +
          "3. Come back here and try again"
        );
        return false;
      }

      const staticSections = [
        { title: "AI & AUTOMATION", categories: ["ai-tools", "frameworks-agents", "mcp-tools"] },
        { title: "DATA & ANALYTICS", categories: ["data-analytics", "web-analytics"] },
        { title: "BACKEND & INFRA", categories: ["backend-infra", "hosting-domains", "web-scraping", "erp-business", "payments"] },
        { title: "CLOUD PLATFORMS", categories: ["azure", "aws"] },
        { title: "FRONTEND & FRAMEWORKS", categories: ["react"] },
        { title: "MOBILE", categories: ["mobile-frameworks", "cicd-distribution"] },
        { title: "DEV TOOLS", categories: ["source-control", "iac"] },
        { title: "TESTING", categories: ["testing"] },
        { title: "DESIGN & ANIMATION", categories: ["design-tools", "animation", "colors", "icons"] },
        { title: "PRODUCTIVITY", categories: ["note-taking", "task-management"] }
      ];

      let anyError = null;
      for (let i = 0; i < staticSections.length; i++) {
        const sec = staticSections[i];
        const { data: gData, error: gError } = await supabase.from('sidebar_groups').insert({ title: sec.title, sort_order: i }).select().single();
        if (gError) { anyError = gError; console.error('Group insert error:', gError); continue; }

        for (let j = 0; j < sec.categories.length; j++) {
          const catSlug = sec.categories[j];
          const catData = staticDatabase[catSlug];
          if (!catData) continue;

          const { data: cData, error: cError } = await supabase.from('categories').insert({
            group_id: gData.id,
            title: catData.title,
            section_title: catData.sectionTitle,
            slug: catSlug,
            sort_order: j
          }).select().single();
          if (cError) { anyError = cError; console.error('Category insert error:', cError); continue; }

          const itemsToInsert = catData.items.map((item, k) => ({
            category_id: cData.id,
            name: item.name,
            description: item.description,
            url: item.url,
            ppt_url: item.pptUrl,
            doc_url: item.docUrl,
            badges: item.badges || [],
            tags: item.tags || [],
            popup_details: item.popupDetails || null,
            sort_order: k
          }));

          if (itemsToInsert.length > 0) {
            const { error: rError } = await supabase.from('resources').insert(itemsToInsert);
            if (rError) { anyError = rError; console.error('Resource insert error:', rError); }
          }
        }
      }

      if (anyError) {
        alert("⚠️ Seeding partially failed. Error: " + anyError.message);
        return false;
      }

      alert("✅ Database seeded! You can now edit everything live.");
      await refetch();
      return true;
    } catch (err) {
      console.error(err);
      alert("Failed to seed database: " + err.message);
      return false;
    }
  };

  if (loading) {
    return <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: 'var(--text-color)' }}>Loading...</div>;
  }

  return (
    <div className="app-container">
      <Header theme={theme} toggleTheme={toggleTheme} session={session} />

      <main className="main-layout">
        <Sidebar
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          groups={groups}
          categories={categories}
          resources={resources}
          allCount={resources.length}
          isAdmin={isAdmin}
          refetch={refetch}
        />

        <section className="content" id="content-area">
          {isAdmin && !isSeeded && (
            <div style={{ background: 'var(--active-bg)', border: '1px solid var(--primary-color)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ marginBottom: '0.25rem', fontWeight: '700', fontSize: '1rem' }}>⚡ Admin Mode Active</p>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>You are viewing static data. Seed the database once to enable live editing.</p>
              </div>
              <button className="resource-action-btn" onClick={handleSeedDatabase}>
                🚀 Seed Database
              </button>
            </div>
          )}

          <ResourceGrid
            title={categoryTitle}
            sectionTitle={categorySectionTitle}
            items={filteredItems}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onItemClick={(item) => setSelectedResource({ item, category: activeCategory })}
            isAdmin={isAdmin}
            activeCategoryObj={activeCategoryObj}
            refetch={refetch}
          />
        </section>
      </main>

      <ResourceModal
        show={!!selectedResource}
        onHide={() => setSelectedResource(null)}
        resource={selectedResource?.item}
        category={selectedResource?.category}
        isAdmin={isAdmin}
        refetch={refetch}
      />
    </div>
  );
}

export default App;
