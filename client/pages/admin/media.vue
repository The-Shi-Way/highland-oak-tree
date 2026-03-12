<template>
  <div class="admin-media">
    <h1>Media Library</h1>

    <UploadWidget @uploaded="refetch" />

    <div v-if="isLoading" class="loading-state">Loading media...</div>
    <div v-else-if="data && data.length > 0" class="media-grid">
      <div v-for="asset in data" :key="asset.id" class="media-card">
        <div class="media-preview">
          <img
            v-if="asset.assetType === 'image' && asset.thumbnails"
            :src="asset.thumbnails.small"
            :alt="asset.originalFilename"
            loading="lazy"
          />
          <div v-else class="file-icon">
            {{ assetIcon(asset.assetType) }}
          </div>
        </div>
        <div class="media-info">
          <p class="media-name" :title="asset.originalFilename">{{ asset.originalFilename }}</p>
          <p class="media-meta">{{ formatSize(asset.fileSize) }} · {{ asset.assetType }}</p>
        </div>
        <button class="delete-btn" title="Delete" @click="handleDelete(asset.id, asset.originalFilename)">✕</button>
      </div>
    </div>
    <p v-else class="empty-state">No media uploaded yet.</p>
  </div>
</template>

<script setup lang="ts">
import { useMediaList, useMediaActions } from '~/composables/useMedia';
import UploadWidget from '~/components/media/UploadWidget.vue';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Media | Admin' });

const { data, isLoading, refetch } = useMediaList();
const { deleteMedia } = useMediaActions();

async function handleDelete(id: string, name: string): Promise<void> {
  if (!window.confirm(`Delete "${name}"?`)) return;
  await deleteMedia(id);
}

function assetIcon(type: string): string {
  switch (type) {
    case 'video': return '🎬';
    case 'audio': return '🎵';
    case 'document': return '📄';
    default: return '🖼';
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<style scoped>
.admin-media h1 { font-size: 1.6rem; color: #1a202c; margin: 0 0 1.5rem; }

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.media-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  position: relative;
}

.media-preview {
  height: 140px;
  background: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon { font-size: 2.5rem; }

.media-info { padding: 0.5rem 0.75rem; }

.media-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #2d3748;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-meta {
  font-size: 0.7rem;
  color: #a0aec0;
  margin: 0.15rem 0 0;
}

.delete-btn {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.5);
  color: white;
  cursor: pointer;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.media-card:hover .delete-btn { opacity: 1; }

.loading-state, .empty-state { text-align: center; padding: 3rem; color: #718096; }
</style>
