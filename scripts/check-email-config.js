// Check if email environment variables are configured
require('dotenv').config({ path: '.env.local' });

console.log('📧 Email Configuration Check:\n');

const emailUser = process.env.EMAIL_SERVER_USER;
const emailPassword = process.env.EMAIL_SERVER_PASSWORD;
const emailHost = process.env.EMAIL_SERVER_HOST;

if (emailUser && emailPassword && emailHost) {
    console.log('✅ EMAIL_SERVER_HOST:', emailHost);
    console.log('✅ EMAIL_SERVER_USER:', emailUser);
    console.log('✅ EMAIL_SERVER_PASSWORD:', '***' + emailPassword.slice(-4));
    console.log('\n✅ Email is configured and ready!');
    console.log('\n📧 Ready to send emails!');
} else {
    console.log('❌ Email NOT configured');
    console.log('Missing:', !emailHost ? 'EMAIL_SERVER_HOST' : '', !emailUser ? 'EMAIL_SERVER_USER' : '', !emailPassword ? 'EMAIL_SERVER_PASSWORD' : '');
}

process.exit(0);
