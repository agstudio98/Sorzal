const User = require('../models/User');
const Product = require('../models/Product');
const Comment = require('../models/Comment');
const Reel = require('../models/Reel');
const ReelComment = require('../models/ReelComment');
const Thread = require('../models/Thread');
const ThreadComment = require('../models/ThreadComment');
const Course = require('../models/Course');
const Repo = require('../models/Repo');
const RepoComment = require('../models/RepoComment');
const Podcast = require('../models/Podcast');
const Post = require('../models/Post');
const Game = require('../models/Game');
const logger = require('../utils/logger');

const autoSeed = async () => {
  try {
    logger.info('Performing deep cleanup of obsolete video links...');
    const brokenPattern = /mixkit\.co|googlevideo|gtv-videos-bucket|vjs\.zencdn\.net|w3\.org|w3schools\.com/;
    await Reel.deleteMany({ videoUrl: brokenPattern });
    await Post.deleteMany({ mediaUrl: brokenPattern });
    await Game.deleteMany({ icon: /http/ });

    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const reelCount = await Reel.countDocuments();
    const threadCount = await Thread.countDocuments();
    const courseCount = await Course.countDocuments();
    const repoCount = await Repo.countDocuments();
    const podcastCount = await Podcast.countDocuments();
    const postCount = await Post.countDocuments();
    const gameCount = await Game.countDocuments();
    
    logger.info('--- Verifying Sorzal Ecosystem ---');
    logger.info(`Courses detected: ${courseCount}/110`);
    
    let createdUsers = await User.find();
    if (createdUsers.length < 35) {
        logger.info('Seeding Real and AI Users...');
        await User.deleteMany({});
        const pilotUsers = [
            { name: 'Elena Visuals', email: 'elena@sorzal.com', password: 'password123', interests: ['Photography'], affinities: ['Portrait', 'Light'], avatar: 'E' },
            { name: 'Marcos Hunter', email: 'marcos@sorzal.com', password: 'password123', interests: ['Urban'], affinities: ['Street', 'Night'], avatar: 'M' },
            { name: 'Sofía Arq', email: 'sofia@sorzal.com', password: 'password123', interests: ['Abstract'], affinities: ['Shapes', 'Color'], avatar: 'S' },
            { name: 'Lucas Pixel', email: 'lucas@sorzal.com', password: 'password123', interests: ['Digital'], affinities: ['AI', 'Cyber'], avatar: 'L' },
            { name: 'Ana Sky', email: 'ana@sorzal.com', password: 'password123', interests: ['Nature'], affinities: ['Landscapes', 'Macro'], avatar: 'A' }
        ];
        createdUsers = await User.insertMany(pilotUsers);
    }

    if (gameCount === 0) {
      logger.info('Seeding Official Sorzal Games...');
      const officialGames = [
        { title: "Alpha Tactics", category: "Strategy", description: "Command your fleet in a tactical stellar battle.", isOfficial: true },
        { title: "Binary Code", category: "Puzzle", description: "Decipher the secrets of binary code.", isOfficial: true },
        { title: "Bio Hazard", category: "Action", description: "Survive the biological threat in a hostile environment.", isOfficial: true },
        { title: "Bot War", category: "Arcade", description: "Robot war in the digital arena.", isOfficial: true },
        { title: "Circle Survive", category: "Rhythm", description: "Keep the rhythm and survive the circle.", isOfficial: true },
        { title: "Cyber Blade", category: "Action", description: "Pure cyberpunk action with light katanas.", isOfficial: true }
      ];
      
      const gamesToInsert = officialGames.map((g, i) => ({
        ...g,
        user: createdUsers[i % createdUsers.length]._id,
        rating: 4.5 + (Math.random() * 0.5),
        icon: 'Gamepad2',
        color: 'text-primary-light'
      }));
      
      await Game.insertMany(gamesToInsert);
    }

    if (productCount < 200) {
        logger.info('Seeding Extended Catalog (200+ Products)...');
        await Product.deleteMany({});
        await Comment.deleteMany({});
        
        const photoCategories = ['Nature', 'Portrait', 'Urban', 'Abstract', 'Digital'];
        const expandedPosts = [];
        
        for (let i = 0; i < 60; i++) {
          const user = createdUsers[i % createdUsers.length];
          const category = photoCategories[i % photoCategories.length];
          expandedPosts.push({
            user: user._id,
            name: `${category} in Sorzal - Shot #${i + 1}`,
            description: `A unique piece of ${category} captured by ${user.name}. Commercial license available.`,
            price: Math.floor(Math.random() * 50) + 15,
            category: category,
            imageUrl: `https://picsum.photos/seed/sorzal-${i}/1200/800`,
            likes: [],
            rating: 4 + Math.random(),
            numReviews: 0,
            countInStock: 1,
            createdAt: new Date(Date.now() - i * 3600000)
          });
        }

        const marketProducts = [
          { name: "Sony Alpha 7R V Mirrorless", cat: "Cameras", price: 3899, desc: "61 MP full-frame sensor with AI for advanced autofocus." },
          { name: "Canon EOS R5 with 24-105mm f/4L", cat: "Cameras", price: 4299, desc: "Professional 8K camera for demanding photographers." },
          { name: "Panasonic Lumix S5 IIX Kit", cat: "Cameras", price: 2199, desc: "Excellent for video with internal ProRes and RAW output." },
          { name: "GoPro HERO12 Black Bundle", cat: "Cameras", price: 449, desc: "Versatile action camera with HDR and HyperSmooth 6.0." },
          { name: "Intel Core i9-14900K 6.0GHz", cat: "Hardware", price: 589, desc: "24 cores and 32 threads for maximum multitasking performance." },
          { name: "Corsair Vengeance 64GB DDR5", cat: "Hardware", price: 215, desc: "64GB kit optimized for Intel and AMD at 6000MHz." },
          { name: "Samsung 990 Pro 2TB NVMe M.2", cat: "Hardware", price: 179, desc: "Read speeds up to 7450 MB/s for instant loading." },
          { name: "Logitech G915 TKL Lightspeed", cat: "Hardware", price: 199, desc: "Wireless low-profile mechanical keyboard." },
          { name: "Razer DeathAdder V3 Pro", cat: "Hardware", price: 145, desc: "Ultra-lightweight 63g design for eSports pros." },
          { name: "Sony FE 70-200mm f/2.8 GM II", cat: "Lenses", price: 2799, desc: "High-end telephoto zoom with exceptional sharpness." },
          { name: "Sigma 24-70mm f/2.8 DG DN Art", cat: "Lenses", price: 1099, desc: "Best standard zoom for E-mount." },
          { name: "Canon RF 85mm f/1.2L USM DS", cat: "Lenses", price: 3099, desc: "The portrait king with ultra-smooth bokeh." },
          { name: "Tamron 28-75mm f/2.8 Di III VXD G2", cat: "Lenses", price: 899, desc: "Compact and sharp, ideal for travel." },
          { name: "Sony WH-1000XM5 Noise Cancelling", cat: "Accessories", price: 399, desc: "Leader in noise cancellation with hi-fi audio." },
          { name: "Shure MV7 USB/XLR Podcast Mic", cat: "Accessories", price: 249, desc: "Inspired by the SM7B, perfect for home creators." },
          { name: "Focusrite Scarlett 2i2 4th Gen", cat: "Accessories", price: 199, desc: "World's best-selling audio interface." },
          { name: "DJI RS 3 Mini Gimbal", cat: "Accessories", price: 369, desc: "Lightweight and powerful for mirrorless cameras." },
          { name: "Elgato Key Light Air", cat: "Accessories", price: 129, desc: "Professional lighting for streaming." },
          { name: "Windows 11 Pro 64 Bits", cat: "Software", price: 149, desc: "Full version for professional use." },
          { name: "Capture One Pro 23", cat: "Software", price: 299, desc: "Best RAW developer for studio photographers." },
          { name: "Ableton Live 11 Suite", cat: "Software", price: 749, desc: "DAW for music production." },
          { name: "Luminar Neo - AI Photo Editor", cat: "Software", price: 99, desc: "Creative editing simplified by AI." }
        ];

        for (let i = 0; i < 140; i++) {
          const user = createdUsers[i % createdUsers.length];
          const baseProduct = marketProducts[i % marketProducts.length];
          
          expandedPosts.push({
            user: user._id,
            name: `${baseProduct.name} ${Math.floor(Math.random() * 10) === 0 ? '(Used)' : ''}`,
            description: baseProduct.desc,
            price: baseProduct.price + (Math.floor(Math.random() * 200) - 100),
            category: baseProduct.cat,
            imageUrl: `https://picsum.photos/seed/market-${i}/800/600`,
            likes: [],
            rating: 4 + Math.random(),
            numReviews: 0,
            countInStock: Math.floor(Math.random() * 5) + 1,
            createdAt: new Date(Date.now() - (i + 60) * 3600000)
          });
        }

        await Product.insertMany(expandedPosts);
        logger.info('200 Products seeded successfully.');
    }

    if (reelCount < 5) {
        logger.info('Seeding Vertical Reels...');
        await Reel.deleteMany({});
        await ReelComment.deleteMany({});
        const videoData = [
            { url: 'https://www.youtube.com/shorts/qM79_itR0Nc', caption: 'Cyber aesthetics in Sorzal #NeonArt' },
            { url: 'https://www.youtube.com/shorts/Wv_S9V-vXoM', caption: 'Cyberpunk vibes #CyberArt' },
            { url: 'https://www.youtube.com/shorts/3P1VvO8rX4c', caption: 'Abstract Digital Art #DigitalArt' },
            { url: 'https://www.youtube.com/shorts/o79r4x0_ySg', caption: 'Nightly Inspiration #CityLights' },
            { url: 'https://www.youtube.com/shorts/pL3kQ6W_9vM', caption: 'Sorzal Futurism #NextGen' }
        ];
        const reels = [];
        for (let i = 0; i < 15; i++) {
            const user = createdUsers[i % createdUsers.length];
            const data = videoData[i % videoData.length];
            reels.push({
                user: user._id,
                videoUrl: data.url,
                caption: data.caption,
                song: 'Original Sound - Sorzal Beats',
                createdAt: new Date(Date.now() - i * 3600000)
            });
        }
        await Reel.insertMany(reels);
    }

    if (threadCount < 10) {
        logger.info('Seeding Forum Debates...');
        await Thread.deleteMany({});
        await ThreadComment.deleteMany({});
        const forumCategories = ['Art', 'Dev', 'Debate', 'Marketplace', 'Courses'];
        const threads = [];
        for (let i = 0; i < 20; i++) {
            const user = createdUsers[i % createdUsers.length];
            threads.push({
                user: user._id,
                title: `How to improve in ${forumCategories[i % forumCategories.length]}? #${i + 1}`,
                content: 'Let\'s share our best pieces of knowledge here in Sorzal.',
                category: forumCategories[i % forumCategories.length],
                upvotes: [user._id],
                createdAt: new Date(Date.now() - i * 7200000)
            });
        }
        await Thread.insertMany(threads);
    }

    if (courseCount < 110) {
        logger.info('Seeding Sorzal Academy: Generating 110 unique courses...');
        await Course.deleteMany({});
        const categories = ['Design', 'Programming', 'Marketing', 'Photography', 'Gaming'];
        const prefixes = ['Master in', 'Fundamentals of', 'Advanced:', 'The Art of', 'Complete Guide to', 'Secrets of', 'Workshop:', 'Immersion in'];
        const subjects = {
            'Design': ['UI/UX', 'Logos', 'Digital Branding', 'Typography', 'Cyber Layouts', 'Colorimetry', 'Prototyping', 'Illustrator Pro'],
            'Programming': ['React 19', 'Rust Backend', 'Distributed Node.js', 'Python AI', 'Go Microservices', 'Advanced TypeScript', 'WebAssembly', 'Solidity'],
            'Marketing': ['New Era SEO', 'Growth Hacking', 'AI Ads', 'Persuasive Copywriting', 'Personal Branding', 'Email Marketing', 'Viral Strategy', 'Analytics'],
            'Photography': ['Natural Light', 'Urban Portrait', 'Astrophotography', 'RAW Post-processing', 'Golden Ratio Composition', 'Macro Photography', 'Street Style', 'Mobile Editing'],
            'Gaming': ['Level Design', 'Core Mechanics', 'Emergent Narrative', 'Unity 3D', 'Unreal Engine 5', 'Pixel Art', 'Game Balance', 'Multiplayer Networking']
        };
        const icons = {
            'Design': 'palette',
            'Programming': 'code',
            'Marketing': 'trending-up',
            'Photography': 'camera',
            'Gaming': 'gamepad-2'
        };

        const courses = [];
        for (let i = 0; i < 110; i++) {
            const user = createdUsers[i % createdUsers.length];
            const category = categories[i % categories.length];
            const subject = subjects[category][Math.floor(Math.random() * subjects[category].length)];
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            
            const title = `${prefix} ${subject}`;
            const description = `A comprehensive course on ${subject.toLowerCase()} designed by ${user.name} for the Sorzal community. You will learn exclusive ${category.toLowerCase()} techniques applied to the modern ecosystem.`;
            
            const modules = [];
            for (let m = 0; m < 10; m++) {
                modules.push({
                    title: `Module ${m + 1}: Foundations`,
                    content: `In this module, we will explore key concepts of ${subject}.`,
                    videoUrl: `https://vimeo.com/video/${i}${m}sorzal`
                });
            }

            courses.push({
                title,
                description,
                instructor: user._id,
                category,
                price: 0,
                thumbnail: icons[category],
                modules,
                rating: 4 + Math.random(),
                numReviews: Math.floor(Math.random() * 200) + 20,
                createdAt: new Date(Date.now() - i * 3600000)
            });
        }
        await Course.insertMany(courses);
        logger.info('110 Courses seeded successfully.');
    }

    if (repoCount < 5) {
        logger.info('Seeding Dev Repositories...');
        await Repo.deleteMany({});
        await RepoComment.deleteMany({});
        
        const realRepos = [
          { title: "Sorzal UI Toolkit", desc: "React component library with Cyber-Luxury aesthetics.", lang: "TypeScript" },
          { title: "Rust Game Engine Core", desc: "Minimalist game engine optimized for WebAssembly.", lang: "Rust" },
          { title: "Sorzal Neural AI", desc: "Neural network implementation for sentiment analysis.", lang: "Python" },
          { title: "Fast API Gateway", desc: "High-performance microservice for Sorzal routing.", lang: "Go" },
          { title: "Graphics Renderer v2", desc: "High-level renderer for 3D applications.", lang: "C++" }
        ];

        const repos = [];
        for (let i = 0; i < realRepos.length; i++) {
            const user = createdUsers[i % createdUsers.length];
            repos.push({
                user: user._id,
                title: realRepos[i].title,
                description: realRepos[i].desc,
                language: realRepos[i].lang,
                fileUrl: `/uploads/repos/project-${i}.zip`,
                fileName: `project-${i}.zip`,
                size: Math.floor(Math.random() * 8000) + 1000,
                stars: Math.floor(Math.random() * 50),
                starUsers: [user._id]
            });
        }
        await Repo.insertMany(repos);
    }

    if (podcastCount < 100) {
        logger.info('Seeding 100+ Sorzal Podcasts...');
        await Podcast.deleteMany({});
        const categories = ["Technology", "Design", "Finance", "Gaming", "Debate"];
        const podcasts = [];
        for (let i = 0; i < 110; i++) {
            const user = createdUsers[i % createdUsers.length];
            podcasts.push({
                user: user._id,
                title: `Sorzal Perspective Podcast #${i}`,
                description: `A deep talk about trends in the ecosystem.`,
                host: "Agustin Gallardo",
                audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 15) + 1}.mp3`,
                imageUrl: `https://picsum.photos/seed/podcast-v2-${i}/600/600`,
                category: categories[i % categories.length],
                duration: `${Math.floor(Math.random() * 30) + 15}:00`
            });
        }
        await Podcast.insertMany(podcasts);
    }

    if (userCount < 30) {
        logger.info('Seeding 30+ AI Users...');
        const matchUsers = [];
        const aiNames = ["Mateo Garcia", "Valentina Rodriguez", "Santiago Lopez", "Isabella Martinez", "Sebastian Perez"];
        for (let i = 0; i < 30; i++) {
            matchUsers.push({
                name: aiNames[i % aiNames.length] + " " + i,
                email: `user.${i}@sorzal.com`,
                password: "password123",
                isAI: true,
                avatar: `https://i.pravatar.cc/300?u=user${i}`,
                age: 20 + (i % 20),
                gender: i % 2 === 0 ? "male" : "female"
            });
        }
        await User.insertMany(matchUsers);
        logger.info('30+ AI Users seeded successfully.');
    }

    logger.success('Sorzal Ecosystem Verified and Seeded successfully.');
  } catch (error) {
    logger.error('Error in integral auto-seed: ' + error.message);
  }
};

module.exports = autoSeed;
