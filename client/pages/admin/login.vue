<template>
  <div class="login-page">
    <div class="login-card">
      <h1>The Highland Oak Tree</h1>
      <p class="login-subtitle">Admin Login</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            autocomplete="username"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            :disabled="loading"
          />
        </div>
        <p v-if="errorMsg" class="error-msg" role="alert">{{ errorMsg }}</p>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({ layout: false });

useHead({ title: 'Login | Admin | The Highland Oak Tree' });

const { login, store } = useAuth();

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

// Redirect if already authenticated
if (store.isAuthenticated) {
  navigateTo('/admin');
}

async function handleLogin(): Promise<void> {
  errorMsg.value = '';
  loading.value = true;
  try {
    await login({ username: username.value, password: password.value });
    navigateTo('/admin');
  } catch {
    errorMsg.value = 'Invalid credentials. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-card h1 {
  font-family: 'Georgia', serif;
  color: #1a4731;
  font-size: 1.6rem;
  margin: 0 0 0.25rem;
}

.login-subtitle {
  color: #718096;
  font-size: 0.9rem;
  margin: 0 0 2rem;
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: #4a5568;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #1a4731;
}

.error-msg {
  color: #e53e3e;
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
}

.login-btn {
  width: 100%;
  padding: 0.7rem;
  background: #1a4731;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #22543d;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
