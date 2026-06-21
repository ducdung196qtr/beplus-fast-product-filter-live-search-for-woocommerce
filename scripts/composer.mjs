#!/usr/bin/env node
/**
 * Run Composer without a global `composer` binary.
 *
 * - Downloads tools/composer.phar on first use
 * - Finds PHP from PHP_BIN, PATH, or Local WP (lightning-services)
 *
 * Usage:
 *   node scripts/composer.mjs install
 *   npm run composer:install
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const ROOT = path.resolve( __dirname, '..' );
const TOOLS_DIR = path.join( ROOT, 'tools' );
const COMPOSER_PHAR = path.join( TOOLS_DIR, 'composer.phar' );
const COMPOSER_URL = 'https://getcomposer.org/download/latest-stable/composer.phar';

function loadEnvFile() {
	const envPath = path.join( ROOT, '.env' );
	if ( ! fs.existsSync( envPath ) ) {
		return;
	}

	for ( const line of fs.readFileSync( envPath, 'utf8' ).split( '\n' ) ) {
		const trimmed = line.trim();
		if ( ! trimmed || trimmed.startsWith( '#' ) || ! trimmed.includes( '=' ) ) {
			continue;
		}

		const eq = trimmed.indexOf( '=' );
		const key = trimmed.slice( 0, eq ).trim();
		let value = trimmed.slice( eq + 1 ).trim();

		if (
			( value.startsWith( '"' ) && value.endsWith( '"' ) )
			|| ( value.startsWith( "'" ) && value.endsWith( "'" ) )
		) {
			value = value.slice( 1, -1 );
		}

		if ( ! process.env[ key ] ) {
			process.env[ key ] = value;
		}
	}
}

function getLocalPluginSite() {
	if ( ! process.env.APPDATA ) {
		return null;
	}

	const sitesPath = path.join( process.env.APPDATA, 'Local', 'sites.json' );
	if ( ! fs.existsSync( sitesPath ) ) {
		return null;
	}

	try {
		const sites = JSON.parse( fs.readFileSync( sitesPath, 'utf8' ) );
		const pluginRoot = ROOT.replace( /\\/g, '/' ).toLowerCase();
		let fallback = null;

		for ( const [ siteId, site ] of Object.entries( sites ) ) {
			if ( ! site || typeof site !== 'object' ) {
				continue;
			}

			if ( site.name === 'plugin' ) {
				return { siteId, site };
			}

			const rawPath = site.path ?? '';
			const sitePath = rawPath
				.replace( /^~\\?/, `${process.env.USERPROFILE}\\` )
				.replace( /\\/g, '/' )
				.toLowerCase();

			if (
				pluginRoot.includes( sitePath )
				|| pluginRoot.includes( 'local sites/plugin' )
			) {
				fallback = { siteId, site };
			}
		}

		return fallback;
	} catch {
		return null;
	}
}

function findLocalSitePhpIni() {
	const match = getLocalPluginSite();
	if ( ! match ) {
		return null;
	}

	const iniPath = path.join(
		process.env.APPDATA,
		'Local',
		'run',
		match.siteId,
		'conf',
		'php',
		'php.ini',
	);

	return fs.existsSync( iniPath ) ? iniPath : null;
}

function phpArgs( phpBin, phpIni, args ) {
	const base = phpIni ? [ '-c', phpIni ] : [];
	return [ ...base, ...args ];
}

function phpWorks( phpBin, phpIni = null ) {
	const result = spawnSync( phpBin, phpArgs( phpBin, phpIni, [ '-v' ] ), {
		stdio: 'ignore',
		shell: false,
	} );
	return result.status === 0;
}

function findLocalLightningPhp() {
	const bases = [];

	if ( process.env.APPDATA ) {
		bases.push( path.join( process.env.APPDATA, 'Local', 'lightning-services' ) );
	}

	if ( process.env.LOCALAPPDATA ) {
		bases.push(
			path.join( process.env.LOCALAPPDATA, 'Programs', 'Local', 'lightning-services' ),
			path.join(
				process.env.LOCALAPPDATA,
				'Programs',
				'Local',
				'resources',
				'extraResources',
				'lightning-services',
			),
		);
	}

	const candidates = [];

	for ( const base of bases ) {
		if ( ! base || ! fs.existsSync( base ) ) {
			continue;
		}

		const fromSite = findPhpFromLocalSitesJson( base );
		if ( fromSite ) {
			candidates.push( fromSite );
		}

		const matches = globSync( 'php-*/bin/win64/php.exe', {
			cwd: base,
			absolute: true,
			nocase: true,
		} );
		candidates.push( ...matches.reverse() );
	}

	return candidates;
}

function findPhpFromLocalSitesJson( lightningBase ) {
	const match = getLocalPluginSite();
	if ( ! match ) {
		return null;
	}

	const version = match.site.services?.php?.version;
	if ( ! version ) {
		return null;
	}

	const dirs = globSync( `php-${version}*`, {
		cwd: lightningBase,
		absolute: true,
		nocase: true,
	} );

	for ( const dir of dirs ) {
		const phpExe = path.join( dir, 'bin', 'win64', 'php.exe' );
		if ( fs.existsSync( phpExe ) ) {
			return phpExe;
		}
	}

	return null;
}

function findPhpCandidates() {
	const candidates = [];

	if ( process.env.PHP_BIN ) {
		candidates.push( process.env.PHP_BIN );
	}

	candidates.push( 'php' );
	candidates.push( ...findLocalLightningPhp() );

	const extras = [
		'C:\\laragon\\bin\\php\\php.exe',
		'C:\\xampp\\php\\php.exe',
		'C:\\wamp64\\bin\\php\\php8.2.0\\php.exe',
		'C:\\Program Files\\PHP\\php.exe',
	];

	candidates.push( ...extras );

	return [ ...new Set( candidates.filter( Boolean ) ) ];
}

function findPhp() {
	const phpIni = findLocalSitePhpIni();

	for ( const candidate of findPhpCandidates() ) {
		if ( candidate !== 'php' && ! fs.existsSync( candidate ) ) {
			continue;
		}

		if ( phpWorks( candidate, phpIni ) ) {
			return { php: candidate, phpIni };
		}

		if ( phpWorks( candidate ) ) {
			return { php: candidate, phpIni: null };
		}
	}

	return null;
}

function downloadComposerPhar() {
	return new Promise( ( resolve, reject ) => {
		fs.mkdirSync( TOOLS_DIR, { recursive: true } );

		const file = fs.createWriteStream( COMPOSER_PHAR );
		https
			.get( COMPOSER_URL, ( response ) => {
				if ( response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location ) {
					https
						.get( response.headers.location, ( redirect ) => {
							redirect.pipe( file );
							file.on( 'finish', () => {
								file.close( () => resolve( COMPOSER_PHAR ) );
							} );
						} )
						.on( 'error', reject );
					return;
				}

				response.pipe( file );
				file.on( 'finish', () => {
					file.close( () => resolve( COMPOSER_PHAR ) );
				} );
			} )
			.on( 'error', reject );
	} );
}

async function ensureComposerPhar() {
	if ( fs.existsSync( COMPOSER_PHAR ) ) {
		return COMPOSER_PHAR;
	}

	console.log( 'Downloading Composer phar → tools/composer.phar …' );
	await downloadComposerPhar();
	console.log( 'Composer phar ready.' );
	return COMPOSER_PHAR;
}

function printHelp() {
	console.error( `
Could not find PHP on this machine.

Fix (pick one):

  1) Start the "plugin" site in Local WP, then run:
       npm run composer:install

  2) Set PHP path in .env (copy .env.example):
       npm run find-php

  3) Install PHP globally, then reopen the terminal:
       winget install PHP.PHP.8.2

After PHP works, run:
  npm run composer:install
` );
}

async function main() {
	loadEnvFile();

	const args = process.argv.slice( 2 );
	if ( args.length === 0 ) {
		args.push( '--version' );
	}

	const phpInfo = findPhp();
	if ( ! phpInfo ) {
		printHelp();
		process.exit( 1 );
	}

	if ( phpInfo.phpIni ) {
		console.log( `Using Local WP php.ini: ${phpInfo.phpIni}` );
	}

	const phar = await ensureComposerPhar();
	const result = spawnSync(
		phpInfo.php,
		phpArgs( phpInfo.php, phpInfo.phpIni, [ phar, ...args ] ),
		{
			cwd: ROOT,
			stdio: 'inherit',
			shell: false,
		},
	);

	process.exit( result.status ?? 1 );
}

main().catch( ( error ) => {
	console.error( error );
	process.exit( 1 );
} );
