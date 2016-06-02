#!/usr/bin/env node
'use strict';
var chalk = require('chalk');
var dpn = require('dpn');
var figures = require('figures');
var indentString = require('indent-string');
var meow = require('meow');
var ora = require('ora');
var sortObject = require('sort-object');

var cli = meow([
	'Usage',
	'  $ dpn [username]',
	'',
	'Options',
	'  -j, --json     Output the result as JSON',
	'  -r, --reverse  Reverse the result',
	'  -v, --verbose  Show the name of the dependents'
], {
	alias: {
		j: 'json',
		r: 'reverse',
		v: 'verbose'
	}
});

var spinner = ora('Loading dependents');

if (!cli.flags.json) {
	spinner.start();
}

dpn(cli.input[0]).then(function (res) {
	spinner.stop();

	if (cli.flags.json || !process.stdin.isTTY) {
		console.log(res);
		process.exit();
	}

	res = sortObject(res, {
		sort: function (a, b) {
			return cli.flags.reverse ? res[a].length - res[b].length : res[b].length - res[a].length;
		}
	});

	Object.keys(res).forEach(function (el) {
		console.log(chalk.bold(res[el].length) + ' ' + figures.arrowRight + ' ' + el);

		if (cli.flags.verbose) {
			res[el].forEach(function (dep) {
				console.log(indentString(chalk.dim(dep), ' ', 6));
			});
		}
	});
}).catch(function (err) {
	spinner.stop();
	console.log(chalk.bold.red(err));
	process.exit(1);
});
