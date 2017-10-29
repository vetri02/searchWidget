# Search Widget

Search Widget with multiselect

## Setup

Run `npm install` to set things up.

If that doesn't work, it may be necessary to use `sudo npm install`.

With this set up, you should now be able to run:

    gulp

This will process any Sass (SCSS) files, translate ES6 to ES5 and launch a web browser showing the current files. Making changes to the files should result in the page updating automatically.

## Libraries/Frameworks

- jQuery (DOM Manipulation)
- Lodash (Utilities)

## Assumptions

- User might not go in and edit the already selected value inbetween

## Approach

- When user starts typing, we fetchresults based of his query, to stop making multiple calls on each keystroke we debounce the call.
- If the typed word is a first entry we fetchresults for the query as it is.
- Subsequent words or sent removing the previosly selected entries
- Selected entries are appended to the search input
- User can select through click or keyborad selection
- Up and Down arrow selections are enabled. Can use Enter to select an entry
 

### License

MIT
