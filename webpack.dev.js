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
            template: "./src/template.html",
            filename: "index.html",
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: "./src/teacher.html",
            filename: "teacher/index.html",
            chunks: ['teacher'],
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
