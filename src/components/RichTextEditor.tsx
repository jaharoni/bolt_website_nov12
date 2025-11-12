import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Image } from '@tiptap/extension-image';
import { Highlight } from '@tiptap/extension-highlight';
import { Typography } from '@tiptap/extension-typography';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, Image as ImageIcon, Minus,
  Palette, Highlighter, Type, ChevronDown
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onImageInsert?: () => void;
  className?: string;
}

const WEB_SAFE_FONTS = [
  { label: 'Default', value: 'inherit' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Impact', value: 'Impact, fantasy' },
];

const GOOGLE_FONTS = [
  { label: 'Roboto', value: "'Roboto', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' },
  { label: 'Open Sans', value: "'Open Sans', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap' },
  { label: 'Lato', value: "'Lato', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' },
  { label: 'Montserrat', value: "'Montserrat', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap' },
  { label: 'Playfair Display', value: "'Playfair Display', serif", url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap' },
  { label: 'Merriweather', value: "'Merriweather', serif", url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap' },
  { label: 'Poppins', value: "'Poppins', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap' },
  { label: 'Inter', value: "'Inter', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap' },
];

const TEXT_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

const HIGHLIGHT_COLORS = [
  'transparent', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24',
  '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
  '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
  '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6',
];

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  onImageInsert,
  className = '',
}: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline hover:text-blue-300 cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-4',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const loadGoogleFont = useCallback((fontUrl: string) => {
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
    }
  }, []);

  const setFontFamily = useCallback((fontValue: string, fontUrl?: string) => {
    if (!editor) return;

    if (fontUrl) {
      loadGoogleFont(fontUrl);
    }

    if (fontValue === 'inherit') {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(fontValue).run();
    }
    setShowFontPicker(false);
  }, [editor, loadGoogleFont]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-white/10 rounded-lg overflow-hidden bg-black/20 ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-white/10 p-2 flex flex-wrap gap-1 bg-black/40 sticky top-0 z-10">
        {/* Font Family Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontPicker(!showFontPicker)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs hover:bg-white/10 transition-colors flex items-center gap-1"
            title="Font family"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Font</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showFontPicker && (
            <div className="absolute top-full left-0 mt-1 bg-black/95 border border-white/20 rounded-lg shadow-xl z-50 min-w-[200px] max-h-[400px] overflow-auto">
              <div className="p-2">
                <div className="text-xs text-white/50 font-semibold px-2 py-1">Web Safe Fonts</div>
                {WEB_SAFE_FONTS.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => setFontFamily(font.value)}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </button>
                ))}
                <div className="h-px bg-white/10 my-2" />
                <div className="text-xs text-white/50 font-semibold px-2 py-1">Google Fonts</div>
                {GOOGLE_FONTS.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => setFontFamily(font.value, font.url)}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px bg-white/10 mx-1" />

        {/* Heading Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px bg-white/10 mx-1" />

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bold')
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('italic')
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('underline')
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('strike')
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('code')
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Inline code"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px bg-white/10 mx-1" />

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-white/10 text-white/60 transition-colors"
            title="Text color"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-black/95 border border-white/20 rounded-lg shadow-xl z-50 p-2">
              <div className="grid grid-cols-6 gap-1 w-[180px]">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="w-full mt-2 px-2 py-1 text-xs text-white/70 hover:bg-white/10 rounded"
              >
                Clear Color
              </button>
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            className="p-2 rounded hover:bg-white/10 text-white/60 transition-colors"
            title="Highlight color"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 bg-black/95 border border-white/20 rounded-lg shadow-xl z-50 p-2">
              <div className="grid grid-cols-5 gap-1 w-[150px]">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      if (color === 'transparent') {
                        editor.chain().focus().unsetHighlight().run();
                      } else {
                        editor.chain().focus().toggleHighlight({ color }).run();
                      }
                      setShowHighlightPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color === 'transparent' ? 'No highlight' : color}
                  >
                    {color === 'transparent' && (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-white/50">×</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px bg-white/10 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive({ textAlign: 'left' })
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Align left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive({ textAlign: 'center' })
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Align center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive({ textAlign: 'right' })
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Align right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive({ textAlign: 'justify' })
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        <div className="w-px bg-white/10 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Bullet list"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Numbered list"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px bg-white/10 mx-1" />

        {/* Insert Elements */}
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded transition-colors ${
            editor.isActive('link')
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/60'
          }`}
          title="Insert link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {onImageInsert && (
          <button
            type="button"
            onClick={onImageInsert}
            className="p-2 rounded hover:bg-white/10 text-white/60 transition-colors"
            title="Insert image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-white/10 text-white/60 transition-colors"
          title="Horizontal rule"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-px bg-white/10 mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-white/10 text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-white/10 text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} className="text-white" />

        {!content && (
          <div className="absolute top-4 left-6 text-white/40 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
