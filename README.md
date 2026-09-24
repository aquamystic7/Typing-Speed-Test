# TypeArena

This is a Typing speed test web and this is my first better web maybe. There is a cool feature when u write correct spellings it reveals a tile and at the end you will unlock a cool image or Aura image that boost your confidence. I'm working on many more cool features.

# Description 
This is web where you can test your typing speed and skill. I have added many mode Like Survival- One mistake and its over, Code- It is good for practicing codes, and many more modes..
There is a cool feature if you write correct spelling it reveals a tile of image and at the end it reveals the image.I'm just adding cool images.

To run it 
just search typearena.xyz .

# Screenshot


# Dependencies
Not need to install anything just a website that can run in any OS or device.
Every Browser can run this website.

## The reveal thing

Every test picks a random image from assets/images/. Then it splits that image into a grid,when you start typing it reveals a tile on each correct spelling and at the end when you complete it without mistake it reveals a cool image.  
The tiles are just divs with the same image as a background, offset so each one only shows its own slice. No canvas, no cropping, just background-position math.
It's the whole reason I built this. Wanted something that made typing a test feel like it was going somewhere instead of just watching a number go up. Like it makes it interesting or other ones just feel boring.

## Adding your own images

You can Put your own images also just follow these steps:
1. Drop your images into assets/images/
2. Name them 01.jpg, 02.jpg, 03.jpg, and so on. Two digits, lowercase, .jpg at the end.
3. Open js/config.js and set imageCount to however many you have.

That's it. The next test will pick a random one.

Keep images at 1920x1080 and under 300kb each or the first paint gets slow. I use squoosh.app to squeeze them down, quality 75 does the trick.

Two gotchas that got me:

- Windows hides file extensions by default. If you name a file "02" hoping it becomes 02.jpg, it might actually become 02.jpg.txt. Turn on "File name extensions" in Explorer's View menu and check.
- If you have 3 images and set imageCount to 5, it'll 404 on 04 and 05. The number in config.js has to match what's actually in the folder.

## What I used

Vanilla HTML, CSS, and JavaScript. No frameworks, no build step, no npm install. Just open index.html or search: https://typearena.xyz/ and it runs.

Fonts are Inter and JetBrains Mono from Google Fonts, with system font fallbacks if those aren't loaded.

Firebase is optional. Only the leaderboard and multiplayer need it. Everything else works without it.

## Bugs I hit while building this

Files with the wrong extension. Windows hides extensions by default, so `words.js` was actually `words.js.txt` the whole time and I couldn't figure out why the browser kept 404ing. Cost me way longer than it should have. Turned on "File name extensions" in Explorer and haven't looked back.

Pasted the wrong file into the wrong file. Ended up with `reveal.css` content sitting in `game.css` for a while. The typing text was invisible because the panel rules weren't there and the image grid was painting on top of everything. Took me a while to notice the first line of the file didn't match the filename.

The Play Again button looked broken. Clicking it did nothing because the overlay refused to disappear. Turned out `display: grid` on `.game-overlay` was overriding the `hidden` attribute. One line — `.game-overlay[hidden] { display: none }` — fixed it.

Typing engine crashed on the first run. Characters wouldn't render because `Typing.start()` was being called before `Typing.init()`, so the text element was still null when the code tried to write into it. Swapping the two lines fixed it.

Live Server caching 404s. Kept getting "Cannot GET /assets/images/01.jpg" even though the file was definitely there. Restarting the server from scratch fixed it. No idea why it did that, but if it happens again I know the drill.

It takes too much time to fix. Just bored.

## License

MIT
