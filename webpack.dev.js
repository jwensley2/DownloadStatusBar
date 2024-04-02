import {merge} from 'webpack-merge';
import webpack from 'webpack';
import common from './webpack.config.js';

export default merge(common, {
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            __DEV_MODE__: true,
        }),
    ]
});
