import webpack from 'webpack';
import {merge} from 'webpack-merge';
import common from './webpack.config.js';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';

export default merge(common, {
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            __DEV_MODE__: false,
        }),
    ],
});
