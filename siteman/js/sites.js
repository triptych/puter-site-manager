import { createBasicIndexHtml } from './utils.js';
import { openEditor } from './editor.js';

const siteListElement = document.getElementById('sites');
const newSiteBtn = document.getElementById('newSiteBtn');
const newSiteForm = document.getElementById('newSiteForm');
const createSiteForm = document.getElementById('createSiteForm');
const chooseDirBtn = document.getElementById('chooseDirBtn');
const selectedDirElement = document.getElementById('selectedDir');
const cancelNewSiteBtn = document.getElementById('cancelNewSite');

let selectedDirectory = null;

export const loadSites = async () => {
    try {
        const sites = await puter.hosting.list();
        siteListElement.innerHTML = '';
        for (const site of sites) {
            const li = document.createElement('li');
            const hasIndexHtml = site.root_dir ? await checkForIndexHtml(site.root_dir.path) : false;
            li.innerHTML = `
                <div class="site-info">
                    <span>${site.subdomain}.puter.site</span>
                    <div class="site-buttons">
                        <button class="openSiteBtn" data-url="https://${site.subdomain}.puter.site">Open</button>
                        <button class="changeFolderBtn" data-subdomain="${site.subdomain}">Change Folder</button>
                        ${hasIndexHtml ? `<button class="editSiteBtn" data-subdomain="${site.subdomain}" data-path="${site.root_dir.path}">Edit Site</button>` : ''}
                        <button class="deleteSiteBtn" data-subdomain="${site.subdomain}">Delete</button>
                    </div>
                </div>
                <div class="folder-path">Folder: ${site.root_dir ? site.root_dir.path : 'Not set'}</div>
            `;
            siteListElement.appendChild(li);
        }
        setupSiteButtons();
    } catch (error) {
        console.error('Error loading sites:', error);
        siteListElement.innerHTML = `<p>Error loading sites: ${error.message}</p>`;
    }
};

const checkForIndexHtml = async (path) => {
    if (!path) return false;
    try {
        await puter.fs.stat(`${path}/index.html`);
        return true;
    } catch (error) {
        return false;
    }
};

const setupSiteButtons = () => {
    document.querySelectorAll('.openSiteBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            window.open(e.target.dataset.url, '_blank');
        });
    });

    document.querySelectorAll('.changeFolderBtn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const subdomain = e.target.dataset.subdomain;
            try {
                const newDirectory = await puter.ui.showDirectoryPicker();
                if (newDirectory && newDirectory.path) {
                    await puter.hosting.update(subdomain, newDirectory.path);
                    await loadSites();
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error changing folder:', error);
                    alert('Error changing folder. Please try again.');
                }
            }
        });
    });

    document.querySelectorAll('.editSiteBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const subdomain = e.target.dataset.subdomain;
            const path = e.target.dataset.path;
            if (path) {
                openEditor(subdomain, path);
            } else {
                alert('Cannot edit site: No folder set');
            }
        });
    });

    document.querySelectorAll('.deleteSiteBtn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const subdomain = e.target.dataset.subdomain;
            if (confirm(`Are you sure you want to delete ${subdomain}.puter.site?`)) {
                try {
                    await puter.hosting.delete(subdomain);
                    await loadSites();
                } catch (error) {
                    console.error('Error deleting site:', error);
                    alert(`Error deleting site: ${error.message}`);
                }
            }
        });
    });
};

export const setupNewSiteForm = () => {
    newSiteBtn.addEventListener('click', () => {
        newSiteForm.style.display = 'block';
    });

    cancelNewSiteBtn.addEventListener('click', () => {
        newSiteForm.style.display = 'none';
        createSiteForm.reset();
        selectedDirectory = null;
        selectedDirElement.textContent = '';
    });

    chooseDirBtn.addEventListener('click', async () => {
        try {
            selectedDirectory = await puter.ui.showDirectoryPicker();
            selectedDirElement.textContent = `Selected: ${selectedDirectory.path}`;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error choosing directory:', error);
                alert('Error choosing directory. Please try again.');
            }
        }
    });

    createSiteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const siteName = document.getElementById('siteName').value;
        const addIndexHtml = document.getElementById('addIndexHtml').checked;

        if (!selectedDirectory) {
            alert('Please choose a directory');
            return;
        }

        try {
            if (addIndexHtml) {
                await puter.fs.write(`${selectedDirectory.path}/index.html`, createBasicIndexHtml(siteName));
            }

            await puter.hosting.create(siteName, selectedDirectory.path);
            await loadSites();
            newSiteForm.style.display = 'none';
            createSiteForm.reset();
            selectedDirectory = null;
            selectedDirElement.textContent = '';
        } catch (error) {
            console.error('Error creating site:', error);
            alert(`Error creating site: ${error.message}`);
        }
    });
};