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
        entry: './src/index.js',
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        module: {
            rules: [
                {test: /\.glsl$/, loader: 'webpack-glsl-loader'},
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
            }),
        ],
        stats: {
            children: false,
        },
    };
};