import fs from 'fs';

export function HTML(body, func) {
    return `
    <!doctype HTML>
    <html lang='ko'>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>TEST</title>
            <link rel="stylesheet" href="http://cdn.webix.com/edge/webix.css" type="text/css">
            <script src="//cdn.webix.com/edge/webix.js" type="text/javascript"></script>
        
            <style>
                a {text-decoration: none; color: #1CA1C1}
            </style>
        </head>
        <body>
        <script type='text/javascript' charset='utf-8'>
            const request = new XMLHttpRequest();
            request.open('GET', 'http://localhost:3000/movies');
            request.onload = function() {
                let myData = JSON.parse(request.response);
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
                                    {
                                        view: 'search',
                                        id: 'search',
                                        placeholder: '검색어 입력',
                                        width: 200,
                                        on: {
                                            onSearchIconClick: function() {
                                                webix.message('검색어: ' + this.getValue());
                                            }
                                        }
                                    },
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
            }
            request.send();
        </script>
        </body>
    </html>
    `;
}

export function INDEX() {
    return `
    rows: [
        {
            view: 'dataview',
            id: 'containers',
            xCount: 1, // only one container in a row
            template: "<div style='border: 1px solid black'><div style='display:inline-block; background-color: pink;'>#title#</div><div style='display:inline-block; background-color: skyblue;'>#director#</div><div style='display:inline-block; background-color: gray;'>#release_date#</div></div>",
            type: { height: 90, width: 500},
            data: myData,
            select: true
        },
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
}

export function INDEX_FUNC() {
    /*
        1. 엔터 키 눌러서 데이터뷰 내에서 검색하기 https://snippet.webix.com/d44ca194
        2. 데이터뷰에서 선택한 뷰에 액션 취하기 https://snippet.webix.com/b3bb066b 
    */

    return `
    $$('search').attachEvent('onTimedKeyPress', function() {
        const input_value = this.getValue(); // toLowerCase()
        webix.message(input_value);
    });

    $$('containers').attachEvent('onSelectChange', function(id){
        var url = '/movies/' + id;
        location.href=url;
    });
    `;
}

export function MOVIE_DISPLAY(id, title, director, release_date, description) {
    return `
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
}

export function EDIT(title = "", director = "", release_date = "", description = "") {
    return `
    rows: [
        {
            view: "form", id: "myForm", elements: [
                {view: "text", name: "title", label: "제목", value: "${title}"},
                {
                    cols: [
                        {view: "text", name: "director", label: "감독", value: "${director}"},
                        {view: "text", name: "release_date", label: "개봉년도", value: "${release_date}"}
                    ]
                },
                {view: "textarea", name: "description", label: "내용", value: "${description}"}
            ]
        },
        {
            view: "toolbar", elements: [
                {view: "button", value: "완성", click: submitBtn},
                {
                    view: "button", value: "다시 작성",
                    click: function() {
                        $$("myForm").clear();
                    }
                },
                {
                    view: "button",
                    value: "뒤로 가기",
                    click: function() {
                        history.back();
                    }
                }
            ]
        }
    ]
    `;
}

export function EDIT_FUNC(id) {
    return `
    function submitBtn() {
        var myForm = $$("myForm");
        var items = myForm.getValues();

        webix.ajax().post('/edit_process',
            {
                id: "${id}",
                title: items.title,
                description: items.description,
                director: items.director,
                release_date: items.release_date
            }).then(() => { location.href='/movies/${id}'; });
    }
    `
}