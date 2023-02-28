import { PathLocation } from './modules/path_plus';
import { make_config, validate_config } from './modules/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { join } from 'path';
import { isMainThread, Worker } from 'node:worker_threads';
import { redBright, bgYellow } from 'colorette';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

var CUI = require('cui');

var path = new PathLocation(__dirname);

function is_config() {
  if (!path.Exist('.config')) {
    return false;
  }

  const data = path.Read('.config').toString();

  if (validate_config(data)) {
    return true;
  }

  return false;
}

const HasConfig: boolean = is_config();

const ADD_TOKEN_PROMPT = {
  title: '\x1b[33m How would you like to add your token? \x1b[0m',
  type: 'buttons',
  data: [
    'Input my own'
    //"Scan QR code"
  ]
};

if (!HasConfig && isMainThread) {
  CUI.push(ADD_TOKEN_PROMPT);

  CUI.push((CB: () => {}) => {
    const ANS: string = CUI.results[0];
    /*
        if (ANS == "Scan QR code"){
            client.QRLogin();
        }
            */
    if (ANS) {
      CUI.push({
        title: 'What is your token?',
        type: 'fields',
        data: [
          'Token [XXXXXXXXXXXXXXXXXXXXXX.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXX]: '
        ]
      });

      CUI.push(function (cb: () => {}) {
        var parts = CUI.results.slice(-3);

        try {
          client.login(parts[1]);
          const config = {
            token: client.token,
            whitelist: []
          };

          const CONFIG_STRING = make_config(config);

          path.Save('.config', CONFIG_STRING);
          after();
        } catch (err) {
          console.log('Incorect token!', err);
        }

        cb();
      });
    }
    CB();
  });
} else {
  console.log(
    redBright(
      'FOUND VALID CONFIG IF NOTHING WORKS DELETE .CONFIG AND RE-ENTER TOKEN \n \n'
    )
  );
  after();
}

function after() {
  client.destroy();

  console.log(bgYellow('Bot Thread launching \n'));

  function persistant_worker(Filename: string) {
    const slave = new Worker(Filename);
    slave.on('error', (err) => {
      console.log(bgYellow('Thread died starting new thread'), err);
      persistant_worker(Filename);
    });
  }

  persistant_worker(join(__dirname, 'bot_main.js'));
}
