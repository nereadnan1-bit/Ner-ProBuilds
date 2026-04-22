// main.js - common scripts for all pages

// Netlify Identity redirect for admin
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    }
  });
}

// Search bar functionality (simple client-side search on page content)
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('form[role="search"]');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchForm.querySelector('input[type="search"]').value.toLowerCase();
      // Simple implementation: search within the current page's text
      const bodyText = document.body.innerText.toLowerCase();
      if (bodyText.includes(query)) {
        alert(`Found "${query}" on this page. Use browser find (Ctrl+F) to locate.`);
      } else {
        alert(`"${query}" not found on this page.`);
      }
    });
  }
});