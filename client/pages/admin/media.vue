<template>
  <div class="admin-media">
    <h1>
      <ImageIcon :size="22" :stroke-width="1.6" />
      Media Library
    </h1>

    <UploadWidget @uploaded="refetch" />

    <div v-if="isLoading" class="loading-state">
      <Loader2 :size="20" class="spin-icon" />
      Loading media...
    </div>
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
            <Film v-if="asset.assetType === 'video'" :size="28" />
            <Music v-else-if="asset.assetType === 'audio'" :size="28" />
            <FileIcon v-else-if="asset.assetType === 'document'" :size="28" />
            <ImageIcon v-else :size="28" />
          </div>
        </div>
        <div class="media-info">
          <p class="media-name" :title="asset.originalFilename">{{ asset.originalFilename }}</p>
          <p class="media-meta">{{ formatSize(asset.fileSize) }} · {{ asset.assetType }}</p>
        </div>
        <button class="delete-btn" title="Delete" @click="handleDelete(asset.id, asset.originalFilename)">
          <Trash2 :size="12" />
        </button>
      </div>
    </div>
    <p v-else class="empty-state">
      <Upload :size="28" :stroke-width="1.2" />
      No media uploaded yet.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ImageIcon, Loader2, Trash2, Film, Music, FileIcon, Upload } from 'lucide-vue-next';
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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<style scoped>
.admin-media h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.6rem;
  color: #111827;
  margin: 0 0 1.5rem;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.media-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
  position: relative;
  transition: box-shadow 0.2s;
}

.media-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.media-preview {
  height: 140px;
  background: #f8fafc;
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

.file-icon {
  color: #94a3b8;
}

.media-info { padding: 0.5rem 0.75rem; }

.media-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-meta {
  font-size: 0.7rem;
  color: #9ca3af;
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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: #6b7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
