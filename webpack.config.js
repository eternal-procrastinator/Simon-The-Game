const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Require  html-webpack-plugin plugin
const VueLoaderPlugin = require('vue-loader/lib/plugin'); // Require vue-loader-plugin

module.exports = {
    entry: path.resolve(__dirname) + "/src/main.js", // webpack entry point. Module to start building dependency graph
    output: {
        path: path.resolve(__dirname) + '/dist/', // Folder to store generated bundle
        filename: '[name].bundle.js',  // Name of generated bundle after build
        publicPath: '/Simon-The-Game/' // public URL of the output directory when referenced in a browser
    },
    module: {  // where we defined file patterns and their loaders
        rules: [
            {
                test: /\.vue$/,
                use: {
                    loader: "vue-loader",
                    options: {
                        loaders: {
                            'sass': [
                                'vue-style-loader',
                                'css-loader',
                                'sass-loader?indentedSyntax',
                            ]
                        }
                    }
                }
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    {
                        loader: "vue-style-loader"
                    }, {
                        loader: "style-loader" // creates style nodes from JS strings
                    }, {
                        loader: "css-loader" // translates CSS into CommonJS
                    }, {
                        loader: "sass-loader", // compiles Sass to CSS
                        options: {
                            //indentedSyntax: true,
                            // sass-loader >= 8
                            sassOptions: {
                                indentedSyntax: true
                            }
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
        ]
    },
    plugins: [  // Array of plugins to apply to build chunk
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: path.resolve(__dirname) + "/src/public/index.html",
            inject: 'body'
        }),
    ],
    devServer: {  // configuration for webpack-dev-server
        contentBase: './src/public',  //source of static assets
        port: 8000, // port to run dev-server
        overlay: true,
        open: true,
    },
    mode: "production"
};