# DbFrontend

This is the web frontend of KoppaDb, an easy-to-use database management system that I (@Dassderdie) co-founded in 2020. The code was written between February 2018 and September 2021, and it is now publicly archived for portfolio purposes. The company was liquidated just a bit more than one year after its founding because we never managed to scale above our initial customer. However, it was a valuable experience, and I learned more about software development in this project than in the first two years of my bachelor's degree.

## Overview

If you're looking for a high-level understanding of this codebase, you're in the right place. This section will provide you with the highlights.

[![](readme-assets/codebase-visualization.svg)](https://mango-dune-07a8b7110.1.azurestaticapps.net/?repo=Dassderdie%2Fdb-frontend)

### Authentication System

-   [AuthenticationModal](src/app/core/auth-modal) which is enforced via a [RouteGuard](src/app/core/guards/auth/auth.guard.ts)
-   Also includes pages for [email verification](src/app/pages/verify-email/verify-email.component.ts), [password reset](src/app/pages/reset-password/reset-password.component.ts) and [email change](src/app/pages/change-authentication-email/change-authentication-email.component.ts)

![](./readme-assets/login-modal.png)

### Profile Settings

-   [ProfileComponent](src/app/pages/users/profile/profile.component.ts)

![](./readme-assets/profile-settings.png)

### Breadcrumb

-   Responsive breadcrumb navigation ([BreadcrumbService](src/app/feature/breadcrumb/breadcrumbs.service.ts), [BreadcrumbComponent](src/app/feature/breadcrumb/breadcrumb/breadcrumb.component.ts))
-   Configuration is saved in the [RoutingModules](src/app/pages/projects/projects-routing.module.ts)

![](./readme-assets/breadcrumb-big.png)
![](./readme-assets/breadcrumb-small.png)

### Projects

[List all projects](src/app/pages/projects/pages/list/list.component.ts)
![](./readme-assets/projects.png)

### Tables Editor

-   A visual editor to create, edit and delete tables of the underlying relational database
-   [Click here for the code](src/app/pages/projects/tables-editor)

![](./readme-assets/tables-editor-full.png)
Click on a table to edit its attributes

![](./readme-assets/tables-editor-attribute-options.png)
There are a lot of (attribute specific) options and validators

![](./readme-assets/tables-editor-choose-foreign-table.png)
Foreign attributes can be used to model relations between tables

![](./readme-assets/tables-editor-intermediate-foreign.png)
A foreign attribute can also have additional attributes (including further foreign attributes -> recursion!)

### DeactivationGuard

Most of the formulars are not only aware of their current validation status, but also of wether their value has been changed. If the user closes the tab or navigates away from the current page and has unsaved changes a prompt plops up.
[Click here for the code](src/app/core/guards/deactivation/deactivation.ts)

![](./readme-assets/deactivation-guard.png)

### Entries

Table entries can be created, edited and deleted

![](./readme-assets/entry-creation-preview.png)
![](./readme-assets/relations-preview.png)

### History

![](./readme-assets/history-preview.png)
All versions of an entry are preserved and changes between them are highlighted in its history [EntryHistoryComponent](src/app/pages/projects/tables/entries/pages/entry-history/entry-history.component.ts) (also recursive for intermediate-foreign-relations)

### Search

-   No-Code Filter creation
-   Filters and displayed attributes are synchronized with the URL-Query-Parameters. This enables easy sharing via a link and using bookmarks for saving them. [EntrySearchComponent](src/app/pages/projects/tables/pages/entry-search/entry-search.component.ts)

![](./readme-assets/filter-preview.png)

![](./readme-assets/search.png)

### Scanner

-   Integrated [QR-Code scanner](src/app/pages/scanner/scanner/scanner.component.ts) to link physical entities with database entries
-   The scan algorithm itself runs in [a WebWorker](src/app/pages/scanner/jsqr.worker.ts) to guarantee a smooth camera live thread

![](./readme-assets/scanner.png)

### Miscellanous

-   I18n via `ngx-translate` for the complete UI
-   TODO: Visualization of complex relations between entries
-   A custom [SharedWorker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker)-based cache enables state consistency between tabs as well as automatic invalidation and refrehsing of all data ([CacheServer code](./src/cache-server/cache-server.ts)).

## Documentation

<details>

<summary>
Click me to see parts of the original README.
</summary>

## Project structure

For most this is a typical angular-app:

in `/app` and every descending folder/module

-   `/core`:
    -   singleton-services with a state etc. that can be used by all other components/services/pipes... that are direct or indirect children of the `core`'s parent-folder
-   `/shared`:
    -   components, pipes, directives, classes, functions, types etc. that (can) have multiple instances and can be used by all other components/services/pipes... that are direct or indirect children of the `shared`'s parent-folder
    -   to keep the size of the main-bundle small, everything (belonging in the `shared-folder`) that is used in main (app-module...) is located in the `main-shared`-folder. Nothing that is in main should import sth. directly from the `@shared`-folder
    -   some stuff is reexported by `@shared` like e.g. `@main-shared/pipes`, because e.g. `PipesModule` should also include the pipes from `MainPipesModule`.
    -   every folder in a `shared`-folder should have it's own module and should export sth. useful
-   `/feature`
    -   here are components/pipes/directives that should only be used in the `/pages`-folder at the same level <br /> **exceptions:**
    -   the top `/feature` folder should only be used in `app.component.ts`
    -   the `/shared/feature` folder should contains components that are used in multiple modules but are very specialized and will not be used on any other places
-   `/pages`:
    -   in here all all modules/components/services etc. located for the routes (-> lazy loading)
-   _lazy-loaded-pages_
    -   if there is a lazy loaded module via the router the corresponding folder with this module and all it's declarations is often at the same level as `/pages`, `shared`, `core`, etc. (e.g. `app/pages/projects/tables`). With this design the module is still at the same level as the routing says without nesting everything to much.

Between the server and the client is the [CacheServer](./src/cache-server/cache-server.ts). It sends and receives requests and caches them to reduce the server load. In the best case it is shared between all tabs through a [SharedWorker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker). In case the browser doesn't support it, each tab creates a fallback on its main thread.

## Build

Run `npm i` to install dependencies

### Production

-   `npm run build` builds the frontend for the cli. The build also works as a good demonstration of our capabilities.
-   `npm run build-official` builds our official cloud based website in production. The build artifacts will be stored in the `dist/` directory.
-   `npm run build-customer-on-premise` builds the website for onPremise use for a customer.
-   `npm run build-customer-online` builds the website for a customer when it should be hosted on our own server open to the internet.

-   Please provide for all `build-customer-…` the correct config in `src/environments/customer/config.json` (use the `config.example.json` as an example)
    -   you can change the config easily after you already build the frontend by replacing the file in `dist/environments/customer/config.json`

### Development

-   Copy `src/environments/environments/development.example.env.ts` and rename it to `development.env.ts`. You can change all the environment variables to your liking.

-   Copy `src/proxy.conf.json.example`, rename it to `src/proxy.conf.json` and (if necessary) change the target to the url on which the db-backend is hosted. (See [here](https://angular.io/guide/build#proxying-to-a-backend-server) for help)

-   For most development you can use `npm run serve`. A live server will be reachable under `http://localhost:4200`. The page will automatically reload after you make changes in the sourcecode. You don't have to mark the _Update on reload_-option in the browser. - It should automatically update and takeover the client. For some special cases it could still be practical (clearing cache even if service-worker didn't change).

-   With `npm run start` the project will be build in development-mode, with an active service-worker (if you enable it in the environment too), but no live-reload. The build artifacts will be stored in the `dist/` directory.

-   When not building in production a CSP is set via the meta-attribute in the html-header. This is to prevent unpleasant surprises after the deployment with a CSP in the https-header.

## Tooling

### I18n

The frontend is internationalized. In the source-code are therefore translation-keys like `_('key.to.translation')`. With `npm run extract-i18n` the json-files under `src/assets/i18n` will be automatically updated (See [here](https://github.com/biesbjerg/ngx-translate-extract)). Don't forget to insert the translations afterwards.

### Lint

Run `npm run lint` or `npm run lint:fix` to automatically format and lint the whole project.

### Debugging

#### vscode

example `tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Serve frontend official",
            "type": "shell",
            // use the commands specified in `package.json` as reference
            "command": "node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng serve",
            "isBackground": true,
            "presentation": {
                "focus": true,
                "clear": true,
                "panel": "dedicated"
            },
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "problemMatcher": {
                "owner": "typescript",
                "source": "ts",
                "applyTo": "closedDocuments",
                "fileLocation": ["relative", "${cwd}"],
                "pattern": "$tsc",
                "background": {
                    "activeOnStart": true,
                    "beginsPattern": {
                        "regexp": "(.*?)"
                    },
                    "endsPattern": {
                        "regexp": "Compiled |Failed to compile."
                    }
                }
            }
        }
    ]
}
```

and `launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "ng serve",
            "type": "chrome",
            "request": "launch",
            "preLaunchTask": "Serve frontend",
            "url": "http://localhost:4200/",
            // Set to a random port that is still free
            "port": 4100,
            "webRoot": "${workspaceFolder}",
            "sourceMapPathOverrides": {
                "webpack:/*": "${webRoot}/*",
                "/./*": "${webRoot}/*",
                "/src/*": "${webRoot}/*",
                "/*": "*",
                "/./~/*": "${webRoot}/node_modules/*"
            }
        }
    ]
}
```

(For additional information see [here](https://github.com/microsoft/vscode-recipes/tree/master/Angular-CLI))

### Recommended extensions

#### vscode

-   Angular Language Service https://github.com/angular/vscode-ng-language-service
-   Angular Schematics
-   Debugger for Chrome

### Recommended Settings

#### vscode

Because we use `$` in variable names it is encouraged to remove `$` from the `Word separators` in the editor. Else the whole variable is not included in the default selection.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

(For everyone preferring a gui: Angular Schematics (vscode))

### Trying stuff out

[ng-run](https://ng-run.com/) is great for testing/reproducing angular/rxjs related problems (make sure that ts-strict-mode and Ivy-AOT are activated as well as all dependencies up to date).

### Analyze bundle

For analyzing the builded bundle run `npm run analyse-bundle`.

### Testing

#### Running unit tests

To run the tests [Chrome](https://www.google.com/chrome/) has to be installed.
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

We currently do not have any end-to-end tests.

## Changelog

1. Update the version in `package.json`
2. Add the version with the appropriate metadata to the changelog-array under `src/app/shared/display-changelog/changelog.ts`
3. (Optional) add html-files with release-notes to the assets (more information in the `changelog.ts`)

## Style guide

We are mostly relying on eslint and prettier for enforcing code style.
Nevertheless there are some additional conventions:

-   Variables for injected services should have the same name as the injected service

```ts
class AComponent {
    constructor(
        private readonly serviceWorkerService: ServiceWorkerService,
        private readonly authService: AuthService,
        i18nService: I18nService
    ) {}
}
```

-   Name Observables with the postfix `$` (shortcut for `Stream`); it is allowed to not use this postfix if it doesn't improve the code -> no finnish-notation rule is enforced

```ts
const item: Item;
const items: Item[];
const item$: Observable<Item>;
const items$: Observable<Item[]>;
const item$s: Observable<Item>[];
```

-   Use the postfix `E$` (`EmitterStream`) for Subjects that should not be exposed

```ts
class AService {
    private readonly itemE$ = new ReplaySubject<Item>(1);
    public readonly item$ = this.itemE$.asObservable();
}
```

## Gotchas

-   The html of a route-component should most of the times manually be wrapped in a `<div class="page-container"></div>`. This makes it possible to make specific exceptions for e.g. a very wide table in contrast to setting the `container` class on the first level. Be aware that `<router-outlet></router-outlet>` should never be placed in a container.
-   There is a `styles-variables.ts` for CSS-values that have to be used in the JS part too.
-   All Components use `ChangeDetectionStrategy.OnPush` - be aware that this ChangeDetectionStrategy gets inherited by child components. So you must programm for it too.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

</details>
