import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy'

export default {
    input: 'src/main.ts',
    output: {
        dir: 'dist',
        format: 'iife',
        freeze: false
    },
    watch: {},
    plugins: [
        typescript(),
        copy({
            targets: [{
                src: 'src/index.html', dest: 'dist/'
            }]
        })
    ]
}