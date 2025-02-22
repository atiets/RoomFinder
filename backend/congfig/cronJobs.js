const cron = require('node-cron');
const Post = require('../models/Post');
const User = require('../models/User');

cron.schedule('0 * * * *', async () => {
  try {
    const posts = await Post.find({ visibility: 'visible' });

    if (posts.length > 0) {
      const operations = [];
      const notifications = [];
      for (const post of posts) {
        if (post.daysRemaining > 0 || post.hoursRemaining > 0) {
          if (post.hoursRemaining > 0) {
            post.hoursRemaining -= 1;
          } else {
            post.daysRemaining -= 1;
            post.hoursRemaining = 23;
          }
          if (post.daysRemaining === 1 && post.hoursRemaining === 0) {
            const owner = await User.findById(post.contactInfo.user);
            if (owner) {
              const notification = {
                message: `Bài viết "${post.title}" của bạn sẽ hết hạn sau 1 ngày.`,
                type: 'expiration_warning',
                post_id: post._id,
                status: 'unread',
              };
              owner.notifications.push(notification);
              notifications.push(owner.save());
            }
          }
          if (post.daysRemaining === 0 && post.hoursRemaining === 0) {
            post.visibility = 'hidden';
          }
          operations.push({
            updateOne: {
              filter: { _id: post._id },
              update: {
                $set: {
                  daysRemaining: post.daysRemaining,
                  hoursRemaining: post.hoursRemaining,
                  visibility: post.visibility,
                },
              },
            },
          });
        }
      }
      if (operations.length > 0) {
        await Post.bulkWrite(operations);
        console.log(`Updated ${operations.length} posts successfully.`);
      }
      if (notifications.length > 0) {
        await Promise.all(notifications);
        console.log('Notifications sent successfully.');
      }
    } else {
      console.log('No posts to update.');
    }
  } catch (error) {
    console.error('Error updating posts:', error);
  }
});
