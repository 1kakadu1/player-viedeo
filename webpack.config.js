const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = ({ development, serve }) => {
    console.log("++++++++++++");
    console.log(development, serve);
    console.log("++++++++++++");
    return {
        target: "web",
        entry: serve ? './src/main.ts' : './src/video_mini.ts',
        devtool: development ? 'inline-source-map' : false,
        mode: development ? 'development' : 'production',
        output: {
            filename: serve ? 'main.js' : 'video_mini.js',
            path: path.resolve(__dirname, 'dist'),
            //publicPath: 'dist',
            library: serve ? 'main' : 'video_mini',
            libraryExport: 'default',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            globalObject: 'typeof self === \'undefined\' ? this : self',
        },
        devServer: {
            static: {
                directory: path.resolve(__dirname, 'dist'),
            },
            liveReload: true,
            compress: true,
            port: 9000,
            hot: true,
            open: true,
            watchFiles: path.join(__dirname, 'src'),
        },
        resolve: {
            extensions: ['.ts', '.js'],
            fallback: {
                util: require.resolve("util/")
            },
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: ['babel-loader', 'ts-loader'],
                },

                {
                    test: /\.(scss|sass|css)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: {
                                        'postcss-preset-env': {
                                            browsers: 'last 2 versions',
                                        },
                                    },
                                },
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true
                            }
                        },
                    ],
                },

                // {
                //     test: /\.css$/i,
                //     use: [
                //         MiniCssExtractPlugin.loader,
                //         {
                //             loader: "css-loader",
                //             options: {
                //                 sourceMap: true
                //             }
                //         },
                //         {
                //             loader: "postcss-loader",
                //             options: {
                //                 postcssOptions: {
                //                     plugins: [
                //                         [
                //                             "postcss-preset-env",
                //                             {
                //                                 // Options
                //                             },
                //                         ],
                //                     ],
                //                 },
                //             },
                //         },
                //     ],
                // },
            ],
        },
        plugins: [
            new ESLintPlugin({ extensions: ['ts'] }),
            new HtmlWebpackPlugin({ template: './src/index.html', minify: false }),
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new CopyPlugin(
                {
                    patterns: [
                        { from: 'src/public', to: 'public' }
                    ],
                })],
    }
};