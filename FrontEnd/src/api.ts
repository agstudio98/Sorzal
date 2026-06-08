const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                      ? 'http://localhost:5000/api' 
                      : 'https://sorzal-backend.onrender.com/api');
const ASSET_BASE_URL = API_BASE_URL.replace('/api', '');

export const getAssetUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${ASSET_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const fetchProducts = async (pageNumber = 1, keyword = '', category = '', isMarket = false) => {
  try {
    let url = `${API_BASE_URL}/products?pageNumber=${pageNumber}&keyword=${keyword}&category=${category}&isMarket=${isMarket}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createProduct = async (productData: { 
  name: string, 
  description: string, 
  category: string, 
  price: number, 
  imageUrl: string, 
  userId: string,
  isMarket?: boolean 
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Failed to create product');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const fetchTopProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/top`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

export const fetchProductById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

export const fetchProductComments = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}/comments`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addProductComment = async (id: string, commentData: { userId: string, content: string, rating: number }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return await response.json();
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const updateComment = async (productId: string, commentId: string, commentData: { userId: string, content: string, rating?: number }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return await response.json();
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

export const deleteComment = async (productId: string, commentId: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to delete comment');
    return await response.json();
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const toggleLike = async (id: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to toggle like');
    return await response.json();
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const loginUser = async (userData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: Error logging in`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const registerUser = async (userData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error registering');
    return data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const fetchUserProfile = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) throw new Error('User not found');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching user profile ${id}:`, error);
    throw error;
  }
};

export const updateUserProfile = async (profileData: { userId: string, name?: string, lastName?: string, bio?: string, avatar?: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const uploadAvatar = async (formData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/upload-avatar`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload avatar');
    return await response.json();
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

export const globalSearch = async (query: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${query}`);
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  } catch (error) {
    console.error('Error during search:', error);
    throw error;
  }
};

export const submitScore = async (scoreData: { userId: string, gameId: string, points: number }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreData),
    });
    if (!response.ok) throw new Error('Failed to submit score');
    return await response.json();
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
};

export const fetchLeaderboard = async (gameId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scores/${gameId}`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

export const followUser = async (id: string, currentUserId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/follow/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId }),
    });
    if (!response.ok) throw new Error('Follow action failed');
    return await response.json();
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const fetchThreads = async (keyword = '', category = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/threads?keyword=${keyword}&category=${category}`);
    if (!response.ok) throw new Error('Failed to fetch threads');
    return await response.json();
  } catch (error) {
    console.error('Error fetching threads:', error);
    throw error;
  }
};

export const createThread = async (threadData: { userId: string, title: string, content: string, category: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threadData),
    });
    if (!response.ok) throw new Error('Failed to create thread');
    return await response.json();
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

export const fetchThreadById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${id}`);
    if (!response.ok) throw new Error('Failed to fetch thread');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching thread ${id}:`, error);
    throw error;
  }
};

export const updateThread = async (id: string, threadData: { userId: string, title?: string, content?: string, category?: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threadData),
    });
    if (!response.ok) throw new Error('Failed to update thread');
    return await response.json();
  } catch (error) {
    console.error('Error updating thread:', error);
    throw error;
  }
};

export const deleteThread = async (id: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to delete thread');
    return await response.json();
  } catch (error) {
    console.error('Error deleting thread:', error);
    throw error;
  }
};

export const voteThread = async (id: string, userId: string, vote: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, vote }),
    });
    if (!response.ok) throw new Error('Failed to vote on thread');
    return await response.json();
  } catch (error) {
    console.error('Error voting on thread:', error);
    throw error;
  }
};

export const addThreadComment = async (id: string, commentData: { userId: string, content: string, parentComment?: string | null }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return await response.json();
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const voteThreadComment = async (threadId: string, commentId: string, userId: string, vote: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/comments/${commentId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, vote }),
    });
    if (!response.ok) throw new Error('Failed to vote on comment');
    return await response.json();
  } catch (error) {
    console.error('Error voting on comment:', error);
    throw error;
  }
};

export const updateThreadComment = async (threadId: string, commentId: string, commentData: { userId: string, content: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return await response.json();
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

export const deleteThreadComment = async (threadId: string, commentId: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to delete comment');
    return await response.json();
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const fetchReels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reels`);
    if (!response.ok) throw new Error('Failed to fetch reels');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reels:', error);
    throw error;
  }
};

export const toggleLikeReel = async (id: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reels/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to like reel');
    return await response.json();
  } catch (error) {
    console.error('Error liking reel:', error);
    throw error;
  }
};

export const fetchReelComments = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reels/${id}/comments`);
    if (!response.ok) throw new Error('Failed to fetch reel comments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reel comments:', error);
    throw error;
  }
};

export const addReelComment = async (id: string, commentData: { userId: string, content: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reels/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to add reel comment');
    return await response.json();
  } catch (error) {
    console.error('Error adding reel comment:', error);
    throw error;
  }
};

export const uploadReelVideo = async (formData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reels/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload video');
    return await response.json();
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

export const createReel = async (reelData: { 
  userId: string, 
  videoUrl: string, 
  caption: string, 
  song?: string,
  trimStart?: number,
  trimEnd?: number,
  textOverlays?: any[]
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reelData),
    });
    if (!response.ok) throw new Error('Failed to create reel');
    return await response.json();
  } catch (error) {
    console.error('Error creating reel:', error);
    throw error;
  }
};

export const shareReel = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reels/${id}/share`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to share reel');
    return await response.json();
  } catch (error) {
    console.error('Error sharing reel:', error);
    throw error;
  }
};

// REPO API
export const fetchRepos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos`);
    if (!response.ok) throw new Error('Failed to fetch repos');
    return await response.json();
  } catch (error) {
    console.error('Error fetching repos:', error);
    throw error;
  }
};

export const fetchRepoById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${id}`);
    if (!response.ok) throw new Error('Failed to fetch repo');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching repo ${id}:`, error);
    throw error;
  }
};

export const createRepo = async (formData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos`, {
      method: 'POST',
      body: formData, // Browser sets multipart/form-data and boundary
    });
    if (!response.ok) throw new Error('Failed to create repo');
    return await response.json();
  } catch (error) {
    console.error('Error creating repo:', error);
    throw error;
  }
};

export const updateRepo = async (id: string, formData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update repo');
    return await response.json();
  } catch (error) {
    console.error('Error updating repo:', error);
    throw error;
  }
};

export const deleteRepo = async (id: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to delete repo');
    return await response.json();
  } catch (error) {
    console.error('Error deleting repo:', error);
    throw error;
  }
};

export const toggleStarRepo = async (id: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${id}/star`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to star repo');
    return await response.json();
  } catch (error) {
    console.error('Error starring repo:', error);
    throw error;
  }
};

export const fetchRepoComments = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${id}/comments`);
    if (!response.ok) throw new Error('Failed to fetch repo comments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching repo comments:', error);
    throw error;
  }
};

export const addRepoComment = async (id: string, commentData: { userId: string, content: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to add repo comment');
    return await response.json();
  } catch (error) {
    console.error('Error adding repo comment:', error);
    throw error;
  }
};

export const updateRepoComment = async (commentId: string, commentData: { userId: string, content: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to update repo comment');
    return await response.json();
  } catch (error) {
    console.error('Error updating repo comment:', error);
    throw error;
  }
};

export const deleteRepoComment = async (commentId: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to delete repo comment');
    return await response.json();
  } catch (error) {
    console.error('Error deleting repo comment:', error);
    throw error;
  }
};

// PODCAST API
export const fetchPodcasts = async (pageNumber = 1, keyword = '', category = '', favorites = false, userId = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcasts?pageNumber=${pageNumber}&keyword=${keyword}&category=${category}&favorites=${favorites}&userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch podcasts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    throw error;
  }
};

export const createPodcast = async (formData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcasts`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create podcast');
    return await response.json();
  } catch (error) {
    console.error('Error creating podcast:', error);
    throw error;
  }
};

export const toggleLikePodcast = async (id: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcasts/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to like podcast');
    return await response.json();
  } catch (error) {
    console.error('Error liking podcast:', error);
    throw error;
  }
};

// COURSE API
export const fetchCourses = async (pageNumber = 1, keyword = '', category = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses?pageNumber=${pageNumber}&keyword=${keyword}&category=${category}`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const fetchCourseById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (!response.ok) throw new Error('Failed to fetch course');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw error;
  }
};

export const createCourse = async (courseData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) throw new Error('Failed to create course');
    return await response.json();
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (id: string, courseData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) throw new Error('Failed to update course');
    return await response.json();
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (id: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to delete course');
    return await response.json();
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

export const fetchSupportBot = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/support-bot`);
    if (!response.ok) throw new Error('Support Bot not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching support bot:', error);
    throw error;
  }
};

// MATCHING API
export const fetchPotentialMatches = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/discover?userId=${userId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Failed to fetch potential matches');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

export const likeUser = async (id: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/like/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to like user');
    return await response.json();
  } catch (error) {
    console.error('Error liking user:', error);
    throw error;
  }
};

export const dislikeUser = async (id: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/dislike/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to dislike user');
    return await response.json();
  } catch (error) {
    console.error('Error disliking user:', error);
    throw error;
  }
};

// MESSAGES API
export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, receiverId, content }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send message');
    }
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (userId: string, otherId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${userId}/${otherId}`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const getConversations = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/conversations/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// PAYMENT METHODS API
export const addPaymentMethod = async (paymentData: { userId: string, cardType: string, lastFour: string, expiry: string, cardHolder: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error('Failed to add payment method');
    return await response.json();
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

export const updatePaymentMethod = async (methodId: string, paymentData: { userId: string, cardType?: string, lastFour?: string, expiry?: string, cardHolder?: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/payment-methods/${methodId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error('Failed to update payment method');
    return await response.json();
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

export const deletePaymentMethod = async (methodId: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/payment-methods/${methodId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to delete payment method');
    return await response.json();
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

export const changePassword = async (passwordData: { userId: string, currentPassword: string, newPassword: string, confirmNewPassword: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }
    return await response.json();
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const updateInterests = async (interestsData: { userId: string, interests: string[] }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/interests`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interestsData),
    });
    if (!response.ok) throw new Error('Failed to update interests');
    return await response.json();
  } catch (error) {
    console.error('Error updating interests:', error);
    throw error;
  }
};

// POSTS API (MURO)
export const fetchPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const createPost = async (postData: { userId: string, content: string, type?: string, referenceId?: string, referenceModel?: string, mediaUrl?: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const toggleLikePost = async (id: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to like post');
    return await response.json();
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const addPostComment = async (id: string, commentData: { userId: string, content: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return await response.json();
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// GAMES API
export const fetchGames = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/games`);
    if (!response.ok) throw new Error('Failed to fetch games');
    return await response.json();
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

export const addGameComment = async (gameId: string, commentData: { userId: string, content: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to add game comment');
    return await response.json();
  } catch (error) {
    console.error('Error adding game comment:', error);
    throw error;
  }
};
