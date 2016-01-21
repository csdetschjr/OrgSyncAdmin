var path = require('path');


module.exports = {
    entry: [
        // Set up an ES6-ish environment
        'babel-polyfill',

        // Add your application's scripts below
        path.resolve(__dirname, 'javascript/organization/app/organization.jsx')
    ],

    output: {
        path: path.resolve(__dirname, 'javascript/organization/build'),
        filename: 'bundle.js'
    },

    module: {
        loaders: [
            {
                loader: "babel-loader",

                exclude: [
                    path.resolve(__dirname, "node_modules"),
                ],

                // Only run `.js` and `.jsx` files through Babel
                test: /\.jsx?$/,

                // Options to configure babel with
                query: {
                    plugins: ['transform-runtime'],
                    presets: ['es2015', 'react'],
                }
            },
        ]
    }
};
