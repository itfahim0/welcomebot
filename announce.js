// announce.js

// Load environment variables from the .env file
require('dotenv').config(); 

const { Client, GatewayIntentBits } = require('discord.js');

// Initialize the Client with required Intents
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, // REQUIRED for guildMemberAdd event and role assignment
        GatewayIntentBits.MessageContent 
    ] 
});

// --- CONFIGURATION ---
const BOT_TOKEN = process.env.NODE_WELCOME_TOKEN; 
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;
const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID;

// NEW: Load IDs for clickable channel mentions
const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID;
const GENERAL_CHANNEL_ID = process.env.GENERAL_CHANNEL_ID;

// Perform critical checks before login
if (!BOT_TOKEN || !WELCOME_CHANNEL_ID || !AUTO_ROLE_ID || !RULES_CHANNEL_ID || !GENERAL_CHANNEL_ID) {
    console.error("FATAL ERROR: One or more configuration values are missing from the .env file. Check all five IDs.");
    process.exit(1); 
}

// Custom welcome message function 
// Uses <#ID> format for clickable channel mentions
const CUSTOM_MESSAGE = (member) => 
    `Hello ${member.user}

                         🎉 WELCOME TO 🎉
                         Purrfect Universe              


We're thrilled to have you join our UNIVERSE! You've been granted the <@&${AUTO_ROLE_ID}> role.

To get started, please check out these channels:

| **<#${RULES_CHANNEL_ID}>** : Read this first! It covers our Universe guidelines.,

| **<#${GENERAL_CHANNEL_ID}>** : Say hello to Universe member!

Enjoy your stay!
https://discord.gg/xYZHkQYt5H
      Arafat_Zahan
Founder & Universe Architect -
Purrfect Universe 
📧 arafat@purrfecthq.com  🌐 www.purrfecthq.com
Work Hard. Play Hard. Purr Loudest.`;
// ---------------------

// Event: Bot is ready and connected
client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
    console.log(`Ready to welcome and assign role ID: ${AUTO_ROLE_ID}...`);
});

// Event: New member joins the guild (server)
client.on('guildMemberAdd', async member => {
    console.log(`Member Joined: ${member.user.tag} (${member.id})`);

    // --- STEP 1: Assign the Role ---
    try {
        const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
        
        if (!role) {
            console.error(`❌ Role ID ${AUTO_ROLE_ID} not found in the guild's cache. Check role ID.`);
        } else {
            // Role assignment requires the bot's role to be higher than the target role.
            await member.roles.add(role);
            console.log(`✅ Successfully attempted to assign role ${role.name} to ${member.user.tag}.`);

            if (member.guild.members.me.roles.highest.position <= role.position) {
                console.warn(`⚠️ WARNING: The role was not applied due to hierarchy! The bot's highest role must be positioned above the role (${role.name}) you are trying to assign in Server Settings -> Roles.`);
            }
        }
    } catch (error) {
        console.error(`❌ Error assigning role to ${member.user.tag}:`, error);
    }


    // --- STEP 2: Send the Welcome Message ---
    try {
        const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);

        if (!channel || !channel.isTextBased()) {
            console.error(`❌ Error: Welcome channel ID ${WELCOME_CHANNEL_ID} is invalid or not a text channel.`);
            return;
        }

        const messageToSend = CUSTOM_MESSAGE(member);
        await channel.send(messageToSend);
        
        console.log(`✅ Successfully sent welcome message to ${member.user.tag} in #${channel.name}.`);

    } catch (error) {
        console.error(`❌ Error sending welcome message for ${member.user.tag}:`, error);
    }
});

// Log in to Discord using the secure token
client.login(BOT_TOKEN);