const path = require('path');
const common = require("./webpack.config");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const {merge} = require("webpack-merge");

module.exports = merge(common, {
    mode: "development",
    output: {
        filename: "[name].[bundle].js",
        path: path.resolve(__dirname, "dev")
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/template.html"
        })
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
        ]
    }
});
