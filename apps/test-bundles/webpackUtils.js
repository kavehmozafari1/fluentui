// @ts-check
const path = require('path');
const fs = require('fs-extra');
const { resources } = require('@fluentui/scripts-webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

const FIXTURE_PATH = 'temp/fixtures/';

/**
 *
 * @param {{[entryName:string]:{entryPath:string, includeStats:boolean}}} entries
 * @param {string} packageName
 * @returns
 */
function createWebpackConfig(entries, packageName) {
  const normalizedPkgName = packageName.replace('@fluentui/', '');
  return Object.keys(entries).map(entryName => {
    /** @type {BundleAnalyzerPlugin.Options} */
    let anaylizerPluginOptions = {
      analyzerMode: 'static',
      reportFilename: entryName + '.stats.html',
      openAnalyzer: false,
      generateStatsFile: false,
      logLevel: 'warn',
    };

    const { entryPath, includeStats } = entries[entryName];

    if (includeStats) {
      anaylizerPluginOptions = {
        ...anaylizerPluginOptions,
        generateStatsFile: true,
        statsOptions: {
          // https://webpack.js.org/configuration/stats
          assets: true,
          modules: true,

          builtAt: false,
          .../** @type {*} */ ({ outputPath: false }),
          namedChunkGroups: false,
          logging: false,
          children: false,
          source: false,
          reasons: false,
          chunks: false,
          cached: false,
          cachedAssets: false,
          performance: false,
          timings: false,
        },
        statsFilename: entryName + '.stats.json',
      };
    }

    const config = resources.createConfig(
      entryName,
      true,
      {
        entry: {
          [entryName]: entryPath,
        },
        output: {
          filename: `[name].min.js`,
          path: path.resolve(__dirname, 'dist', normalizedPkgName),
        },
        externals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        optimization: {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              extractComments: false,
            }),
          ],
        },
        plugins: [new BundleAnalyzerPlugin(anaylizerPluginOptions)],
      },
      true,
      true,
    )[0];
    if (packageName === '@fluentui/react-northstar') {
      // This is used most of the configs for IE 11 compat, which northstar doesn't need
      delete config.target;
    }
    return config;
  });
}

/**
 * Webpack will remove any unused import as a dead code (tree shaking).
 * Thus we are creating temporary JS files with top-level component imports
 * and console logging them. This will ensure that the code is active
 * and that webpack bundles it correctly.
 */
function createFluentNorthstarFixtures() {
  const packageName = '@fluentui/react-northstar';
  const distPath = path.dirname(require.resolve(packageName).replace('commonjs', 'es'));
  const packagePath = path.resolve(distPath, 'components');
  fs.readdirSync(packagePath).forEach(itemName => {
    const isFolder = fs.statSync(path.join(packagePath, itemName)).isDirectory();

    if (isFolder && itemName) {
      const importStatement = `import { ${itemName} } from '${packageName}'; console.log(${itemName})`;
      try {
        const folderName = getFolderName(packageName);
        const entryPath = path.join(FIXTURE_PATH, folderName, `${itemName}.js`);
        fs.outputFileSync(entryPath, importStatement, 'utf-8');
      } catch (err) {
        console.log(err);
      }
    }
  });
}

// Files which should not be considered top-level entries.
const TopLevelEntryFileExclusions = ['index.js', 'version.js', 'index.bundle.js'];

function createFluentReactFixtures() {
  const packageName = '@fluentui/react';
  const distPath = path.dirname(require.resolve(packageName).replace('lib-commonjs', 'lib'));
  const packagePath = path.resolve(distPath);
  fs.readdirSync(packagePath).forEach(itemName => {
    const isFolder = fs.statSync(path.join(packagePath, itemName)).isDirectory();
    const isAllowedFile = itemName && itemName.match(/.js$/) && !TopLevelEntryFileExclusions.includes(itemName);

    if (isAllowedFile && !isFolder) {
      const item = isFolder ? itemName : itemName.replace(/.js$/, '');
      // import everything from package/item path
      const importStatement = `import * as p from '${packageName}/lib/${item}'; console.log(p)`;
      try {
        const folderName = getFolderName(packageName);
        const entryPath = path.join(FIXTURE_PATH, folderName, `${item}.js`);
        fs.outputFileSync(entryPath, importStatement, 'utf-8');
      } catch (err) {
        console.log(err);
      }
    }
  });
}

/**
 * @param {string} packageName
 */
function createEntry(packageName) {
  try {
    // import everything from a single package
    const importStatement = `import * as p from '${packageName}'; console.log(p)`;
    const folderName = getFolderName(packageName);
    const entryPath = path.join(FIXTURE_PATH, folderName, 'index.js');
    fs.outputFileSync(entryPath, importStatement, 'utf-8');
  } catch (err) {
    console.log(err);
  }
}

/**
 * Build webpack entries from created fixtures.
 *
 * @param {string} packageName
 * @param {{[entryName:string]:{entryPath:string, includeStats:boolean}}} [entries]
 * @param {boolean} [includeStats] - Stats are generated and used by the size auditor report
to check more details on what caused the bundle size change. Due to stats generation being slow,
and therefore slowing down CI significantly, setting this to true to avoid stats generation.
If bundle size is changed unexpectedly, developers can drill down deeper on the problem by
locally running bundle tests.
 */
function buildEntries(packageName, entries = {}, includeStats = true) {
  const folderName = getFolderName(packageName);
  const packagePath = path.join(FIXTURE_PATH, folderName);

  fs.readdirSync(packagePath).forEach(itemName => {
    const entryName = itemName.replace(/.js$/, '');
    const entryPath = path.resolve(path.join(packagePath, itemName));
    entries[`${packageName.replace('@', '').replace('/', '-')}-${entryName}`] = {
      entryPath,
      includeStats,
    };
  });

  return entries;
}

/**
 * Build entries for single fixture with top level import.
 * @param {string} packageName
 * @param {boolean} [includeStats]
 */
function buildEntry(packageName, includeStats = true) {
  const folderName = getFolderName(packageName);
  const entryPath = path.resolve(path.join(FIXTURE_PATH, folderName));
  return {
    entryPath: `${entryPath}/index.js`,
    includeStats,
  };
}

/**
 * @param {string} packageName
 */
function getFolderName(packageName) {
  return packageName.replace('@fluentui/', '');
}

module.exports = {
  buildEntries,
  buildEntry,
  createFluentNorthstarFixtures,
  createFluentReactFixtures,
  createEntry,
  createWebpackConfig,
};
