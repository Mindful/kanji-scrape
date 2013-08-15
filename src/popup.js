//Todo: save kanji records to file
//Todo after that: present new kanji larger and in a new color, present the rest sorted inversely by their views (fewest views first)
function kanjiString(kanji)
{
  var out = ""
  for (var value in kanji) //This iterates keys. To iterate values, just do a for value in kanji and check kanji[value]
  {
    out += (value+", ")
  }
  out = out.replace(/(, $)/g, "").replace(/(,$)/,"")
  return out
}

//The values in the storage hash are page views and the ones in the generated hash are occurences on page, so they don't equate
//and consequently we don't sum them. We only look for instances of the kanji existing

function computeNewHash(pageHash, storageHash)
{
  for (var value in pageHash)
  {
    storageHash[value] = storageHash[value] ? storageHash[value]+1 : 1
  }
}

//Save the old hash, and have a "don't save results from this page" button for the purposes of reverting


$(function () 
{
chrome.tabs.getSelected(null, function(tab) 
  {
    var pageHash, storageHash, newHash

    //Get the page hash in the form of {'Kanji':Occurence #}
    chrome.tabs.sendRequest(tab.id, {method: "scrape"}, function(response)
    { //in case of multiple responses, check method on response for string match "scrape"
        pageHash = response.data
    });

    //Get the storage hash in the form of {'Kanji:Seen # times on page'}
    chrome.storage.sync.get('kanji', function(storage)
    {
        storageHash = storage
    })
    
    $('#text').text(kanjiString(pageHash))
  });
});
