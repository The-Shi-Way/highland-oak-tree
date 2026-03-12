<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <TreePine :size="28" :stroke-width="1.5" class="brand-icon" />
        <h1>The Highland Oak Tree</h1>
      </div>
      <p class="login-subtitle">
        <Lock :size="14" />
        Admin Login
      </p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">
            <User :size="14" />
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="Enter your email"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="password">
            <KeyRound :size="14" />
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
            :disabled="loading"
          />
        </div>
        <p v-if="errorMsg" class="error-msg" role="alert">
          <AlertCircle :size="14" />
          {{ errorMsg }}
        </p>
        <button type="submit" class="login-btn" :disabled="loading">
          <Loader2 v-if="loading" :size="16" class="spin-icon" />
          <LogIn v-else :size="16" />
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TreePine, Lock, User, KeyRound, LogIn, Loader2, AlertCircle } from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

definePageMeta({ layout: false });

useHead({ title: 'Login | Admin | The Highland Oak Tree' });

const { login, store } = useAuth();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

if (store.isAuthenticated) {
  navigateTo('/admin');
}

async function handleLogin(): Promise<void> {
  errorMsg.value = '';
  loading.value = true;
  try {
    await login({ email: email.value, password: password.value });
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
  background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f0f9ff 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.login-card {
  background: white;
  padding: 2.75rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.brand-icon {
  color: #1a4731;
  opacity: 0.8;
}

.login-card h1 {
  font-family: 'Georgia', serif;
  color: #1a4731;
  font-size: 1.5rem;
  margin: 0;
  letter-spacing: -0.01em;
}

.login-subtitle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #94a3b8;
  font-size: 0.82rem;
  margin: 0.5rem 0 2rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 1.15rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  color: #4b5563;
  margin-bottom: 0.4rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.92rem;
  box-sizing: border-box;
  transition: all 0.2s;
  background: #fafbfc;
}

.form-group input:focus {
  outline: none;
  border-color: #1a4731;
  background: white;
  box-shadow: 0 0 0 3px rgba(26, 71, 49, 0.08);
}

.form-group input::placeholder {
  color: #c4cad2;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #dc2626;
  font-size: 0.84rem;
  margin: 0 0 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #fef2f2;
  border-radius: 6px;
}

.login-btn {
  width: 100%;
  padding: 0.7rem;
  background: linear-gradient(135deg, #1a4731, #22543d);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-weight: 500;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #22543d, #276749);
  box-shadow: 0 2px 8px rgba(26, 71, 49, 0.2);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
