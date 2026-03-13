<template>
  <div class="ai-panel">
    <div class="ai-panel-header">
      <h3>AI Assistant</h3>
      <button
        class="review-btn"
        :disabled="loading"
        @click="handleReview"
      >
        {{ loading ? 'Reviewing...' : '✨ Review Content' }}
      </button>
    </div>

    <div v-if="error" class="ai-error" role="alert">
      {{ error }}
    </div>

    <div v-if="suggestions.length === 0 && !loading && !error" class="ai-empty">
      Click "Review Content" to get AI suggestions for improving your writing.
    </div>

    <div v-for="(s, idx) in suggestions" :key="idx" class="suggestion-card">
      <div class="suggestion-reason">{{ s.reason }}</div>
      <div class="suggestion-diff">
        <div class="diff-original">
          <span class="diff-label">Original</span>
          <p>{{ s.original }}</p>
        </div>
        <div class="diff-suggested">
          <span class="diff-label">Suggested</span>
          <p>{{ s.suggested }}</p>
        </div>
      </div>
      <div class="suggestion-actions">
        <button class="accept-btn" @click="$emit('accept', s)">Accept</button>
        <button class="reject-btn" @click="removeSuggestion(idx)">Dismiss</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { reviewContent, type IAiSuggestion } from '~/composables/useAi';

const props = defineProps<{
  content: string;
  leafType: 'prose' | 'blossom' | 'fruit' | 'seed';
}>();

defineEmits<{
  accept: [suggestion: IAiSuggestion];
}>();

const suggestions = ref<IAiSuggestion[]>([]);
const loading = ref(false);
const error = ref('');

async function handleReview(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await reviewContent(props.content, props.leafType);
    suggestions.value = result.suggestions;
  } catch {
    error.value = 'AI service is currently unavailable. Your editor still works fine — try again later.';
  } finally {
    loading.value = false;
  }
}

function removeSuggestion(idx: number): void {
  suggestions.value.splice(idx, 1);
}
</script>

<style scoped>
.ai-panel {
  margin-top: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fafaf9;
  overflow: hidden;
}

.ai-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.ai-panel-header h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #2d3748;
}

.review-btn {
  padding: 0.4rem 0.8rem;
  background: #553c9a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.review-btn:hover:not(:disabled) { background: #6b46c1; }
.review-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ai-error {
  padding: 0.75rem 1rem;
  background: #fff5f5;
  color: #c53030;
  font-size: 0.85rem;
  border-bottom: 1px solid #fed7d7;
}

.ai-empty {
  padding: 1.5rem;
  text-align: center;
  color: #a0aec0;
  font-size: 0.9rem;
}

.suggestion-card {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.suggestion-card:last-child { border-bottom: none; }

.suggestion-reason {
  font-size: 0.85rem;
  color: #553c9a;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.suggestion-diff {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.diff-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #718096;
  margin-bottom: 0.25rem;
}

.diff-original {
  background: #fff5f5;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 3px solid #fc8181;
}

.diff-original p { margin: 0; font-size: 0.9rem; color: #742a2a; }

.diff-suggested {
  background: #f0fff4;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 3px solid #68d391;
}

.diff-suggested p { margin: 0; font-size: 0.9rem; color: #22543d; }

.suggestion-actions {
  display: flex;
  gap: 0.5rem;
}

.accept-btn {
  padding: 0.3rem 0.7rem;
  background: #1a4731;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.accept-btn:hover { background: #22543d; }

.reject-btn {
  padding: 0.3rem 0.7rem;
  background: transparent;
  color: #718096;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.reject-btn:hover { background: #edf2f7; }
</style>
