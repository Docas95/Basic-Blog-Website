const config = {
    postsDirectory: '/posts/',
    posts: [
        {
            slug: 'first-post',
            title: 'First Test Post',
            date: '2024-12-15',
            subtitle: 'This is a subtitle',
            tags: ['Programming', 'Personal']
        },
        {
            slug: 'second-post',
            title: 'Second Test Post',
            date: '2024-12-18',
            subtitle: 'This is a subtitle',
            tags: ['Programming', 'Personal']
        }
    ],
    tags: ['Programming', 'Gamedev', 'Personal']
};


let activeFilters = new Set();
let sortDirection = 'desc';

function handleRoute() {
    const hash = window.location.hash.slice(1) || '';
    
    if (hash && hash !== '') {
        loadPost(hash);
    } else {
        showPostsList();
    }
}

function filterPosts(posts) {
    if (activeFilters.size === 0) return posts;
    return posts.filter(post => 
        Array.from(activeFilters).every(filterTag => 
            post.tags.includes(filterTag)
        )
    );
}

function sortPosts(posts) {
    return posts.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
}

function toggleTag(tag) {
    if (activeFilters.has(tag)) {
        activeFilters.delete(tag);
    } else {
        activeFilters.add(tag);
    }
    showPostsList();
}

function toggleSort() {
    sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    showPostsList();
}

function createTagFilters() {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'tags-container';
    
    config.tags.forEach(tag => {
        const tagButton = document.createElement('button');
        tagButton.className = `tag-button ${activeFilters.has(tag) ? 'active' : ''}`;
        tagButton.textContent = tag;
        tagButton.onclick = () => toggleTag(tag);
        tagsContainer.appendChild(tagButton);
    });

    return tagsContainer;
}

function showPostsList() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    // Add controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';

    // Add sort button
    const sortButton = document.createElement('button');
    sortButton.className = 'sort-button';
    sortButton.textContent = `Sort by Date (${sortDirection === 'desc' ? 'Newest First' : 'Oldest First'})`;
    sortButton.onclick = toggleSort;
    controlsContainer.appendChild(sortButton);

    // Add tag filters
    const tagFilters = createTagFilters();
    controlsContainer.appendChild(tagFilters);

    mainContent.appendChild(controlsContainer);

    // Create posts list
    const postsList = document.createElement('ul');
    postsList.className = 'post-list';

    const filteredAndSortedPosts = sortPosts(filterPosts(config.posts));

    if (filteredAndSortedPosts.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No posts found matching the selected tags.';
        mainContent.appendChild(noResults);
        return;
    }

    filteredAndSortedPosts.forEach(post => {
        const listItem = document.createElement('li');
        listItem.className = 'post-item';
        listItem.innerHTML = `
            <a href="#${post.slug}" class="post-title">${post.title}</a>
            <div class="post-date">${formatDate(post.date)}</div>
            <div class="post-tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="post-excerpt">${post.subtitle}</div>
        `;
        postsList.appendChild(listItem);
    });

    mainContent.appendChild(postsList);
}

async function loadPost(slug) {
    const post = config.posts.find(p => p.slug === slug);
    if (!post) {
        showPostsList();
        return;
    }

    try {
        const response = await fetch(`${config.postsDirectory}${slug}.md`);
        if (!response.ok) {
            throw new Error('Post not found');
        }
        const markdown = await response.text();
        const mainContent = document.getElementById('main-content');

        mainContent.innerHTML = `
            <a href="#" class="back-button">← Back to Posts</a>
            <article class="post-content">
                
                <div class="post-date">${formatDate(post.date)}</div>
                ${marked.parse(markdown)}
            </article>
        `;
    } catch (error) {
        console.error('Error loading post:', error);
        mainContent.innerHTML = `
            <a href="#" class="back-button">← Back to Posts</a>
            <div class="error">
                <h2>Error Loading Post</h2>
                <p>Make sure you have created the file: ${config.postsDirectory}${slug}.md</p>
            </div>
        `;
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

window.addEventListener('hashchange', handleRoute);
handleRoute();