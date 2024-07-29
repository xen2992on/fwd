const TelegramBot = require('node-telegram-bot-api');
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const dotenv = require("dotenv")
const Message = require("../model/messageModel.js")

dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN; 
const bot = new TelegramBot(token, { polling: true });


const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION_STRING);

const Source_Channel_ID = process.env.SOURCE_CHANNEL_ACCESS_ID;
const DESTINATION_CHANNEL_ACCESS_ID = process.env.DESTINATION_CHANNEL_ACCESS_ID;

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Please enter your number: "),
        password: async () => await input.text("Please enter your password: "),
        phoneCode: async () => await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    console.log(client.session.save()); 

    let i = 9002;

    // try {
    //     const result = await Message.findOne().sort('-forward_origin_chat_id').exec();
    //     console.log(result);
    //     // If a document was found, set 'i' to the maximum 'forward_origin_chat_id' found
    //     if (result) {
    //         i = result.forward_origin_chat_id+1;
    //     }
    // } catch (err) {
    //     console.log("Error in retrieving data from database", err);
    // }

    bot.on('channel_post', async (msg) => {
        console.log(msg);
    //     try {
    //         const NewMessages = new Message({
    //             chat_id: msg.message_id,
    //             source_message_link: `https://t.me/c/${Source_Channel_ID}/${i-1}`,
    //             destination_message_link: `https://t.me/c/${DESTINATION_CHANNEL_ACCESS_ID}/${msg.message_id}`,
    //             file_name: msg.video?.file_name || msg.document?.file_name,
    //             mime_type: msg.video?.mime_type || msg.document?.mime_type,
    //             duration: msg.video?.duration || null,
    //             file_size: msg.video?.file_size || msg.document?.file_size,
    //             caption: msg?.caption,
    //             forward_origin_chat_id: i-1,
    //             text_message: msg?.text || null
    //         });

    //         await NewMessages.save()
    //             .then((result) => {
    //                 // console.log(result);
    //             })
    //             .catch((error) => {
    //                 console.log("Error in save data in database", error);
    //             })

    //     } catch (error) {
    //         console.log(error);
    //     }
    });


    const sourceChannel = await client.getEntity(new Api.PeerChannel({ channelId: process.env.SOURCE_CHANNEL_ACCESS_ID }));
    const SOURCE_CHANNEL_ACCESS_HASH = sourceChannel.accessHash;
    console.log({"source": SOURCE_CHANNEL_ACCESS_HASH})
    
    const destiChannel = await client.getEntity(new Api.PeerChannel({ channelId: process.env.DESTINATION_CHANNEL_ACCESS_ID }));
    const DESTI_CHANNEL_ACCESS_HASH = destiChannel.accessHash;
    console.log({"source": DESTI_CHANNEL_ACCESS_HASH})
    
    setInterval(async () => {
        const element = i++;
        try {
            // Fetch the full message from the source channel
            const fullMsg = await client.invoke(
                new Api.channels.GetMessages({
                    channel: new Api.InputChannel({ channelId: sourceChannel.id, accessHash: sourceChannel.accessHash }),
                    id: [element],
                })
            );
    
            const message = fullMsg.messages[0]; // Get the message from the result
    
            // Check if the message is a video or document
            if (message.video || message.document) { 
                await client.invoke(
                    new Api.messages.ForwardMessages({
                        fromPeer: new Api.InputPeerChannel({ channelId: sourceChannel.id, accessHash: sourceChannel.accessHash }),
                        id: [element],
                        randomId: [BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))],
                        toPeer: new Api.InputPeerChannel({ channelId: destiChannel.id, accessHash: destiChannel.accessHash }),
                        silent: true, 
                        dropAuthor: true,
                        // dropMediaCaptions: true, // Optional, if you want to drop captions
                    })
                );
            } else {
                console.log(`Skipping message with ID ${element} as it's not a video or document.`);
            }
    
        } catch (error) { 
            // ... (error handling remains the same)
        }
    }, 10002); // Forward messages every 10 seconds

})();
