// Component HTML Template Generator Functions

const ComponentRenderer = {

  renderPostCard(post, currentUserId) {
    const isOwner = post.user_id === parseInt(currentUserId);
    const timeFormatted = timeAgo(post.created_at);
    const formattedContent = formatContentWithTags(post.content);

    // Media renderer
    let mediaHtml = '';
    if (post.media_url) {
      if (post.media_type === 'video' || post.media_url.endsWith('.mp4')) {
        mediaHtml = `
          <div class="post-media-box">
            <video controls preload="metadata">
              <source src="${post.media_url}" type="video/mp4">
              Your browser does not support video play.
            </video>
          </div>
        `;
      } else {
        mediaHtml = `
          <div class="post-media-box">
            <img src="${post.media_url}" alt="Post media" class="lightbox-trigger" data-src="${post.media_url}">
          </div>
        `;
      }
    }

    // Tagged users pills
    let taggedHtml = '';
    if (post.mentions && post.mentions.length > 0) {
      taggedHtml = `
        <div class="tagged-users-pills">
          ${post.mentions.map(m => `<span class="tag-pill"><i class="fa-solid fa-user-tag"></i> @${escapeHtml(m)}</span>`).join('')}
        </div>
      `;
    }

    const likeClass = post.is_liked ? 'liked' : '';
    const bookmarkClass = post.is_bookmarked ? 'bookmarked' : '';

    return `
      <article class="post-card" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-author-info">
            <img src="${post.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" class="avatar avatar-md user-profile-trigger" data-user-id="${post.user_id}" alt="Avatar">
            <div class="author-names">
              <span class="author-display-name user-profile-trigger" data-user-id="${post.user_id}">${escapeHtml(post.display_name)}</span>
              <span class="author-meta">@${escapeHtml(post.username)} • ${timeFormatted}</span>
            </div>
          </div>
          ${isOwner ? `
            <button class="post-menu-btn delete-post-btn" data-post-id="${post.id}" title="Delete Post">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          ` : ''}
        </div>

        <div class="post-content">
          ${formattedContent}
        </div>

        ${taggedHtml}
        ${mediaHtml}

        <div class="post-footer-actions">
          <button class="interaction-btn like-btn ${likeClass}" data-post-id="${post.id}">
            <i class="fa-${post.is_liked ? 'solid' : 'regular'} fa-heart"></i>
            <span class="like-count">${post.likes_count || 0}</span>
          </button>

          <button class="interaction-btn comment-btn" data-post-id="${post.id}">
            <i class="fa-regular fa-comment"></i>
            <span class="comment-count">${post.comments_count || 0}</span>
          </button>

          <button class="interaction-btn bookmark-btn ${bookmarkClass}" data-post-id="${post.id}">
            <i class="fa-${post.is_bookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
          </button>

          <button class="interaction-btn share-btn" data-post-id="${post.id}" title="Copy Link">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
        </div>

        <!-- Comments Collapsible Section -->
        <div class="post-comments-section hidden" id="commentsSection-${post.id}">
          <div class="comment-input-box">
            <input type="text" class="comment-text-input" data-post-id="${post.id}" placeholder="Write a comment...">
            <button class="btn btn-sm btn-primary submit-comment-btn" data-post-id="${post.id}">Reply</button>
          </div>
          <div class="comments-list" id="commentsList-${post.id}">
            <div class="text-muted" style="font-size:0.85rem;">Loading comments...</div>
          </div>
        </div>
      </article>
    `;
  },

  renderCommentItem(comment) {
    return `
      <div class="comment-item">
        <img src="${comment.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" class="avatar avatar-sm user-profile-trigger" data-user-id="${comment.user_id}">
        <div style="flex:1;">
          <div>
            <span class="comment-author user-profile-trigger" data-user-id="${comment.user_id}">${escapeHtml(comment.display_name)}</span>
            <span class="text-muted" style="font-size:0.78rem;">@${escapeHtml(comment.username)}</span>
          </div>
          <div>${formatContentWithTags(comment.content)}</div>
        </div>
        <span class="comment-time">${timeAgo(comment.created_at)}</span>
      </div>
    `;
  },

  renderNotificationCard(notif) {
    let typeClass = 'like';
    let icon = '<i class="fa-solid fa-heart"></i>';
    let text = 'liked your post';

    if (notif.type === 'comment') {
      typeClass = 'comment';
      icon = '<i class="fa-solid fa-comment"></i>';
      text = 'commented on your post';
    } else if (notif.type === 'follow') {
      typeClass = 'follow';
      icon = '<i class="fa-solid fa-user-plus"></i>';
      text = 'started following you';
    } else if (notif.type === 'mention') {
      typeClass = 'mention';
      icon = '<i class="fa-solid fa-at"></i>';
      text = 'mentioned you in a post';
    }

    const unreadClass = notif.is_read === 0 ? 'unread' : '';

    return `
      <div class="notif-item ${unreadClass}">
        <div class="notif-icon-box ${typeClass}">${icon}</div>
        <img src="${notif.actor_avatar}" class="avatar avatar-md user-profile-trigger" data-user-id="${notif.actor_id}">
        <div style="flex:1;">
          <div>
            <strong class="user-profile-trigger" data-user-id="${notif.actor_id}">${escapeHtml(notif.actor_name)}</strong> 
            <span class="text-muted">@${escapeHtml(notif.actor_username)}</span> ${text}
          </div>
          ${notif.post_snippet ? `<div class="text-muted" style="font-size:0.82rem; margin-top:2px;">"${escapeHtml(notif.post_snippet.substring(0, 60))}..."</div>` : ''}
          <div class="text-muted" style="font-size:0.75rem; margin-top:4px;">${timeAgo(notif.created_at)}</div>
        </div>
      </div>
    `;
  },

  renderTrendingTagItem(tag) {
    return `
      <div class="tag-item" data-tag="${tag.tag_name}">
        <span class="tag-item-name">#${escapeHtml(tag.tag_name)}</span>
        <span class="tag-item-count">${tag.count} ${tag.count === 1 ? 'post' : 'posts'}</span>
      </div>
    `;
  },

  renderFollowUserItem(user) {
    return `
      <div class="follow-user-item">
        <img src="${user.avatar}" class="avatar avatar-md user-profile-trigger" data-user-id="${user.id}">
        <div style="flex:1; overflow:hidden;">
          <div class="user-name user-profile-trigger" data-user-id="${user.id}">${escapeHtml(user.display_name)}</div>
          <div class="user-handle">@${escapeHtml(user.username)}</div>
        </div>
        <button class="btn btn-xs btn-outline follow-btn" data-user-id="${user.id}">
          <i class="fa-solid fa-user-plus"></i> Follow
        </button>
      </div>
    `;
  }
};
