import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

import fs from 'fs';

const server = express(); // express server 생성
const PORT = 3000;

server.use(bodyParser.urlencoded({extended:true}));
// 이게 없으면 클라이언트에서 POST로 넘기는 값이 모두 undefined로 나온다.
// 해결 방법 출처: https://meyouus.tistory.com/68
server.use(bodyParser.json()); // server에선 모두 JSON 데이터를 사용한다는 의미이다.

// let template = {
//     HTML:function(body) {
//         return `
//         <!doctype HTML>
//         <html>
//             <head>
//                 <title>TEST</title>
//                 <meta charset='utf-8'>
//             </head>
//             <body>
//                 ${body}
//             </body>
//         </html>
//         `;
//     },
//     LIST:function(movielist) {
//         var list = '<ul>';
//         movielist.forEach((movie) => {
//             list += `<li><a href='/Ghibli/${movie}'>${movie}</a></li>`;
//         });
//         list += '</ul>';

//         return list;
//     }
// }

function HTML(body, func) {
    return `
    <!doctype HTML>
    <html>
        <head>
            <title>TEST</title>
            <meta charset='utf-8'>
            <link rel="stylesheet" href="http://cdn.webix.com/edge/webix.css" type="text/css">
            <script src="//cdn.webix.com/edge/webix.js" type="text/javascript"></script>
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
    for (var i = 0; i < movielist.length; i++)
        movie_list.push({id: movielist[i]});
    movie_list = JSON.stringify(movie_list); // 이게 없으면 [object Object]로 인식

    const list = `
    view: 'list', id: 'list', select: true, data: ${movie_list}, template: "#id#",
    click: function() {
        var list = $$('list');
        var movie_id = list.getSelectedId();
    }
    `;

    return list;
}

server.get('/', (req, res) => {
    fs.readdir('movies', 'utf8', (err, movielist) => {
        if (err) throw err;
        else {
            const list = LIST(movielist);
            const func = `

            `;
            const template = HTML(list, func);

            res.send(template);
        }
    });
});

server.get('/create', (req, res) => {
    const body = `
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
                        template: 'container'
                    },
                    {
                        template: 'footer', height: 50
                    }
                ]
            });
        });
    </script>
    `;
    const template = HTML(body, '');
    res.send(template);
});

server.listen(PORT, () => {
    console.log(`localhost:${PORT} runs`);
});