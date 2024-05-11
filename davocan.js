import('node-fetch').then(fetchModule => {
   
    const WebSocket = require("ws");
  
    const guildToken = 'sunucuları izlettirmek istediginiz hesabin tokeni';
    const vanityToken = "sunucuya urlyi alıcak yetki verilmiş hesabın tokeni";
    const serverIds = ['sunucu idleri'];
    const webhookUrl = 'webhook urlsi';
    const vanities = {
      'sunucu idsi': 'istediginiz url'
    };
  
    let heartbeatInterval = null;
    let socket = null;
  
    const assignVanity = async (serverId, vanity) => {
      const start = Date.now();
      const res = await fetch(`https://canary.discord.com/api/v7/guilds/${serverId}/vanity-url`, {
        method: 'PATCH',
        headers: {
          Authorization: vanityToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: vanity })
      }).catch(error => console.log(error));
  
      if (res && res.ok) {
        const end = Date.now();
        const elapsed = end - start;
        const elapsedSeconds = elapsed / 1000;
        console.log(`@everyone discord.gg/${vanity} MS: ${elapsedSeconds}`);
        await sendWebhook(`@everyone discord.gg/${vanity} MS: ${elapsedSeconds}`);
      } else {
        console.error(`KAÇIRDIK! discord.gg/${vanity} MS:{elapsedSeconds}.`);
      }
    };
  
    const sendWebhook = async (message) => {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });
    };
  
    const connectToWebSocket = () => {
      socket = new WebSocket('wss://gateway.discord.gg');
  
      socket.on('open', () => {
        console.log('Connected to Discord Gateway');
  
        socket.on('message', (message) => {
          const data = JSON.parse(message);
  
          if (data.op === 0) {
            if (data.t === 'GUILD_UPDATE' || data.t === 'GUILD_DELETE') {
              const vanity = vanities[data.d.id];
              if (vanity) {
                Promise.all(serverIds.map(serverId => assignVanity(serverId, vanity)));
              }
            }
          } else if (data.op === 10) {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            heartbeatInterval = setInterval(() => socket.send(JSON.stringify({ op: 1, d: null })), data.d.heartbeat_interval);
  
            socket.send(JSON.stringify({
              op: 2,
              d: {
                token: guildToken,
                intents: 513,
                properties: {
                  "$os": 'win',
                  "$browser": 'chrome',
                  "$device": 'desktop',
                },
              },
            }));
          }
        });
  
        socket.on('close', (code, reason) => {
          console.log(`WebSocket closed. Reconnecting...`);
          setTimeout(connectToWebSocket, 1000);
        });
        socket.on(close), catche 
  
        socket.on('error', (error) => {
          console.error(`WebSocket error. Exiting...`);
          process.exit();
        });
      });
    };
  
    connectToWebSocket();
  }).catch(err => {
    console.error('Modül yüklenirken hata oluştu:', err);
  });
  