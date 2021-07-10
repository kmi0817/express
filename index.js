import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';


import { deleteMovie, getIndex, getMovie, createView, createMovie } from './controller/server.js';

import fs from 'fs';

const server = express(); // express server 생성
const PORT = 3000;

server.use(bodyParser.urlencoded({extended:true}));
// 이게 없으면 클라이언트에서 POST로 넘기는 값이 모두 undefined로 나온다.
// 해결 방법 출처: https://meyouus.tistory.com/68
server.use(bodyParser.json()); // server에선 모두 JSON 데이터를 사용한다는 의미이다.

function HTML(body, func) {
    return `
    <!doctype HTML>
    <html>
        <head>
            <title>TEST</title>
            <meta charset='utf-8'>
            <link rel="stylesheet" href="http://cdn.webix.com/edge/webix.css" type="text/css">
            <script src="//cdn.webix.com/edge/webix.js" type="text/javascript"></script>
        
            <style>
                a {text-decoration: none; color: #1CA1C1}
            </style>
        </head>
        <body>
        <script type='text/javascript' charset='utf-8'>
            webix.ready(function() {
                webix.ui({
                    type: 'space',
                    rows: [
                        {
                            cols: [
                                {template: 'icon'},
                                {template: 'searchBox'},
                                {template: 'menu1'},
                                {template: 'menu2'},
                                {template: 'menu3'},
                                {template: 'menu4'},
                            ],
                            height: 60
                        },
                        {
                            ${body}
                        },
                        {
                            template: 'footer', height: 50
                        }
                    ]
                });
                ${func}
            });
        </script>
        </body>
    </html>
    `;
}

function LIST(movielist) {
    // movielist 를 JSON 형태로 바꾼다. ex) {id: "1233..."}
    let movie_list = []
    for (var i = 0; i <movielist.length; i++)
        movie_list.push({id: movielist[i]});
    
    movie_list = JSON.stringify(movie_list); // 이게 없으면 [object Object]로 인식
    
    const list = `
    view: 'list', id: 'list', select: true, data: ${movie_list},
    template: "<a href='movies/#id#'>#id#</a>"
    `;

    return list;
}

function MOVIE_TABLE(id, title, director, release_date, description) {
    const table = `
    rows: [
        {
            height: 35,
            cols: [
                {template: "제목"},
                {template: "${title}"}
            ]
        },
        {
            height: 35,
            cols: [
                {template: "감독"},
                {template: "${director}"},
                {template: "개봉년도"},
                {template: "${release_date}"}
            ]
        },
        {
            template: "${description}", minHeight: 200, autoheight: true
        },
        {
            view: 'toolbar', elements: [
                {view: 'button', value: '<a href="javascript:history.back()">뒤로 가기</a>', autowidth: true},
                {view: 'button', value: '수정', autowidth: true},
                {view: 'button', value: '삭제', autowidth: true, click: function() {
                    webix.confirm("삭제하시겠습니까?", "confirm-warning")
                        .then((result) => {
                            webix.ajax().post('/delete_process', {id: "${id}"})
                            .then((result) => { location.href='/'; })
                            .fail(() => { webix.message('삭제하는 데 문제가 발생했습니다.')});
                        });
                }}
            ]
        }
    ]
    `;

    return table
}


server.get('/', getIndex);

server.get('/movies/:id', getMovie);

server.post('/delete_process', deleteMovie);

server.get('/create', createView);

server.post('/create_process', createMovie);

server.listen(PORT, () => {
    console.log(`localhost:${PORT} runs`);
});