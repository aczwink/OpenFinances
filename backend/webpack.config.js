module.exports = {
    mode: "production",
    target: "node",

    entry: "./src/main.ts",
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js",
    },
    
    resolve: {
        extensions: [".ts", ".js"]
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
        ]
    },

    externals: {
    },
    
};