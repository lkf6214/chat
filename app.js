// @ts-check

const Koa = require('koa');
const websockify = require('koa-websocket');
const route = require('koa-route');
const serve = require('koa-static');
const mount = require('koa-mount');

const Pug = require('koa-pug');
const path = require('path');

const mongoClient = require('./public/mongo');
const _client = mongoClient.connect();

const app = websockify(new Koa());
const PORT = 4500;

app.use(mount('/public', serve('public')));

const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  app,
});

app.ws.use(
  route.all('/chat', async (ctx) => {
    // console.log(app.ws);
    const { server } = app.ws;

    const client = await _client;
    const cursor = client.db('kdt1').collection('chats');
    // 채팅 내역 시간 적용
    const chats = cursor.find(
      {},
      {
        sort: {
          createdAt: 1,
        },
      }
    );
    const chatsData = await chats.toArray();

    ctx.websocket.send(
      JSON.stringify({
        type: 'sync',
        data: {
          chatsData,
        },
      })
    );

    // 서버 접속 안내
    server.clients.forEach((client) => {
      //   client.send('모든 클라이언트에게 데이터를 보낸다 실시!');
      // 접속자 수 나타내기
      client.send(
        JSON.stringify({
          type: 'chat',
          data: {
            name: '서버',
            msg: `새로운 유저가 참여 했습니다. 현재 유저 수 ${server.clients.size}`,
            bg: 'bg-danger',
            text: 'text-white',
          },
        })
      );
    });

    // ctx.websocket.send('아아~ 들리십니까 여긴 서버입니다!');
    ctx.websocket.on('message', async (message) => {
      const chat = JSON.parse(message);

      // 채팅 내역 시간 적용
      const insertClient = await _client;
      const chatCursor = insertClient.db('kdt1').collection('chats');
      await chatCursor.insertOne({
        ...chat,
        createdAt: new Date(),
      });

      server?.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: 'chat',
            data: {
              ...chat,
              createdAt: new Date(),
            },
          })
        );
        //   console.log(message.toString());
      });
    });

    // 서버 접속 종료 안내
    ctx.websocket.on('close', (message) => {
      server.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: 'chat',
            data: {
              name: '서버',
              msg: `유저 한 명이 나갔습니다. 현재 유저 수 ${server?.clients.size}`,
              bg: 'bg-dark',
              text: 'text-white',
            },
          })
        );
      });
    });
  })
);

app.use(async (ctx, next) => {
  await ctx.render('chat');
});

app.listen(PORT, () => {
  console.log(`서버는 ${PORT}에서 작동 중입니다.`);
});
