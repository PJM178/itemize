declare const _default: "const path = require('path');\nconst webpack = require(\"webpack\");\nconst fs = require(\"fs\");\nconst MiniCssExtractPlugin = require(\"mini-css-extract-plugin\");\nconst BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;\nconst WorkerInjectorGeneratorPlugin = require(\"worker-injector-generator-plugin\");\n\nconst isDevelopment = process.env.NODE_ENV === \"development\";\nconst mode = isDevelopment ? \"development\" : \"production\";\n\nconst config = fs.readFileSync(\"./config/index.json\", \"utf-8\");\n\nconst plugins = [\n  new MiniCssExtractPlugin({\n    filename: \"[name].\" + mode + \".css\",\n    chunkFilename: \"[name].\" + mode + \".css\"\n  }),\n  new webpack.IgnorePlugin(/^./locale$/, /moment$/),\n  new webpack.DefinePlugin({\n    CONFIG: JSON.stringify(config),\n  }),\n  new WorkerInjectorGeneratorPlugin({\n    name: \"cache-worker.injector.\" + mode + \".js\",\n    importScripts: [\n      \"commons.\" + mode + \".js\",\n      \"cache-worker.\" + mode + \".js\",\n    ],\n    isAsync: false,\n  }),\n]\n\nif (process.env.BUNDLE_ANALYZE) {\n  plugins.push(new BundleAnalyzerPlugin());\n}\n\nmodule.exports = {\n  mode,\n  entry: {\n    \"service-worker\": [\"./node_modules/@onzag/itemize/client/internal/workers/service/service.worker.ts\"],\n    \"cache-worker\": [\"./node_modules/@onzag/itemize/client/internal/workers/cache/cache.worker.ts\"],\n    \"build\": [\"./src/client/index.tsx\"],\n    \"polyfills\": [\"./node_modules/@onzag/itemize/client/internal/polyfills.ts\"],\n  },\n  devtool: isDevelopment ? 'inline-source-map' : false,\n  plugins,\n  resolve: {\n    extensions: ['.ts', '.tsx', '.js', '.mjs']\n  },\n  optimization: {\n    splitChunks: {\n      chunks(chunk) {\n        return chunk.name !== \"service-worker\";\n      },\n      cacheGroups: {\n        vendors: {\n          test: /[\\/]node_modules[\\/]/,\n          priority: -10,\n          chunks(chunk) {\n            return chunk.name !== \"cache-worker\" && chunk.name !== \"service-worker\";\n          },\n        },\n        commons: {\n          name: 'commons',\n          minChunks: 2,\n        },\n      }\n    }\n  },\n  module: {\n    rules: [\n      {\n        test: /stream-browserify/,\n        use: \"null-loader\"\n      },\n      {\n        test: /readable-stream/,\n        use: \"null-loader\"\n      },\n      {\n        test: /graphql/,\n        use: \"null-loader\"\n      },\n      {\n        test: /jsdom\\/lib\\/api.js/,\n        use: \"null-loader\"\n      },\n      {\n        test: /knex/,\n        use: \"null-loader\"\n      },\n      {\n        test: /node\\-fetch\\/lib\\/index\\.js/,\n        use: \"null-loader\"\n      },\n      {\n        test: /form_data\\.js/,\n        use: \"null-loader\"\n      },\n      {\n        test: /bcrypt\\.js/,\n        use: \"null-loader\"\n      },\n      {\n        test: /itemize\\/[a-zA-Z0-9_\\/]+\\/sql\\.ts/,\n        use: \"null-loader\"\n      },\n      {\n        test: /\\.tsx?$/,\n        use: {\n          loader: \"babel-loader\"\n        },\n      },\n      {\n        test: /\\.s?css$/,\n        use: [\n          {\n            loader: MiniCssExtractPlugin.loader\n          },\n          {\n            loader: \"css-loader\"\n          },\n          {\n            loader: \"sass-loader\"\n          }\n        ]\n      },\n      {\n        test: /\\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,\n        loader: 'url-loader',\n        options: {\n          limit: 10000,\n        },\n      },\n      {\n        test: /\\.mjs$/,\n        include: /node_modules/,\n        type: 'javascript/auto'\n      }\n    ]\n  },\n  output: {\n    filename: \"[name].\" + mode + \".js\",\n    path: path.resolve(path.join(\"dist\", \"data\")),\n    publicPath: \"/rest/resource\",\n  }\n};\n";
export default _default;
