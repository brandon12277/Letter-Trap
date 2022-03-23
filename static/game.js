
const socket=io.connect("http://localhost:3000/?name="+per_name+"&room="+room+"&running=true");


window.onload=()=>{
    let seconds=time*60;
    let id=setInterval(()=>{
        document.getElementById("timer").innerHTML=seconds+"s";
        seconds--;
        if(seconds<0){
            clearInterval(id);
            window.location="/";
        }
    },1000);
}

logos=["A.gif","B.gif","N.gif","W.gif"]
   socket.emit("send-user-info",room);
   socket.on("display-users",(players,score)=>{
    present_Players(players,score);
     socket.emit("display_names",per_name,room);
});
    socket.on("players",(players,score)=>{
        let to_add="";
        if(Object.values(players).indexOf(per_name)==-1)window.location="/";
        Object.keys(players).map(person=>{
            
         to_add+=players[person]+",";
           
        });  
        addPlayer(to_add,score);
    })
    function present_Players(players,score){
        let to_add="";
          
            Object.keys(players).map(person=>{
                
             to_add+=players[person]+",";
               
            });  
            addPlayer(to_add,score);
     }
    function addPlayer(people,score){
        let cnt=0;
        let div=document.createElement('div');
        div.style.width="100%";
        div.style.fontFamily="'Montserrat', sans-serif";
        div.style.display="flex";
        div.style.alignItems="center";
        div.style.justifyContent="center";
        div.style.flexDirection="row";
        div.style.gap="1%";
        let first=0;
        let elem=makeDiv("You",logos[cnt],score[per_name]);
        div.append(elem);
        cnt++;
        for(let i=0;i<people.length;i++){
           if(people[i]==',' || i==people.length-1){
            if(people.substring(first,i)==per_name){
                first=i+1;
             }
             else{
             elem=makeDiv(people.substring(first,i),logos[cnt],score[people.substring(first,i)]);
           
             div.append(elem);
             first=i+1;
             cnt++;
             }
              
           }
          
        }
        document.getElementById("score").innerHTML="";
        document.getElementById("score").append(div);
     }
     function makeDiv(person,logo,points){
        let elem=document.createElement('div');
        elem.style.color="white";
        elem.style.padding="2%";
        elem.style.display="flex";
        elem.style.flexDirection="column";
        elem.style.fontSize="bold";
        elem.style.fontFamily="'Montserrat', sans-serif";
        elem.style.textTransform="uppercase";
        elem.style.textAlign="center";
        elem.style.backgroundColor="#B22B27";
        elem.style.borderRadius="10px";
        let img=document.createElement("img");
        img.src="\\"+logo;
        img.style.width="70px";
        img.style.height="auto";
        let score=document.createElement("p");
        score.style.color="red";
        score.append("Score");
        let num=document.createElement("p")
        num.id="sc";
        num.append(points);
        score.append(num);
        elem.append(img);
        elem.append(person);
        elem.append(score);
        return elem;
     }

var row_no=0,square=0;
var word_index=0;
var table=document.getElementById("table");

document.getElementById("keys").addEventListener("click",handleTextInput);
window.addEventListener("keydown",handleTextInput);
document.getElementById("go_to").addEventListener("click",restart);

//textInput with backspace aplha checking and enter button checking options.
//function takes care of entire input process
function handleTextInput(e){
    let val;
    if(e.key==undefined)val=e.target.innerHTML;
    else
    val=e.key;
    let exit=false;
    if(val!="Enter" && val!="Backspace" && val!="Back"){
           if(check_Char(val)){
           for(i in table.rows){
               let row=table.rows[i];
               for (j in row.cells){
                   if(row.cells[j].innerHTML=='' && square<=4){
                     row.cells[j].innerHTML=val.toUpperCase();
                     square++;
                       exit=true;
                       break;
                    }


               }
               if(exit)break;
           }
        }
    }
    else if(val=="Backspace" || val=="Back"){
        let prev;
        let x=0;
        for(i in table.rows){
            let row=table.rows[i];
            var cnt=0;
            if(x==row_no){
            for (j in row.cells){
                cnt++;
               
                if(row.cells[j].innerHTML==''){
                    
                    if(prev!=undefined){
                        row.cells[prev].innerHTML='';
                        square--;
                    }
                    exit=true;
                    break;
                 }
                 if(cnt==5 && cnt==square){
                    row.cells[j].innerHTML='';
                    square--;
                }
              prev=j;

            }
        }
            x++;
            if(exit)break;
        }
    }
    else if(val=="Enter" && square==5){
        square=0;
        if(WordAnalysis() || row_no==5){

            setTimeout(() => {
                completion();
            }, 1000);
           
        }
        score_count();
        row_no++;
        
    }
}

//obtain word from row
function getWord(){
    let x=0;
    for(i in table.rows){
        if(row_no==x){
            var row= table.rows[i];
            return row;
        
        }
        else
        x++;
    }
}

function getWordDic(word){
    let dic={};
    for(let i=0;i<word.length;i++){
       
            if(dic[word[i]])dic[word[i]]++;
            else
            dic[word[i]]=1;
            
    }
    return dic;
}

//analyse the word to check for positon of characters and implement color scheme
function WordAnalysis(){
    let match=getWord();
    let word_dic=getWordDic(wordle[word_index]);
    console.log(word_dic);
    let cnt=0;
    let square_cnt=0;
    let win=0;
   for(i in match.cells){
       if(square_cnt<=4){
       let ch=match.cells[i].innerHTML;
       match.cells[i].style.transition="transform 0.5s";
       match.cells[i].style.transform = "rotate(360deg)";
      
       
       if(wordle[word_index].indexOf(ch)!=-1 && word_dic[ch]>0){
           if(wordle[word_index][cnt]==ch){
               match.cells[i].style.backgroundColor="green";
               win++;
            }
           else
           match.cells[i].style.backgroundColor="rgb(167, 167, 29)";
           word_dic[ch]--;
       }
       else
       match.cells[i].style.backgroundColor="grey";
      
        
      
       
       cnt++;
    
   }
   square_cnt++;
  }
  
  if(win==5)return true;
  else
  return false;
}

//check if letter is a character or not
function check_Char(char){
   return char.length==1 && char.match(/[a-z]/i);
}

//after completion of the round
function completion(){
    
    word_index++;
    document.body.style.height="500px";
     document.getElementById("game").style.display="none";
     document.getElementById("nv").style.display="none";
     document.getElementById("word_reveal").innerHTML="The word was "+wordle[word_index-1];
     if(word_index==(wordle.length-1))document.getElementById("game_over").style.display="flex";
     else
     document.getElementById("after_comp").style.display="flex";
    
    
     
     
}

//restart the page for next word
function restart(){
    document.body.style.height="0%";
    for(i in table.rows){
        let row=table.rows[i];
        let cnt=0;
        for(j in row.cells){
            if(cnt<=4){
            row.cells[j].innerHTML="";
            row.cells[j].style.backgroundColor="";
            row.cells[j].style.transition="none";
            row.cells[j].style.transform = "none";
            }
            cnt++;
        }
    }
    document.getElementById("game").style.display="flex";
    document.getElementById("after_comp").style.display="none";
    document.getElementById("nv").style.display="flex";
    row_no=0;
    square=0;
}

function score_count(){
    let yellow=getWordDic(wordle[word_index]);
    let green=getWordDic(wordle[word_index]);

    let score=0;
    let sq_cnt=0;
    let win=0;
     let word=getWord();
    for(let i in word.cells){
           if(sq_cnt<=4){
               let ch=word.cells[i].innerHTML;
               if(word.cells[i].style.backgroundColor=="green" && green[ch]>0){
                       green[ch]--;
                       score+=120;
                       win++;
               }
               if(word.cells[i].style.backgroundColor=="rgb(167, 167, 29)" && yellow[ch]>0){
                    yellow[ch]--;
                    score+=60;
              }
              sq_cnt++;
           }

    }
    if(win==5)score+=200;
    let score1=document.getElementById("sc");
    console.log(score1.innerHTML);
    let total=parseInt(score1.innerHTML)+score;
    document.getElementById("sc").innerHTML=total;
    document.getElementById("score_added").innerHTML="Score gained : +"+total;
    socket.emit("points",per_name,room,total)


}