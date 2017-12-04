
# RainCatcher release

### Publishing modules and generating applications

The repository also includes a set of commands for publishing both the standalone modules and the contained applications.

- `npm run publish:prepare` - builds TS sources and setups dependencies for publishing packages
- `npm run publish:test` - runs a test of publishing packages to a local npm registry via the [Verdaccio](https://github.com/verdaccio/verdaccio) project
- `npm run publish:full` - prepares packages and tries to publish to the public registry, requires human input for confirming the version bumps, see the [lerna publish](https://github.com/lerna/lerna#publish) documentation for more information.
- `npm run publish:dry` - does a dry-run of the publish scripts for local test purposes, avoiding any permanent changes to git history or npm registries
- `npm run publish:demo-server` - publishes the `demo/server` application to a separate repository as part of the project's inclusion in the [Red Hat Mobile Application Platform](https://www.redhat.com/en/technologies/mobile/application-platform)

#### Procedure

##### raincatcher-core

1. Generate a separate local branch for release, i.e. `git checkout -b release-{new semver}`
2. Run `npm run publish:full` to compile sources and start `lerna publish`
3. Select the appropriate version bump when prompted via the console. If the operation is aborted at this point, only `lerna publish` is needed to be run again to continue.
4. The core packages should be published to the public NPM registry and internal references should be updated. Note: By default, `lerna publish` will create a git tag that points to this branch, so in a later step we must regenerate this tag to point to the release commit on master.
5. Run `npm run publish:demo-server` to publish the demo application to the template repository, it will be published under a branch called `release-{semver in lerna.json}`
6. Clone the https://github.com/feedhenry-raincatcher/raincatcher-server repository and copy the new branch to one with the required name:

```
git clone git@github.com:feedhenry-raincatcher/raincatcher-server.git
cd raincatcher-server/
git push origin +release-{semver}:master
```

7. Open a PR against https://github.com/feedhenry-raincatcher/raincatcher-core `master` from the new release branch
8. After the PR is merged, regenerate the version tag to point to the merged result in master:

```
# on raincatcher-core/
git checkout master
git pull # pulls merged PR update
git tag -d v{semver} # deletes local tag
git push --delete origin v{semver} # deletes remote tag if necessary
git tag v{semver} # recreates the tag pointing to current HEAD which should be master
git push --tags
```

##### raincatcher-angularjs

This procedure is very similar to the one for Core, except it currently involves a few extra manual steps:

1. Generate a separate local branch for release, i.e. `git checkout -b release-{new semver}`
2. EXTRA: Ensure the raincatcher-core clone in the /core directory is up to date with the latest released version. If releasing all modules, core should be published first. Refer to the previous section.
3. EXTRA: Manually bump the versions of the dependencies upon `core` packages in the raincatcher-angularjs repository to match any new versions:

  - Use `lerna ls` to confirm the used packages from `core` and their versions (currently `@raincatcher/datasync-client`, `@raincatcher/wfm` and `@raincatcher/logger`)
  - Manually update any references to them in `package.json` files in the `angularjs` repo (currently this seems to affenct only the demo applications)

4. Run `npm run publish:full` to compile sources and start `lerna publish`
5. Select the appropriate version bump when prompted via the console. If the operation is aborted at this point, only `lerna publish` is needed to be run again to continue.
6. The packages should be published to the public NPM registry and internal references should be updated. Note: By default, `lerna publish` will create a git tag that points to this branch, so in a later step we must regenerate this tag to point to the release commit on master.
8. Run `npm run publish:demo-mobile` to publish the demo application to the template repository, it will be published under a branch called `release-{semver in lerna.json}`
7. Run `npm run publish:demo-portal` to publish the demo application to the template repository, it will be published under a branch called `release-{semver in lerna.json}`
9. Clone the https://github.com/feedhenry-raincatcher/raincatcher-server and `mobile` repositories and copy the new branch to one with the required name:

```
git clone git@github.com:feedhenry-raincatcher/raincatcher-server.git
cd raincatcher-server/
git push origin +release-{semver}:master

git clone git@github.com:feedhenry-raincatcher/raincatcher-mobile.git
cd raincatcher-mobile/
git push origin +release-{semver}:master
```

10. Open a PR against https://github.com/feedhenry-raincatcher/raincatcher-angularjs `master` from the new release branch
11. After the PR is merged, regenerate the version tag to point to the merged result in master:

```
# on raincatcher-angularjs/
git checkout master
git pull # pulls merged PR update
git tag -d v{semver} # deletes local tag
git push --delete origin v{semver} # deletes remote tag if necessary
git tag v{semver} # recreates the tag pointing to current HEAD which should be master
git push --tags
```

### Generate api documentation

1. Use previously checked out https://github.com/feedhenry-raincatcher/raincatcher-core repository

2. Execute documentation generator

  npm run docs

> Note: You may need to update VERSION environment variable in the script for new releases.

3. Go to checked out documentation repository

  cd raincatcher-docs

4. Install required packages

  npm install

5. Build documentation

        npm run build:docs
        npm run build:api

6. Publish to page:

> NOTE: THIS OPERATION WILL UPDATE PUBLIC WEBSITE.
PLEASE TEST IF WEBSITE AND DOCUMENTATION WORK before release.
PLEASE DO NOT DO THAT WITHOUT RELEASING APPLICATION

    npm run publish
    
7. Create tag for documentation repository with the version number

```
git tag v{semver} # recreates the tag pointing to current HEAD which should be master
git push --tags
```
