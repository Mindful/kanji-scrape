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


var alltext
//document.addEventListener('DOMContentLoaded',
$(function () 
{
chrome.tabs.getSelected(null, function(tab) 
  {
      chrome.tabs.sendRequest(tab.id, {method: "scrape"}, function(response) 
      {
        //in case of multiple responses, check method on response for string match "scrape"
        //compare and record the number of times a Kanji's been seen as well. it's in the hash in response.data
          kanjiHash = response.data
          $('#text').text(kanjiString(kanjiHash))

         // alert(kanjiString(kanjiHash))
      });
  });
});
