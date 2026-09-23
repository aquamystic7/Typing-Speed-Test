# TypeArena

A typing speed test with an image reveal. You type, and every correct letter
uncovers one tile of a picture. Finish the text, finish the picture.

## This web consist......

Six modes: timed (15/30/60s), survival (one mistake ends the run), quote,
code, custom text, and zen (no timer, no errors counted).

Single player works with no setup. Leaderboard and multiplayer need a
Firebase project, see below.

## How to run it

    git clone: https://github.com/aquamystic7/Typing-Speed-Test
    cd typearena
    open index.html
    or just search: https://typingspeedtest.xyz/

## Modes 

Timed- is the standard test. Pick 15, 30 or 60 seconds, type as many words
as you can, WPM is calculated live.

Survival- ends the moment you make a mistake. No corrections, no second
chances.

Quote- pulls from a list of quotes in `js/quotes.js`. I picked ones I
actually like, so if you don't recognize some of them that's why.

Code- gives you HTML, JavaScript or Python snippets. Meant for people who
want to practice typing code, which is different from typing prose.

Custom- lets you paste in whatever text you want.

Zen- has no timer and doesn't count errors. Just you and the text.

## The image reveal

Each test picks a random image from `assets/images/`. The image gets split
into a grid, and the number of tiles equals the number of characters in the
text. Type a character correctly and one tile flips from dark to full color.

## File layout

    css/      reset, themes, main, game, reveal
    js/       14 files, loaded in a specific order in index.html
    lib/      firebase config, gitignored
    assets/   images, sounds, icons

The JS load order matters because these are plain scripts, not modules.
`config.js` has to load first, `app.js` has to load last. If you reorder them
and something breaks, that's why.

## License

MIT.
