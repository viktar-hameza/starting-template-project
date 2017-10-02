# File structure

Builder has the following file structure:

```

└── public/               # The production folder
└── src/                  # The main project folder
  └── assets/             # Assets project
    └── fonts/
    └── images/
    └── scripts/
    └── stylesheets/
    └── temp/             # Temporary files
  └── pages/              # Page's templates
  └── templates/          # Templates
    └── layouts/
    └── mixins/
    └── partials/
    └── vendor/
├── gulpfile.js           # gulpfile of builder
├── package.json          # Basic dependencies

```

## Fonts

In the project, use the font format: woff, woff2

[**Online Font Converter**](https://onlinefontconverter.com/)
  
## Pug + Bemto
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