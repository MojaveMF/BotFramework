import {
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import { parse } from 'discord-command-parser';

(module.exports.name = 'echo'),
  (module.exports.description = 'echo'),
  (module.exports.args = -1),
  (module.exports.example = '!echo'),
  (module.exports.callback = async (msg: Message) => {
    const parsed = parse(msg, '!', {
      allowSpaceBeforeCommand: true,
      allowBots: true
    });

    if (!parsed.success){
      return;
    }

    let embed = new EmbedBuilder()
    .setTitle("ECHOOOOO")
    .setDescription(parsed.body)

    let row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
      .setCustomId(`Repeat/${parsed.body}`)
      .setLabel("Repeat")
      .setStyle(ButtonStyle.Primary),
      )

    msg.reply({embeds:[embed],components:[row]})
    

  })
module.exports.onInteraction = async function (Interaction: Interaction) {
  if (!Interaction.isButton()){
    return;
  }

  let [first , ...args]:Array<string> = Interaction.customId.split("/")

  let combined = args.join("/")

  if (first == "Repeat"){
    let embed = new EmbedBuilder()
    .setTitle("ECHOOOOO")
    .setDescription(combined)

    let row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
      .setCustomId(`Repeat/${combined}`)
      .setLabel("Repeat")
      .setStyle(ButtonStyle.Primary))

    Interaction.message.reply({embeds:[embed],components:[row]})
  }

  

};
