// const TelegramBot = require('node-telegram-bot-api');

// // Replace 'YOUR_BOT_TOKEN' with your actual bot token
// const bot = new TelegramBot('6666904386:AAG8icnKGRBcyUfcOPA2eF_SstZdtQr8d3U', { polling: true });

// // // Listen for any kind of message
// // bot.on('message', (msg) => {
// //   const chatId = msg.chat.id;
  
// //   // Send a greeting when someone sends "/start"
// //   if (msg.text.toString().toLowerCase().includes('/start')) {
// //     bot.sendMessage(chatId, 'Hello! I am Ronald.');
// //   }
// // });

// // Specify the word you want to trigger the response
// const triggerWord = 'hello';

// // Define a positive response
// const positiveResponse = 'Hi there! How can I assist you?';

// // Listen for any kind of message
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
  
//   // Check if the trigger word is present in the message
//   if (msg.text.toString().toLowerCase().includes(triggerWord)) {
//     bot.sendMessage(chatId, positiveResponse);
//   }
// });
const TelegramBot = require('node-telegram-bot-api');
const notifier = require('node-notifier');

// Replace 'YOUR_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot('6666904386:AAG8icnKGRBcyUfcOPA2eF_SstZdtQr8d3U', { polling: true });

// Define user state object to store user data
const userState = {};

// Function to send notification
function sendNotification(chatId, gameId) {
  // Implement your notification logic here
  // For example, you can use the 'node-notifier' module to send desktop notifications
  notifier.notify({
      title: 'Application Successful',
      message: `User ${userState[chatId]} has successfully redeemed the bonus for game ID: ${gameId}`,
      sound: true,
  });
}

// Listen for any kind of message
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text.trim().toLowerCase();

    // Check if the message is the /start command
    if (messageText === '/start') {
        // Reset user state
        userState[chatId] = {};

        // Send the welcome message and prompt for the redemption code
        bot.sendMessage(
            chatId,
            `Dear Player!\nWelcome to RUMMYMOMENT’s Official TG Subscription Bonus Program!\nEnter The Redemption Code: tgbonusmnt`
        );
        // Set a timeout to remind the user to enter the redemption code after a certain period (e.g., 5 minutes)
        setTimeout(() => {
            if (!userState[chatId]?.redemptionCode) {
                bot.sendMessage(chatId, 'Invalid input. Please enter the redemption code first.');
            }
        }, 5 * 60 * 1000); // 5 minutes
    } else {
        if (!userState[chatId]?.redemptionCode) {
            // Check if the user has entered the redemption code
            if (messageText === 'tgbonusmnt') {
                userState[chatId].redemptionCode = true;

                // Ask if the user is a new player or an old player
                bot.sendMessage(chatId, 'Are you a new player or an old player?', {
                    reply_markup: {
                        keyboard: [['New Player', 'Old Player']],
                        one_time_keyboard: true,
                    },
                });
            } else {
                // If the user hasn't entered the redemption code yet or entered an invalid code
                bot.sendMessage(chatId, 'Invalid redemption code. Please enter the correct redemption code.');
            }
        } else if (!userState[chatId]?.playerType) {
            // Check if the user has selected a player type
            if (messageText === 'new player' || messageText === 'old player') {
                // Store the player type
                userState[chatId].playerType = messageText;

                // Ask for the game ID
                bot.sendMessage(chatId, 'Please provide your game ID (top left corner of RUMMYMOMENT APP)');
            } else {
                // If the user entered an invalid player type
                bot.sendMessage(chatId, 'Invalid input. Please select "New Player" or "Old Player".');
            }
        } else if (!userState[chatId]?.gameId) {
            // Assuming the user has entered the player type
            const gameId = messageText.trim();

            // Validate the game ID
            if (/^\d{1,12}$/.test(gameId)) {
                // Store the game ID
                userState[chatId].gameId = gameId;

                // Send confirmation message
                bot.sendMessage(
                    chatId,
                    'Application successful! Thank you for participating! (The bonus will be sent to your personal email before 12:00PM the next day)'
                );

                // Mark the process as completed
                userState[chatId].completed = true;

                // Send desktop notification with the game ID
                sendNotification(chatId, userState[chatId].gameId);
            } else {
                // Inform the user that the game ID is invalid
                bot.sendMessage(chatId, 'Invalid game ID. Please enter a valid game ID containing only numbers with a maximum length of 12 digits.');
            }
        } else {
            // Auto-response messages
            const autoResponses = [
                "Thank you for reaching out! Our team will get back to you as soon as possible.",
                "We appreciate your message! Please allow us some time to review and respond.",
                "Your inquiry is important to us! We'll address it shortly.",
                "Hi there! We've received your message and will be in touch shortly.",
                "Thanks for getting in touch! We'll provide assistance shortly."
            ];

            // Select a random auto-response message
            const randomIndex = Math.floor(Math.random() * autoResponses.length);
            const autoResponse = autoResponses[randomIndex];

            // Send the auto-response message
            bot.sendMessage(chatId, autoResponse);
        }
    }
});

