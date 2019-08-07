
console.log("keyFinder🔑 is working!");



//custom searches

let js = document.getElementsByTagName('script');



chrome.runtime.sendMessage({method: "getStatus"}, function(response) {

  var savedSearch = response.status;

    for (var key in savedSearch) {

      if (savedSearch.hasOwnProperty(key)) {

        for(src in js){

          var url = js[src].src;
          let regex = new RegExp(key,'i');

          try {

            if(url.search(regex) !== -1) {
              chrome.runtime.sendMessage({getter: url}, function(response) {
              });
              console.log(`KeyFinder: a potential API key found: ${url} it matched your search ${key}`);
            }

          } catch(err) {
            //do nothing
          }
        }
      }
    }

});




// for GoogleMaps API key
for (src in js) {
  let url = js[src].src;
  try {
    if(url.search(/key/i) !== -1) {
      console.log(`KeyFinder: a potential API key found: ${url}`)

      //saving the results
      chrome.runtime.sendMessage({getter: url}, function(response) {
      });
    }
  } catch (err) {
    //console.log(err)
  }
}
