# File structure

Builder has the following file structure:

```

└── public/               # The production folder
└── src/                  # The main project folder
  └── assets/             # Assets project
    └── content/          # For different content (video, json etc.)
    └── fonts/
    └── images/
    └── scripts/
    └── stylesheets/
    └── temp/             # Temporary files (is removed on production)
  └── templates/          # Templates
    └── _layouts/
    └── _mixins/
    └── _partials/
    └── _vendor/
        index.pug         # Page's templates
├── gulpfile.js           # gulpfile of builder
├── package.json          # Basic dependencies

```

## Fonts

In the project, use the font format: woff, woff2

[**Online Font Converter**](https://onlinefontconverter.com/)
  
## Pug + Bemto
File naming Pug should be camelCase!!!

Mixins for writing BEM-style code for [Pug](https://pugjs.org/), more syntax [Bemto](https://github.com/kizu/bemto)

Use the modifier syntax BEM of Nicolas Gallagher (block__element--modifier)
```Pug
  +b.block1.--modifier
    +e.element1.--modifier1 Test
```

```HTML
  <div class="block1 block1--modifier">
    <div class="block1__element1 block1__element1--modifier1">
      Test
    </div>
  </div>
```

## SVG
### Svg in Pug(html)
Add svg file in folder assets/images/sprite-svg/

```Pug
  +b.test
    +icon-svg('schedule-sub')
```

```HTML
  <div class="test">
    <svg class="icon-svg icon-svg-vk">
      <use xlink:href="assets/images/sprite.svg#vk"></use>
    </svg>
  </div>
```
### Inline-svg in css
Add svg file in folder assets/images/..

```CSS
  .up {
    background: svg-load('../images/arrow-up.svg');
  }
```

To change the color(fill), remove all 'fill' in svg file

```CSS
  @svg-load nav url(../images/nav.svg) {
    fill: #cfc;
    path:nth-child(2) {
      fill: #ff0;
    }
  }
  .nav {
    background: svg-inline(nav);
  }

  .up {
    background: svg-load('../images/arrow-up.svg', fill=#000, stroke=#fff);
  }
```



