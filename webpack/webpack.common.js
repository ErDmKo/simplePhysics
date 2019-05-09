const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        main: './src/main.ts'
    },
    output: {
        path: path.join(__dirname, '/../dist'),
        library: 'p',
        libraryTarget: 'var',
        filename: '[name].bundle.js'
    },
    devServer: {
        contentBase: path.join(__dirname, "/../dist"),
        compress: true,
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [path.join(__dirname, 'src'), 'node_modules']
    },
    module: {
        rules: [{
            test: /\.ts$/,    
            use: ['awesome-typescript-loader']
        }, {
            test: /\.css$/,
            use: ['to-string-loader', 'css-loader']
        }, {
            test: /\.(jpg|png|gif)$/,
            use: 'file-loader'
        }, {
            test: /\.(woff|woff2|eot|ttf|svg)$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 100000
                }
            }
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            chunksSortMode: 'dependency'
        })
    ]
}
