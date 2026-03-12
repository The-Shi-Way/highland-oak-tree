<template>
  <div class="site-wrapper">
    <header class="site-header">
      <nav class="nav-container" role="navigation" aria-label="Main navigation">
        <NuxtLink to="/" class="site-logo">The Highland Oak Tree</NuxtLink>
        <ul class="nav-links">
          <li><NuxtLink to="/">Blog</NuxtLink></li>
          <li><NuxtLink to="/poetry">Poetry</NuxtLink></li>
          <li><NuxtLink to="/search">Search</NuxtLink></li>
        </ul>
      </nav>
    </header>

    <main class="site-main" role="main">
      <slot />
    </main>

    <footer class="site-footer" role="contentinfo">
      <p>&copy; {{ new Date().getFullYear() }} The Highland Oak Tree. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.site-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #2c3e50;
}

.site-header {
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 2rem;
  background: #fafaf9;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a4731;
  text-decoration: none;
  letter-spacing: -0.02em;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: #4a5568;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #1a4731;
}

.site-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.site-footer {
  border-top: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
  text-align: center;
  color: #718096;
  font-size: 0.85rem;
  background: #fafaf9;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 0.75rem;
  }
  .nav-links {
    gap: 1.25rem;
  }
  .site-main {
    padding: 1rem;
  }
}
</style>
