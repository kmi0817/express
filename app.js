// import express from 'express';
// import bodyParser from 'body-parser';
// import { v4 as uuidv4 } from 'uuid';

// import remote from 'webix-remote';

// import fs from 'fs';

// const app = express();
// const api = remote.server();

// api.setMethod("add", (a, b) => {
//     return a + b;
// });

// app.get('/', (req, res) => {
//     const template = `
//     <!doctype HTML>
//     <html>
//         <head>
//             <title>TEST</title>
//             <meta charset='utf-8'>
//             <link rel="stylesheet" href="http://cdn.webix.com/edge/webix.css" type="text/css">
//             <script src="//cdn.webix.com/edge/webix.js" type="text/javascript"></script>
//         </head>
//         <body>
//             <script src='webix.js'>

//             </script>

//             <script src='/api'>
//                 webix.remote.add(1, 2).then(result) {
//                     alert(result);
//                 }
//             </script>
//         </body>
//     </html>
//     `;
//     res.send(template);
// });

// app.listen(9090, () => {
//     console.log("Server runs 9090");
// })