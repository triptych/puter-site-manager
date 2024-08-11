import { initAuth, checkAuthStatus } from './auth.js';
import { loadSites, setupNewSiteForm } from './sites.js';

const init = async () => {
    await initAuth();
    const isLoggedIn = await checkAuthStatus();
    if (isLoggedIn) {
        document.getElementById('siteList').style.display = 'block';
        await loadSites();
        setupNewSiteForm();
    }
};

init();