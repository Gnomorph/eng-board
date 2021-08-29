module.exports = {
    entry: {
        main: "./src/main.js",
        teacher: "./src/teacher.js",
        vendor: "./src/vendor.js",
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.html$/,
                use: ["html-loader"],
            },
            //{
                //test: /\.(svg|png|jpg|gif)$/,
                //use: {
                    //loader: "file-loader",
                    //options: {
                        //limit: 8,
                        //name: "[name].[hash].[ext]",
                        //outputPath: "imgs",
                    //}
                //}
            //},
        ]
    },
    plugins: [
    ],
}
