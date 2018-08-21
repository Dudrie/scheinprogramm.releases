module.exports = {
    // Use inline-source-maps because VSCode does not find the source-map file in dev mode. Also note that all 'eval' based source maps will NOT work!
    devtool: 'inline-source-map',
    output: {
        // Bundle absolute resource paths in the source-map, so VSCode can match the source file.
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    }
}