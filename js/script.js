document.addEventListener('DOMContentLoaded', () => {
    // Elements specific to index.html or list.html
    const postsPlaceholder = document.getElementById('posts-container');
    const modal = document.getElementById('music-player-modal');
    const modalLogo = document.getElementById('modal-logo');
    const modalTitle = document.getElementById('modal-title');
    const seekSlider = document.getElementById('seek-slider');
    const volumeSlider = document.getElementById('volume-slider');
    const playPauseBtn = document.getElementById('play-pause');
    const currentTimeElem = document.getElementById('current-time');
    const totalDurationElem = document.getElementById('total-duration');
    const closeModal = document.getElementById('close-modal');
    const listView = document.getElementById('list-view');
    const cardView = document.getElementById('card-view');
    const searchButton = document.getElementById('search-button');
    let sound;
    let isSeeking = false;

 // Глобальные переменные
    let allPosts = [];
    let newPosts = [];
    let fuse;

       // Загрузка данных и инициализация
       fetch('../src/data.json')
       .then(response => response.json())
       .then(data => {
           allPosts = data.posts;
           
           // Сортировка постов по дате (от новых к старым)
           allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
           
           // Определение трех самых новых постов
           newPosts = allPosts.slice(0, 3);
           
           // Инициализация Fuse.js
           const options = {
               keys: ['title', 'description', 'tags'],
               threshold: 0.3
           };
           fuse = new Fuse(allPosts, options);
           
           // Заполнение выпадающего списка тегов
           populateTagFilter();
           
           // Отображение всех постов по умолчанию
           displayPosts(allPosts);
       });


    // Only run this block if postsPlaceholder exists (index.html or list.html)
    if (postsPlaceholder) {
        fetch('../src/data.json')
            .then(response => response.json())
            .then(data => {
                // Sort posts by date (recent first)
                data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));

                // If this is index.html, show only the 10 most recent posts
                if (window.location.pathname.endsWith('index.html')) {
                    fetch('../src/data.json')
                        .then(response => response.json())
                        .then(data => {
                            // Ensure correct sorting by date (recent first)
                            data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                            const recentPosts = data.posts.slice(0, 10); // Show only the 10 most recent posts
                            displayPosts(recentPosts);
                        });
                } else {
                    // For list.html, handle search and sorting
                    const urlParams = new URLSearchParams(window.location.search);
                    const searchQuery = urlParams.get('search');

                    if (searchQuery && fuse) {
                        const results = fuse.search(searchQuery);
                        displayPosts(results.map(result => result.item));
                    } else {
                        // Default sort by alphabetically for list.html
                        data.posts.sort((a, b) => a.title.localeCompare(b.title));
                        displayPosts(data.posts);
                    }
                }
            });
    }

    if (postsPlaceholder) {
        fetch('../src/data.json')
            .then(response => response.json())
            .then(data => {
                const options = {
                    keys: ['title', 'description', 'tags'],
                    threshold: 0.3
                };
                fuse = new Fuse(data.posts, options);
    
                const urlParams = new URLSearchParams(window.location.search);
                const searchQuery = urlParams.get('search');
    
                // Sort posts by date to identify the 3 newest posts
                data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                const newPosts = data.posts.slice(0, 3); // Get the 3 most recent posts
    
                if (searchQuery) {
                    const results = fuse.search(searchQuery);
                    displayPosts(results.map(result => result.item), newPosts);
                } else {
                    // Default sort by alphabetically for list.html
                    data.posts.sort((a, b) => a.title.localeCompare(b.title));
                    displayPosts(data.posts, newPosts);
                }
            });
    }


    // Функция для заполнения выпадающего списка тегов
    function populateTagFilter() {
        const tagFilter = document.getElementById('filter-tag');
        const uniqueTags = [...new Set(allPosts.flatMap(post => post.tags))];
        
        tagFilter.innerHTML = '<option value="">Select Tag</option>';
        uniqueTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
    }

// Update displayPosts function to accept the list of newPosts
function displayPosts(posts) {
    if (!postsPlaceholder) return;
    
    postsPlaceholder.innerHTML = '';  // Clear current posts
    posts.forEach(post => {
        const isNew = newPosts.includes(post);
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <img src="${post.albumLogo}" alt="${post.title} Album Logo">
            <div class="post-card-content">
                ${isNew ? '<span class="new-pin">New!</span>' : ''}
                <h2>${post.title}</h2>
                <p class="original-name">${post.originalName}</p>
                <p>${post.description}</p>
                <p class="date">Arranged on: ${post.date}</p>
                <button onclick="openPlayer('${post.albumLogo}', '${post.title}', '${post.audioUrl}')">Play Music</button>
                ${post.versions ? `<button onclick="showVersions('${post.id}')">Show Versions</button>` : ''}
            </div>
        `;
        postsPlaceholder.appendChild(postCard);
    });
}

function displayPosts(posts) {
    function displayPosts(posts) {
        if (!postsPlaceholder) return;
        
        postsPlaceholder.innerHTML = '';  // Clear current posts
        posts.forEach(post => {
            const isNew = newPosts.includes(post);
            const isDependentVersion = post.mainVersion !== undefined;
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <img src="${post.albumLogo}" alt="${post.title} Album Logo">
                <div class="post-card-content">
                    ${isNew ? '<span class="new-pin">New!</span>' : ''}
                    ${isDependentVersion ? '<span class="dependent-version">Dependent Version</span>' : ''}
                    <h2>${post.title}</h2>
                    <p class="original-name">${post.originalName}</p>
                    <p>${post.description}</p>
                    <p class="date">Arranged on: ${post.date}</p>
                    <button class="play-music">Play Music</button>
                    ${post.versions ? '<button class="show-versions">Show Versions</button>' : ''}
                </div>
            `;
        
            const playMusicBtn = postCard.querySelector('.play-music');
            playMusicBtn.addEventListener('click', () => openPlayer(post.albumLogo, post.title, post.audioUrl));
            
            if (post.versions) {
                const showVersionsBtn = postCard.querySelector('.show-versions');
                showVersionsBtn.addEventListener('click', () => showVersions(post.id));
            }
            
            if (isDependentVersion) {
                const dependentVersionSpan = postCard.querySelector('.dependent-version');
                dependentVersionSpan.addEventListener('click', () => showVersions(post.mainVersion));
            }
            
            postsPlaceholder.appendChild(postCard);
        });
    }
}

function showVersions(postId) {
    let mainPost = allPosts.find(p => p.id === postId);
    
    // If the clicked post is a dependent version, find its main version
    if (!mainPost.versions && mainPost.mainVersion) {
        mainPost = allPosts.find(p => p.id === mainPost.mainVersion);
    }
    
    if (!mainPost || !mainPost.versions) return;

    const versions = [mainPost, ...mainPost.versions.map(versionId => allPosts.find(p => p.id === versionId))];
    const versionsModal = document.createElement('div');
    versionsModal.className = 'versions-modal';
    versionsModal.innerHTML = `
        <div class="versions-content">
            <h3>Versions of ${mainPost.title}</h3>
            <ul>
                ${versions.map(version => `
                    <li>
                        <h4>${version.title}${version.id === mainPost.id ? ' (Main Version)' : ''}</h4>
                        <p>${version.description}</p>
                        <button class="play-version">Play Music</button>
                    </li>
                `).join('')}
            </ul>
            <button class="close-modal">Close</button>
        </div>
    `;
    
    document.body.appendChild(versionsModal);
    
    // Add event listeners for the new buttons
    versionsModal.querySelectorAll('.play-version').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const version = versions[index];
            openPlayer(version.albumLogo, version.title, version.audioUrl);
        });
    });
    
    versionsModal.querySelector('.close-modal').addEventListener('click', closeVersionsModal);
}

function closeVersionsModal() {
    const modal = document.querySelector('.versions-modal');
    if (modal) {
        modal.remove();
    }
}

    function applyFilters() {
        const tagFilter = document.getElementById('filter-tag').value;
        const dateFilter = document.getElementById('filter-date').value;
        const alphaFilter = document.getElementById('filter-alpha').value;
        const showNewOnly = document.getElementById('filter-new').checked;
        const authorFilter = document.getElementById('filter-author').value.trim().toLowerCase();
        const albumFilter = document.getElementById('filter-album').value.trim().toLowerCase();

        let filteredPosts = [...allPosts]; // Начинаем с копии всех постов

    // Применяем фильтр по тегам
    if (tagFilter) {
        filteredPosts = filteredPosts.filter(post => post.tags.includes(tagFilter));
    }

    // Применяем фильтр по дате
    if (dateFilter === 'latest') {
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (dateFilter === 'oldest') {
        filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Применяем алфавитный фильтр
    if (alphaFilter === 'asc') {
        filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (alphaFilter === 'desc') {
        filteredPosts.sort((a, b) => b.title.localeCompare(a.title));
    }

    // Применяем фильтр "Показать только новые"
    if (showNewOnly) {
        filteredPosts = filteredPosts.filter(post => newPosts.includes(post));
    }

    // Применяем фильтр по автору
    if (authorFilter) {
        filteredPosts = filteredPosts.filter(post => post.author.toLowerCase().includes(authorFilter));
    }

    // Применяем фильтр по альбому
    if (albumFilter) {
        filteredPosts = filteredPosts.filter(post => post.albumLogo.toLowerCase().includes(albumFilter));
    }

        // Отображаем отфильтрованные посты
        displayPosts(filteredPosts);
    }

  // Define displayResults function to show search results
  function displayResults(posts) {
    postsPlaceholder.innerHTML = '';  // Clear current posts
    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <img src="${post.albumLogo}" alt="${post.title} Album Logo">
            <div class="post-card-content">
                <h2>${post.title}</h2>
                <p>${post.description}</p>
                <p class="date">Arranged on: ${post.date}</p>
                <button onclick="openPlayer('${post.albumLogo}', '${post.title}', '${post.audioUrl}')">Play Music</button>
            </div>
        `;
        postsPlaceholder.appendChild(postCard);
    });
}


    // Advanced Search Toggle
    const advancedSearchToggle = document.getElementById('advanced-search-toggle');
    const advancedSearchSection = document.getElementById('advanced-search');
    const applyFiltersButton = document.getElementById('apply-filters');
    
    if (advancedSearchToggle && advancedSearchSection) {
        advancedSearchToggle.addEventListener('click', () => {
            advancedSearchSection.classList.toggle('show');
            
            // Добавляем небольшую задержку перед анимацией содержимого
            if (advancedSearchSection.classList.contains('show')) {
                setTimeout(() => {
                    const children = advancedSearchSection.children;
                    Array.from(children).forEach((child, index) => {
                        child.style.animationDelay = `${index * 0.1}s`;
                    });
                }, 50);
            }
        });
    }

    if (advancedSearchSection) {
        advancedSearchSection.classList.remove('show');
    }
    
        // Apply Filters
        if (applyFiltersButton) {
            applyFiltersButton.onclick = applyFilters;
        }

    // Tag filtering logic (only if tags-container exists)
    const tagsContainer = document.getElementById('tags-container');
    if (tagsContainer) {
        fetch('../src/data.json')
            .then(response => response.json())
            .then(data => {
                const tags = [...new Set(data.posts.flatMap(post => post.tags))];  // Unique tags
                tags.forEach(tag => {
                    const tagElement = document.createElement('button');
                    tagElement.textContent = tag;
                    tagElement.classList.add('tag-button');
                    tagElement.onclick = () => filterByTag(tag);
                    tagsContainer.appendChild(tagElement);
                });
            });

        function filterByTag(tag) {
            const results = fuse.search(tag);
            displayPosts(results.map(result => result.item));
        }
    }

    // Music player logic (only if modal elements exist)
    if (modal && modalLogo && modalTitle && seekSlider && volumeSlider && playPauseBtn && currentTimeElem && totalDurationElem && closeModal) {
        window.openPlayer = (logo, title, audioUrl) => {
            modal.style.display = 'block';
            modalLogo.src = logo;
            modalTitle.textContent = title;

            if (sound) {
                sound.stop();
            }

            sound = new Howl({
                src: [audioUrl],
                volume: 0.5,
                onplay: function () {
                    requestAnimationFrame(updateSeek);
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    totalDurationElem.textContent = formatTime(sound.duration());
                },
                onpause: function () {
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                },
                onstop: function () {
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    seekSlider.value = 0;
                    currentTimeElem.textContent = "00:00";
                }
            });

            sound.play();
        };

        closeModal.onclick = () => {
            modal.style.display = 'none';
            if (sound) {
                sound.stop();
            }
        };

        playPauseBtn.onclick = () => {
            if (sound.playing()) {
                sound.pause();
            } else {
                sound.play();
            }
        };

        function updateSeek() {
            if (sound.playing() && !isSeeking) {
                const seek = sound.seek();
                seekSlider.value = (seek / sound.duration()) * 100;
                currentTimeElem.textContent = formatTime(seek);
                requestAnimationFrame(updateSeek);
            }
        }

        seekSlider.addEventListener('input', () => {
            isSeeking = true;
            const seekTo = sound.duration() * (seekSlider.value / 100);
            sound.seek(seekTo);
            currentTimeElem.textContent = formatTime(seekTo);
        });

        seekSlider.addEventListener('change', () => {
            isSeeking = false;
            updateSeek();
        });

        volumeSlider.addEventListener('input', () => {
            sound.volume(volumeSlider.value);
        });

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60) || 0;
            const secs = Math.floor(seconds - minutes * 60) || 0;
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }
    }

    // View toggle (if listView and cardView exist)
    if (listView && cardView) {
        listView.onclick = () => {
            postsPlaceholder.className = 'posts-list';
        };

        cardView.onclick = () => {
            postsPlaceholder.className = 'posts-card';
        };
    }

    // Scroll to latest posts (if see-latest button exists)
    const seeLatestButton = document.getElementById('see-latest');
    if (seeLatestButton) {
        seeLatestButton.onclick = () => {
            document.getElementById('posts-placeholder').scrollIntoView({ behavior: 'smooth' });
        };
    }

    // Search functionality
    if (searchButton) {
        searchButton.onclick = function () {
            const query = document.getElementById('search').value.trim();
            if (query) {
                // Redirect to list.html with the search query as a URL parameter
                window.location.href = `../pages/list.html?search=${encodeURIComponent(query)}`;
            }
        };
    }

    // Only run this block if postsPlaceholder exists (list.html)
if (postsPlaceholder) {
    fetch('../src/data.json')
        .then(response => response.json())
        .then(data => {
            const options = {
                keys: ['title', 'description', 'tags'],
                threshold: 0.3
            };
            fuse = new Fuse(data.posts, options);

            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search');

            if (searchQuery) {
                const results = fuse.search(searchQuery);
                displayPosts(results.map(result => result.item));
            } else {
                // Default sort by alphabetically for list.html
                data.posts.sort((a, b) => a.title.localeCompare(b.title));
                displayPosts(data.posts);
            }
        });
}



    
    const clearSearchButton = document.getElementById('clear-search');
    if (clearSearchButton) {
        clearSearchButton.onclick = () => {
            document.getElementById('search').value = '';
            window.location.href = '../pages/list.html'; // Refresh the page to show all posts
        };
    }
    

    

});
