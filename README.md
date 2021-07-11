# express
* lib/template.js 속 함수 소개
1. HTML - 기본 뼈대 (크게 header, aritlce, footer 나뉘며, 현재 나머지 template 함수는 모두 article만 달라진다.)
2. INDEX - '/' 기본 페이지 (각 영화 레코드를 CONTAINER에 담아서 보여준다)
3. CONTAINER - 저장된 영화들을 하나씩 담고, index 화면 속 article이다.
4. MOVIE_DISPLAY - '/movies/:id', index에서 영화를 클릭하면 나오는 그 영화의 상세 데이터 (?) 페이지이다.
5. EDIT - '/edit' & '/edit/:id' 새 영화를 추가하거나 기존 영화를 수정하는 화면이다.
6. EDIT_FUNC - 영화 추가, 수정 시 함께 필요한 함수들을 반환한다.
------
1. reference1 : https://www.youtube.com/watch?v=dBZDJloj9xk&amp;list=PLuHgQVnccGMA9QQX5wqj6ThK7t2tsGxjm&amp;index=43
2. reference2 : https://www.youtube.com/watch?v=l8WPWK9mS5M
