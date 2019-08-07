//Searching localStorage for URL
var i;
for(i=0; i < localStorage.length; i++) {
  //regex to filter keywords from localStorage and showing URLS
  if(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(localStorage.key(i))){
    $('.table').append(`
      <tr>
       <td scope="row"></td>
       <td>${extractHostname(localStorage.key(i))}</td>
       <td> <a href='${localStorage.key(i)}'>${localStorage.key(i)}</a> <button value=${localStorage.key(i)} class="btn"><i class="fa fa-trash"></i></button> </td>
       <td>${searchKeywordOnURL(localStorage.key(i))}</td>
      <tr>
      <style>

      `)
  }
}



function searchKeywordOnURL(key) {
  let i;
  var keyword;
  for(i=0; i < localStorage.length; i++) {
    //regex to filter keywords from localStorage and showing URLS
    if(!/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(localStorage.key(i))){
      if(key.indexOf(localStorage.key(i)) !== -1) {
        return localStorage.key(i);
      }
    }
  }


}



//numbering results && self-inovking the function
(function(cl){
  var table = document.querySelector('table.' + cl)
  var trs = table.querySelectorAll('tr')
  var counter = 1

  Array.prototype.forEach.call(trs, function(x,i){
    var firstChild = x.children[0]
    if (firstChild.tagName === 'TD') {
      var cell = document.createElement('td')
      cell.textContent = counter ++
      x.insertBefore(cell,firstChild)
    } else {
      firstChild.setAttribute('colspan',2)
    }
  })
})("table");






//delete
$('.btn').click(function() {
  var selectedItem = $(this).val();
  localStorage.removeItem(selectedItem);
  location.reload();
  alert(`${selectedItem} removed`);
})

//extract domain name from URL
function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}
