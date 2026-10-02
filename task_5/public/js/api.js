// API Service Wrapper for Express Backend Endpoints

const API = {
  baseUrl: '/api',

  async getUsers(currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/users?current_user_id=${currentUserId}`);
    return res.json();
  },

  async getUser(identifier, currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/users/${identifier}?current_user_id=${currentUserId}`);
    return res.json();
  },

  async updateUser(userId, data) {
    const res = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async uploadUserMedia(userId, formData) {
    const res = await fetch(`${this.baseUrl}/users/${userId}/media`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async followUser(targetUserId, currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/users/${targetUserId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_user_id: currentUserId })
    });
    return res.json();
  },

  async unfollowUser(targetUserId, currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/users/${targetUserId}/follow?current_user_id=${currentUserId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getFollowers(userId) {
    const res = await fetch(`${this.baseUrl}/users/${userId}/followers`);
    return res.json();
  },

  async getFollowing(userId) {
    const res = await fetch(`${this.baseUrl}/users/${userId}/following`);
    return res.json();
  },

  async getPosts(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${this.baseUrl}/posts?${query}`);
    return res.json();
  },

  async createPost(formData) {
    const res = await fetch(`${this.baseUrl}/posts`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async deletePost(postId, currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUserId })
    });
    return res.json();
  },

  async toggleLike(postId, currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUserId })
    });
    return res.json();
  },

  async getComments(postId) {
    const res = await fetch(`${this.baseUrl}/posts/${postId}/comments`);
    return res.json();
  },

  async addComment(postId, content, currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, user_id: currentUserId })
    });
    return res.json();
  },

  async toggleBookmark(postId, currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUserId })
    });
    return res.json();
  },

  async getNotifications(currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/notifications?current_user_id=${currentUserId}`);
    return res.json();
  },

  async markNotificationsRead(currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_user_id: currentUserId })
    });
    return res.json();
  },

  async getTrendingTags() {
    const res = await fetch(`${this.baseUrl}/trending/tags`);
    return res.json();
  },

  async getRecommendedUsers(currentUserId = 1) {
    const res = await fetch(`${this.baseUrl}/users/recommended?current_user_id=${currentUserId}`);
    return res.json();
  }
};
