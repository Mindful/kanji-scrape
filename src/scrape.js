var scraped = false

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
	scraped = true
	return kanji //these numbers seem to not always be accurate, at least via lang-8. perhaps there's some "visible" but covered text
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse)
{
	if (!scraped)
	{
		sendResponse({data: scrape(), method: "scrape", repeat: false})
	}
	else
	{
		sendResponse({data: null, method: "scrape", repeat: true})
	}
	//in case of multiple Messages, string match Message to "scrape")
})