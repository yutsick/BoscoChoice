const fs = require('fs')
const path = require('path')

const file = path.join(
  __dirname,
  '..',
  'node_modules',
  '@payloadcms',
  'next',
  'dist',
  'utilities',
  'handleServerFunctions.js',
)

if (!fs.existsSync(file)) {
  console.log('[patch] handleServerFunctions.js not found, skipping')
  process.exit(0)
}

const content = fs.readFileSync(file, 'utf8')

if (content.startsWith("'use server'")) {
  console.log('[patch] already patched, skipping')
  process.exit(0)
}

fs.writeFileSync(file, "'use server';\n" + content)
console.log('[patch] added "use server" to handleServerFunctions.js')
