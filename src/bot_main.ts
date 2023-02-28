// This is always going to be launched as a subthread using workers

import {
  ActionRowBuilder,
  ButtonStyle,
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ButtonBuilder,
  Events,
  Message
} from 'discord.js';
import { parse } from 'discord-command-parser';
import { PathLocation } from './modules/path_plus';
import { parse_config } from './modules/config';
import { bold, bgYellow, yellowBright } from 'colorette';
import { join } from 'path';
import discord_text_builder from './modules/discord_text_builder';

const randomstring = require('randomstring');

let help_messages = new Array<{
  id: string;
  current: number;
  message: Message;
}>();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

declare global {
  var client: Client;
}
global.client = client;

let user_id: string;

var path = new PathLocation(__dirname);
const data = path.Read('.config').toString();

const DECODED_DATA = parse_config(data);

// var whitelist: Array<String> = DECODED_DATA.whitelist

var CMD = new Map();

let help: string[] = [];

client.login(DECODED_DATA.token);

console.log(bold(yellowBright('LOGGED INTO TOKEN \n')));

(async function () {
  let commands = new PathLocation(join(__dirname, 'commands'));

  let files = commands.List();

  console.log(files.length);
  files.forEach(async (file) => {
    try {
      let { name, description, args, example, callback, onInteraction } =
        await require(join(__dirname, 'commands', file));

      console.log(`[INFO]: Loaded command ${name}`);

      if (onInteraction) {
        client.on('interactionCreate', onInteraction);
      }

      CMD.set(name.toLowerCase(), {
        name,
        description,
        args,
        example,
        callback
      });
    } catch (err) {
      console.log('Failed to load', err);
    }
  });
})();

client.once('ready', () => {
  user_id = client.user?.id!;
  console.log('Loaded');
  let embed = new EmbedBuilder();
  let help_string = new discord_text_builder();
  let i = 0;
  let real_i = 1;
  for (let Command of CMD.entries()) {
    let KEY = Command[0];
    let OBJ = Command[1];

    if (i == 10) {
      help_string.AddText(
        '*for more information on any command use* **!command --help**'
      );
      help.push(help_string.text);
      help_string.text = '';
    }

    help_string.AddBox('ini', `[${real_i}]: ${KEY}, ${OBJ.example}`);

    i++;
    real_i++;
  }

  if (real_i < 10) {
    help.push(help_string.text);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const id = interaction.customId;

  let [type, page]: Array<string> = id.split('/');

  if (type == '<' || type == '>') {
    const asnumber: number = +page;

    console.log('in function');
    const Embed = new EmbedBuilder();
    Embed.setDescription(help[asnumber]);
    Embed.setTitle('Help');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`</${asnumber - 1}`)
        .setLabel('◄')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(asnumber == 0 ? true : false),
      new ButtonBuilder()
        .setCustomId(`>/${asnumber + 1}`)
        .setLabel('►')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(asnumber == help.length ? true : false)
    );
    let reply = interaction.message.edit({
      embeds: [Embed],
      components: [row]
    });
  }
});

client.on(Events.MessageCreate, async function (message) {
  /*if (message.author.id != user_id){
        return
    }*/

  const parsed = parse(message, '!', {
    allowSpaceBeforeCommand: true,
    allowBots: true
  });

  if (!parsed.success) {
    return;
  }

  const cmd = CMD.get(parsed.command.toLowerCase());

  console.log(parsed.command.toLowerCase());

  if (parsed.command == 'help') {
    console.log('in function');
    const Embed = new EmbedBuilder();
    Embed.setDescription(help[0]);
    Embed.setTitle('Help');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`</${0}`)
        .setLabel('◄')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(0 == 0 ? true : false),
      new ButtonBuilder()
        .setCustomId(`>/1`)
        .setLabel('►')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(1 == help.length ? true : false)
    );
    let reply = await message.reply({
      embeds: [Embed],
      components: [row]
    });

    return;
  }

  if (cmd == null) {
    console.log('exiting');
    return;
  }

  console.log(parsed.arguments);

  if (parsed.arguments[0]?.toLowerCase() == '--help') {
    let embed = new EmbedBuilder();
    embed.setTitle(cmd.name);
    let reply = new discord_text_builder()
      .AddBox(
        'ini',
        `[Description]: ${cmd.description} \n \n[Example]: ${cmd.example}`
      )
      .AddText('*Made by MojaveMF#2577*');
    embed.setDescription(reply.text);
    message.reply({ embeds: [embed] });
    return;
  }

  if (parsed.arguments.length != cmd.args && cmd.args > 0) {
    let reply = new discord_text_builder()
      .AddBox('diff', '- Error')
      .AddText(
        `${
          parsed.arguments.length > cmd.args
            ? 'To many arguments'
            : 'To little arguments'
        }. ${cmd.args} needed.`
      );
    message.reply(reply.text);
    return;
  }

  try {
    console.log('Running function');

    try {
      cmd.callback(message, client);
    } catch (err) {
      console.log(err);
    }

    // message.reply(response)
  } catch (err) {
    console.log(err);
  }
});
