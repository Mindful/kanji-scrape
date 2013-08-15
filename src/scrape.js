function scrape()
{
	//IMPORTANT TODO: MAKR THE PAGE AS SCRAPED, SO WE DON'T RETURN ANYTHING NEW IF THE USER OPENS IT AGAIN ON THIS PAGE
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


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse)
{
	//in case of multiple Messages, string match Message to "scrape"
  sendResponse({data: scrape(), method: "scrape"})
})
