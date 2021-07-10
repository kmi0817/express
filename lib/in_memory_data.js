import fs from 'fs';

let data = []

function getData() {
    fs.readdir('movies', (err, movielist) => {
        if (err) throw err;
        movielist.forEach((movie_id) => {
            var movie = fs.readFileSync(`movies/${movie_id}`, 'utf8');
            movie = JSON.parse(movie);
            movie = JSON.stringify(movie);
            data.push(movie);
        });
        console.log(`data: ${data}`);
    });
}