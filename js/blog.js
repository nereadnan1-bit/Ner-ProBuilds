// blog.js - Fetch and display blog posts from GitHub (authenticated)
// ================================================================
// CONFIGURATION: Replace with your actual details
const GITHUB_USER = 'nereadnan1-bit';       // e.g., 'johndoe'
const GITHUB_REPO = 'Ner-ProBuilds.git';             // e.g., 'personal-business-website'
const GITHUB_TOKEN = 'YOUR_PERSONAL_ACCESS_TOKEN'; // Keep this secret! Do NOT commit to public repos.
const BLOG_PATH = 'content/blog';

// Helper: Parse frontmatter from Markdown
function parseFrontmatter(markdown) {
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(fmRegex);
  if (!match) return { title: 'Untitled', date: new Date().toISOString(), body: markdown };
  
  const frontmatter = match[1];
  const body = match[2];
  const data = {};
  frontmatter.split('\n').forEach(line => {
    const [key, ...valueArr] = line.split(':');
    if (key && valueArr.length) {
      data[key.trim()] = valueArr.join(':').trim();
    }
  });
  return { ...data, body };
}

// Render posts into the page
function renderBlogPosts(posts) {
  const container = document.getElementById('blog-posts-container');
  if (!container) return;
  
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info">
        <h4>No blog posts yet.</h4>
        <p>Visit the <a href="/admin/" target="_blank">admin panel</a> to create your first post!</p>
      </div>
    `;
    return;
  }
  
  let html = '<div class="row">';
  posts.forEach(post => {
    const excerpt = post.body ? post.body.substring(0, 200).replace(/#/g, '') + '...' : '';
    const thumbnail = post.thumbnail || 'https://via.placeholder.com/600x400?text=Blog+Post';
    const dateStr = post.date ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    
    html += `
      <div class="col-md-6 mb-4">
        <div class="card h-100 shadow-sm">
          <img src="${thumbnail}" class="card-img-top" alt="${post.title}" style="height:200px; object-fit:cover;">
          <div class="card-body">
            <h5 class="card-title">${post.title || 'Untitled'}</h5>
            ${dateStr ? `<p class="text-muted small">${dateStr}</p>` : ''}
            <p class="card-text">${excerpt}</p>
            <button class="btn btn-outline-primary read-more" data-slug="${post.slug}">Read More</button>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
  
  // "Read More" buttons (simple alert for demo)
  document.querySelectorAll('.read-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const slug = btn.dataset.slug;
      alert(`Full post view not implemented. Slug: ${slug}\n(You can implement a modal or detail page.)`);
    });
  });
}

// Fetch list of markdown files from GitHub
async function fetchBlogPosts() {
  const container = document.getElementById('blog-posts-container');
  container.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
  
  const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${BLOG_PATH}`;
  
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    if (GITHUB_TOKEN && GITHUB_TOKEN !== 'YOUR_PERSONAL_ACCESS_TOKEN') {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Blog folder not found. Create a blog post via the CMS first.');
      } else if (response.status === 403 && !GITHUB_TOKEN) {
        throw new Error('GitHub API rate limit exceeded. Add a personal access token to blog.js.');
      } else {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
    }
    
    const files = await response.json();
    const markdownFiles = files.filter(file => file.name.endsWith('.md'));
    
    if (markdownFiles.length === 0) {
      renderBlogPosts([]);
      return;
    }
    
    // Fetch content of each markdown file
    const posts = [];
    for (const file of markdownFiles) {
      try {
        const contentResp = await fetch(file.download_url, { headers });
        const content = await contentResp.text();
        const post = parseFrontmatter(content);
        post.slug = file.name.replace('.md', '');
        posts.push(post);
      } catch (err) {
        console.warn(`Failed to fetch ${file.name}:`, err);
      }
    }
    
    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderBlogPosts(posts);
    
  } catch (error) {
    console.error('Blog fetch error:', error);
    container.innerHTML = `
      <div class="alert alert-danger">
        <h4>Unable to load blog posts</h4>
        <p>${error.message}</p>
        <hr>
        <p class="mb-0"><strong>Troubleshooting:</strong></p>
        <ul>
          <li>Have you created any blog posts via the <a href="/admin/">admin panel</a>?</li>
          <li>Is your GitHub username and repo name correct in <code>blog.js</code>?</li>
          <li>If you see a rate limit error, add a GitHub personal access token to <code>blog.js</code>.</li>
        </ul>
      </div>
    `;
  }
}

// Start fetching when DOM is ready
if (document.getElementById('blog-posts-container')) {
  fetchBlogPosts();
}