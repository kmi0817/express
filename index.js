import express from 'express';
import bodyParser from 'body-parser';

import { deleteMovie, getIndex, getMovies, getMovie, editMovie, editView } from './controller/server.js';

const server = express(); // express server 생성
const PORT = 3000;

server.use(bodyParser.urlencoded({extended:true}));
// 이게 없으면 클라이언트에서 POST로 넘기는 값이 모두 undefined로 나온다.
// 해결 방법 출처: https://meyouus.tistory.com/68
server.use(bodyParser.json()); // server에선 모두 JSON 데이터를 사용한다는 의미이다.

server.get('/', getIndex);

server.get('/movies', getMovies);
server.get('/movies/:id', getMovie);

server.post('/delete_process', deleteMovie);

server.get('/edit', editView);

server.post('/edit_process', editMovie);

server.get('/edit/:id', editView);

server.listen(PORT, () => {
    console.log(`localhost:${PORT} runs`);
});