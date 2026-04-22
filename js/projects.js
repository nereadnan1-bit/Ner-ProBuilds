// projects.js - Fetches and renders project items
const GITHUB_USER = 'nereadnan1-bit';
const GITHUB_REPO = 'Ner-ProBuilds.git';
const PROJECTS_PATH = 'content/projects';

async function fetchProjects() {
  const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${PROJECTS_PATH}`;
  try {
    const response = await fetch(apiUrl);
    const files = await response.json();
    const mdFiles = files.filter(f => f.name.endsWith('.md'));
    
    const projects = [];
    for (const file of mdFiles) {
      const contentResp = await fetch(file.download_url);
      const content = await contentResp.text();
      const data = parseFrontmatter(content);
      projects.push(data);
    }
    renderProjects(projects);
  } catch (error) {
    console.error(error);
    document.getElementById('projects-container').innerHTML = '<p class="text-danger">Failed to load projects.</p>';
  }
}

function parseFrontmatter(md) {
  // Same parser as blog.js
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = md.match(fmRegex);
  if (!match) return { title: 'Untitled', description: '', body: md };
  const frontmatter = match[1];
  const body = match[2];
  const data = {};
  frontmatter.split('\n').forEach(line => {
    const [key, ...val] = line.split(':');
    if (key && val.length) data[key.trim()] = val.join(':').trim();
  });
  return { ...data, body };
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  let html = '<div class="row">';
  projects.forEach(p => {
    html += `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${p.image || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="${p.title}">
          <div class="card-body">
            <h5 class="card-title">${p.title}</h5>
            <p class="card-text">${p.description || ''}</p>
            ${p.link ? `<a href="${p.link}" class="btn btn-sm btn-primary" target="_blank">View Project</a>` : ''}
            ${p.pdf ? `<a href="${p.pdf}" class="btn btn-sm btn-outline-secondary ms-2" target="_blank">PDF</a>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

if (document.getElementById('projects-container')) {
  fetchProjects();
}