// Main Application Controller & State Manager

document.addEventListener('DOMContentLoaded', async () => {
  // State variables
  let currentUser = null;
  let allUsers = [];
  let currentFeedType = 'all';
  let activeTagFilter = null;
  let activeProfileUser = null;
  let taggedUserList = [];
  let selectedPostFile = null;

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  await initApp();

  async function initApp() {
    setupTheme();
    await loadUsers();
    setupEventListeners();
    await refreshSidebarData();
    loadFeed();
  }

  // Dark/Light Theme setup
  function setupTheme() {
    const savedTheme = localStorage.getItem('pulse_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggleBtn i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  // Load User Accounts for Account Switcher Dropdown
  async function loadUsers() {
    try {
      allUsers = await API.getUsers(currentUser ? currentUser.id : 1);
      const dropdown = document.getElementById('currentUserSelect');
      dropdown.innerHTML = '';

      allUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.display_name} (@${user.username})`;
        dropdown.appendChild(option);
      });

      // Default active user is user 1 (Alex Rivers) or saved user
      const savedUserId = localStorage.getItem('pulse_user_id') || 1;
      dropdown.value = savedUserId;
      currentUser = allUsers.find(u => u.id == savedUserId) || allUsers[0];

      updateSidebarUserDisplay();
      updateNotificationsBadge();
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }

  function updateSidebarUserDisplay() {
    if (!currentUser) return;
    document.getElementById('sidebarAvatar').src = currentUser.avatar;
    document.getElementById('sidebarName').textContent = currentUser.display_name;
    document.getElementById('sidebarUsername').textContent = `@${currentUser.username}`;
    document.getElementById('composerAvatar').src = currentUser.avatar;
  }

  async function refreshSidebarData() {
    if (!currentUser) return;
    try {
      const [trendingTags, recommended, notifs] = await Promise.all([
        API.getTrendingTags(),
        API.getRecommendedUsers(currentUser.id),
        API.getNotifications(currentUser.id)
      ]);

      // Render Trending Tags
      const tagsContainer = document.getElementById('trendingTagsList');
      if (trendingTags.length === 0) {
        tagsContainer.innerHTML = '<div class="text-muted">No hashtags yet</div>';
      } else {
        tagsContainer.innerHTML = trendingTags.map(t => ComponentRenderer.renderTrendingTagItem(t)).join('');
      }

      // Render Recommended Users
      const recContainer = document.getElementById('whoToFollowList');
      if (recommended.length === 0) {
        recContainer.innerHTML = '<div class="text-muted">No recommendations right now</div>';
      } else {
        recContainer.innerHTML = recommended.map(u => ComponentRenderer.renderFollowUserItem(u)).join('');
      }

      // Update Unread Badge
      const badge = document.getElementById('unreadBadge');
      if (notifs.unread_count > 0) {
        badge.textContent = notifs.unread_count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    } catch (err) {
      console.error('Error refreshing sidebar data:', err);
    }
  }

  // -------------------------------------------------------------
  // FEED & CONTENT LOADING
  // -------------------------------------------------------------
  async function loadFeed() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading posts...</div>';

    try {
      const filters = {
        type: currentFeedType,
        current_user_id: currentUser.id
      };

      if (activeTagFilter) {
        filters.tag = activeTagFilter;
      }

      const searchQuery = document.getElementById('globalSearchInput').value.trim();
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const posts = await API.getPosts(filters);

      if (posts.length === 0) {
        container.innerHTML = `
          <div class="card text-center p-4">
            <i class="fa-solid fa-folder-open" style="font-size:2rem; color:var(--text-muted); margin-bottom:0.5rem;"></i>
            <h4>No posts found</h4>
            <p class="text-muted">Try switching tabs or creating a new post!</p>
          </div>
        `;
        return;
      }

      container.innerHTML = posts.map(post => ComponentRenderer.renderPostCard(post, currentUser.id)).join('');
    } catch (err) {
      console.error('Error loading posts:', err);
      container.innerHTML = '<div class="text-danger p-3">Failed to load posts feed.</div>';
    }
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS & DELEGATION
  // -------------------------------------------------------------
  function setupEventListeners() {
    
    // Theme Toggle
    document.getElementById('themeToggleBtn').addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('pulse_theme', nextTheme);
      updateThemeIcon(nextTheme);
    });

    // Account Switcher Dropdown
    document.getElementById('currentUserSelect').addEventListener('change', async (e) => {
      const selectedId = e.target.value;
      localStorage.setItem('pulse_user_id', selectedId);
      currentUser = allUsers.find(u => u.id == selectedId);
      updateSidebarUserDisplay();
      showToast(`Switched active account to ${currentUser.display_name}`, 'success');
      await refreshSidebarData();
      
      const activeNav = document.querySelector('.nav-item.active').dataset.page;
      if (activeNav === 'profile') {
        openProfileView(currentUser.id);
      } else if (activeNav === 'notifications') {
        loadNotificationsView();
      } else if (activeNav === 'saved') {
        loadSavedView();
      } else {
        loadFeed();
      }
    });

    // Sidebar Navigation Tabs
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        switchView(page);
      });
    });

    // Feed Sub-tabs (For You, Following, Trending)
    document.querySelectorAll('.feed-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFeedType = tab.dataset.feed;
        activeTagFilter = null;
        document.getElementById('tagFilterBanner').classList.add('hidden');
        loadFeed();
      });
    });

    // Global Search Input with debounce
    let searchTimeout;
    document.getElementById('globalSearchInput').addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const activeNav = document.querySelector('.nav-item.active').dataset.page;
        if (activeNav !== 'feed') switchView('feed');
        loadFeed();
      }, 300);
    });

    // Clear Tag Filter Banner
    document.getElementById('clearTagFilterBtn').addEventListener('click', () => {
      activeTagFilter = null;
      document.getElementById('tagFilterBanner').classList.add('hidden');
      loadFeed();
    });

    // Post Creation - File Attachment Input
    const fileInput = document.getElementById('postFileInput');
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        selectedPostFile = e.target.files[0];
        const previewContainer = document.getElementById('mediaPreviewContainer');
        const previewContent = document.getElementById('mediaPreviewContent');
        
        const fileUrl = URL.createObjectURL(selectedPostFile);
        if (selectedPostFile.type.startsWith('video/')) {
          previewContent.innerHTML = `<video src="${fileUrl}" controls max-height="200"></video>`;
        } else {
          previewContent.innerHTML = `<img src="${fileUrl}" max-height="200">`;
        }

        previewContainer.classList.remove('hidden');
      }
    });

    // Remove Attachment Btn
    document.getElementById('removeMediaBtn').addEventListener('click', () => {
      selectedPostFile = null;
      document.getElementById('postFileInput').value = '';
      document.getElementById('mediaPreviewContainer').classList.add('hidden');
      document.getElementById('mediaPreviewContent').innerHTML = '';
    });

    // Tag User Popover Toggle
    document.getElementById('tagUserBtn').addEventListener('click', () => {
      const popover = document.getElementById('tagUserPopover');
      popover.classList.toggle('hidden');
    });

    // Add Tagged User Button
    document.getElementById('addTagBtn').addEventListener('click', () => {
      const input = document.getElementById('tagUserInput');
      const val = input.value.trim().replace('@', '');
      if (val && !taggedUserList.includes(val)) {
        taggedUserList.push(val);
        renderTaggedUserChips();
        input.value = '';
        document.getElementById('tagUserPopover').classList.add('hidden');
      }
    });

    // Post Textarea Character Counter
    const textarea = document.getElementById('postContentInput');
    textarea.addEventListener('input', () => {
      const count = textarea.value.length;
      document.getElementById('charCount').textContent = `${count} / 280`;
    });

    // Submit New Post Button
    document.getElementById('submitPostBtn').addEventListener('click', handleCreatePost);

    // Open Create Post Modal (Focus on composer)
    document.getElementById('openNewPostModalBtn').addEventListener('click', () => {
      switchView('feed');
      textarea.focus();
    });

    // Global Event Delegation for Dynamic Elements (Likes, Comments, Tags, Profiles)
    document.addEventListener('click', async (e) => {

      // Like Button Click
      const likeBtn = e.target.closest('.like-btn');
      if (likeBtn) {
        const postId = likeBtn.dataset.postId;
        const res = await API.toggleLike(postId, currentUser.id);
        if (res.success) {
          likeBtn.classList.toggle('liked', res.is_liked);
          const icon = likeBtn.querySelector('i');
          icon.className = res.is_liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
          likeBtn.querySelector('.like-count').textContent = res.likes_count;
        }
        return;
      }

      // Bookmark Button Click
      const bookmarkBtn = e.target.closest('.bookmark-btn');
      if (bookmarkBtn) {
        const postId = bookmarkBtn.dataset.postId;
        const res = await API.toggleBookmark(postId, currentUser.id);
        if (res.success) {
          bookmarkBtn.classList.toggle('bookmarked', res.is_bookmarked);
          const icon = bookmarkBtn.querySelector('i');
          icon.className = res.is_bookmarked ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
          showToast(res.is_bookmarked ? 'Post saved to bookmarks!' : 'Removed from bookmarks');
        }
        return;
      }

      // Comment Toggle Button Click
      const commentBtn = e.target.closest('.comment-btn');
      if (commentBtn) {
        const postId = commentBtn.dataset.postId;
        const commentsSection = document.getElementById(`commentsSection-${postId}`);
        commentsSection.classList.toggle('hidden');

        if (!commentsSection.classList.contains('hidden')) {
          loadCommentsForPost(postId);
        }
        return;
      }

      // Submit Comment Button Click
      const submitCommentBtn = e.target.closest('.submit-comment-btn');
      if (submitCommentBtn) {
        const postId = submitCommentBtn.dataset.postId;
        const input = document.querySelector(`.comment-text-input[data-post-id="${postId}"]`);
        const content = input.value.trim();
        if (content) {
          const res = await API.addComment(postId, content, currentUser.id);
          input.value = '';
          showToast('Comment added!', 'success');
          loadCommentsForPost(postId);
          // Update comment count
          const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);
          if (card) {
            card.querySelector('.comment-count').textContent = res.comments_count;
          }
        }
        return;
      }

      // Delete Post Button Click
      const deleteBtn = e.target.closest('.delete-post-btn');
      if (deleteBtn) {
        if (confirm('Are you sure you want to delete this post?')) {
          const postId = deleteBtn.dataset.postId;
          await API.deletePost(postId, currentUser.id);
          showToast('Post deleted', 'info');
          const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);
          if (card) card.remove();
        }
        return;
      }

      // Share Link Click
      const shareBtn = e.target.closest('.share-btn');
      if (shareBtn) {
        const postId = shareBtn.dataset.postId;
        navigator.clipboard.writeText(window.location.origin + `/#post-${postId}`);
        showToast('Post link copied to clipboard!', 'success');
        return;
      }

      // Clickable Hashtag filter
      const hashtagSpan = e.target.closest('.post-hashtag, .tag-item');
      if (hashtagSpan) {
        const tag = hashtagSpan.dataset.tag.replace('#', '');
        activeTagFilter = tag;
        document.getElementById('activeTagName').textContent = `#${tag}`;
        document.getElementById('tagFilterBanner').classList.remove('hidden');
        switchView('feed');
        loadFeed();
        return;
      }

      // Clickable User Profile Trigger (@mention or avatar or name)
      const profileTrigger = e.target.closest('.user-profile-trigger, .post-mention');
      if (profileTrigger) {
        let userId = profileTrigger.dataset.userId;
        const mention = profileTrigger.dataset.mention;

        if (mention) {
          const cleanMention = mention.replace('@', '').toLowerCase();
          const targetUser = allUsers.find(u => u.username.toLowerCase() === cleanMention);
          if (targetUser) userId = targetUser.id;
        }

        if (userId) {
          openProfileView(userId);
        }
        return;
      }

      // Follow / Unfollow Button Click
      const followBtn = e.target.closest('.follow-btn');
      if (followBtn) {
        const targetUserId = followBtn.dataset.userId;
        const isFollowing = followBtn.classList.contains('following');

        if (isFollowing) {
          await API.unfollowUser(targetUserId, currentUser.id);
          followBtn.classList.remove('following');
          followBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Follow';
          showToast('Unfollowed user');
        } else {
          await API.followUser(targetUserId, currentUser.id);
          followBtn.classList.add('following');
          followBtn.innerHTML = '<i class="fa-solid fa-user-check"></i> Following';
          showToast('Now following user!', 'success');
        }

        await refreshSidebarData();
        if (activeProfileUser && activeProfileUser.id == targetUserId) {
          openProfileView(targetUserId);
        }
        return;
      }

      // Lightbox Image Viewer Trigger
      const lightboxImg = e.target.closest('.lightbox-trigger');
      if (lightboxImg) {
        const src = lightboxImg.dataset.src;
        document.getElementById('lightboxBody').innerHTML = `<img src="${src}" alt="Enlarged view">`;
        document.getElementById('lightboxModal').classList.remove('hidden');
        return;
      }
    });

    // Close Modals
    document.querySelectorAll('.closeModalBtn, #closeLightboxBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      });
    });

    // Edit Profile Modal Trigger & Submit
    document.getElementById('editProfileBtn').addEventListener('click', () => {
      if (!activeProfileUser) return;
      document.getElementById('editDisplayName').value = activeProfileUser.display_name;
      document.getElementById('editBio').value = activeProfileUser.bio || '';
      document.getElementById('editLocation').value = activeProfileUser.location || '';
      document.getElementById('editWebsite').value = activeProfileUser.website || '';
      document.getElementById('editProfileModal').classList.remove('hidden');
    });

    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedData = {
        display_name: document.getElementById('editDisplayName').value.trim(),
        bio: document.getElementById('editBio').value.trim(),
        location: document.getElementById('editLocation').value.trim(),
        website: document.getElementById('editWebsite').value.trim(),
      };

      const avatarUrlInput = document.getElementById('editAvatarUrl').value.trim();
      if (avatarUrlInput) updatedData.avatar = avatarUrlInput;

      const coverUrlInput = document.getElementById('editCoverUrl').value.trim();
      if (coverUrlInput) updatedData.cover_image = coverUrlInput;

      await API.updateUser(activeProfileUser.id, updatedData);

      // Handle media file uploads if selected
      const avatarFile = document.getElementById('editAvatarFile').files[0];
      const coverFile = document.getElementById('editCoverFile').files[0];

      if (avatarFile || coverFile) {
        const formData = new FormData();
        if (avatarFile) formData.append('avatar', avatarFile);
        if (coverFile) formData.append('cover_image', coverFile);

        await API.uploadUserMedia(activeProfileUser.id, formData);
      }

      document.getElementById('editProfileModal').classList.add('hidden');
      showToast('Profile updated successfully!', 'success');
      await loadUsers();
      openProfileView(activeProfileUser.id);
    });

    // Followers & Following Clickable Stats List
    document.getElementById('statFollowers').addEventListener('click', () => openUserListModal('followers'));
    document.getElementById('statFollowing').addEventListener('click', () => openUserListModal('following'));
  }

  // -------------------------------------------------------------
  // HELPER ACTIONS & CONTROLLERS
  // -------------------------------------------------------------

  function renderTaggedUserChips() {
    const container = document.getElementById('taggedUsersContainer');
    container.innerHTML = taggedUserList.map(username => `
      <span class="tag-pill">
        @${escapeHtml(username)} 
        <i class="fa-solid fa-xmark remove-tag-chip" data-user="${username}" style="cursor:pointer; margin-left:4px;"></i>
      </span>
    `).join('');

    container.querySelectorAll('.remove-tag-chip').forEach(icon => {
      icon.addEventListener('click', () => {
        const u = icon.dataset.user;
        taggedUserList = taggedUserList.filter(item => item !== u);
        renderTaggedUserChips();
      });
    });
  }

  async function handleCreatePost() {
    const textarea = document.getElementById('postContentInput');
    const content = textarea.value.trim();

    if (!content && !selectedPostFile) {
      showToast('Please enter text or attach an image/video to post', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', currentUser.id);
    formData.append('content', content);

    if (selectedPostFile) {
      formData.append('media_file', selectedPostFile);
    }

    if (taggedUserList.length > 0) {
      formData.append('tagged_users', taggedUserList.join(','));
    }

    try {
      const newPost = await API.createPost(formData);
      showToast('Post published successfully!', 'success');

      // Reset Composer Form
      textarea.value = '';
      document.getElementById('charCount').textContent = '0 / 280';
      selectedPostFile = null;
      document.getElementById('postFileInput').value = '';
      document.getElementById('mediaPreviewContainer').classList.add('hidden');
      taggedUserList = [];
      renderTaggedUserChips();

      // Refresh Feed & Stats
      await refreshSidebarData();
      loadFeed();
    } catch (err) {
      console.error('Create post error:', err);
      showToast('Failed to publish post', 'error');
    }
  }

  async function loadCommentsForPost(postId) {
    const list = document.getElementById(`commentsList-${postId}`);
    try {
      const comments = await API.getComments(postId);
      if (comments.length === 0) {
        list.innerHTML = '<div class="text-muted" style="font-size:0.85rem;">No comments yet. Be the first to comment!</div>';
      } else {
        list.innerHTML = comments.map(c => ComponentRenderer.renderCommentItem(c)).join('');
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  }

  function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const navItem = document.querySelector(`.nav-item[data-page="${viewName}"]`);
    if (navItem) navItem.classList.add('active');

    if (viewName === 'feed') {
      document.getElementById('viewFeed').classList.add('active');
      document.getElementById('pageTitle').textContent = 'Home Feed';
      document.getElementById('pageSubtitle').textContent = 'Discover posts and updates from around the network';
      loadFeed();
    } else if (viewName === 'profile') {
      document.getElementById('viewProfile').classList.add('active');
      openProfileView(currentUser.id);
    } else if (viewName === 'notifications') {
      document.getElementById('viewNotifications').classList.add('active');
      document.getElementById('pageTitle').textContent = 'Notifications';
      document.getElementById('pageSubtitle').textContent = 'Track likes, comments, mentions, and new followers';
      loadNotificationsView();
    } else if (viewName === 'explore') {
      document.getElementById('viewExplore').classList.add('active');
      document.getElementById('pageTitle').textContent = 'Explore';
      document.getElementById('pageSubtitle').textContent = 'Discover trending tags & recommended topics';
      loadExploreView();
    } else if (viewName === 'saved') {
      document.getElementById('viewSaved').classList.add('active');
      document.getElementById('pageTitle').textContent = 'Bookmarks';
      document.getElementById('pageSubtitle').textContent = 'Posts you saved for quick access';
      loadSavedView();
    }
  }

  async function openProfileView(userId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById('viewProfile').classList.add('active');

    try {
      activeProfileUser = await API.getUser(userId, currentUser.id);

      document.getElementById('profileDisplayName').textContent = activeProfileUser.display_name;
      document.getElementById('profileUsername').textContent = `@${activeProfileUser.username}`;
      document.getElementById('profileBio').textContent = activeProfileUser.bio || 'No bio yet.';
      document.getElementById('profileAvatarImg').src = activeProfileUser.avatar;
      document.getElementById('profileCoverImg').src = activeProfileUser.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200';
      
      document.getElementById('profileLocation').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${activeProfileUser.location || 'Everywhere'}`;
      document.getElementById('profileWebsite').innerHTML = `<i class="fa-solid fa-link"></i> <a href="${activeProfileUser.website || '#'}" target="_blank">${activeProfileUser.website || 'No website'}</a>`;

      document.getElementById('statPostsCount').textContent = activeProfileUser.posts_count || 0;
      document.getElementById('statFollowersCount').textContent = activeProfileUser.followers_count || 0;
      document.getElementById('statFollowingCount').textContent = activeProfileUser.following_count || 0;

      // Edit Profile button vs Follow button
      const editBtn = document.getElementById('editProfileBtn');
      const followBtn = document.getElementById('followUserBtn');

      if (activeProfileUser.id === currentUser.id) {
        editBtn.classList.remove('hidden');
        followBtn.classList.add('hidden');
      } else {
        editBtn.classList.add('hidden');
        followBtn.classList.remove('hidden');
        followBtn.dataset.userId = activeProfileUser.id;

        if (activeProfileUser.is_following) {
          followBtn.classList.add('following');
          followBtn.classList.replace('btn-primary', 'btn-outline');
          followBtn.innerHTML = '<i class="fa-solid fa-user-check"></i> Following';
        } else {
          followBtn.classList.remove('following');
          followBtn.classList.replace('btn-outline', 'btn-primary');
          followBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Follow';
        }
      }

      // Load Profile User Posts
      loadProfileTabPosts('user');

    } catch (err) {
      console.error('Error opening profile:', err);
    }
  }

  // Profile Subtabs (Posts, Liked, Media)
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadProfileTabPosts(tab.dataset.tab);
    });
  });

  async function loadProfileTabPosts(tabType) {
    if (!activeProfileUser) return;
    const container = document.getElementById('profilePostsContainer');
    container.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>';

    const posts = await API.getPosts({
      type: tabType,
      user_id: activeProfileUser.id,
      current_user_id: currentUser.id
    });

    if (posts.length === 0) {
      container.innerHTML = `<div class="card text-center p-4 text-muted">No ${tabType} posts found.</div>`;
    } else {
      container.innerHTML = posts.map(p => ComponentRenderer.renderPostCard(p, currentUser.id)).join('');
    }
  }

  async function loadNotificationsView() {
    const container = document.getElementById('notificationsContainer');
    container.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>';

    const notifData = await API.getNotifications(currentUser.id);
    if (notifData.notifications.length === 0) {
      container.innerHTML = '<div class="card text-center p-4 text-muted">You have no notifications right now.</div>';
    } else {
      container.innerHTML = notifData.notifications.map(n => ComponentRenderer.renderNotificationCard(n)).join('');
    }

    // Mark all as read listener
    document.getElementById('markAllReadBtn').onclick = async () => {
      await API.markNotificationsRead(currentUser.id);
      document.querySelectorAll('.notif-item').forEach(i => i.classList.remove('unread'));
      document.getElementById('unreadBadge').classList.add('hidden');
      showToast('All notifications marked as read', 'success');
    };
  }

  async function loadSavedView() {
    const container = document.getElementById('savedPostsContainer');
    container.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading saved posts...</div>';

    const posts = await API.getPosts({
      type: 'saved',
      current_user_id: currentUser.id
    });

    if (posts.length === 0) {
      container.innerHTML = '<div class="card text-center p-4 text-muted">You have no bookmarked posts.</div>';
    } else {
      container.innerHTML = posts.map(p => ComponentRenderer.renderPostCard(p, currentUser.id)).join('');
    }
  }

  async function loadExploreView() {
    const grid = document.getElementById('exploreGrid');
    grid.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading trending media...</div>';

    const trendingPosts = await API.getPosts({
      type: 'trending',
      current_user_id: currentUser.id
    });

    grid.innerHTML = trendingPosts.map(p => ComponentRenderer.renderPostCard(p, currentUser.id)).join('');
  }

  async function openUserListModal(type) {
    if (!activeProfileUser) return;
    const modal = document.getElementById('userListModal');
    const title = document.getElementById('userListModalTitle');
    const body = document.getElementById('userListModalBody');

    title.textContent = type === 'followers' ? 'Followers' : 'Following';
    body.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>';
    modal.classList.remove('hidden');

    const users = type === 'followers'
      ? await API.getFollowers(activeProfileUser.id)
      : await API.getFollowing(activeProfileUser.id);

    if (users.length === 0) {
      body.innerHTML = `<div class="p-3 text-muted">No ${type} found.</div>`;
    } else {
      body.innerHTML = users.map(u => ComponentRenderer.renderFollowUserItem(u)).join('');
    }
  }
});
