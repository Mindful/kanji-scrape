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

function numberString(kanji)
{
  var out = ""
  for (var value in kanji) //This iterates keys. To iterate values, just do a for value in kanji and check kanji[value]
  {
    out += (kanji[value]+", ")
  }
  out = out.replace(/(, $)/g, "").replace(/(,$)/,"")
  return out
}

//The values in the storage hash are page views and the ones in the generated hash are occurences on page, so they don't equate
//and consequently we don't sum them. We only look for instances of the kanji existing

function registerNewHash(pageHash, storageHash)
{
  for (var value in pageHash) //We look at keys here, because we don't care about how many times it occured on page (the values)
  {
    storageHash[value] = storageHash[value] ? storageHash[value]+1 : 1
  }

  chrome.storage.sync.set({'kanji':storageHash}, function(){
    if (chrome.runtime.lastError)
    {
      //bad things
    }
  })
  return storageHash
}

//Save the old hash, and have a "don't save results from this page" button for the purposes of reverting

var stuff, pagestuff
$(function () 
{
chrome.tabs.getSelected(null, function(tab) 
  {
    var pageHash, storageHash, newHash

    //Get the page hash in the form of {'Kanji':Occurence #}
    chrome.tabs.sendRequest(tab.id, {method: "scrape"}, function(response)
    { //this is asynchronous, so we're ending up nesting like this to insure consecutiveness
        pageHash = response.data
        chrome.storage.sync.get('kanji', function(loaded)
        {
            storageHash = loaded['kanji']
            newHash = registerNewHash(pageHash, storageHash)
            stuff = storageHash
            pagestuff = pageHash
            $('#text').text(numberString(storageHash))
        })

    });
    //Get the storage hash in the form of {'Kanji:Seen # times on page'}
    newHash = registerNewHash(pageHash, storageHash)
    
  });
});
