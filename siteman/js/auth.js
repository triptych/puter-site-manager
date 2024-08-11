const authStatusElement = document.getElementById('authStatus');

export const initAuth = async () => {
    if (!puter.auth.isSignedIn()) {
        try {
            await puter.auth.signIn();
        } catch (error) {
            console.error('Error signing in:', error);
        }
    }
};

export const checkAuthStatus = async () => {
    const isLoggedIn = puter.auth.isSignedIn();
    updateAuthStatus(isLoggedIn);
    return isLoggedIn;
};

export const logout = async () => {
    puter.auth.signOut();
    updateAuthStatus(false);
    document.getElementById('siteList').style.display = 'none';
    document.getElementById('newSiteForm').style.display = 'none';
};

const updateAuthStatus = (isLoggedIn) => {
    if (isLoggedIn) {
        authStatusElement.innerHTML = `
            <span>Logged in</span>
            <button id="logoutBtn">Logout</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', logout);
    } else {
        authStatusElement.innerHTML = '<span>Not logged in</span>';
    }
};