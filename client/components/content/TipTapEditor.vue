<template>
  <div class="tiptap-editor">
    <div v-if="editor" class="toolbar" role="toolbar" aria-label="Editor toolbar">
      <button
        type="button"
        :class="{ active: editor.isActive('bold') }"
        title="Bold"
        @click="editor.chain().focus().toggleBold().run()"
      >B</button>
      <button
        type="button"
        :class="{ active: editor.isActive('italic') }"
        title="Italic"
        @click="editor.chain().focus().toggleItalic().run()"
      ><em>I</em></button>
      <button
        type="button"
        :class="{ active: editor.isActive('strike') }"
        title="Strikethrough"
        @click="editor.chain().focus().toggleStrike().run()"
      ><s>S</s></button>
      <span class="toolbar-divider" />
      <button
        type="button"
        :class="{ active: editor.isActive('heading', { level: 2 }) }"
        title="Heading 2"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >H2</button>
      <button
        type="button"
        :class="{ active: editor.isActive('heading', { level: 3 }) }"
        title="Heading 3"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >H3</button>
      <span class="toolbar-divider" />
      <button
        type="button"
        :class="{ active: editor.isActive('bulletList') }"
        title="Bullet list"
        @click="editor.chain().focus().toggleBulletList().run()"
      >•</button>
      <button
        type="button"
        :class="{ active: editor.isActive('orderedList') }"
        title="Ordered list"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >1.</button>
      <button
        type="button"
        :class="{ active: editor.isActive('blockquote') }"
        title="Blockquote"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >"</button>
      <button
        type="button"
        :class="{ active: editor.isActive('codeBlock') }"
        title="Code block"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >&lt;/&gt;</button>
      <span class="toolbar-divider" />
      <button type="button" title="Add link" @click="setLink">🔗</button>
      <button type="button" title="Add image" @click="addImage">🖼</button>
      <button type="button" title="Horizontal rule" @click="editor.chain().focus().setHorizontalRule().run()">—</button>
    </div>
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

const props = defineProps<{
  modelValue: Record<string, unknown>;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
}>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Image,
    Placeholder.configure({ placeholder: props.placeholder ?? 'Start writing...' }),
  ],
  onUpdate: ({ editor: e }) => {
    emit('update:modelValue', e.getJSON() as Record<string, unknown>);
  },
});

watch(() => props.modelValue, (val) => {
  if (editor.value && JSON.stringify(editor.value.getJSON()) !== JSON.stringify(val)) {
    editor.value.commands.setContent(val);
  }
});

function setLink(): void {
  if (!editor.value) return;
  const url = window.prompt('Enter URL:');
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run();
  }
}

function addImage(): void {
  if (!editor.value) return;
  const url = window.prompt('Enter image URL:');
  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run();
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.tiptap-editor {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.toolbar button {
  padding: 0.3rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
  color: #4a5568;
  min-width: 28px;
  transition: all 0.15s;
}

.toolbar button:hover {
  background: #edf2f7;
}

.toolbar button.active {
  background: #1a4731;
  color: white;
}

.toolbar-divider {
  width: 1px;
  background: #e2e8f0;
  margin: 0 4px;
  align-self: stretch;
}

.editor-content {
  min-height: 300px;
  padding: 1rem;
}

.editor-content :deep(.tiptap) {
  outline: none;
  min-height: 280px;
  line-height: 1.7;
}

.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #a0aec0;
  pointer-events: none;
  float: left;
  height: 0;
}

.editor-content :deep(h2) { font-size: 1.5rem; margin: 1.5rem 0 0.75rem; }
.editor-content :deep(h3) { font-size: 1.25rem; margin: 1.25rem 0 0.5rem; }
.editor-content :deep(blockquote) {
  border-left: 3px solid #1a4731;
  padding-left: 1rem;
  color: #4a5568;
  margin: 1rem 0;
}
.editor-content :deep(pre) {
  background: #1a202c;
  color: #e2e8f0;
  padding: 0.75rem;
  border-radius: 6px;
  overflow-x: auto;
}
.editor-content :deep(img) {
  max-width: 100%;
  border-radius: 6px;
}
</style>
