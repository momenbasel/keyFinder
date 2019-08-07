chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.method == "getStatus")
          sendResponse({status: localStorage});
        else
          sendResponse({});
    });



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.getter)
          console.log(request.getter);
          localStorage.setItem(request.getter,request.getter);
    });
