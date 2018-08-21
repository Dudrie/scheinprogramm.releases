# Template Project for electron with webpack, Typescript and VSCode debugging

<!-- toc -->

- [What is this?](#what-is-this)
- [Project structure](#project-structure)
- [Development Scripts](#development-scripts)
- [Renderer - How To](#renderer---how-to)
- [Attach debugger](#attach-debugger)
- [Important things](#important-things)
  * [Debugger for Chrome (vscode extension)](#debugger-for-chrome-vscode-extension)
  * [Integrated devtools](#integrated-devtools)
- [Multiple windows - How To](#multiple-windows---how-to)
  * [How to handle multiple windows?](#how-to-handle-multiple-windows)
- [electron-window-ts - Documentation](#electron-window-ts---documentation)
- [Adjusting the configurations](#adjusting-the-configurations)
  * [Typescript compiler](#typescript-compiler)
  * [Webpack](#webpack)
- [FAQ](#faq)
  * [Why isn't `electron-window` a dependency?](#why-isnt-electron-window-a-dependency)

<!-- tocstop -->

## What is this?
This is an "empty" project set up to use electron together with Typescript, React and webpack. It contains a vscode launch file which lets you debug the app from vscode. It's based on the quick start project of [electron-webpack](https://github.com/electron-userland/electron-webpack#quick-start).


## Project structure
The project structure expected from `electron-webpack` looks like this:

```
my-project/
├─ src/
│  ├─ main/
│  │  └─ index.js
│  ├─ renderer/
│  │  └─ index.js
│  └─ common/
└─ static/
```

* `src/` - Contains all code and the following subfolder:
    * `main/` - All code related to the main process goes in here. Within __you need__ an `index.ts` where the main process gets started.
    * `renderer/` _(optional)_ - All code related to the renderer process(es) goes in here. Within __you need__ an `index.ts` where the renderer process gets started.
    * `common/` _(optional)_ - All code used by the main __and__ renderer process.
* `static/` _(optional)_ - Files which should not be bundled by `webpack` (ie files consumed `fs`).

More information can be found in the [electron-webpack documentation](https://webpack.electron.build/project-structure).


## Development Scripts

```bash
# run application in development mode
yarn dev

# compile source code and create webpack output
yarn compile

# `yarn compile` & create build with electron-builder
yarn dist

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```


## Renderer - How To
_This is the explanation with only one window. For multiple windows [see below](#multiple-windows---how-to)._

electron-webpack automatically generates the `html` file for the electron app. Therefore you do not need to provide it, but you need to provide an entry point for the renderer in `renderer/index.ts`. This file has two functions:

1. If you need to include `css` (or `scss` or something like this), you should include these things right here with:
```typesript
import './style.css';
```
2. This is the script which gets run after the `html` file is loaded. So this is were you add your first element to the DOM wih React.

Please note, that the body in the generated `html` file has the following structure and the `div` has __always__ the id `"app"`.
```html
<body>
    <div id="app"></div>
</body>
```


## Attach debugger
To attach the debugger just start the app and then, in vscode, launch `Attach to Electron renderer`. If you have multiple windows opened up then you're prompted to choose to which window the debugger should be attached. If there's only one open window the debugger automatically attaches itself to that one.

__Note:__ In a multiple window scenario the presented "names" contain the `windowName` which the renderer takes to determine what to render. This makes it easier to find the correct window.


## Important things
### Debugger for Chrome (vscode extension)
You need the `Debugger for Chrome` extension for vscode to be able to debug the app. It can be found in the [vscode marketplace](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome).

### Integrated devtools
__Important note:__ The remote debugger of chrome (which is used for debugging the electron app aswell) only allows __one__ connection. So either you connect vscode _or_ the integrated devtools.

You'll find a constant named `showDevTools` in `main/index.ts` (default: `false`). If set to `true` it'll install the react devtools extensions and opens the devtools afterwards.


## Multiple windows - How To
`electron-webpack` allows by design only one entry for renderers and will only generate one `html`-file which is used by all windows. However, this project contains `electron-window` (in `common/electron-window-ts/`) which can be used to create multiple windows with different parts (see below for details). To use multiple windows refer to `main/index_multiple_windows.ts` and `renderer/index_multiple_windows.ts` files which contain an example on how to open two windows. 

__Note__: If multiple windows are not needed, you can safely delete `common/electron-window-ts` and the files in `main/` and `renderer/` as they aren't used for other things.

The core idea is that because there is only one renderer entry that entry decides what to render. For this decision the renderer needs to know what "his" window should show. This is achieved by passing data from the main process to the renderer. In this project, every window in a "multi window" app gets created by providing a `windowName` additionally to the other options. This `windowName` is then read by the renderer. You can adjust the available names in `common/electron-window-ts/windowNames.ts` which, by default, contains one name for the main app and one for a splashscreen.

### How to handle multiple windows?
First __delete__ the `main/index.ts` aswell as the `renderer/index.tsx` - you won't need the ones for only one window. Then __rename__ the `main/index_multiple_windows.ts` to `index.ts` and the `renderer/index_multiple_windows.tsx` to `index.tsx`. From now these files get referred to as `index.ts` (for the main) or `index.tsx` (for the renderer).

Each window needs to have it's own name defined in `common/electron-window-ts/windowNames.ts`, so you have to define that first. _One exception to that rule is the case where multiple windows show the same UI (so get handled the same way by the renderer). These windows can all use the same name._
```typescript
/* common/electron-window-ts/windowNames.ts */
export const windowName = {
    // ...
    yourNewWindowName: 'whateverYouWantToCallIt'
};
```

Within the `index.tsx` of the renderer you need one function per window which determines the correct components to be rendered. For a window you just have to add a new __function__ and a new __switch case__.
```typescript
/* renderer/index.tsx */

// ...

function yourRenderFunction() {
    // COMPONENT is the component (can be JSX) which should be rendered.
    render([COMPONENT])
}

// ...

if (options) {
    // ...
    switch (name) {
        // ...
        case windowName.yourNewWindowName: {
            // Your new case.
            renderToCall = yourRenderFunction;
            break;
        }
        // ...
    }
    // ...
}
```

Now you need to actually create that window in the main process. The only thing that really changes is that you have to create a window with a different call now. _Please note again: You only need a reference to the created window if you want to manipulate it in any ways later on. Internally `makeRendererWindow(..)` keeps a reference to prevent garbage collection._
```typescript
/* index.ts */

import { makeRendererWindow } from '../common/electron-window-ts/window';

// ...

createdWindow: Electron.BrowserWindow = makeRendererWindow({
    data: {
        windowName: windowName.yourNewWindowName
    },
    browserWindowOptions: {
        // Options passed to new Electron.BrowserWindow(..)
    }
});

// ...
```

That's it - Everything else is done for you in `electron-window-ts` and you can start working with more than one window :tada:

## electron-window-ts - Documentation
### makeRendererWindow(options: `WindowOptions`): [Electron.BrowserWindow](https://electronjs.org/docs/api/browser-window) -- `[main]`
Creates a new `BrowserWindow` with the given options. It also saves a reference to that window (and deletes that reference on close) to prevent garbage collection of that window. So, you can keep a reference yourself, too, but that is not needed.

* `options: WindowOptions` - Contains the [`BrowserWindowConstructorOptions`](https://electronjs.org/docs/api/browser-window#new-browserwindowoptions) aswell as the `windowName` used in the `renderer`.
    * `browserWindowOpts: BrowserWindowConstructorOptions` - Contains all options passed to the `BrowserWindow` constructor.
    * `data: WindowData` - Contains the `windowName` used in the `renderer`. Can also contain other data which should get passed to the `renderer`

### parseArgs(window: `Electron.BrowserWindow`): `WindowData` | `undefined` -- `[renderer]`
Will parse the saved data and returns them. If there is no data saved `undefined` will be returned.

### WindowData
Has atleast an attribute `windowName`. However, more attributes can be added.

* `windowName: string` - Identifier of the window so the `renderer` knows what it should render.


## Adjusting the configurations
### Typescript compiler
You can change the options of the compiler by adjusting the `tsconfig.json` file. However, be aware that you should neither change the value of `extends` nor the one of `jsx` if you're using React with JSX.

### Webpack
You can change the webpack configuration (for the renderer) by changing `webpack.renderer.additions.js`. Be aware, that you should not change `devtool` or `devtoolModuleFilenameTemplate` because this can break the debugging with vscode. For more information on how to change other webpack settings (aswell as the one for the main process) please refer to the [electron-webpack documentation](https://webpack.electron.build/modifying-webpack-configurations).


## FAQ
### Why isn't `electron-window` a dependency?
Neither does `electron-window` itself contain Typescript defintion files nor is there a `@types/electron-window` package available on npm. Therefore this project contains a rewritten version in Typescript (with small adjustments regarding typing). The original Javascript implementation can be found [on it's GitHub](https://github.com/jprichardson/electron-window) and it is licensed under the MIT license. However, the documentation of the API is __not entirely__ valid in this project because some implementation details have changed (due to Typescript). Refer to the JSDoc comments of the functions available in the projects.