// academics.js - Fetch and display certifications, CV, publications
const GITHUB_USER = 'nereadnan1-bit';
const GITHUB_REPO = 'Ner-ProBuilds.git';
const ACADEMICS_PATH = 'content/academics';

async function fetchAcademics() {
  const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${ACADEMICS_PATH}`;
  try {
    const resp = await fetch(apiUrl);
    const files = await resp.json();
    const mdFiles = files.filter(f => f.name.endsWith('.md'));
    
    const items = [];
    for (const file of mdFiles) {
      const contentResp = await fetch(file.download_url);
      const content = await contentResp.text();
      const data = parseFrontmatter(content);
      items.push(data);
    }
    renderAcademics(items);
  } catch (err) {
    console.error(err);
    document.getElementById('academics-container').innerHTML = '<p class="text-danger">Failed to load academic items.</p>';
  }
}

function parseFrontmatter(md) {
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = md.match(fmRegex);
  if (!match) return { title: 'Untitled', description: '', body: md };
  const fm = match[1];
  const body = match[2];
  const data = {};
  fm.split('\n').forEach(line => {
    const [key, ...val] = line.split(':');
    if (key && val.length) data[key.trim()] = val.join(':').trim();
  });
  return { ...data, body };
}

function renderAcademics(items) {
  const container = document.getElementById('academics-container');
  let html = '<div class="row">';
  items.forEach(item => {
    html += `
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="row g-0">
            <div class="col-md-4">
              <img src="${item.image || 'https://via.placeholder.com/150'}" class="img-fluid rounded-start" alt="${item.title}">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text">${item.description || ''}</p>
                ${item.pdf ? `<a href="${item.pdf}" class="btn btn-sm btn-primary" target="_blank">Download PDF</a>` : ''}
                <p class="mt-2"><small class="text-muted">Type: ${item.type || 'Other'}</small></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

if (document.getElementById('academics-container')) {
  fetchAcademics();
}