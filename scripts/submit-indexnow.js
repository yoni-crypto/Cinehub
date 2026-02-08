#!/usr/bin/env node

const BASE_URL = 'https://cinehub1.vercel.app';
const INDEXNOW_KEY = '1d3051b4934a44b9bd07d8d82458361d';

async function submitToIndexNow(urls) {
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: 'cinehub1.vercel.app',
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    if (response.ok) {
      console.log(`✅ Successfully submitted ${urls.length} URLs to IndexNow`);
      return true;
    } else {
      console.error(`❌ Failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting IndexNow submission...\n');

  const priorityUrls = [
    `${BASE_URL}/`,
    `${BASE_URL}/movies`,
    `${BASE_URL}/tv-shows`,
    `${BASE_URL}/categories`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/about`,
    `${BASE_URL}/privacy`,
    `${BASE_URL}/terms`,
  ];

  const genreUrls = [
    'action', 'comedy', 'drama', 'horror', 'thriller', 'romance', 
    'sci-fi', 'fantasy', 'animation', 'crime'
  ].map(genre => `${BASE_URL}/genre/${genre}`);

  const yearUrls = ['2024', '2023', '2022'].map(year => `${BASE_URL}/year/${year}`);

  const blogUrls = [
    'top-movies-2024',
    'streaming-guide-beginners',
    'best-action-movies',
    'hidden-gems-2023',
    'tv-shows-binge-watch',
    'hdtoday-alternative',
    'best-horror-movies-2024',
    'romantic-movies-valentines',
    'anime-movies-must-watch',
    'free-streaming-sites-comparison'
  ].map(slug => `${BASE_URL}/blog/${slug}`);

  // Top 50 popular movies (you can increase this)
  const topMovieIds = [
    693134, 872585, 575264, 447365, 569094, 438631, 502356, 346698,
    299534, 299536, 299537, 118340, 157336, 181808, 335984, 335983,
    284053, 284052, 284054, 19995, 76341, 76600, 76338, 127380,
    155, 278, 238, 424, 129, 13, 122, 497, 680, 27205,
    550, 98, 637, 120, 389, 429, 274, 240, 424, 372058,
    603, 11, 769, 329865, 475557, 508442
  ].map(id => `${BASE_URL}/movies/${id}`);

  // Top 30 popular TV shows
  const topTVIds = [
    94997, 1396, 1399, 60735, 82856, 84958, 76479, 95557,
    100088, 37854, 31911, 46952, 1668, 4614, 60059, 1434,
    456, 1622, 2734, 1408, 1416, 46261, 60625, 63174,
    71712, 88329, 92783, 95396, 103768, 110492
  ].map(id => `${BASE_URL}/tv-shows/${id}`);

  const allUrls = [
    ...priorityUrls, 
    ...genreUrls, 
    ...yearUrls, 
    ...blogUrls, 
    ...topMovieIds, 
    ...topTVIds
  ];

  console.log(`📊 Total URLs to submit: ${allUrls.length}\n`);

  const batchSize = 100;
  for (let i = 0; i < allUrls.length; i += batchSize) {
    const batch = allUrls.slice(i, i + batchSize);
    console.log(`📤 Submitting batch ${Math.floor(i / batchSize) + 1}...`);
    await submitToIndexNow(batch);
    
    if (i + batchSize < allUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n✨ Complete!');
  console.log(`\n📈 Summary:`);
  console.log(`   - Priority pages: ${priorityUrls.length}`);
  console.log(`   - Genre pages: ${genreUrls.length}`);
  console.log(`   - Year pages: ${yearUrls.length}`);
  console.log(`   - Blog posts: ${blogUrls.length}`);
  console.log(`   - Movie pages: ${topMovieIds.length}`);
  console.log(`   - TV show pages: ${topTVIds.length}`);
  console.log(`   - TOTAL: ${allUrls.length} URLs submitted`);
  console.log(`\n💡 Tip: Run this weekly to keep search engines updated!`);
}

main();
