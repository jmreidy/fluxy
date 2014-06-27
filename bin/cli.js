#!/usr/bin/env node
var Promise = require('bluebird');
var chalk = require('chalk');
var commander = require('commander');
var Command = commander.Command;
var argv = require('minimist')(process.argv.slice(2));
var pkg = require('../package');
var fs = Promise.promisifyAll(require('fs'));
var pending;

function exit (text) {
  if (text instanceof Error) {
    console.error(chalk.red(text.stack));
  } else {
    console.error(chalk.red(text));
  }
  process.exit(1);
}

function success (text) {
  console.log(text);
  process.exit(0);
}

function loadTemplate(type) {
  return fs.readFileAsync(__dirname + '/../templates/'+type+'.js', 'utf8');
}

function replaceName(name, template) {
  return template.replace(/PLACEHOLDER_NAME/g, name);
}

function extractPath() {
  var path = argv.path || argv.p;
  if (path && !path.match(/\/$/)) {
    path += '/';
  }
  return path;
}

function handleTemplateResult(name, componentType) {
  return function (template) {
    var path = extractPath();
    if (path) {
      var dest = path + name + '.js';
      return fs.writeFileAsync(path + name + '.js', template).then(function () {
        return chalk.green('Wrote ' + componentType + ' to ' + dest);
      });
    }
    else {
      return template;
    }
  };
}

Command.prototype.missingArgument = function (name) {
  exit("Missing required argument " + name);
};

commander
  .version(
      chalk.blue('Fluxy version: ' + chalk.green(pkg.version)) + '\n'
  )
  .option('--debug', 'Activate verbose logging');


commander
  .command('generate:store <StoreName>')
  .description('Create a Fluxy store')
  .option('-p, --path <path>', 'Destination directory')
  .action(function (name) {
    pending = loadTemplate('store')
      .then(replaceName.bind(null, name))
      .then(handleTemplateResult(name, 'store'))
      .then(success)
      .catch(exit);
  });

commander
  .command('generate:actions <ActionsName>')
  .description('Create a Fluxy Action Handler')
  .option('-p, --path <path>', 'Destination directory')
  .action(function (name) {
    pending = loadTemplate('actions')
      .then(replaceName.bind(null, name))
      .then(handleTemplateResult(name, 'actions'))
      .then(success)
      .catch(exit);
  });

commander
  .command('generate:constants <ConstantsName>')
  .description('Create a Fluxy Constants Enum')
  .option('-p, --path <path>', 'Destination directory')
  .action(function (name) {
    pending = loadTemplate('constants')
      .then(replaceName.bind(null, name))
      .then(handleTemplateResult(name, 'contants'))
      .then(success)
      .catch(exit);
  });

commander.parse(process.argv);

Promise.resolve(pending).then(function () {
  commander.help();
});

