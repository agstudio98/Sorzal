const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Thread = require('./models/Thread');
const User = require('./models/User');
const ThreadComment = require('./models/ThreadComment');
const Reel = require('./models/Reel');
const ReelComment = require('./models/ReelComment');
const logger = require('./utils/logger');

dotenv.config();

const seedThreads = async () => {
  try {
    await connectDB();

    // Check if we have users
    let users = await User.find();
    if (users.length === 0) {
      logger.info('No users found, creating pilot users...');
      const pilotUsers = [
        { name: 'Elena Visuals', email: 'elena@sorzal.com', password: 'password123', interests: ['Photography'], avatar: 'E' },
        { name: 'Marcos Hunter', email: 'marcos@sorzal.com', password: 'password123', interests: ['Urban'], avatar: 'M' },
        { name: 'Sofía Arq', email: 'sofia@sorzal.com', password: 'password123', interests: ['Abstract'], avatar: 'S' },
        { name: 'Lucas Pixel', email: 'lucas@sorzal.com', password: 'password123', interests: ['Digital'], avatar: 'L' },
        { name: 'Ana Sky', email: 'ana@sorzal.com', password: 'password123', interests: ['Nature'], avatar: 'A' }
      ];
      users = await User.insertMany(pilotUsers);
    }

    logger.info('Cleaning old debates...');
    await Thread.deleteMany({});
    await ThreadComment.deleteMany({});

    const categories = ['Art', 'Dev', 'Debate', 'Marketplace', 'Courses'];
    const titles = [
      'How to improve in', 'Doubts about', 'My experience with', 'Let\'s talk about', 'Tips for', 
      'Does anyone know about', 'Proposal for', 'Analysis of', 'Opinions on', 'Basic guide to'
    ];
    const topics = [
      'analog photography', 'React development', 'the Sorzal ecosystem', 'artificial intelligence',
      'cryptocurrencies and art', 'interface design', 'asset optimization', 'creative community',
      'rendering techniques', 'future of digital art', 'project management', 'marketing for artists'
    ];

    const threads = [];
    logger.info('Generating 200 debates...');

    for (let i = 0; i < 200; i++) {
      const user = users[i % users.length];
      const category = categories[i % categories.length];
      const titlePrefix = titles[Math.floor(Math.random() * titles.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      threads.push({
        user: user._id,
        title: `${titlePrefix} ${topic} #${i + 1}`,
        content: `This is an automatically generated debate about ${topic}. We want to know what the Sorzal community thinks about this relevant topic in the ${category} category.`,
        category: category,
        upvotes: users.slice(0, Math.floor(Math.random() * users.length)).map(u => u._id),
        downvotes: [],
        repliesCount: Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - i * 3600000)
      });
    }

    const createdThreads = await Thread.insertMany(threads);
    logger.success('200 Debates loaded successfully');

    logger.info('Generating mock comments...');
    const threadComments = [];
    const commentTexts = [
      'Excellent point! I noticed something similar.',
      'I disagree, I think the key is simplicity.',
      'Has anyone tried the latest version? It fixes several bugs.',
      'I love this topic. Thanks for starting the debate.',
      'Interesting perspective. I\'d like to go deeper into the technical aspect.',
      'Brutal! Just what I was looking for.',
      'I\'ve had some issues with that, any extra tips?',
      'Sorzal keeps growing, glad to see so much activity.',
      'Great contribution. We should have a meeting about this.',
      'Totally. Digital art is the future.'
    ];

    for (const thread of createdThreads) {
      const numComments = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < numComments; j++) {
        const user = users[Math.floor(Math.random() * users.length)];
        threadComments.push({
          user: user._id,
          thread: thread._id,
          content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          upvotes: users.slice(0, Math.floor(Math.random() * users.length)).map(u => u._id),
          downvotes: [],
          createdAt: new Date(thread.createdAt.getTime() + (j + 1) * 600000)
        });
      }
    }

    await ThreadComment.insertMany(threadComments);
    logger.success('Comments loaded successfully');

    logger.info('Generating mock Reels...');
    await Reel.deleteMany({});
    await ReelComment.deleteMany({});

    const videoData = [
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        caption: 'Exploring new rendering techniques in Sorzal #SorzalArt',
        category: 'Art'
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        caption: 'The dream of a digital architect. What do you think? #DevLife',
        category: 'Dev'
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        caption: 'Light and fire in the north sector. Brutal! #SorzalSky',
        category: 'Art'
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        caption: 'Escaping reality towards the perfect ecosystem. #Abstract',
        category: 'Debate'
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        caption: 'Fun has no limits when everything fits. #Community',
        category: 'Debate'
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        caption: 'A journey through new Sorzal mechanics. #Gaming',
        category: 'Courses'
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        caption: 'Crystal fusion in the Marketplace. Don\'t miss it! #Marketplace',
        category: 'Marketplace'
      }
    ];

    const reels = [];
    for (let i = 0; i < 21; i++) {
      const user = users[i % users.length];
      const data = videoData[i % videoData.length];
      reels.push({
        user: user._id,
        videoUrl: data.url,
        caption: data.caption,
        song: 'Sorzal Original - ' + (i % 2 === 0 ? 'Lofi' : 'Techno') + ' Beats',
        likes: users.slice(0, Math.floor(Math.random() * users.length)).map(u => u._id),
        sharesCount: Math.floor(Math.random() * 100),
        createdAt: new Date(Date.now() - i * 3600000)
      });
    }

    const createdReels = await Reel.insertMany(reels);
    
    const reelComments = [];
    const reelCommentTexts = [
      'I love this video!',
      'Brutal editing',
      'What camera did you use?',
      'Sorzal at its best.',
      'Keep it up!',
      'When is the next one?',
      'Very inspiring.',
      'Saving this reel',
      'Perfect sound.',
      'Top tier content.'
    ];

    for (const reel of createdReels) {
      const numC = Math.floor(Math.random() * 8) + 2;
      for (let k = 0; k < numC; k++) {
        const user = users[Math.floor(Math.random() * users.length)];
        reelComments.push({
          user: user._id,
          reel: reel._id,
          content: reelCommentTexts[Math.floor(Math.random() * reelCommentTexts.length)],
          createdAt: new Date(reel.createdAt.getTime() + (k + 1) * 300000)
        });
      }
    }
    await ReelComment.insertMany(reelComments);
    logger.success('20 Reels and comments loaded successfully');

    process.exit();
  } catch (error) {
    logger.error('Error seeding threads: ' + error.message);
    process.exit(1);
  }
};

seedThreads();
