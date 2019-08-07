var save = document.getElementById('save');



save.onclick = function() {

  var keyword = document.getElementById("keyword").value;


  if(keyword == "key") {
    alert("already exist!");

  }
   if(keyword === ""){
    alert("cannot be empty");
  }

  if(keyword == localStorage.getItem(keyword)){
    alert("you can't add the same word twice!")
  }
  else
  {
    keyword.trim();
      //setting key value to keyword for easy lopping
      localStorage.setItem(keyword,keyword);

   }
}


var i;
for(i=0; i < localStorage.length; i++) {
  //regex to filter keywords from localStorage and showing URLS
  if(!/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(localStorage.key(i))){
    if(localStorage.key(i) !== 'undefined')
    {
      $('body').append(`<li>${localStorage.key(i)}<button value=${localStorage.key(i)} class="btn"><i class="fa fa-trash"></i></button></li>`)
    }
  }
}


$('.btn').click(function() {
  var selectedItem = $(this).val();
  localStorage.removeItem(selectedItem);
  location.reload();
  alert(`${selectedItem} removed`);
})
