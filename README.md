Kanji-Scrape
--------------

A simple chrome addon that scrapes the web page you're on for any Kanji (as far as the addon is concerned, this means any characters with numerical values >= 0x4e00 and <= 0x9faf ). It alerts you of any Kanji you've never seen before, as well as listing ones on the page that you have seen before, in ascending order based on how many times you've seen them. Data is stored in chrome synchronized storage. Displayed Kanji are links to their information page on http://jisho.org.

Information about which Kanji you have and haven't seen before is stored in Chrome's synced storage. The application makes as much use of storage as possible by mapping the information about Kanji into 25 different objects (see comments in popup.js for more information) to circumvent the max item size, but it is *possible* that sufficient use might fill up the storage available in sync. The application will alert you if this happens, but it's something to be aware of. 

Some notes:

- The addon looks through the document body for any Kanji. Sometimes, the document body includes Kanji you can't see on the page. This seems to be especially (and unfortunately) prevalent on Lang-8. 
- Kanji you've seen before are sorted by how many times you've seen them. New Kanji are sorted by how many times they occur on in the document body (though this can sometimes be deceiving, as above). There may eventually be some minor options in terms of controlling how Kanji are sorted, but it's a low priority.
- Non Jouyou Kanji (常用漢字) are pushed to the end of the list and displayed in gray.
