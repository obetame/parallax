# Parallax

- Based on native JS, you do not need to install other dependencies.
- Focus on interaction, rather than just rolling parallax (not intended to support scrolling parallax, after all, GitHub has many plugins that have been implemented).
- Support mobile device.

## Installation

You can use npm:

```bash
npm install motion-parallax --save
```

and then in you js file:

```js
const Parallax = require('motion-parallax'); 
```

Or download `parallax.min.js` file and include in you document:

```html
<script src="/path/to/parallax.min.js"></script>
```

## Getting Started

```html
<div class="parallax">
	<div class="box"></div>
	<div class="box"></div>
</div>
```

```js
const parallax = new Parallax('.box'); // className or other selector
parallax.start();
```

## Usage

```js
new Parallax('className_or_other_selector', [config]);
```

Options can via data attributes setting:

```html
<div class="parallax">
	<div class="box" data-xrange="20" data-yrange="10"></div>
	<div class="box" data-xrange="10" data-yrange="20"></div>
</div>
```

all config:

```js
{
	xRange: 20, // Use attribute on priority
	yRange: 20,
	listenElement: window,
	animate: false,
	enterCallback: function() {},
	leaveCallback: function() {}
}
```

The above values are all defaults.

- `xRange, yRange`: the movable distance of an element on the X and Y axis.
- `listenElement`: the element that listens for the mouseover event(in Mobile device is window and you can't change it).
- `animate`: when `xRange, yRange` is greater than 80 or more, you can consider opening this option.
- `enterCallback`: mouse enter `listenElement` will callback this funciton.
- `leaveCallback`: mouse leave `listenElement` will callback this funciton.

## API

include `add`,`remove`,`refresh`.

#### add

Add a new animation element.

`parallax.add(element, [config])`

```js
const parallax = new Parallax('.box');
parallax.add('.other');
parallax.add('.three');
parallax.refresh();
```

#### remove

This api can remove alreay animate element, but you need manual call `refresh` api make the operation effective.

```js
const parallax = new Parallax('.box');
parallax.add('.other');
parallax.add('.three');
parallax.refresh();

// then you don't need className other, you can
parallax.remove('other').refresh();
```

#### refresh

```js
const parallax = new Parallax('.box');
parallax.add('.other');
parallax.add('.three');
parallax.refresh();

// then you don't need className other and three, you can
parallax.remove('other');
parallax.remove('other');
parallax.refresh();
```

## Support chain operation

```js
const parallax = new Parallax('.box');
parallax
  .add('.other')
  .add('.three')
  .refresh();
```

## Contributing

If you have a pull request you would like to submit, please ensure that you update the minified version of the library along with your code changes.This project uses `gulp`.

```shell
# dev
gulp

# min file
gulp min
```