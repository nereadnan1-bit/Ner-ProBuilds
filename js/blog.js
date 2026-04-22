// blog.js - Fetches blog posts from GitHub repository
// Configuration: Replace with your GitHub username and repo name
const GITHUB_USER = 'nereadnan1-bit';
const GITHUB_REPO = 'Ner-ProBuilds.git';
const BLOG_PATH = 'content/blog';

async function fetchBlogPosts() {
  const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${BLOG_PATH}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch blog list');
    const files = await response.json();
    const markdownFiles = files.filter(file => file.name.endsWith('.md'));
    
    const posts = [];
    for (const file of markdownFiles) {
      const contentResp = await fetch(file.download_url);
      const content = await contentResp.text();
      const post = parseFrontmatter(content);
      post.slug = file.name.replace('.md', '');
      posts.push(post);
    }
    
    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderBlogPosts(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    document.getElementById('blog-posts-container').innerHTML = 
      '<p class="text-danger">Unable to load blog posts. Please try again later.</p>';
  }
}

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

function renderBlogPosts(posts) {
  const container = document.getElementById('blog-posts-container');
  if (!container) return;
  
  if (posts.length === 0) {
    container.innerHTML = '<p>No blog posts yet. Check back soon!</p>';
    return;
  }
  
  let html = '<div class="row">';
  posts.forEach(post => {
    // Use marked.js to render markdown body (include marked CDN in blog.html)
    const excerpt = post.body ? post.body.substring(0, 200) + '...' : '';
    html += `
      <div class="col-md-6 mb-4">
        <div class="card h-100 shadow-sm">
          ${post.thumbnail ? `<img src="${post.thumbnail}" class="card-img-top" alt="${post.title}">` : ''}
          <div class="card-body">
            <h5 class="card-title">${post.title}</h5>
            <p class="text-muted">${new Date(post.date).toLocaleDateString()}</p>
            <p class="card-text">${excerpt}</p>
            <a href="#" class="btn btn-outline-primary read-more" data-slug="${post.slug}">Read More</a>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
  
  // Add event listeners for "Read More" (you could implement a modal or detail page)
  document.querySelectorAll('.read-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = btn.dataset.slug;
      alert(`Full post view not implemented in this demo. Slug: ${slug}`);
      // In a real implementation, you'd fetch the full post and display it in a modal.
    });
  });
}

// Initialize on blog page
if (document.getElementById('blog-posts-container')) {
  fetchBlogPosts();
}