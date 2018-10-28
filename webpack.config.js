const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: {
        background: './src/background.ts',
        content: './src/content.ts',
        options: './src/options.ts',
        confirmation: './src/confirmation.ts',
    },
    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                }
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {url: false}
                    },
                    'sass-loader',
                ],
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    performance: {
        hints: false
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new CopyWebpackPlugin([
            {from: 'manifest.json', to: './'},
            {from: '.web-extension-id', to: './'},
            {from: 'src/options.html', to: './'},
            {from: 'src/confirmation.html', to: './'},
            {from: 'icons', to: './icons'},
            {from: 'icomoon/fonts', to: './fonts'},
            {from: 'sounds', to: './sounds'},
            {from: '_locales', to: './_locales'}
        ]),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
};