
//This is the range for common Kanji. There are more, but it's highly unlikely we'd run into any
var KANJI_MAX = 0x9faf
var KANJI_MIN = 0x4e00

//Comments explain how the below were computed, but if they do change, changing the constants with them
//would break our storage. So the constants are constant for now.
var STORAGE_ENTRIES = 25 //chrome.storage.sync.QUOTA_BYTES / chrome.storage.sync.QUOTA_BYTES_PER_ITEM
var HASH_RANGE = 837 //Math.ceil((KANJI_MAX - KANJI_MIN) / STORAGE_ENTRIES)

function syncHashStructure() //demo function, no actual use
{
  var syncHash = {}
  for (var i = 1; i <= STORAGE_ENTRIES; i++)
  {
    syncHash[i] = ( KANJI_MIN+((i-1)*HASH_RANGE) )+"-"+( KANJI_MIN+(i*HASH_RANGE) )
  }
  return syncHash
}

function saveSynced(kanjiHash)
{
  var syncHash = {}

  for (var i = 1; i <= STORAGE_ENTRIES; i++)
  {
    syncHash[i] = {}
  }

  for (var kanji in kanjiHash)
  {
    //have to use floor+1, or numbers that == the bottom of the range break it
    //this works, even for the highest and lowest kanji values (maybe because our top range slightly
    //exceeds max, or maybe because it just works. Not too concerned either way)
    syncHash[Math.floor((kanji.charCodeAt(0) - KANJI_MIN)/HASH_RANGE)+1][kanji] = kanjiHash[kanji]
  }

  return syncHash
}

function loadSynced(kanjiHash)
{

}


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


function pairLists(kanji)
{
  pairs = []
  newPairs = []
  for (var value in kanji)
  {
    if (kanji[value]==1) newPairs.push([value, kanji[value]])
    else pairs.push([value, kanji[value]])
  } 
  pairs.sort(function(a, b) 
  {
    a = a[1];
    b = b[1];
    return a < b ? -1 : (a > b ? 1 : 0);
  })
  return [newPairs, pairs]
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
         $('#text').text(chrome.runtime.lastError.message)
      }
    })
  return storageHash
}


//Save the old hash, and have a "don't save results from this page" button for the purposes of reverting
var pageHash, storageHash, newHash
$(function () 
{
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
{
    //Get the page hash in the form of {'Kanji':Occurence #}
    chrome.tabs.sendMessage(tabs[0].id, {method: "scrape"}, function(response)
    { //this is asynchronous, so we're ending up nesting like this to insure consecutiveness
        if (response.repeat)
        {
          chrome.storage.sync.get('kanji', function(loaded)
          {
              
              storageHash = loaded['kanji'] || {}
              $('#text').text("Run Twice: "+numberString(storageHash))
          })
        }
        else
        {
          pageHash = response.data
          chrome.storage.sync.get('kanji', function(loaded)
          {
              storageHash = loaded['kanji'] || {}
              newHash = registerNewHash(pageHash, storageHash)
              $('#text').text(numberString(newHash) + "tee")
          })
        }


    });
    
  });
});

function draw(hash)
{
  //[kanji, #seen]
  var div, appendString;
  var pairLists = pairLists(hash)
  var newPairs = pairLists[0]
  var pairs = pairLists[1]
  if (newPairs.length > 0)
  {
    div = $('#newKanji')
    //unhide new div
    for (var pair in newPairs)
    {
      appendString = '<a tooltip="'+pair[0]+' is new!" class="kanji">'+pair[0]+'</a>'
      if (pair != newPairs[pairs.length-1]) appendString += ", "
      div.append(appendString)
    }
  }
  if (pairs.length > 0)
  {
    div = $('#kanji')
    //unhide kanji div
    for (var pair in pairs)
    {
      appendString = '<a tooltip="'+pair[0]+' seen '+pair[1]+' times" class="kanji">'+pair[0]+'</a>'
      if (pair != pairs[pairs.length-1]) appendString += ", "
      div.append(appendString)
      //<a tooltip="僕 seen 3 times" class="kanji">僕</a>
    }
  }
  if (newPairs.length < 1 && pairs.length < 1)
  {
    div = $('#noKanji')
  }
}
