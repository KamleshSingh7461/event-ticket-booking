require('dotenv').config({ path: '.env.local' });

console.log('Email User:', process.env.EMAIL_SERVER_USER);
console.log('Email Pass:', process.env.EMAIL_SERVER_PASSWORD ? '***configured***' : 'NOT SET');
console.log('Email Host:', process.env.EMAIL_SERVER_HOST);
console.log('Email Port:', process.env.EMAIL_SERVER_PORT);
