const path = require('path');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.config');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(common, {
    plugins: [
        new UglifyJSPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new CleanWebpackPlugin([
            'build',
        ])
    ],
    devtool: '#source-map'
});