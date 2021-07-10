import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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

export const getIndex = (req, res) => {
    fs.readdir('movies', (err, movielist) => {
        if (err) throw err;
        else {
            const list = LIST(movielist);
            
            const body = `
            rows: [
                {${list}},
                {
                    view: 'toolbar', elements: [
                        {view: 'button', value: '<a href="/create">추가</a>'}
                    ]
                }
            ]
            `;
            const template = HTML(body, '');

            res.send(template);
        }
    });
}

export const getMovie = (req, res) => {
    const id = req.params.id;

    fs.readFile(`movies/${id}`, 'utf8', (err, movie) => {
        movie = JSON.parse(movie);

        const body = MOVIE_TABLE(movie.id, movie.title, movie.director, movie.release_date, movie.description);

        var template = HTML(body, '');

        res.send(template);
    });
}

export const deleteMovie = (req, res) => {
    const id = req.body.id;

    fs.unlink(`movies/${id}`, (err) => {
        if (err) throw err;
        else {
            res.redirect('/');
        }
    });
    /* 1. 삭제 버튼 누르는 곳에서
        webix.ajax().post('/delete_process', {id: "${id}"})
                            .then((result) => { location.href='/' })
        으로 index 페이지로 이동하는 걸 구현함
        
        2. 근데 location.href='/' 와 res.direct('/'); 둘 다 있어야 하나 봄.
            둘 중에 하나가 없으면 계속 index 페이지로 이동 안 함

        3. http method 중 webix에서 delete 사용할 수 있는 것처럼 보이지만, 구현해 보니 오류가 남. 내가 잘못 구현한 걸 수도. (https://docs.webix.com/helpers__ajax_operations.html#promiseapiforajaxrequests)
        */
}

export const createView = (req, res) => {
    const body = `
    rows: [
        {
            view: 'form', id: 'myForm', elements: [
                {view: 'text', id: 'title', label: '제목'},
                {
                    cols: [
                        {view: 'text', id: 'director', label: '감독'},
                        {view: 'text', id: 'release_date', label: '개봉년도'}
                    ]
                },
                {view: 'textarea', id: 'description', label: '내용'}
            ]
        },
        {
            view: 'toolbar', elements: [
                {view: 'button', value: '<a href="javascript:history.back()">뒤로 가기</a>'},
                {view: 'button', value: '완성', click: submitBtn}
            ]
        }
    ]
    `;

    const func = `
    function submitBtn() {
        alert('왜 안 되지...');
        location.href='/';
    }
    `;
    const template = HTML(body, func);
    res.send(template);
}

export const createMovie = (req, res) => {

}