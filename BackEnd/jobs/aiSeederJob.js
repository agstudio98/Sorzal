const User = require('../models/User');
const Post = require('../models/Post');
const Podcast = require('../models/Podcast');
const Reel = require('../models/Reel');
const Repo = require('../models/Repo');
const Thread = require('../models/Thread');
const Game = require('../models/Game');
const ThreadComment = require('../models/ThreadComment');
const Product = require('../models/Product');
const Comment = require('../models/Comment');
const Course = require('../models/Course');
const { generateAIContent, generateAIInteraction, generateAIPersonaUpdate } = require('../services/groqService');
const logger = require('../utils/logger');

const startAISeederJob = () => {
  logger.info('Sorzal AI Generation System Active (Photos/Forum/Reel: 2m, Game: 3m, Others: 5m, Interaction: 1m)');
  
  const reliableVideos = [
    'https://www.youtube.com/shorts/qM79_itR0Nc',
    'https://www.youtube.com/shorts/Wv_S9V-vXoM',
    'https://www.youtube.com/shorts/3P1VvO8rX4c',
    'https://www.youtube.com/shorts/o79r4x0_ySg',
    'https://www.youtube.com/shorts/pL3kQ6W_9vM'
  ];

  // JOB -1: Purge broken links
  const purgeBrokenVideos = async () => {
    try {
      logger.info('Purging broken and problematic links (403/CORS)...');
      const brokenPattern = /mixkit\.co|googlevideo|gtv-videos-bucket|vjs\.zencdn\.net|w3\.org|w3schools\.com/;
      const reelResult = await Reel.deleteMany({ videoUrl: brokenPattern });
      const postResult = await Post.deleteMany({ mediaUrl: brokenPattern });
      if (reelResult.deletedCount > 0 || postResult.deletedCount > 0) {
        logger.info(`Cleanup: Removed ${reelResult.deletedCount} Reels and ${postResult.deletedCount} Posts with broken links.`);
      }
    } catch (error) {
      logger.error('Error in Video Purge: ' + error.message);
    }
  };

  purgeBrokenVideos();

  // JOB 0: Sync and Backfill
  const syncPhotography = async () => {
    try {
      logger.info('Syncing Wall with Photo Gallery...');
      const photoPosts = await Post.find({ 
        mediaUrl: { $ne: null },
        type: { $in: ['text', 'photography'] } 
      }).populate('user');

      for (const post of photoPosts) {
        const exists = await Product.findOne({ imageUrl: post.mediaUrl });
        if (!exists && post.user) {
          await Product.create({
            user: post.user._id,
            name: post.content.substring(0, 20) || 'Sorzal Work',
            description: post.content || 'No description',
            price: Math.floor(Math.random() * 2000) + 500,
            category: 'Digital',
            imageUrl: post.mediaUrl,
            numReviews: 0,
            countInStock: 1
          });
          logger.debug(`Synced: New photo from post of ${post.user.name}`);
        }
      }
    } catch (error) {
      logger.error('Error in Photo Sync: ' + error.message);
    }
  };

  const syncReels = async () => {
    try {
      logger.info('Syncing Wall with Reels...');
      const videoPosts = await Post.find({ 
        type: 'reel'
      }).populate('user');

      for (const post of videoPosts) {
        if (!post.user || !post.mediaUrl) continue;
        const exists = await Reel.findOne({ videoUrl: post.mediaUrl });
        if (!exists) {
          await Reel.create({
            user: post.user._id,
            videoUrl: post.mediaUrl,
            caption: post.content,
            song: 'Original Sound - Sorzal AI'
          });
          logger.debug(`Synced: New Reel from post of ${post.user.name}`);
        }
      }
    } catch (error) {
      logger.error('Error in Reel Sync: ' + error.message);
    }
  };

  syncPhotography();
  syncReels();
  setInterval(() => {
    syncPhotography();
    syncReels();
  }, 3600000);

  // JOB 1A: Photography Generation (Every 2 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const user = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      logger.info(`IA: ${user.name} is capturing a photograph...`);
      const aiResponse = await generateAIContent('photography', user);

      const imageUrl = `https://picsum.photos/seed/${Date.now()}/1200/800`;

      await Product.create({
        user: user._id,
        name: aiResponse.name || 'Cyber Art',
        description: aiResponse.description || aiResponse.content,
        price: aiResponse.price || 500,
        category: aiResponse.category || 'Art',
        imageUrl: imageUrl,
        numReviews: 0,
        countInStock: 1
      });
      logger.info(`Success: New artwork published by ${user.name}`);
      
      await Post.create({
        user: user._id,
        content: aiResponse.content,
        type: 'photography',
        mediaUrl: imageUrl
      });
    } catch (error) {
      logger.error('Error in AI Photography Generation: ' + error.message);
    }
  }, 120000);

  // JOB 1B: Forum Threads Generation (Every 2 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const user = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      logger.info(`IA: ${user.name} is starting a debate...`);
      const aiResponse = await generateAIContent('thread', user);

      await Thread.create({
        user: user._id,
        title: aiResponse.title || 'Sorzal Discussion',
        content: aiResponse.content,
        category: aiResponse.category || 'General'
      });
      logger.info(`Success: New thread created by ${user.name}`);
    } catch (error) {
      logger.error('Error in AI Forum Generation: ' + error.message);
    }
  }, 120000);

  // JOB 1E: Marketplace Products (Every 4 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const user = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      logger.info(`IA: ${user.name} is posting a product in the Marketplace...`);
      
      const categories = ['Digital', 'Hardware', 'Software', 'Cameras', 'Lenses', 'Accessories'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const aiResponse = await generateAIContent('photography', user);

      const imageUrl = category === 'Digital' 
        ? `https://picsum.photos/seed/${Date.now()}/1200/800`
        : `https://picsum.photos/seed/market-${Date.now()}/800/600`;

      const product = await Product.create({
        user: user._id,
        name: aiResponse.name || `Piece ${category} #${Math.floor(Math.random()*1000)}`,
        description: aiResponse.description || aiResponse.content,
        price: Math.floor(Math.random() * 2000) + 100,
        category: category,
        imageUrl: imageUrl,
        numReviews: 0,
        countInStock: Math.floor(Math.random() * 5) + 1
      });

      logger.info(`Success: ${product.name} published by ${user.name}`);

      await Post.create({
        user: user._id,
        content: `I have published a new piece in the Marketplace: "${product.name}". Check it out!`,
        type: 'photography',
        mediaUrl: imageUrl
      });
    } catch (error) {
      logger.error('Error in AI Marketplace Generation: ' + error.message);
    }
  }, 240000);

  // JOB 1D: Reels (Every 2 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const user = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      logger.info(`IA: ${user.name} is recording a Reel...`);
      const aiResponse = await generateAIContent('reel', user);
      
      const videoUrl = reliableVideos[Math.floor(Math.random() * reliableVideos.length)];

      await Reel.create({
        user: user._id,
        videoUrl: videoUrl,
        caption: aiResponse.caption || aiResponse.content,
        song: 'Sorzal Cyber Vibes - AI'
      });
      logger.info(`Success: New video published by ${user.name}`);

      await Post.create({
        user: user._id,
        content: aiResponse.caption || aiResponse.content,
        type: 'reel',
        mediaUrl: videoUrl
      });
    } catch (error) {
      logger.error('Error in AI Reel Generation: ' + error.message);
    }
  }, 120000);

  // JOB 1F: Community Games (Every 3 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const user = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      logger.info(`IA: ${user.name} is developing a video game...`);
      
      const gameCategories = ['Arcade', 'Puzzle', 'Action', 'Retro', 'Strategy', 'Rhythm'];
      const category = gameCategories[Math.floor(Math.random() * gameCategories.length)];
      
      const aiResponse = await generateAIContent('photography', user);

      await Game.create({
        user: user._id,
        title: aiResponse.name || `Cyber Game ${category} #${Math.floor(Math.random()*100)}`,
        description: aiResponse.description || aiResponse.content,
        category: category,
        icon: 'Gamepad2',
        color: 'text-primary-light',
        rating: 4 + Math.random(),
        isOfficial: false
      });

      logger.info(`Success: New community game published by ${user.name}`);

      await Post.create({
        user: user._id,
        content: `I just launched my new game "${aiResponse.name || 'Cyber Quest'}" in the Gaming Arena! Try it out and let me know what you think. #SorzalDev #Gaming`,
        type: 'text'
      });
    } catch (error) {
      logger.error('Error in AI Game Generation: ' + error.message);
    }
  }, 180000);

  // JOB 1G: Dev Repositories (Every 5 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const user = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      logger.info(`IA: ${user.name} is uploading a new repository...`);
      
      const languages = ['TypeScript', 'Rust', 'Python', 'Go', 'C++', 'JavaScript'];
      const lang = languages[Math.floor(Math.random() * languages.length)];
      
      const aiResponse = await generateAIContent('repo', user);

      const repo = await Repo.create({
        user: user._id,
        title: aiResponse.title || `Module ${lang} Sorzal`,
        description: aiResponse.description || aiResponse.content,
        language: lang,
        fileUrl: '/uploads/repos/sample-0.zip',
        fileName: `${(aiResponse.title || 'module').toLowerCase().replace(/\s+/g, '-')}.zip`,
        size: Math.floor(Math.random() * 5000) + 500,
        stars: 0,
        starUsers: []
      });

      logger.info(`Success: "${repo.title}" published by ${user.name}`);

      await Post.create({
        user: user._id,
        content: `I just released a new repository: "${repo.title}". A module written in ${lang} for the ecosystem. #Dev #OpenSource`,
        type: 'repo',
        referenceId: repo._id,
        referenceModel: 'Repo'
      });
    } catch (error) {
      logger.error('Error in AI Repo Generation: ' + error.message);
    }
  }, 300000);

  // JOB 1H: Podcasts (Every 5 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const user = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      logger.info(`IA: ${user.name} is recording a new podcast...`);
      
      const aiResponse = await generateAIContent('podcast', user);

      const podcast = await Podcast.create({
        user: user._id,
        title: aiResponse.title || 'Sorzal Podcast',
        description: aiResponse.description || aiResponse.content,
        host: user.name,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        imageUrl: `https://picsum.photos/seed/${Date.now()}/600/600`,
        category: user.interests[0] || 'Technology',
        duration: '25:00'
      });

      logger.info(`Success: "${podcast.title}" published by ${user.name}`);

      await Post.create({
        user: user._id,
        content: `I uploaded a new podcast episode: "${podcast.title}". Tune in to hear the latest trends. #SorzalRadio #Podcast`,
        type: 'podcast',
        referenceId: podcast._id,
        referenceModel: 'Podcast'
      });
    } catch (error) {
      logger.error('Error in AI Podcast Generation: ' + error.message);
    }
  }, 300000);

  // JOB 1C: Other Content (Every 5 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const user = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      logger.info(`IA: ${user.name} is sharing a thought...`);
      const aiResponse = await generateAIContent('text', user);

      await Post.create({
        user: user._id,
        content: aiResponse.content,
        type: 'text',
        mediaUrl: `https://picsum.photos/seed/${Date.now()}/1200/800`
      });

      logger.info(`Success: Thought published by ${user.name}`);
    } catch (error) {
      logger.error('Error in AI Text Generation: ' + error.message);
    }
  }, 300000);

  // JOB 1I: Academy Courses (Every 5 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const user = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      logger.info(`IA: ${user.name} is drafting a new course...`);
      
      const courseCategories = ['Web Development', 'UI/UX Design', 'Artificial Intelligence', 'Cybersecurity', 'Blockchain', 'Digital Marketing'];
      const category = courseCategories[Math.floor(Math.random() * courseCategories.length)];
      
      const aiResponse = await generateAIContent('course', user);

      const course = await Course.create({
        instructor: user._id,
        title: aiResponse.title || `Masterclass: Modern ${category}`,
        description: aiResponse.description || aiResponse.content,
        category: aiResponse.category || category,
        price: aiResponse.price || Math.floor(Math.random() * 100) + 10,
        thumbnail: `https://picsum.photos/seed/course-${Date.now()}/800/600`,
        rating: 4.5 + (Math.random() * 0.5),
        numReviews: Math.floor(Math.random() * 20),
        modules: [
          { title: 'Introduction', content: 'Basic fundamentals.' },
          { title: 'Advanced Practice', content: 'Real application.' }
        ]
      });

      logger.info(`Success: "${course.title}" published by ${user.name}`);

      await Post.create({
        user: user._id,
        content: `I just launched my new course "${course.title}" at Sorzal Academy! If you want to learn about ${category}, this is the place. #Learn #Academy`,
        type: 'text',
        mediaUrl: course.thumbnail
      });
    } catch (error) {
      logger.error('Error in AI Course Generation: ' + error.message);
    }
  }, 300000);

  // JOB 2: Auto Interaction (Every minute)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const bot = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      const randomValue = Math.random();
      let targetType;
      
      if (randomValue < 0.4) targetType = 'post';
      else if (randomValue < 0.7) targetType = 'thread';
      else targetType = 'photography';

      if (targetType === 'post') {
        const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(10);
        if (recentPosts.length === 0) return;
        const post = recentPosts[Math.floor(Math.random() * recentPosts.length)];

        const action = Math.random();
        if (action < 0.7 && !post.likes.includes(bot._id)) {
          post.likes.push(bot._id);
          logger.info(`IA: ${bot.name} liked a post.`);
        }

        if (action > 0.4) {
          const commentContent = await generateAIInteraction(bot, post);
          post.comments.push({ user: bot._id, content: commentContent });
          logger.info(`IA: ${bot.name} commented on post: "${commentContent}"`);
        }
        await post.save();
      } else if (targetType === 'thread') {
        const recentThreads = await Thread.find().sort({ createdAt: -1 }).limit(10);
        if (recentThreads.length === 0) return;
        const thread = recentThreads[Math.floor(Math.random() * recentThreads.length)];

        const action = Math.random();
        if (action < 0.7 && !thread.upvotes.includes(bot._id)) {
          thread.upvotes.push(bot._id);
          logger.info(`IA: ${bot.name} upvoted a thread.`);
        }

        if (action > 0.4) {
          const commentContent = await generateAIInteraction(bot, thread);
          await ThreadComment.create({
            user: bot._id,
            thread: thread._id,
            content: commentContent
          });
          thread.repliesCount += 1;
          logger.info(`IA: ${bot.name} commented on forum: "${commentContent}"`);
        }
        await thread.save();
      } else if (targetType === 'photography') {
        const recentPhotos = await Product.find().sort({ createdAt: -1 }).limit(10);
        if (recentPhotos.length === 0) return;
        const photo = recentPhotos[Math.floor(Math.random() * recentPhotos.length)];

        const action = Math.random();
        if (action < 0.7 && !photo.likes.includes(bot._id)) {
          photo.likes.push(bot._id);
          logger.info(`IA: ${bot.name} liked a photo.`);
        }

        if (action > 0.4) {
          const commentContent = await generateAIInteraction(bot, photo);
          await Comment.create({
            user: bot._id,
            product: photo._id,
            content: commentContent,
            rating: 5
          });
          logger.info(`IA: ${bot.name} commented on photography: "${commentContent}"`);
        }
        await photo.save();
      }
    } catch (error) {
      logger.error('Error in AI Interaction: ' + error.message);
    }
  }, 60000);

  // JOB 2B: Game Interaction (Every minute)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const bot = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      const recentGames = await Game.find().sort({ createdAt: -1 }).limit(10);
      if (recentGames.length === 0) return;

      const game = recentGames[Math.floor(Math.random() * recentGames.length)];
      const commentContent = await generateAIInteraction(bot, { content: game.title + " " + game.description });
      
      game.comments.push({ user: bot._id, content: commentContent });
      await game.save();
      logger.info(`IA: ${bot.name} commented on game "${game.title}": "${commentContent}"`);
    } catch (error) {
      logger.error('Error in AI Game Interaction: ' + error.message);
    }
  }, 60000);

  // JOB 3: Profile Evolution (Every 10 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const user = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      
      const update = await generateAIPersonaUpdate(user);
      user.bio = update.bio;
      user.avatar = update.avatar;
      
      await user.save();
      logger.info(`Success: Profile of ${user.name} has evolved.`);
    } catch (error) {
      logger.error('Error in AI Evolution: ' + error.message);
    }
  }, 600000);

  // JOB 4: Social Dynamics (Every 10 minutes)
  setInterval(async () => {
    try {
      const aiUsers = await User.find({ isAI: true });
      if (aiUsers.length === 0) return;

      const bot = aiUsers[Math.floor(Math.random() * aiUsers.length)];
      const potentialUsers = await User.find({ _id: { $ne: bot._id } }).limit(50);
      const target = potentialUsers[Math.floor(Math.random() * potentialUsers.length)];

      if (target && !bot.following.includes(target._id)) {
        bot.following.push(target._id);
        await bot.save();
        logger.info(`IA: ${bot.name} is now following ${target.name}.`);
      }
    } catch (error) {
      logger.error('Error in AI Social Dynamics: ' + error.message);
    }
  }, 600000);
};

module.exports = { startAISeederJob };
