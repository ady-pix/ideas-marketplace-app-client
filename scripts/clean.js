#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

function deleteFile(filePath) {
    try {
        fs.unlinkSync(filePath)
        console.log(`Deleted: ${filePath}`)
    } catch (err) {
        // File might not exist, ignore
    }
}

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true })
        console.log(`Deleted folder: ${folderPath}`)
    }
}

function shouldKeepFile(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/') // Normalize path separators

    // Keep files matching these patterns
    const keepPatterns = [
        /^src\/types\//, // src/types/**/*.d.ts
        /^[^\/]+\.d\.ts$/, // *.d.ts (root level only)
        /^cypress\/support\//, // cypress/support/**/*.d.ts
        /^src\/env\.d\.ts$/, // src/env.d.ts
    ]

    return keepPatterns.some((pattern) => pattern.test(normalizedPath))
}

function findAndDeleteTypeScriptFiles(dir, basePath = '') {
    if (!fs.existsSync(dir)) return

    const files = fs.readdirSync(dir)

    files.forEach((file) => {
        const filePath = path.join(dir, file)
        const relativePath = path.join(basePath, file).replace(/\\/g, '/')
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            findAndDeleteTypeScriptFiles(filePath, relativePath)
        } else if (file.endsWith('.d.ts')) {
            if (shouldKeepFile(relativePath)) {
                console.log(`Keeping: ${relativePath}`)
            } else {
                deleteFile(filePath)
            }
        }
    })
}

console.log('🧹 Cleaning generated files...')

// Clean build outputs
deleteFolderRecursive('dist')
deleteFolderRecursive('node_modules/.vite')
deleteFolderRecursive('node_modules/.tmp')

// Clean TypeScript generated files (but keep specified ones)
findAndDeleteTypeScriptFiles('src', 'src')
findAndDeleteTypeScriptFiles('cypress', 'cypress')
findAndDeleteTypeScriptFiles('.', '') // Root level files

// Clean other common generated files
deleteFile('tsconfig.tsbuildinfo')
deleteFile('.tsbuildinfo')

console.log('✅ Cleanup complete!')
console.log('📝 Kept custom type definitions and important .d.ts files')
