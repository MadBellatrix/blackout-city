import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import crypto from 'crypto';
import mongoose from 'mongoose';
import BetaCode from '../models/BetaCode.js';

let client = null;

/**
 * Generiert einen formatierten Beta-Code im Format BC-XXXX-XXXX
 */
function generateFormattedBetaCode() {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `BC-${part1}-${part2}`;
}

/**
 * Registriert die Slash-Commands bei der Discord REST API
 */
async function registerSlashCommands(token, clientId) {
  const commands = [
    new SlashCommandBuilder()
      .setName('betacode')
      .setDescription('Verwaltung von Beta-Codes für Blackout-City')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('generate')
          .setDescription('Erzeuge einen neuen, einmaligen Beta-Code')
      )
      .toJSON(),
  ];

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('[Discord-Bot] Aktualisiere Slash-Commands (/) ...');
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('✓ [Discord-Bot] Slash-Commands erfolgreich registriert');
  } catch (error) {
    console.error('Fehler bei der Registrierung der Slash-Commands:', error.message);
  }
}

/**
 * Initialisiert den Discord-Bot und lauscht auf Befehle
 */
export async function initDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token) {
    console.warn('[Discord-Bot] DISCORD_BOT_TOKEN nicht gesetzt. Bot wird nicht gestartet.');
    return;
  }

  client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once('clientReady', async () => {
    console.log(`✓ [Discord-Bot] Eingeloggt als ${client.user.tag}`);

    if (clientId) {
      await registerSlashCommands(token, clientId);
    } else {
      console.warn('[Discord-Bot] DISCORD_CLIENT_ID fehlt. Slash-Commands wurden nicht registriert.');
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'betacode') {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'generate') {
        try {
          await interaction.deferReply({ ephemeral: true });

          let code;
          let isUnique = false;
          let attempts = 0;

          // Sicherstellen, dass der Code eindeutig ist
          while (!isUnique && attempts < 10) {
            code = generateFormattedBetaCode();
            const existing = await BetaCode.findOne({ code });
            if (!existing) isUnique = true;
            attempts++;
          }

          if (!isUnique) {
            return await interaction.editReply({
              content: 'Fehler beim Erzeugen des Beta-Codes. Bitte versuche es erneut.',
            });
          }

          const creatorTag = `${interaction.user.tag || interaction.user.username} (${interaction.user.id})`;

          console.log('[Discord Bot] Versuche Code in MongoDB zu speichern:', code);
          console.log('[Discord Bot] Aktuelle Datenbank:', mongoose.connection.name);
          console.log('[Discord Bot] Mongoose ReadyState:', mongoose.connection.readyState); // 1 = Verbunden

          const newBetaDoc = await BetaCode.create({
            code,
            isUsed: false,
            createdBy: creatorTag,
          });

          console.log('[Discord Bot] ERFOLGREICH in MongoDB gespeichert:', newBetaDoc);

          await interaction.editReply({
            content: `🔑 **Neuer Beta-Zugangscode generiert:**\n\`\`\`${code}\`\`\`\nDieser Code ist einmalig gültig und gewährt Zugang zur Blackout-City Biosphäre.`,
          });
        } catch (error) {
          console.error('[Discord-Bot] Fehler beim Generieren des Beta-Codes:', error);
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
              content: 'Es gab einen Fehler beim Generieren des Codes.',
            });
          } else {
            await interaction.reply({
              content: 'Es gab einen Fehler beim Generieren des Codes.',
              ephemeral: true,
            });
          }
        }
      }
    }
  });

  try {
    await client.login(token);
  } catch (error) {
    console.error('Fehler beim Discord-Bot-Login:', error.message);
  }
}

export default {
  initDiscordBot,
};
