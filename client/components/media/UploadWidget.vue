<template>
  <div
    class="upload-widget"
    :class="{ dragging }"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      class="file-input"
      accept="image/*,video/*,audio/*,.pdf"
      multiple
      @change="handleFileSelect"
    />
    <div class="upload-content">
      <p class="upload-icon">📁</p>
      <p>Drag files here or <button type="button" class="browse-btn" @click="($refs.fileInput as HTMLInputElement).click()">browse</button></p>
      <p class="upload-hint">Images, video, audio, PDF — max 50MB each</p>
    </div>
    <div v-if="uploading" class="upload-progress">
      Uploading {{ uploadCount }} file{{ uploadCount !== 1 ? 's' : '' }}...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMediaActions } from '~/composables/useMedia';

const emit = defineEmits<{ uploaded: [] }>();

const { uploadFile } = useMediaActions();
const dragging = ref(false);
const uploading = ref(false);
const uploadCount = ref(0);

async function processFiles(files: FileList | File[]): Promise<void> {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) return;
  uploading.value = true;
  uploadCount.value = fileArray.length;
  try {
    for (const file of fileArray) {
      await uploadFile(file);
    }
    emit('uploaded');
  } finally {
    uploading.value = false;
  }
}

function handleDrop(e: DragEvent): void {
  dragging.value = false;
  if (e.dataTransfer?.files) {
    void processFiles(e.dataTransfer.files);
  }
}

function handleFileSelect(e: Event): void {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    void processFiles(input.files);
  }
}
</script>

<style scoped>
.upload-widget {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s;
  position: relative;
  cursor: pointer;
}

.upload-widget.dragging {
  border-color: #1a4731;
  background: #f0fff4;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.upload-icon { font-size: 2rem; margin: 0 0 0.5rem; }
.upload-content p { margin: 0.25rem 0; color: #4a5568; font-size: 0.9rem; }
.upload-hint { color: #a0aec0; font-size: 0.8rem; }

.browse-btn {
  background: none;
  border: none;
  color: #1a4731;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
}

.upload-progress {
  margin-top: 0.75rem;
  color: #553c9a;
  font-size: 0.85rem;
}
</style>
