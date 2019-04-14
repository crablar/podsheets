const webpack = require("webpack");

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const { CheckerPlugin } = require('awesome-typescript-loader')

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    // disable: process.env.NODE_ENV === "development"
});

module.exports = {
    entry: ["babel-polyfill", "./src/index.tsx"],
    entry: {
        admin: ["babel-polyfill", "./src/index.admin.tsx"],
        public: ["babel-polyfill", "./src/index.public.tsx"],
    },
    output: {
        filename: "[name].bundle.js",
        path: __dirname + "/dist",
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                enforce: "pre",
                test: /\.tsx?$/,
                use: "source-map-loader"
            },
            {
                test: /\.tsx?$/,
                enforce: "pre",
                loader: "tslint-loader",
            },
            {
                test: /\.tsx?$/,
                loaders: ["babel-loader", 'awesome-typescript-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                exclude: /node_modules(?!\/quill-image-drop-module|quill-image-resize-module|react-quill)/,
                loader: 'babel-loader',
            },
            {
                test: /\.jsx?$/,
                loaders: ["babel-loader", 'awesome-typescript-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.scss$/,
                use: extractSass.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "sass-loader"
                    }],
                    fallback: "style-loader"
                })
            }
        ],
        noParse: /node_modules\/quill\/dist/
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx"],
    },
    devServer: {
        publicPath: "/dist/",
        compress: false,
        port: 3000,
        proxy: {
            '*.hot-update.json': {
                target: "http://localhost:3001",
                pathRewrite: { '/': '/dist/' }
            },
            "*": {
                target: "http://localhost:3001",
                secure: false,
                bypass: function (req, res, proxyOptions) {
                    return false
                }
            }
        }
    },
    devtool: "eval",
    plugins: [
        new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }),
        new webpack.ProvidePlugin({
            'window.Quill': 'quill'
        }),
        new webpack.LoaderOptionsPlugin({
			options: {
				worker: {
					output: {
						filename: "hash.worker.js",
						chunkFilename: "[id].hash.worker.js"
					}
				}
			}
        }),
        new CheckerPlugin(),
        new webpack.NamedModulesPlugin(),
        new ExtractTextPlugin("styles.css")
    ]
};
