function addPlayer(){
  let c=category.value;
  let p=JSON.parse(localStorage.getItem(c))||[];
  p.push(playerName.value);
  localStorage.setItem(c,JSON.stringify(p));
  location.reload();
}
