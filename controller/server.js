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
                                {
                                    view: 'button',
                                    value: 'index',
                                    click: function() {
                                        location.href='/';
                                    }
                                },
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
    // console.log(movielist);
    var result;
    make_CONTAINER(movielist)
        .catch((err) => console.log(err)) // 예외 처리
        .then(ret => {
            // console.log('done');
            console.log(ret);
            result = ret;
        });
    return result;
}

/* async, await reference: https://zellwk.com/blog/async-await/ */
/* async, await in LOOP reference: https://zellwk.com/blog/async-await-in-loops/ */

const mapLoop = async (movielist) => {
    // console.log('start - movielist');

    const promises = await movielist.map(async (movie_id) => {
        const container_elemnt = await CONTAINER2(movie_id);
        return container_elemnt;
    });

    const containers = await Promise.all(promises);
    // console.log(`mapLoop: ${containers}`);
    // console.log('end - movielist');
    return containers;
}

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const make_CONTAINER = async (movielist) => {
    try {
        const promises = [ CONTAINER1(), mapLoop(movielist), CONTAINER3() ]
        const [con1, con2, con3] = await Promise.all(promises);
        // console.log(con1);
        // console.log(con2);
        // console.log(con3);

        const result = con1 + con2 + con3;
        return result;
    } catch (err) {
        console.log('err');
    }
}
const CONTAINER1 = async (ret = true) => {
    if (ret) {
        // console.log('1');
        return sleep(1000).then(res => 'rows: [');
    }
    else { throw new Error('Error1'); }
}

const CONTAINER3 = async (ret = true) => {
    if (ret) {
        // console.log('3');
        return sleep(1000).then(res => ']');
    }
    else { throw new Error('Error3'); }
}

const CONTAINER2 = async (id) => {
    // console.log(`2 - ${id}`);
    var movie = fs.readFileSync(`movies/${id}`, 'utf8');
    movie = JSON.parse(movie);
    
    const desc = movie.description.substr(0, 100);
    var container = `
    {
        cols: [
            {template: "사진", maxWidth: 250},
            {
                rows: [
                    {template: "${movie.title}", height: 50},
                    {template: "작성자/작성날짜", height: 30},
                    {template: "${desc}", height: 100}
                ]
            }
        ]
    }
    `;
    // console.log(`2 -> ${container}`);
    return sleep(1000).then(res => container);
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
            view: 'toolbar',
            elements: [
                {
                    view: 'button',
                    value: '목록',
                    autowidth: true,
                    click: function() {
                        location.href='/';
                    }
                },
                {
                    view: 'button',
                    value: '수정',
                    autowidth: true,
                    click: function() {
                        location.href='/edit/${id}';
                    }
                },
                {
                    view: 'button',
                    value: '삭제',
                    autowidth: true,
                    click: function() {
                        webix.confirm("삭제하시겠습니까?", "confirm-warning")
                        .then((result) => {
                            webix.ajax().post('/delete_process', {id: "${id}"})
                            .then((result) => { location.href='/'; })
                            .fail(() => { webix.message('삭제하는 데 문제가 발생했습니다.')});
                        });
                    }
                }
            ]
        }
    ]
    `;

    /* confirm documentation: https://docs.webix.com/api___confirm.html */
    return table
}

export const getIndex = (req, res) => {
    fs.readdir('movies', (err, movielist) => {
        if (err) throw err;
        else {
            const list = LIST(movielist);
            console.log(list);
            const body = `
            rows: [
                {${list}},
                {
                    view: 'toolbar', elements: [
                        {
                            view: 'button', value: '추가',
                            click: function() {
                                location.href='/edit';
                            }
                        }
                    ]
                }
            ]
            `;
            const template = HTML(body, ''); // no function part

            res.send(template);
        }
    });
}

export const getMovie = (req, res) => {
    const id = req.params.id; // 파라미터로 온 영화 id 값

    if (id) {
        fs.readFile(`movies/${id}`, 'utf8', (err, movie) => {
            movie = JSON.parse(movie);

            const body = MOVIE_TABLE(movie.id, movie.title, movie.director, movie.release_date, movie.description);

            var template = HTML(body, ''); // no function part

            res.send(template);
        });
    } else {
        webix.message("영화가 존재하지 않습니다.");
        location.href='/';
    }
}

export const deleteMovie = (req, res) => {
    const id = req.body.id;

    if (id) {
        fs.unlink(`movies/${id}`, (err) => {
            if (err) throw err;
            else {
                res.redirect('/');
            }
        });
    } else {
        webix.message("해당하는 영화가 없습니다.");
        location.href='/';
    }
    /* 1. 삭제 버튼 누르는 곳에서
        webix.ajax().post('/delete_process', {id: "${id}"})
                            .then((result) => { location.href='/' })
        으로 index 페이지로 이동하는 걸 구현함
        
        2. 근데 location.href='/' 와 res.direct('/'); 둘 다 있어야 하나 봄.
            둘 중에 하나가 없으면 계속 index 페이지로 이동 안 함

        3. http method 중 webix에서 delete 사용할 수 있는 것처럼 보이지만, 구현해 보니 오류가 남. 내가 잘못 구현한 걸 수도. (https://docs.webix.com/helpers__ajax_operations.html#promiseapiforajaxrequests)

        4. 근데 res.redirect('/'); 가 실제 페이지 이동시키는 듯!
    */
}

export const editMovie = (req, res) => {
    const movie = req.body;
    const json = JSON.stringify(movie, null, 2);

    fs.writeFile(`movies/${movie.id}`, `${json}`, 'utf8', (err) => {
        if (err) throw err;
        else {
            console.log(`${movie.id} has saved!`);
            res.redirect(`/movies/${movie.id}`);
        }
    });
}

export const editView = (req, res) => {
    const id = req.params.id;

     /* 기존에 등록된 영화 수정 */
    if (id) {
        /* id에 해당하는 영화 데이터 가져와서 각 input의 value 값으로 설정한다. */
        fs.readFile(`movies/${id}`, 'utf8', (err, movie) => {
            movie = JSON.parse(movie);

            const body = `
            rows: [
                {
                    view: 'form', id: 'myForm', elements: [
                        {view: 'text', name: 'title', label: '제목', value: '${movie.title}'},
                        {
                            cols: [
                                {view: 'text', name: 'director', label: '감독', value: '${movie.director}'},
                                {view: 'text', name: 'release_date', label: '개봉년도', value: '${movie.release_date}'}
                            ]
                        },
                        {view: 'textarea', name: 'description', label: '내용', value: '${movie.description}'}
                    ]
                },
                {
                    view: 'toolbar', elements: [
                        {view: 'button', value: '완성', click: submitBtn},
                        {
                            view: 'button', value: "다시 작성",
                            click: function() {
                                $$('myForm').clear();
                            }
                        },
                        {
                            view: 'button',
                            value: '뒤로 가기',
                            click: function() {
                                history.back();
                            }
                        }
                    ]
                }
            ]
            `;
        
            const func = `
            function submitBtn() {
                var myForm = $$("myForm");
                var items = myForm.getValues();

                webix.ajax().post('/edit_process',
                    {
                        id: "${movie.id}",
                        title: items.title,
                        description: items.description,
                        director: items.director,
                        release_date: items.release_date
                    }).then(() => { location.href='/movies/${movie.id}'; });
            }
            `;
            
            const template = HTML(body, func);
            res.send(template);
        });
    }
    
    
    /* 새 영화 추가 */
    else {
        const body = `
        rows: [
            {
                view: 'form', id: 'myForm', elements: [
                    {view: 'text', name: 'title', label: '제목'},
                    {
                        cols: [
                            {view: 'text', name: 'director', label: '감독'},
                            {view: 'text', name: 'release_date', label: '개봉년도'}
                        ]
                    },
                    {view: 'textarea', name: 'description', label: '내용'}
                ]
            },
            {
                view: 'toolbar', elements: [
                    {view: 'button', value: '완성', click: submitBtn},
                    {
                        view: 'button', value: "다시 작성",
                        click: function() {
                            $$('myForm').clear();
                        }
                    },
                    {
                        view: 'button',
                        value: '뒤로 가기',
                        click: function() {
                            history.back();
                        }
                    }
                ]
            }
        ]
        `;
    
        const created_id = uuidv4(); // 새 영화의 id 생성
        const func = `
        function submitBtn() {
            var myForm = $$("myForm");
            var items = myForm.getValues();

            webix.ajax().post('/edit_process',
                {
                    id: "${created_id}",
                    title: items.title,
                    description: items.description,
                    director: items.director,
                    release_date: items.release_date
                }).then(() => { location.href='/movies/${created_id}'; });
        }
        `;
        
        const template = HTML(body, func);
        res.send(template);
    }
}