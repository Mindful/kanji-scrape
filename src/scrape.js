function scrape()
{
	var text = $('body').text()
	var kanji = {}
	var charCode;
	for (var i = 0; i < text.length; i++)
	{
		charCode = text.charCodeAt(i);
		if (charCode >= 0x4e00 && charCode <= 0x9faf ) //common Kanji. Rare Kanji = 0x3400 - 0x4dbf
		{
			kanji[text[i]] = kanji[text[i]] ? kanji[text[i]]+1 : 1
		}
	}
	return kanji
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse)
{
	//in case of multiple requests, string match request to "scrape"
  sendResponse({data: scrape(), method: "scrape"})
})
