import app from "./src/app.js";
import connectTodb from "./config/db.js";

   connectTodb()

  app.listen(3000,()=>{
    console.log("server is started on port number on 3000")
  })
