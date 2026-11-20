import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/server.ts"],
	format: ["esm"],
	outDir: "dist",
	target: "es2022",
	sourcemap: true,
	clean: true,
	splitting: false,
	bundle: true,
});
