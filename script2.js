/* --- CONFIGURATION & DATA INITIALE --- */
const STORAGE_KEY = 'minimalist_startpage_data_v1';

const DEFAULT_DATA = {
    customLogo: './icon/hello.webp',
    customBg: '',
    quickLinks: [
        { id: 'q1', title: 'GitHub', url: 'https://github.com', icon: 'https://github.com/favicon.ico' },
        { id: 'q2', title: 'YouTube', url: 'https://youtube.com', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvADlQkrEfqbNAacqecqMZWFgiZvzrYXbiO57yvrmAuhRzUFcCLnlUUZvq&s=10' },
        { id: 'q3', title: 'Reddit', url: 'https://reddit.com', icon: 'https://d2q79iu7y748jz.cloudfront.net/s/_squarelogo/256x256/0d052849e7c7a6a968344e33cbca5a7a' },
        { id: 'q4', title: 'Gmail', url: 'https://mail.google.com', icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico' }
    ],
    sidebarCategories: [
        {
            id: 'c1', name: 'Sports', links: [
                { id: 's1', title: 'Basket usa', url: 'https://www.basketusa.com/', icon: '🏀' },
                { id: 's2', title: 'BBC', url: 'https://bbc.com', icon: '📰' }
            ]
        },
        {
            id: 'c2', name: 'Download', links: [
                { id: 's3', title: 'HackerNews', url: 'https://news.ycombinator.com', icon: '🧑‍💻' },
                { id: 's4', title: 'ProductHunt', url: 'https://producthunt.com', icon: '🏷️' }
            ]
        }
    ]
};

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_DATA;


/* --- FONCTIONS DE SAUVEGARDE & APPLIANCE DU STYLE --- */

function applyCustomAppearance() {
    // Application du logo
    const logoEl = document.querySelector('.logo');
    if (logoEl) {
        const logoUrl = appData.customLogo || './icon/hello.webp';
        logoEl.style.backgroundImage = `url('${logoUrl}')`;
    }

    // Application du fond d'écran
    if (appData.customBg && appData.customBg.trim() !== '') {
        document.body.style.backgroundImage = `url('${appData.customBg}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    } else {
        document.body.style.backgroundImage = '';
    }
}

// 1. Sauvegarde pour les éditions (n'appelle pas renderAll pour éviter de fermer la sidebar)
function saveAndRefresh() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    renderQuickLinks();
    renderSidebar();
    applyCustomAppearance();
}

// 2. Sauvegarde simple (utilisée lors de gros changements)
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    renderAll();
}

// 3. Sauvegarde de l'ordre après Drag & Drop (lit le DOM actuel)
function saveOrderAfterDrag() {
    // Mise à jour des liens rapides
    const newQuickLinks = [];
    document.querySelectorAll('.quick-pill').forEach(el => {
        const id = el.dataset.id;
        const originalLink = appData.quickLinks.find(l => l.id === id);
        if (originalLink) newQuickLinks.push(originalLink);
    });
    appData.quickLinks = newQuickLinks;

    // Mise à jour de la sidebar
    const newSidebarCategories = [];
    document.querySelectorAll('.category-block').forEach(block => {
        const catId = block.dataset.id;
        const catName = block.querySelector('.category-title span').innerText;
        
        const links = [];
        block.querySelectorAll('.sidebar-link').forEach(linkEl => {
            const linkId = linkEl.dataset.id;
            let foundLink = null;
            appData.sidebarCategories.forEach(c => {
                const l = c.links.find(item => item.id === linkId);
                if(l) foundLink = l;
            });
            if(foundLink) links.push(foundLink);
        });

        newSidebarCategories.push({ id: catId, name: catName, links: links });
    });
    appData.sidebarCategories = newSidebarCategories;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

/* --- MOTEUR DE RENDU --- */

function isImageFile(path) {
    if (!path) return false;
    return path.startsWith('http') || path.includes('/') || /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i.test(path);
}

function renderAll() {
    applyCustomAppearance();
    renderQuickLinks();
    renderSidebar();
}

function renderQuickLinks() {
    const container = document.getElementById('quick-links');
    container.innerHTML = '';
    appData.quickLinks.forEach((link, index) => {
        const li = document.createElement('li');
        let iconHtml = isImageFile(link.icon) ? `<img src="${link.icon}" alt="icon">` : link.icon;
        li.innerHTML = `
            <a href="${link.url}" class="quick-pill" data-id="${link.id}" data-type="quick"
               style="animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: ${index * 0.08}s; opacity: 0;">
                <div class="pill-icon">${iconHtml}</div>
                <span class="pill-text">${link.title}</span>
            </a>
        `;
        li.querySelector('a').addEventListener('contextmenu', handleContextMenu);
        container.appendChild(li);
    });
}

function renderSidebar() {
    const container = document.getElementById('sidebar-content');
    container.innerHTML = '';

    appData.sidebarCategories.forEach((cat, index) => {
        const catDiv = document.createElement('div');
        catDiv.className = 'category-block';
        catDiv.dataset.id = cat.id;
        catDiv.style.transitionDelay = `${index * 0.1}s`;
        
        const linksHtml = cat.links.map(link => {
            let iconHtml = isImageFile(link.icon) ? `<img src="${link.icon}">` : `<span>${link.icon}</span>`;
            return `<a href="${link.url}" class="sidebar-link" data-id="${link.id}" data-cat-id="${cat.id}" data-type="sidebar">${iconHtml} <span>${link.title}</span></a>`;
        }).join('');

        catDiv.innerHTML = `
            <div class="category-title">
                <span>${cat.name}</span>
                <button onclick="addLinkToCategory('${cat.id}')" class="btn-small" style="border:none; color:inherit; opacity:0.5; cursor:pointer;">+</button>
            </div>
            <div class="cat-links">
                ${linksHtml}
            </div>
        `;
        catDiv.querySelectorAll('.sidebar-link').forEach(el => el.addEventListener('contextmenu', handleContextMenu));
        container.appendChild(catDiv);
    });
    
    initSidebarSortable();
}

/* --- GESTION DES MENUS CONTEXTUELS --- */
const contextMenu = document.getElementById('context-menu');
let currentContextTarget = null;

function handleContextMenu(e) {
    e.preventDefault();
    currentContextTarget = e.currentTarget;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.classList.remove('hidden');
    document.addEventListener('click', closeContextMenu, { once: true });
}

function closeContextMenu() { contextMenu.classList.add('hidden'); }

document.getElementById('ctx-edit').addEventListener('click', () => { if(currentContextTarget) openModal(currentContextTarget); });

document.getElementById('ctx-delete').addEventListener('click', () => {
    if(!currentContextTarget) return;
    const type = currentContextTarget.dataset.type;
    const id = currentContextTarget.dataset.id;
    if(confirm('Supprimer ce raccourci ?')) {
        if(type === 'quick') {
            appData.quickLinks = appData.quickLinks.filter(l => l.id !== id);
        } else {
            const catId = currentContextTarget.dataset.catId;
            const cat = appData.sidebarCategories.find(c => c.id === catId);
            if(cat) cat.links = cat.links.filter(l => l.id !== id);
        }
        saveData();
    }
});

/* --- MODALE ÉDITION --- */
const modal = document.getElementById('modal-editor');
const inputTitle = document.getElementById('input-title');
const inputUrl = document.getElementById('input-url');
const inputIcon = document.getElementById('input-icon');
const modalId = document.getElementById('modal-id');
const modalType = document.getElementById('modal-type');
const modalCat = document.getElementById('modal-category');

function openModal(targetElement = null, isNewQuick = false, newCatId = null) {
    modal.classList.remove('hidden');
    if (isNewQuick) {
        modalType.value = 'quick'; modalId.value = ''; clearInputs();
    } else if (newCatId) {
        modalType.value = 'sidebar'; modalCat.value = newCatId; modalId.value = ''; clearInputs();
    } else if (targetElement) {
        const id = targetElement.dataset.id;
        const type = targetElement.dataset.type;

        modalId.value = id;
        modalType.value = type;

        if (type === 'sidebar') {
            modalCat.value = targetElement.dataset.catId;
        }

        let data = (type === 'quick')
            ? appData.quickLinks.find(l => l.id === id)
            : appData.sidebarCategories
                .find(c => c.id === targetElement.dataset.catId)
                .links.find(l => l.id === id);

        inputTitle.value = data.title;
        inputUrl.value = data.url;
        inputIcon.value = data.icon;
    }
}

function clearInputs() { inputTitle.value = ''; inputUrl.value = ''; inputIcon.value = ''; }
document.getElementById('btn-cancel').addEventListener('click', () => modal.classList.add('hidden'));

document.getElementById('btn-save').addEventListener('click', () => {
    const id = modalId.value; const type = modalType.value;
    const newLink = { id: id || 'id_' + Date.now(), title: inputTitle.value || 'Lien', url: inputUrl.value || '#', icon: inputIcon.value || '🔗' };
    
    if(type === 'quick') {
        if(id) appData.quickLinks[appData.quickLinks.findIndex(l => l.id === id)] = newLink;
        else appData.quickLinks.push(newLink);
    } else {
        const cat = appData.sidebarCategories.find(c => c.id === modalCat.value);
        if(id) cat.links[cat.links.findIndex(l => l.id === id)] = newLink;
        else cat.links.push(newLink);
    }
    saveData();
    modal.classList.add('hidden');
});

/* --- DRAG & DROP (SORTABLE) --- */
const quickLinksEl = document.getElementById('quick-links');
new Sortable(quickLinksEl, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    delay: 200,
    delayOnTouchOnly: true,
    touchStartThreshold: 5,
    onEnd: saveOrderAfterDrag
});

function initSidebarSortable() {
    document.querySelectorAll('.cat-links').forEach(cat => {
        new Sortable(cat, {
            group: 'sidebar-links',
            animation: 150,
            ghostClass: 'sortable-ghost',
            delay: 200,
            delayOnTouchOnly: true,
            touchStartThreshold: 5,
            onEnd: saveOrderAfterDrag
        });
    });
}

/* --- AUTRES ÉVÉNEMENTS --- */
document.getElementById('add-quick-btn').addEventListener('click', () => openModal(null, true));
window.addLinkToCategory = (catId) => openModal(null, false, catId);

const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebar.classList.toggle('closed');
    menuBtn.classList.toggle('active');
    overlay.classList.toggle('active');
}
menuBtn.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

document.getElementById('add-sidebar-cat-btn').addEventListener('click', () => {
    const name = prompt("Nom de la nouvelle catégorie :");
    if(name) { appData.sidebarCategories.push({ id: 'c_' + Date.now(), name: name, links: [] }); saveData(); }
});

// Recherche
document.getElementById('se-toggle').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('se-dropdown').classList.toggle('hidden');
});

document.querySelectorAll('#se-dropdown li').forEach(item => {
    item.addEventListener('click', () => {
        document.getElementById('search-form').action = item.dataset.url;
        document.getElementById('search-input').name = item.dataset.name;
        document.getElementById('current-se-icon').src = item.dataset.icon;
        document.getElementById('se-dropdown').classList.add('hidden');
    });
});

document.querySelector('.search-submit').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('search-form').submit();
});

// Settings Modal
const settingsModal = document.getElementById('modal-settings');
const inputLogoUrl = document.getElementById('input-logo-url');
const inputBgUrl = document.getElementById('input-bg-url');

document.getElementById('settings-btn').addEventListener('click', () => {
    inputLogoUrl.value = appData.customLogo || '';
    inputBgUrl.value = appData.customBg || '';
    settingsModal.classList.remove('hidden');
});

document.getElementById('btn-close-settings').addEventListener('click', () => settingsModal.classList.add('hidden'));

document.getElementById('btn-save-settings').addEventListener('click', () => {
    appData.customLogo = inputLogoUrl.value.trim();
    appData.customBg = inputBgUrl.value.trim();
    saveData();
    settingsModal.classList.add('hidden');
});

document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm("Tout supprimer ?")) { appData = DEFAULT_DATA; saveData(); location.reload(); }
});

// Start
renderAll();
const searchInput = document.getElementById('search-input');
const suggestionsList = document.getElementById('search-suggestions');
const searchForm = document.getElementById('search-form');

// Fonction pour récupérer les suggestions via JSONP
function getGoogleSuggestions(query) {
    if (query.length < 2) {
        suggestionsList.classList.add('hidden');
        return;
    }

    const script = document.createElement('script');
    script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&callback=handleSuggestions`;
    document.body.appendChild(script);
    document.body.removeChild(script);
}

// Callback appelé par l'API Google
window.handleSuggestions = function(data) {
    const suggestions = data[1];
    if (suggestions.length === 0) {
        suggestionsList.classList.add('hidden');
        return;
    }

    suggestionsList.innerHTML = '';
    suggestions.slice(0, 6).forEach(suggestion => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.textContent = suggestion;
        li.onclick = () => {
            searchInput.value = suggestion;
            searchForm.submit();
        };
        suggestionsList.appendChild(li);
    });
    suggestionsList.classList.remove('hidden');
};

let debounceTimer;
searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        getGoogleSuggestions(e.target.value);
    }, 200);
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        suggestionsList.classList.add('hidden');
    }
});

/* --- IMPORT / EXPORT PAR FICHIER --- */

// EXPORT : Crée un fichier et déclenche le téléchargement
document.getElementById('btn-export-file').addEventListener('click', () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'startpage_config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

// IMPORT : Lit le fichier sélectionné
document.getElementById('input-import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const newData = JSON.parse(event.target.result);
            if (newData.quickLinks && newData.sidebarCategories) {
                if (confirm("Importer cette configuration ? Cela écrasera vos données actuelles.")) {
                    appData = newData;
                    saveData();
                    location.reload();
                }
            } else {
                alert("Format de fichier invalide.");
            }
        } catch (err) {
            alert("Erreur lors de la lecture du fichier JSON.");
        }
    };
    reader.readAsText(file);
});