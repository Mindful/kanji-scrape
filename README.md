Kanji-Scrape
--------------

A simple chrome addon that scrapes the web page you're on for any Kanji (as far as the addon is concerned, this means any characters with numerical values >= 0x4e00 and <= 0x9faf ). It alerts you of any Kanji you've never seen before, as well as listing ones on the page that you have seen before, in ascending order based on how many times you've seen them. Data is stored in chrome synchronized storage.

Information about which Kanji you have and haven't seen before is stored in Chrome's synced storage. The application makes as much use of storage as possible by mapping the information about Kanji into 25 different objects (see comments in popup.js for more information) to circumvent the max item size, but it is *possible* that sufficient use might fill up the storage available in sync. The application will alert you if this happens, but it's something to be aware of.