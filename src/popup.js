
//This is the range for common Kanji. There are more, but it's highly unlikely we'd run into any
var KANJI_MAX = 0x9faf
var KANJI_MIN = 0x4e00

//kanji are mapped to ranges because chrome's total sync storage max is substantially > than its per item max
//Comments explain how the below were computed, but if they do change, changing the constants with them
//would break our storage. So the constants are constant for now. 
var STORAGE_ENTRIES = 25 //chrome.storage.sync.QUOTA_BYTES / chrome.storage.sync.QUOTA_BYTES_PER_ITEM
var HASH_RANGE = 837 //Math.floor((KANJI_MAX - KANJI_MIN) / STORAGE_ENTRIES)+1


// kanji are thrown into ranges based on the formula: Math.floor((kanji.charCodeAt(0) - KANJI_MIN)/HASH_RANGE)+1
//ceiling is out of the question because then the lowest value kanji tries to put itself in nonexistant range 0
//so we use floor+1, but unless we know our top range to exceed our max, a max value kanji could produce a 
//nonexistant range 26 by dividing exactly, producing floor(25)=25 and then +1 gives us 26. So floor+1 for HASH_RANGE
//ensures our top range is always slightly above max, although it usually is anyway. The top range will catch 
//slightly fewer kanji, but that's no real concern


//TODO: we don't need to save how many times it occured on page, but the information is valuable
//new kanji should probably be sorted like that, and there should at least be an option to sort other kanji like
//that (the alternative being sorting them by how many times you've seen them before)

//TODO: check wikipedia quirks, and look into a better way to get only visible page text.
//Also, much better styling - links having HREFs is making them blue, for example



function saveSynced(kanjiHash)
{
  var syncHash = {}

  for (var i = 1; i <= STORAGE_ENTRIES; i++)
  {
    syncHash[''+i] = {}
  }

  for (var kanji in kanjiHash)
  {
    //have to use floor+1, or numbers that == the bottom of the range break it
    //this works, even for the highest and lowest kanji values (likely because our top range slightly
    //exceeds max so division for the highest number still produces a number <25)
    syncHash[''+(Math.floor((kanji.charCodeAt(0) - KANJI_MIN)/HASH_RANGE)+1)][kanji] = kanjiHash[kanji]
  }

  chrome.storage.sync.set(syncHash, function(){
    if (chrome.runtime.lastError)
    {
       error(chrome.runtime.lastError.message)
    }
  })

  return syncHash
}

function loadSynced(callback)
{
  var loadList = []
  for (var i = 1; i <= STORAGE_ENTRIES; i++)
  {
    loadList.push(''+i)
  }
  chrome.storage.sync.get(loadList, function(loaded) //good to here; we load good data
  {
    if (chrome.runtime.lastError)
    {
       error(chrome.runtime.lastError.message)
       return
    }
    var syncHash = {}
    for (var loadKey in loadList)
    {
      for (var item in loaded[loadKey])
      {
        syncHash[item] = loaded[loadKey][item]
      }
    }
    callback(syncHash)
  })

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

  saveSynced(storageHash)

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
        pageHash = response.data
        if (response.repeat)
        {
          loadSynced(function(loaded)
          {
              storageHash = loaded
              draw(storageHash, pageHash)
          })
        }
        else
        {
          loadSynced(function(loaded)
          {
              storageHash = loaded
              newHash = registerNewHash(pageHash, storageHash)
              draw(newHash, pageHash)
          })
        }


    });
    
  });
});

function draw(hash, pageHash)
{
  //[kanji, #seen]
  var div, appendString;
  var lists = pairLists(hash)
  var newPairs = lists[0]
  var pairs = lists[1]
  if (newPairs.length > 0)
  {
    div = $('#newKanji')
    div.show()
    for (var i = 0 ; i < newPairs.length; i ++)
    {
      pair = newPairs[i]
      if (pageHash[pair[0]])
      {
        appendString = '<a href="http://jisho.org/kanji/details/'+pair[0]+'" tooltip="'+pair[0]+' is new!" class="kanji">'+pair[0]+'</a>'
        if (pair != newPairs[pairs.length-1]) appendString += ", "
        div.append(appendString)
      }
    }
  }
  if (pairs.length > 0)
  {
    div = $('#kanji')
    div.show()
    for (var i = 0 ; i < pairs.length; i ++)
    {
      pair = pairs[i]
      if (pageHash[pair[0]])
      {
        appendString = '<a href="http://jisho.org/kanji/details/'+pair[0]+'" tooltip="'+pair[0]+' seen '+pair[1]+' times" class="kanji">'+pair[0]+'</a>'
        if (pair != pairs[pairs.length-1]) appendString += ", "
        div.append(appendString)
      }
    }
  }
  if (newPairs.length < 1 && pairs.length < 1)
  {
    div = $('#noKanji')
    div.show()
  }
}

function error(errorText)
{
  $('#error').text(errorText)
}

function syncHashStructure() //demo function, no actual use
{
  var syncHash = {}
  for (var i = 1; i <= STORAGE_ENTRIES; i++)
  {
    syncHash[i] = ( KANJI_MIN+((i-1)*HASH_RANGE) )+"-"+( KANJI_MIN+(i*HASH_RANGE) )
  }
  return syncHash
}
