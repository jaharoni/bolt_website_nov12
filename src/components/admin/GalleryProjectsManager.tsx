import React, { useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, X, Star, Eye, ImagePlus } from 'lucide-react';
import useSupabaseTable from '../../hooks/useSupabaseTable';
import { GalleryProject, ProjectMedia, Media } from '../../lib/types';
import slugify from '../../lib/slugify';
import { supabase } from '../../lib/supabase';
import ImageService from '../../lib/imageService';
import ConfirmDialogNew from './ConfirmDialogNew';
import EmbeddedMediaManager from './EmbeddedMediaManager';
import RichTextEditor from '../RichTextEditor';

export default function GalleryProjectsManager() {
  const projectsQ = useSupabaseTable<GalleryProject>({
    table: 'gallery_projects',
    order: { column: 'sort_order', ascending: true },
  });
  const projectMediaQ = useSupabaseTable<ProjectMedia>({
    table: 'project_media',
    order: { column: 'position', ascending: true },
  });
  const mediaQ = useSupabaseTable<Media>({
    table: 'media_items',
    order: { column: 'created_at', ascending: false },
  });

  const [editing, setEditing] = useState<GalleryProject | null>(null);
  const [confirm, setConfirm] = useState<GalleryProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(projectsQ.items.map((p) => p.category));
    return Array.from(cats).sort();
  }, [projectsQ.items]);

  const filtered = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    let results = projectsQ.items;

    if (filterCategory !== 'all') {
      results = results.filter((p) => p.category === filterCategory);
    }

    if (s) {
      results = results.filter((p) =>
        (p.title + ' ' + (p.description ?? '') + ' ' + p.category).toLowerCase().includes(s)
      );
    }

    return results;
  }, [projectsQ.items, searchQuery, filterCategory]);

  async function createProject() {
    const title = prompt('Project title?');
    if (!title) return;
    const category = prompt('Category?', 'general');
    if (!category) return;

    await projectsQ.insert({
      title,
      slug: slugify(title),
      category,
      is_active: true,
      is_featured: false,
      sort_order: projectsQ.items.length,
    } as any);
  }

  async function toggleFeatured(project: GalleryProject) {
    await supabase
      .from('gallery_projects')
      .update({ is_featured: !project.is_featured })
      .eq('id', project.id);
    await projectsQ.fetchAll();
  }

  async function toggleActive(project: GalleryProject) {
    await supabase
      .from('gallery_projects')
      .update({ is_active: !project.is_active })
      .eq('id', project.id);
    await projectsQ.fetchAll();
  }

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center gap-3 flex-wrap">
        <div className="text-xl font-semibold text-white">Gallery Projects</div>
        <button
          className="ml-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white"
          onClick={createProject}
        >
          New Project
        </button>
        <select
          className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/50"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-left text-white/70 border-b border-white/10">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Sort</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={project.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3">{project.title}</td>
                <td className="p-3">
                  <span className="text-xs px-2 py-1 rounded bg-white/10">{project.category}</span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleActive(project)}
                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                      project.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    {project.is_active ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleFeatured(project)}
                    className={`p-1 rounded ${
                      project.is_featured ? 'text-yellow-400' : 'text-white/30'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={project.is_featured ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td className="p-3 text-white/60">{project.sort_order}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <button
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
                      onClick={() => setEditing(project)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500/80 hover:bg-red-500 rounded text-white"
                      onClick={() => setConfirm(project)}
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
        <ProjectEditor
          project={editing}
          onClose={() => setEditing(null)}
          mediaQ={mediaQ}
          projectMediaQ={projectMediaQ}
        />
      )}

      {confirm && (
        <ConfirmDialogNew
          title="Delete project"
          description={`Remove "${confirm.title}"? All associated media relationships will be deleted.`}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            await projectsQ.remove('id', confirm.id);
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}

function ProjectEditor({
  project,
  onClose,
  mediaQ,
  projectMediaQ,
}: {
  project: GalleryProject;
  onClose: () => void;
  mediaQ: any;
  projectMediaQ: any;
}) {
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [category, setCategory] = useState(project.category);
  const [description, setDescription] = useState(project.description ?? '');
  const [isActive, setIsActive] = useState(project.is_active);
  const [isFeatured, setIsFeatured] = useState(project.is_featured);
  const [sortOrder, setSortOrder] = useState(project.sort_order);
  const [thumbnailMediaId, setThumbnailMediaId] = useState<string[]>(
    project.thumbnail_media_id ? [project.thumbnail_media_id] : []
  );
  const [stagedMediaIds, setStagedMediaIds] = useState<string[]>([]);

  const items: ProjectMedia[] = projectMediaQ.items
    .filter((x: ProjectMedia) => x.project_id === project.id)
    .sort((a: ProjectMedia, b: ProjectMedia) => a.position - b.position);

  async function save() {
    const projectData = {
      title,
      slug,
      category,
      description,
      is_active: isActive,
      is_featured: isFeatured,
      sort_order: sortOrder,
      thumbnail_media_id: thumbnailMediaId[0] || null,
    };

    await supabase.from('gallery_projects').update(projectData).eq('id', project.id);
    await projectMediaQ.fetchAll();
    onClose();
  }

  async function removeItem(id: string) {
    await supabase.from('project_media').delete().eq('id', id);
    await projectMediaQ.fetchAll();
  }

  async function moveItem(id: string, direction: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const itemA = items[idx];
    const itemB = items[targetIdx];

    await supabase.from('project_media').update({ position: itemB.position }).eq('id', itemA.id);
    await supabase.from('project_media').update({ position: itemA.position }).eq('id', itemB.id);
    await projectMediaQ.fetchAll();
  }

  async function addStagedImages() {
    if (stagedMediaIds.length === 0) return;

    let pos = items.length;
    for (const media_id of stagedMediaIds) {
      await supabase.from('project_media').insert({
        project_id: project.id,
        media_id,
        position: pos++,
      });
    }
    setStagedMediaIds([]);
    await projectMediaQ.fetchAll();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4 overflow-auto">
      <div className="bg-black/90 border border-white/10 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <div className="font-semibold text-white">Edit Project</div>
          <button className="ml-auto px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Title</div>
              <input
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setSlug(slugify(title))}
              />
            </label>
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Slug</div>
              <input
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Category</div>
              <input
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Sort Order</div>
              <input
                type="number"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              />
            </label>
            <label className="block">
              <div className="text-xs text-white/70 mb-2">Description (HTML)</div>
              <RichTextEditor content={description} onChange={setDescription} />
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Featured</span>
              </label>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white" onClick={save}>
              Save
            </button>
          </div>

          <div>
            <EmbeddedMediaManager
              mode="single"
              selectedMediaIds={thumbnailMediaId}
              onMediaChange={setThumbnailMediaId}
              context={{ type: 'project', id: project.id, name: project.title }}
              label="Thumbnail Image"
            />

            <div className="mt-6">
              <EmbeddedMediaManager
                mode="multiple"
                selectedMediaIds={stagedMediaIds}
                onMediaChange={setStagedMediaIds}
                context={{ type: 'project', id: project.id, name: project.title }}
                label="Add Project Images"
              />
              {stagedMediaIds.length > 0 && (
                <button
                  className="mt-2 w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm flex items-center justify-center gap-1"
                  onClick={addStagedImages}
                >
                  <ImagePlus className="w-4 h-4" />
                  Add {stagedMediaIds.length} Image(s) to Project
                </button>
              )}
            </div>

            <div className="mt-6">
              <div className="text-xs text-white/70 mb-3">Current Project Images</div>
              <div className="grid grid-cols-3 gap-3">
                {items.map((it) => {
                  const m: Media | undefined = mediaQ.items.find((x: Media) => x.id === it.media_id);
                  if (!m) return null;

                  return (
                    <div key={it.id} className="border border-white/10 rounded overflow-hidden bg-black/40">
                      <img
                        className="w-full aspect-[4/3] object-cover"
                        src={ImageService.getOptimizedUrl(m.bucket_name, m.storage_path, 'thumbnail')}
                        alt={m.alt_text ?? ''}
                      />
                      <div className="p-2 text-xs text-white flex items-center justify-between">
                        <div>#{it.position}</div>
                        <div className="flex gap-1">
                          <button
                            className="p-1 bg-white/10 hover:bg-white/20 rounded"
                            onClick={() => moveItem(it.id, -1)}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            className="p-1 bg-white/10 hover:bg-white/20 rounded"
                            onClick={() => moveItem(it.id, 1)}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            className="p-1 bg-red-500/80 hover:bg-red-500 rounded"
                            onClick={() => removeItem(it.id)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
