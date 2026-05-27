const User = require('../models/User');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// @desc    Get user profile & posts
// @route   GET /api/users/:id
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const posts = await Post.find({ user: user._id })
    .populate('user', 'name avatar')
    .populate('referenceId')
    .sort({ createdAt: -1 });

  const followersCount = await User.countDocuments({ following: user._id });
  const filteredPosts = posts.filter(p => p.user && p.user.name);
  
  return ApiResponse.success(res, { user, posts: filteredPosts, followersCount });
});

// @desc    Follow/Unfollow user
// @route   POST /api/users/follow/:id
const followUser = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.body.currentUserId);

  if (!userToFollow || !currentUser) {
    throw new AppError('User not found', 404);
  }

  let isFollowing = false;
  if (currentUser.following.includes(userToFollow._id)) {
    currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
    isFollowing = false;
  } else {
    currentUser.following.push(userToFollow._id);
    isFollowing = true;
  }

  await currentUser.save();
  const followersCount = await User.countDocuments({ following: userToFollow._id });

  return ApiResponse.success(res, { 
    following: currentUser.following,
    followersCount,
    isFollowing
  }, isFollowing ? 'Followed successfully' : 'Unfollowed successfully');
});

// @desc    Auth user & get token
// @route   POST /api/users/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && user.password === password) {
    return ApiResponse.success(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      following: user.following,
      token: 'fake-jwt-token',
    });
  } else {
    throw new AppError('Invalid email or password', 401);
  }
});

// @desc    Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  const user = await User.create({ name, email, password });

  if (user) {
    return ApiResponse.success(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      following: user.following,
      token: 'fake-jwt-token',
    }, 'User registered successfully', 201);
  } else {
    throw new AppError('Invalid user data', 400);
  }
});

// @desc    Get potential matches
const getPotentialMatches = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  if (!userId) throw new AppError('User ID is required', 400);

  const currentUser = await User.findById(userId);
  if (!currentUser) throw new AppError('User not found', 404);

  const likes = Array.isArray(currentUser.likes) ? currentUser.likes.filter(id => id) : [];
  const dislikes = Array.isArray(currentUser.dislikes) ? currentUser.dislikes.filter(id => id) : [];

  const potentialMatches = await User.find({
    _id: { $ne: currentUser._id, $nin: [...likes, ...dislikes] },
    $or: [{ email: { $regex: /@sorzal\.com$/ } }, { isAI: true }]
  });

  const userInterests = currentUser.interests || [];
  const userAffinities = currentUser.affinities || [];
  
  const tunedMatches = potentialMatches.map(user => {
    const sharedInterests = (user.interests || []).filter(i => userInterests.includes(i)).length;
    const sharedAffinities = (user.affinities || []).filter(a => userAffinities.includes(a)).length;
    const tuningScore = (sharedInterests * 1) + (sharedAffinities * 2);
    return { ...user.toObject(), tuningScore, sharedCount: sharedInterests + sharedAffinities };
  }).sort((a, b) => b.tuningScore - a.tuningScore);

  return ApiResponse.success(res, tunedMatches.slice(0, 40));
});

// @desc    Like a user
const likeUser = asyncHandler(async (req, res) => {
  const userToLike = await User.findById(req.params.id);
  const currentUser = await User.findById(req.body.userId);

  if (!userToLike || !currentUser) {
    throw new AppError('User not found', 404);
  }

  if (!currentUser.likes) currentUser.likes = [];
  if (!currentUser.matches) currentUser.matches = [];

  if (!currentUser.likes.includes(userToLike._id)) {
    currentUser.likes.push(userToLike._id);
    await currentUser.save();
  }

  const aiLikesBack = userToLike.isAI && Math.random() < 0.6;
  const isMatch = aiLikesBack || (userToLike.likes && userToLike.likes.includes(currentUser._id));
  
  if (isMatch) {
    if (!currentUser.matches.includes(userToLike._id)) {
      currentUser.matches.push(userToLike._id);
      await currentUser.save();
    }
    if (!userToLike.matches.includes(currentUser._id)) {
      userToLike.matches.push(currentUser._id);
      await userToLike.save();
    }
  }

  return ApiResponse.success(res, { isMatch }, 'Liked successfully');
});

// @desc    Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { userId, name, lastName, bio } = req.body;
  const user = await User.findById(userId);

  if (!user) throw new AppError('User not found', 404);

  user.name = name || user.name;
  user.lastName = lastName || user.lastName;
  user.bio = bio || user.bio;
  
  if (req.body.avatar) {
    user.avatar = req.body.avatar;
  }

  const updatedUser = await user.save();

  return ApiResponse.success(res, {
    _id: updatedUser._id,
    name: updatedUser.name,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    avatar: updatedUser.avatar,
    bio: updatedUser.bio,
    role: updatedUser.role,
    following: updatedUser.following,
    token: 'fake-jwt-token',
  });
});

// @desc    Dislike a user
const dislikeUser = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.body.userId);
  if (!currentUser) throw new AppError('User not found', 404);
  if (!currentUser.dislikes) currentUser.dislikes = [];
  if (!currentUser.dislikes.includes(req.params.id)) {
    currentUser.dislikes.push(req.params.id);
    await currentUser.save();
  }
  return ApiResponse.success(res, null, 'Disliked successfully');
});

// @desc    Upload avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  return ApiResponse.success(res, { path: `/${req.file.path}` });
});

// @desc    Change password
const changePassword = asyncHandler(async (req, res) => {
  const { userId, currentPassword, newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) throw new AppError('Passwords do not match', 400);
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (user.password !== currentPassword) throw new AppError('Incorrect current password', 401);
  user.password = newPassword;
  await user.save();
  return ApiResponse.success(res, null, 'Password updated successfully');
});

// @desc    Add payment method
const addPaymentMethod = asyncHandler(async (req, res) => {
  // Mock implementation
  return ApiResponse.success(res, null, 'Payment method added successfully');
});

// @desc    Update payment method
const updatePaymentMethod = asyncHandler(async (req, res) => {
  // Mock implementation
  return ApiResponse.success(res, null, 'Payment method updated successfully');
});

// @desc    Delete payment method
const deletePaymentMethod = asyncHandler(async (req, res) => {
  // Mock implementation
  return ApiResponse.success(res, null, 'Payment method deleted successfully');
});

// @desc    Update interests
const updateInterests = asyncHandler(async (req, res) => {
  const { userId, interests } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  user.interests = interests;
  await user.save();
  return ApiResponse.success(res, user.interests, 'Interests updated successfully');
});

// @desc    Update affinities
const updateAffinities = asyncHandler(async (req, res) => {
  const { userId, affinities } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  user.affinities = affinities;
  await user.save();
  return ApiResponse.success(res, user.affinities, 'Affinities updated successfully');
});

module.exports = {
  loginUser,
  registerUser,
  getUserProfile,
  followUser,
  getPotentialMatches,
  likeUser,
  dislikeUser,
  updateUserProfile,
  uploadAvatar,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  changePassword,
  updateInterests,
  updateAffinities
};
