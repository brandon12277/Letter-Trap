const socket=io.connect("https://lettertrap.herokuapp.com/?name="+per_name+"&room="+room+"&mode="+on_start);

console.log(per_name);
document.getElementById("time").value=time;
document.getElementById("words").value=words;
logos=["A.gif","B.gif","N.gif","W.gif"]
let img=document.createElement("img");
console.log(logos[0]);
addPlayer(per_name+",")
window.onload=()=>{
   if(mode=="player"){
      document.getElementById("lobby").style.pointerEvents="none";
      document.getElementById("start").style.opacity="0.7";
      document.getElementById("start").style.cursor="not-allowed";
   }
   on_start=false;
}

socket.on("start_game",route=>{
   route+="?name="+per_name;
   window.location=route;
})


document.getElementById("start_game").addEventListener("click",()=>{
   on_start=true;
   socket.emit("start",room,per_name);
})

socket.emit("user-display",(room)); 
socket.emit("lobby_values",room);
   
   socket.on("user_show",(name)=>{
      console.log(name)
      present_Players(name);
       socket.emit("display_name",per_name,room);
   });
  
   socket.on("user_name",(players)=>{
      if(Object.values(players).indexOf(per_name)==-1)window.location="/";
      console.log(players);
      present_Players(players)
   });



function present_Players(players){
   let to_add="";
     
       Object.keys(players).map(person=>{
           
        to_add+=players[person]+",";
          
       });  
       addPlayer(to_add);
       socket.emit("user-display-other-screens",(room)); 
}
function addPlayer(people){
   let cnt=0;
   let div=document.createElement('div');
   div.style.width="100%";
   div.style.fontFamily="'Montserrat', sans-serif";
   div.style.display="flex";
   div.style.alignItems="center";
   div.style.justifyContent="center";
   div.style.flexDirection="row";
   div.style.gap="2%";
   let first=0;
   let elem=makeDiv("You",logos[cnt]);
   div.append(elem);
   cnt++;
   for(let i=0;i<people.length;i++){
      if(people[i]==',' || i==people.length-1){
         let elem;
         let name=people.substring(first,i);
         if(name==per_name){
            first=i+1;
         }
         else{
         elem=makeDiv(people.substring(first,i),logos[cnt]);
       
        div.append(img);
         div.append(elem);
         first=i+1;
         cnt++;
         }
         
      }
     
   }
   document.getElementById("players").innerHTML="";
   document.getElementById("players").append(div);
}
function makeDiv(person,logo){
   let elem=document.createElement('div');
   elem.style.color="white";
   elem.style.padding="2%";
   elem.style.display="flex";
   elem.style.flexDirection="column";
   
   elem.style.fontFamily="'Montserrat', sans-serif";
   elem.style.textTransform="uppercase";
   elem.style.textAlign="center";
   let img=document.createElement("img");
   img.src="\\"+logo;
   img.style.width="70px";
   img.style.height="auto";
   elem.append(img);
   elem.append(person);
   return elem;
}

function ChangeTime(){
   let e=document.getElementById("time");
   let val=e.value;
   console.log(val);
   socket.emit("Time",val,room)
}

function ChangeWord(){
   let e=document.getElementById("words");
   let val=e.value;
   console.log(val);
   socket.emit("Word",val,room);
}

socket.on("ChangeTime",val=>{
    document.getElementById("time").value=val;
})
socket.on("ChangeWord",val=>{
   document.getElementById("words").value=val;
})


socket.on("GetValues",(time,word)=>{
   document.getElementById("time").value="time"
})

socket.on("disconnect",()=>{
   socket.emit("removePlayer",per_name,room);
})