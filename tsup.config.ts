import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"], // Generate both CommonJS and ES Modules
    dts: true,              // Automatically generate .d.ts type files
    splitting: false,
    sourcemap: true,
    clean: true,            // Clean the dist folder before every build
    minify: true,           // Minify production output
    treeshake: true,
    external: ["react"] // Keep React external to avoid bundling it
});