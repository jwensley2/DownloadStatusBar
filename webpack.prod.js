const path = require('path');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.config');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(common, {
    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].js'
    },
    plugins: [
        new UglifyJSPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new CopyWebpackPlugin([
            {from: 'manifest.json', to: './'},
            {from: '.web-extension-id', to: './'},
            {from: 'icons', to: './icons'}
        ]),
        new CleanWebpackPlugin([
            'build',
        ])
    ],
    devtool: '#source-map'
});