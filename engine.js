const branch = require('git-branch');
const wrap = require('word-wrap');
const map = require('lodash.map');
const longest = require('longest');
const rightPad = require('right-pad');

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function (options) {
    const types = options.types;

    const length = longest(Object.keys(types)).length + 1;
    const choices = map(types, function (type, key) {
        return {
            name: rightPad(key + ':', length) + ' ' + type.description,
            value: key,
        };
    });

    return {
        // When a user runs `git cz`, prompter will
        // be executed. We pass you cz, which currently
        // is just an instance of inquirer.js. Using
        // this you can ask questions and get answers.
        //
        // The commit callback should be executed when
        // you're ready to send back a commit template
        // to git.
        //
        // By default, we'll de-indent your commit
        // template and will keep empty lines.
        prompter: function (cz, commit) {
            console.log(
                '\nLine 1 will be cropped at 100 characters with the current branch name prepended. All other lines will be wrapped after 100 characters.\n'
            );

            const branchName = branch.sync();

            cz.prompt([
                {
                    type: 'list',
                    name: 'type',
                    message: "TYPE - select the type of change that you're committing:",
                    choices: choices,
                    default: options.defaultType,
                },
                {
                    type: 'input',
                    name: 'scope',
                    message: 'SCOPE - enter one word that defines the work (enter to skip):\n',
                    default: options.defaultScope,
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'DESCRIPTION - write a short description of the change:\n',
                    default: options.defaultDescription,
                },
                {
                    type: 'input',
                    name: 'body',
                    message: 'BODY - write a longer description of the change (enter to skip)\n',
                    default: options.defaultBody,
                },
                {
                    type: 'input',
                    name: 'ticket',
                    message: `JIRA ID - enter the JIRA ticket ID (enter to use ${branchName}):\n`,
                    default: branchName,
                },
                {
                    type: 'confirm',
                    name: 'isBreaking',
                    message: 'Are there any breaking changes?',
                    default: false,
                },
                {
                    type: 'input',
                    name: 'breaking',
                    message: `Describe the breaking changes (enter to use ${answers.body}):\n`,
                    default: answers.body,
                    when: function (answers) {
                        return answers.isBreaking;
                    },
                },
            ]).then(function (answers) {
                const maxLineWidth = 72;

                function getHead(description) {
                    return `${
                        answers.type
                    }${answers.scope ? '(' + answers.scope + ')' : ''}: ${description} ${answers.ticket}`;
                }

                let description = answers.description.trim();

                // Enforce 72 characters max - trim description otherwise
                const headLength = getHead(description).length;
                if (headLength > maxLineWidth) {
                    description = description.slice(0, -(headLength - maxLineWidth));
                }

                const head = getHead(description);

                const wrapOptions = {
                    trim: true,
                    newline: '\n',
                    indent: '',
                    width: maxLineWidth,
                };

                // Wrap these lines at 72 characters
                const body = wrap(
                    answers.isBreaking ? `BREAKING CHANGE: ${answers.breaking}` : answers.body,
                    wrapOptions
                );

                commit(head + '\n' + body);
            });
        },
    };
};
