const express=require("express");
const app=express();
const server=require("http").createServer(app);
const bodyParser=require("body-parser");
var sowpodsFive = require('sowpods-five');
console.log(sowpodsFive[0]);
const ejs=require("ejs");
const { urlencoded } = require("body-parser");
const {Server}= require("socket.io");
const { isObject } = require("util");
const io = new Server(server,{
    cors:{
    origin:"http://localhost:3000/",
    methods:["GET","POST"]
    }
})
const port=3000 || process.env.PORT;;
app.use(express.static("static"));

app.get("/test",(req,res)=>{
    res.render("test",{})
})
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:false}));

let rooms={};
app.post("/createRoom",(req,res)=>{
    let room=req.body.room;
    let name=req.body.name;
    let mode="host";
    if(Object.keys(rooms[room].players).length==1 && rooms[room].host==rooms[room].players[Object.keys(rooms[room].players)[0]]){
        let roomname="/"+room+"/lobby"+"/?name="+name+"&"+"mode="+mode;
        return res.redirect(roomname);
    } 
    else
    return res.redirect("/");
});
app.get("/testgame",(req,res)=>{
    res.render("game",{room:"room",name:"name",time:1});
})


app.post("/joinRoom",(req,res)=>{
    let room=req.body.room;
    let name=req.body.name_join;
    let mode="player";
     if(rooms[room]!=undefined && rooms[room].limit<4 && rooms[room].started==false && Object.keys(rooms[room].players).length!=0){
       
         rooms[room].limit++;
        let roomname="/"+room+"/lobby"+"/?name="+name+"&"+"mode="+mode;
        res.redirect(roomname);
    } 
    else
    res.redirect("/");
});
app.get("/",(req,res)=>{
    res.render("home",{});
});

app.get("/:room/lobby",(req,res)=>{
    let room=req.params.room;
    let name=req.query.name;
    let mode=req.query.mode;
    try{
    let time=rooms[room].time_limit;
    let word=rooms[room].num_words;
    res.render("lobby",{roomName:room,name:name,mode:mode,time:time,word:word});
    }
    catch(e){
        res.redirect("/");
    }
});



app.get("/:room/game",(req,res)=>{
    let room=req.params.room;
    let name=req.query.name;
    try{
    res.render("game",{room:room,name:name,time:rooms[room].time_limit,words:rooms[room].words});
    }
    catch(e){
        res.redirect("/");
    }
   
});


function getRandomWords(room){
    let words=[];
    for(let i=0;i<rooms[room].num_words;i++){
        let index=Math.round(Math.random() * ((sowpodsFive.length-1) - 0) + 0);
        let word=sowpodsFive[index];
        word=word.toUpperCase();
        words.push(word);
    }
    return words;
}

app.post("/Game",(req,res)=>{
    let room=req.body.room;
    let name=req.body.name;
    let route="/"+room+"/game"+"?name="+name;
    rooms[room].words=getRandomWords(room);
    if(rooms[room].limit>1)
      res.redirect(route);
    else
      {
          delete rooms[room];
          res.redirect("/");
      }
})
io.on('connection',socket=>{
    socket.on("send-user-info",room=>{
        socket.join(room);
        socket.to(room).emit("display-users",rooms[room].players,rooms[room].score);
    });
    socket.on("display_names",(name,room)=>{
        socket.to(room).emit("players",rooms[room].players,rooms[room].score);
    });
    socket.on("points",(person,room,score)=>{
        rooms[room].score[person]=score;
        socket.to(room).emit("players",rooms[room].players,rooms[room].score);
    })

    socket.on("allow_disp",(per_name,room)=>{
        rooms[room].finished[per_name]=true;
        socket.to(room).emit("show_scores",rooms[room].finished,rooms[room].players,rooms[room].score);
    })
    socket.on("show_in_screen",room=>{
        socket.to(room).emit("show_scoreboard_on_own_screen",rooms[room].players,rooms[room].score);
    })
    socket.on("disconnect",()=>{
        try{
       let room=socket.handshake.query.room;
        let name=socket.handshake.query.name;
        let running=socket.handshake.query.running;
        if(!rooms[room].started || running=="true"){
       Object.keys(rooms[room].players).map(person=>{
           if(rooms[room].players[person]==name)delete rooms[room].players[person];
           if(Object.keys(rooms[room].players).length==0)delete rooms[room];
       })
       socket.to(room).emit("players",rooms[room].players,rooms[room].score);
        }
      }
      catch(e){ 
      }
     });
});
io.on('connection',socket=>{
    socket.on("user-display",room=>{
        socket.join(room);
        socket.to(room).emit("user_show",rooms[room].players);
    });
    socket.on("display_name",(name,room)=>{
        socket.to(room).emit("user_name",rooms[room].players);
    });
   
   socket.on("start",(room,name)=>{
    let route="/"+room+"/game";
    rooms[room].started=true;
       socket.to(room).emit("start_game",route);
   });

   socket.on("Time",(val,room)=>{
    rooms[room].time_limit=val;
       socket.to(room).emit("ChangeTime",val);
   });

   socket.on("Word",(val,room)=>{
       rooms[room].num_words=val
    socket.to(room).emit("ChangeWord",val);
});

 socket.on("disconnect",()=>{
     try{
    let room=socket.handshake.query.room;
     let name=socket.handshake.query.name;
     let running=socket.handshake.query.running;
     console.log(rooms[room].players)
     if(!rooms[room].started || running=="true"){
        console.log(rooms[room].players)
    Object.keys(rooms[room].players).map(person=>{
        if(rooms[room].players[person]==name){
            delete rooms[room].players[person];
            delete rooms[room].finished[name];
        }
        if(rooms[room].players=={})delete rooms[room];
    })
    socket.to(room).emit("user_name", rooms[room].players);
     }
   }
   catch(e){ 
   }
  });

 

});

io.on('connection',socket=>{
   
   socket.on("new_player",(per_name,room)=>{
    if(rooms[room]!=undefined && rooms[room].limit<=4 && rooms[room].started==false && Object.keys(rooms[room].players).length!=0){
    //  var foundName=(per)=>{
    //     Object.keys(rooms[room].players).map(person=>{
    //         if(rooms[room].players[person]==per)return true;
    //         console.log(rooms[room].players[person]);
    //     })
    //     return false;
    //  }
   
    socket.join(room);
    rooms[room].players[socket.id]=per_name;
    rooms[room].score[per_name]=0;
    rooms[room].finished[per_name]=false;
    rooms[room].created=false;
    socket.to(room).emit("user-connected",(rooms[room].players));
}
   });

   socket.on("new_host",(per_name,room)=>{
    if(rooms[room]==null){
        rooms[room]={players:{},limit:1,host:per_name,created:true,num_words:4,time_limit:7,started:false,score:{},running:false,words:[],finished:{}};
       socket.join(room);
       rooms[room].players[socket.id]=per_name;
       rooms[room].score[per_name]=0;
       rooms[room].finished[per_name]=false;
       socket.to(room).emit("user-connected",rooms[room].players);
       
    } 
   })
});


server.listen(port,()=>{
    console.log("Server at 8080 running");
})
