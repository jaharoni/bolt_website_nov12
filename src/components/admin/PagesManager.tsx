import React, { useMemo, useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import useSupabaseTable from '../../hooks/useSupabaseTable';
import { Page, Media } from '../../lib/types';
import slugify from '../../lib/slugify';
import ConfirmDialogNew from './ConfirmDialogNew';
import { supabase } from '../../lib/supabase';
import EmbeddedMediaManager from './EmbeddedMediaManager';
import RichTextEditor from '../RichTextEditor';

export default function PagesManager() {
  const { items, insert, update, remove, loading, error } = useSupabaseTable<Page>({
    table: 'pages',
    order: { column: 'created_at', ascending: false },
  });

  const [editing, setEditing] = useState<Page | null>(null);
  const [confirm, setConfirm] = useState<Page | null>(null);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const qq = q.toLowerCase().trim();
    if (!qq) return items;
    return items.filter((p) =>
      [p.title, p.slug, p.page_type, p.meta_description].join(' ').toLowerCase().includes(qq)
    );
  }, [items, q]);

  const handleCreate = () => {
    setEditing({
      id: 'new',
      title: '',
      slug: '',
      page_type: 'standard',
      template: 'default',
      content_json: { html: '' },
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);
  };

  return (
    <div className="p-4 space-y-4">
      <header className="flex flex-wrap items-center gap-2">
        <div className="text-xl font-semibold text-white">Pages</div>
        <button
          className="ml-auto px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white"
          onClick={handleCreate}
        >
          New Page
        </button>
        <input
          className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/50"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </header>

      {loading && <div className="text-white/70 text-sm">Loading...</div>}
      {error && <div className="text-red-400 text-sm">Error: {String(error.message || error)}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-left text-white/70 border-b border-white/10">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Type</th>
              <th className="p-2">Status</th>
              <th className="p-2">Updated</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-2">{p.title}</td>
                <td className="p-2">
                  <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">
                    {p.page_type}
                  </span>
                </td>
                <td className="p-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.is_published
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-2 text-white/60">{new Date(p.updated_at).toLocaleDateString()}</td>
                <td className="p-2">
                  <div className="flex gap-2 justify-end">
                    <a
                      className="text-white/70 hover:text-white underline flex items-center gap-1"
                      href={`/pages/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Preview
                    </a>
                    <button
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
                      onClick={() => setEditing(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500/80 hover:bg-red-500 rounded text-white"
                      onClick={() => setConfirm(p)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <PageEditor
          page={editing}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            if (editing.id === 'new') {
              await insert(payload as any);
            } else {
              await update('id', editing.id, payload as any);
            }
            setEditing(null);
          }}
        />
      )}

      {confirm && (
        <ConfirmDialogNew
          title="Delete page"
          description={`Remove "${confirm.title}"?`}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            await remove('id', confirm.id);
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}

function PageEditor({
  page,
  onClose,
  onSave,
}: {
  page: Page;
  onClose: () => void;
  onSave: (v: Partial<Page>) => Promise<any>;
}) {
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'media' | 'seo'>('general');
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug || '');
  const [pageType, setPageType] = useState<Page['page_type']>(page.page_type);
  const [template, setTemplate] = useState(page.template || 'default');
  const [isPublished, setIsPublished] = useState(page.is_published);
  const [metaTitle, setMetaTitle] = useState(page.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState(page.meta_description ?? '');
  const [contentHtml, setContentHtml] = useState((page.content_json as any)?.html || '');
  const [heroMediaId, setHeroMediaId] = useState<string[]>(page.hero_media_id ? [page.hero_media_id] : []);
  const [galleryMediaIds, setGalleryMediaIds] = useState<string[]>([]);

  function autoSlug() {
    if (!slug) setSlug(slugify(title));
  }

  async function handleSave() {
    const pageData: Partial<Page> = {
      title,
      slug,
      page_type: pageType,
      template,
      hero_media_id: heroMediaId[0] || null,
      content_json: { html: contentHtml },
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      is_published: isPublished,
      published_at: isPublished && !page.published_at ? new Date().toISOString() : page.published_at,
    };

    if (page.id === 'new') {
      const { data: newPage, error } = await supabase
        .from('pages')
        .insert(pageData)
        .select()
        .single();

      if (error || !newPage) {
        alert('Failed to create page: ' + (error?.message || 'Unknown error'));
        return;
      }

      if (galleryMediaIds.length > 0) {
        const mediaInserts = galleryMediaIds.map((media_id, index) => ({
          page_id: newPage.id,
          media_id,
          media_role: 'gallery',
          position: index,
        }));
        await supabase.from('page_media').insert(mediaInserts);
      }

      await onSave(pageData);
    } else {
      await onSave(pageData);
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4 overflow-auto">
      <div className="bg-black/90 border border-white/10 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <FileText className="w-5 h-5 text-white" />
          <div className="font-semibold text-white">
            {page.id === 'new' ? 'Create Page' : 'Edit Page'}
          </div>
          <button className="ml-auto px-3 py-1 bg-white/10 rounded text-white" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="p-4 border-b border-white/10 flex gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded ${
              activeTab === 'general' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded ${
              activeTab === 'content' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 rounded ${
              activeTab === 'media' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60'
            }`}
          >
            Media
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 rounded ${
              activeTab === 'seo' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60'
            }`}
          >
            SEO
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <label className="block">
                <div className="text-xs text-white/70 mb-1">Title</div>
                <input
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={autoSlug}
                  placeholder="Page Title"
                />
              </label>
              <label className="block">
                <div className="text-xs text-white/70 mb-1">Slug</div>
                <input
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="page-slug"
                />
              </label>
              <label className="block">
                <div className="text-xs text-white/70 mb-1">Page Type</div>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                  value={pageType}
                  onChange={(e) => setPageType(e.target.value as Page['page_type'])}
                >
                  <option value="standard">Standard</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="landing">Landing</option>
                  <option value="about">About</option>
                  <option value="contact">Contact</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label className="block">
                <div className="text-xs text-white/70 mb-1">Template</div>
                <input
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="default"
                />
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Published</span>
              </label>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="text-xs text-white/70 mb-2">Page Content (HTML)</div>
              <RichTextEditor content={contentHtml} onChange={setContentHtml} />
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              <EmbeddedMediaManager
                mode="single"
                selectedMediaIds={heroMediaId}
                onMediaChange={setHeroMediaId}
                context={{ type: 'page', name: title }}
                label="Hero Image"
              />

              {page.id === 'new' && (
                <EmbeddedMediaManager
                  mode="multiple"
                  selectedMediaIds={galleryMediaIds}
                  onMediaChange={setGalleryMediaIds}
                  context={{ type: 'page', name: title }}
                  label="Gallery Images (staged)"
                />
              )}
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              <label className="block">
                <div className="text-xs text-white/70 mb-1">Meta Title</div>
                <input
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title (defaults to page title)"
                />
              </label>
              <label className="block">
                <div className="text-xs text-white/70 mb-1">Meta Description</div>
                <textarea
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white h-24"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search engines"
                />
              </label>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button className="px-4 py-2 bg-white/10 rounded text-white" onClick={handleSave}>
            {page.id === 'new' && galleryMediaIds.length > 0
              ? `Save Page & Attach ${galleryMediaIds.length} Image(s)`
              : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
