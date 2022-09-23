// @ ts-check

// IIF
// (정의)(실행)
(() => {
  const socket = new WebSocket(`ws://${window.location.host}/chat`);

  const btn = document.getElementById('btn');
  const inputEl = document.getElementById('input');
  const chatEl = document.getElementById('chat');

  const adj = [
    '멋진',
    '잘생긴',
    '예쁜',
    '졸린',
    '우아한',
    '힙한',
    '배고픈',
    '집에 가기 싫은',
    '집에 가고 싶은',
    '귀여운',
    '중후한',
    '똑똑한',
    '이게 뭔가 싶은',
    '까리한',
    '프론트가 하고 싶은',
    '백엔드가 재미 있는',
    '몽고 디비 날려 먹은',
    '열심히하는',
    '피곤한',
    '눈빛이 초롱초롱한',
    '치킨이 땡기는',
    '술이 땡기는',
  ];

  const member = [
    '유림님',
    '지훈님',
    '한솔님',
    '윤비님',
    '승환님',
    '영은님',
    '수지님',
    '종익님',
    '혜영님',
    '준우님',
    '진형님',
    '민정님',
    '소민님',
    '지현님',
    '다영님',
    '세영님',
    '의진님',
    '승수님',
    '해성님',
    '허원님',
  ];

  const bootColor = [
    { bg: 'bg-primary', text: 'text-white' },
    { bg: 'bg-success', text: 'text-white' },
    { bg: 'bg-warning', text: 'text-black' },
    { bg: 'bg-info', text: 'text-white' },
    { bg: 'alert-primary', text: 'text-black' },
    { bg: 'alert-secondary', text: 'text-black' },
    { bg: 'alert-success', text: 'text-black' },
    { bg: 'alert-danger', text: 'text-black' },
    { bg: 'alert-warning', text: 'text-black' },
    { bg: 'alert-info', text: 'text-black' },
  ];

  function pickRandomArr(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  const nickName = `${pickRandomArr(adj)} ${pickRandomArr(member)}`;
  const thema = pickRandomArr(bootColor);

  btn?.addEventListener('click', () => {
    const msg = inputEl.value;
    const data = {
      name: nickName,
      msg: msg,
      bg: thema.bg,
      text: thema.text,
    };
    socket.send(JSON.stringify(data));
    inputEl.value = '';
  });

  // 엔터키를 쳤을 때도 채팅이 전송 되게
  inputEl.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
      btn.click();
    }
  });

  socket.addEventListener('open', () => {
    // socket.send('안녕하세요! 저는 클라이언트에요😋');
  });

  const chats = [];

  function drawChats(type, data) {
    if (type === 'sync') {
      chatEl?.innerHTML - '';
      chats.forEach(({ name, msg, bg, text }) => {
        const msgEl = document.createElement('p');
        msgEl.innerText = `${name} : ${msg}`;
        msgEl.classList.add('p-2');
        msgEl.classList.add('fw-bold');
        msgEl.classList.add(bg);
        msgEl.classList.add(text);
        msgEl.classList.add('alert');
        msgEl.classList.add('font-4');
        console.log(chatEl?.scrollTop);
        chatEl.appendChild(msgEl);
        chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight;
      });
    } else if (type === 'chat') {
      const msgEl = document.createElement('p');
      msgEl.innerText = `${data.name} : ${data.msg}`;
      msgEl.classList.add('p-2');
      msgEl.classList.add('fw-bold');
      msgEl.classList.add(data.bg);
      msgEl.classList.add(data.text);
      msgEl.classList.add('alert');
      msgEl.classList.add('font-4');
      console.log(chatEl?.scrollTop);
      chatEl.appendChild(msgEl);
      chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight;
    }
  }

  socket.addEventListener('message', (event) => {
    const msgData = JSON.parse(event.data);
    const { type, data } = msgData;

    if (type === 'sync') {
      const oldChats = data.chatsData;
      chats.push(...oldChats);
      drawChats(type, data);
    } else if (type === 'chat') {
      chats.push(data);
      drawChats(type, data);
    }
  });
})();
