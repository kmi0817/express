import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { HTML, INDEX, MOVIE_DISPLAY, EDIT, EDIT_FUNC } from '../lib/template.js';

/* 클라이언트 상에서 사용할 데이터 이름: myData */

export const getIndex = (req, res) => {
    const body = INDEX();
    const template = HTML(body, '');
    res.send(template);
}

export const getMovies = (req, res) => {
    /* localhost:3000/movies/에 게시할 JSON 데이터
        이 주소로 XMLHttpRequest 객체가 GET 해서 데이터를 사용한다 */

    let data = []
    
    const movielist = fs.readdirSync('movies');
    // console.log(movielist);

    movielist.forEach((movie_id) => {
        var element = fs.readFileSync(`movies/${movie_id}`, 'utf8');
        element = JSON.parse(element);
        // console.log(element);
        data.push(element);
    });

    res.send(data);
}

export const getMovie = (req, res) => {
    const id = req.params.id; // 파라미터로 온 영화 id 값

    if (id) {
        fs.readFile(`movies/${id}`, 'utf8', (err, movie) => {
            if (err) throw err;
            else {
                movie = JSON.parse(movie);

                const body = MOVIE_DISPLAY(movie.id, movie.title, movie.director, movie.release_date, movie.description);

                var template = HTML(body, ''); // no function part

                res.send(template);
            }
        });
    } else {
        alert("영화가 존재하지 않습니다.");
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
            // console.log(`${movie.id} has saved!`);
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
            if (err) throw err;

            movie = JSON.parse(movie);

            const body = EDIT(movie.title, movie.director, movie.release_date, movie.description);
            const func = EDIT_FUNC(movie.id);
            
            const template = HTML(body, func);
            res.send(template);
        });
    } else { /* 새 영화 추가 */
        const created_id = uuidv4(); // 새 영화의 id 생성

        const body = EDIT();
        const func = EDIT_FUNC(created_id);

        const template = HTML(body, func);
        res.send(template);
    }
}