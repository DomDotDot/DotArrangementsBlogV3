document.addEventListener('DOMContentLoaded', () => {
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
    let sound;
    let isSeeking = false;

    // Initialize Fuse.js with options
    let fuse;

    
    fetch('../src/data.json')
    .then(response => response.json())
    .then(data => {
        const options = {
            keys: ['title', 'description', 'tags'],
            threshold: 0.3
        };
        fuse = new Fuse(data.posts, options);
    });

    // Fetch posts data
    fetch('../src/data.json')
    .then(response => response.json())
    .then(data => {
        data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));  // Sort by date
        const recentPosts = data.posts.slice(0, 10);  // Get the 10 most recent posts
        recentPosts.forEach(post => {
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
        });


            // Fetch tags from the JSON and display them
        fetch('../src/data.json')
        .then(response => response.json())
        .then(data => {
            const tags = [...new Set(data.posts.flatMap(post => post.tags))];  // Unique tags
            const tagsContainer = document.getElementById('tags-container');
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
displayResults(results);
}


    // Open music player modal
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
            onplay: function() {
                requestAnimationFrame(updateSeek);
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                totalDurationElem.textContent = formatTime(sound.duration());
            },
            onpause: function() {
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            },
            onstop: function() {
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                seekSlider.value = 0;
                currentTimeElem.textContent = "00:00";
            }
        });

        sound.play();
    };

    // Close music player modal
    closeModal.onclick = () => {
        modal.style.display = 'none';
        if (sound) {
            sound.stop();
        }
    };

    // Play/Pause functionality
    playPauseBtn.onclick = () => {
        if (sound.playing()) {
            sound.pause();
        } else {
            sound.play();
        }
    };

    // Update seek slider and time
    function updateSeek() {
        if (sound.playing() && !isSeeking) {
            const seek = sound.seek();
            seekSlider.value = (seek / sound.duration()) * 100;
            currentTimeElem.textContent = formatTime(seek);
            requestAnimationFrame(updateSeek);
        }
    }

    // Seek slider input
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

    // Volume slider input
    volumeSlider.addEventListener('input', () => {
        sound.volume(volumeSlider.value);
    });

    // Format time in MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60) || 0;
        const secs = Math.floor(seconds - minutes * 60) || 0;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // View toggle
    listView.onclick = () => {
        postsPlaceholder.className = 'posts-list';
    };

    cardView.onclick = () => {
        postsPlaceholder.className = 'posts-card';
    };

    // Scroll to latest posts
    document.getElementById('see-latest').onclick = () => {
        document.getElementById('posts-placeholder').scrollIntoView({ behavior: 'smooth' });
    };

// Search functionality with Fuse.js
document.getElementById('search-button').onclick = function() {
    const query = document.getElementById('search').value.trim();
    if (query && fuse) {
        const results = fuse.search(query);
        displayResults(results);
    }
};
    function displayResults(results) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';  // Clear current posts
    results.forEach(result => {
        // Insert the result display code here
    });
    }


    // Sort by Alphabet or Date
let currentSort = 'alphabet';

function sortPosts(posts) {
    if (currentSort === 'alphabet') {
        posts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === 'date') {
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    displayPosts(posts);
}

// Sort based on user selection
document.getElementById('list-view').onclick = () => {
    currentSort = 'alphabet';
    sortPosts(fuse._docs);  // Assuming fuse is used to hold all posts
};

document.getElementById('card-view').onclick = () => {
    currentSort = 'date';
    sortPosts(fuse._docs);
};



});
