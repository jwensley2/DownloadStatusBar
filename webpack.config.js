import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';
import {fileURLToPath} from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {VueLoaderPlugin} from 'vue-loader';
import {createRequire} from 'module';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export default {
    stats: {
        errorDetails: true
    },
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
            },
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto',
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.vue'],
        alias: {
            'vue$': 'vue/dist/vue.runtime.esm-bundler.js',
            '@': path.resolve('src/'),
        },
        fallback: {
            fs: false,
            util: false,
            path: false,
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
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'manifest.json', to: './', transform(content) {
                        const require = createRequire(import.meta.url);
                        const pkg = require('./package.json');
                        const manifest = JSON.parse(content.toString());

                        manifest.version = pkg.version;

                        return JSON.stringify(manifest, null, 2);
                    }
                },
                {from: '.web-extension-id', to: './'},
                {from: 'src/options.html', to: './'},
                {from: 'src/confirmation.html', to: './'},
                {from: 'icons', to: './icons'},
                {from: 'icomoon/fonts', to: './fonts'},
                {from: 'sounds', to: './sounds'},
                {from: '_locales', to: './_locales'},
            ]
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/
        }),
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: false,
            __VUE_PROD_DEVTOOLS__: false,
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
};
