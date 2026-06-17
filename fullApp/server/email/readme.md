


### 1. Initial Setup

i guess its obvious but still, npm shall be installed to work with this shi 😛

### 2. Editing the Code

* **Important:** dont write code in index.html, it will not work, we need this file only to preview how it looks in browser during development, since web browser dont support mjml code. All work must be done inside the index.mjml file.


### 3. Compiling to HTML

* To translate the MJML blueprint into standard HTML that a browser can read, run this every time you make a change and want to save it:

```bash

npx mjml index.mjml -o index.html

```

I never used it, but noramlly with runnig this command changes will be added automatically every time you change code, smth like that, but again, i never used it, so i cant be 100% sure 

```bash
npx mjml index.mjml -w -o index.html

```

### 4. General

So, mjml is not hard to work with at all, it looks just like weird html + css with weird tags. ai understands it nicely, my advice - use claude, it better tha gemini for example, but still they all work w it good. i hope everything will be clear, if anything, text me 🙃 i hope everything works out.