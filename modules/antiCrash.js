// modules/antiCrash.js
module.exports = {
    name: 'antiCrash',
    execute(client) {
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            // Optional: send error to a channel
            // const errorChannel = client.channels.cache.get('YOUR_CHANNEL_ID');
            // if (errorChannel) {
            //     errorChannel.send(`⚠️ Unhandled Rejection:\n\`\`\`${reason}\`\`\``);
            // }
        });

        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            // Optional: send error to a channel
            // const errorChannel = client.channels.cache.get('YOUR_CHANNEL_ID');
            // if (errorChannel) {
            //     errorChannel.send(`💥 Uncaught Exception:\n\`\`\`${err}\`\`\``);
            // }
        });

        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.warn('Uncaught Exception Monitor:', err, 'Origin:', origin);
        });

        console.log('✅ Anti-crash module loaded and active');
    }
};
