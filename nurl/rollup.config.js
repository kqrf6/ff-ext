import resolve from 'rollup-plugin-node-resolve';

export default [{
  input: 'javascripts/popup.js',
  output: {
    file: 'javascripts/popup.bundle.js',
    format: 'cjs'
  },
  plugins: [ resolve() ]
},
{
  input: 'javascripts/background.js',
  output: {
    file: 'javascripts/background.bundle.js',
    format: 'cjs'
  },
  plugins: [ resolve() ]
}
];
