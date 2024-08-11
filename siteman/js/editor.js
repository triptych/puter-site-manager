import { loadSites } from './sites.js';

let editor;
let currentSubdomain;
let currentPath;

const readBlobAsText = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(blob);
    });
};

export const openEditor = async (subdomain, path) => {
    currentSubdomain = subdomain;
    currentPath = path;
    const editorDialog = document.getElementById('editorDialog');
    editorDialog.style.display = 'block';

    if (!editor) {
        editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/html");
    }

    try {
        const content = await puter.fs.read(`${path}/index.html`);
        console.log('Raw file content:', content);  // Log the raw content

        let stringContent;
        if (content instanceof Blob) {
            stringContent = await readBlobAsText(content);
        } else if (typeof content === 'string') {
            stringContent = content;
        } else if (content instanceof ArrayBuffer) {
            stringContent = new TextDecoder().decode(content);
        } else if (typeof content === 'object' && content !== null) {
            stringContent = JSON.stringify(content, null, 2);
        } else {
            stringContent = String(content);
        }

        console.log('Processed file content:', stringContent);  // Log the processed content

        editor.setValue(stringContent);
        editor.clearSelection();
    } catch (error) {
        console.error('Error reading file:', error);
        editor.setValue(`Error reading file: ${error.message}`);
        alert('Error reading file. Check the editor for details.');
    }

    setupEditorButtons();
};

const setupEditorButtons = () => {
    document.getElementById('saveBtn').addEventListener('click', saveFile);
    document.getElementById('reloadBtn').addEventListener('click', reloadFile);
    document.getElementById('closeBtn').addEventListener('click', closeEditor);
};

const saveFile = async () => {
    try {
        const content = editor.getValue();
        await puter.fs.write(`${currentPath}/index.html`, content);
        alert('File saved successfully!');
    } catch (error) {
        console.error('Error saving file:', error);
        alert(`Error saving file: ${error.message}`);
    }
};

const reloadFile = async () => {
    try {
        const content = await puter.fs.read(`${currentPath}/index.html`);
        console.log('Raw file content:', content);  // Log the raw content

        let stringContent;
        if (content instanceof Blob) {
            stringContent = await readBlobAsText(content);
        } else if (typeof content === 'string') {
            stringContent = content;
        } else if (content instanceof ArrayBuffer) {
            stringContent = new TextDecoder().decode(content);
        } else if (typeof content === 'object' && content !== null) {
            stringContent = JSON.stringify(content, null, 2);
        } else {
            stringContent = String(content);
        }

        console.log('Processed file content:', stringContent);  // Log the processed content

        editor.setValue(stringContent);
        editor.clearSelection();
    } catch (error) {
        console.error('Error reloading file:', error);
        editor.setValue(`Error reloading file: ${error.message}`);
        alert('Error reloading file. Check the editor for details.');
    }
};

const closeEditor = () => {
    const editorDialog = document.getElementById('editorDialog');
    editorDialog.style.display = 'none';
    loadSites();
};