import type { Config } from "jest";

const config: Config = {
	testEnvironment: "node",
	setupFiles: ["<rootDir>/test/setup-env.ts"],
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		"^@domain/(.*?)(?:\\.ts|\\.js)?$": "<rootDir>/src/domain/$1",
		"^@application/(.*?)(?:\\.ts|\\.js)?$": "<rootDir>/src/application/$1",
		"^@dtos/(.*?)(?:\\.ts|\\.js)?$": "<rootDir>/src/application/dtos/$1",
		"^@ports/(.*?)(?:\\.ts|\\.js)?$": "<rootDir>/src/application/ports/$1",
		"^@use-cases/(.*?)(?:\\.ts|\\.js)?$":
			"<rootDir>/src/application/use-cases/$1",
		"^@infrastructure/(.*?)(?:\\.ts|\\.js)?$":
			"<rootDir>/src/infrastructure/$1",
		"^@interfaces/(.*?)(?:\\.ts|\\.js)?$": "<rootDir>/src/interfaces/$1",
		"^@config/(.*?)(?:\\.ts|\\.js)?$": "<rootDir>/src/config/$1",
		"^@di/(.*?)(?:\\.ts|\\.js)?$": "<rootDir>/src/config/di/$1",
		"^@modules/(.*?)(?:\\.ts|\\.js)?$": "<rootDir>/src/modules/$1",
		"^@presentation/(.*?)(?:\\.ts|\\.js)?$": "<rootDir>/src/interfaces/$1",
		"^@shared/(.*?)(?:\\.ts|\\.js)?$": "<rootDir>/src/shared/$1",
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	transformIgnorePatterns: [
		"/node_modules/(?!(\\.pnpm|inversify|@inversifyjs)).*",
	],
	transform: {
		"^.+\\.(t|j)sx?$": [
			"@swc/jest",
			{
				jsc: {
					parser: {
						syntax: "typescript",
						decorators: true,
						dynamicImport: true,
					},
					transform: {
						legacyDecorator: true,
						decoratorMetadata: true,
					},
				},
			},
		],
	},
};

export default config;
