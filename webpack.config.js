const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = function(env = {}) {
    return {
        mode: env.production ? 'production' : 'development',
        devServer: {
            port: 3000,
            stats: {
                children: false,
            },
        },
        entry: './src/index.ts',
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        module: {
            rules: [
                {test: /\.ts$/, loader: 'ts-loader'},
                {test: /\.glsl$/, loader: 'webpack-glsl-loader'},
            ],
        },
        resolve: {
            extensions: ['.ts', '.js', '.glsl'],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
                favicon: './assets/favicon.png',
            }),
        ],
        stats: {
            children: false,
        },
    };
};
