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
                    name: 'subject',
                    message: 'DESCRIPTION - write a short description of the change:\n',
                    default: options.defaultSubject,
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
                    name: 'body',
                    message: 'BODY - write a longer description of the change (enter to skip)\n',
                    default: options.defaultBody,
                },
            ]).then(function (answers) {
                const maxLineWidth = 72;

                function getHead(subject) {
                    return `${
                        answers.type
                    }${answers.scope ? '(' + answers.scope + ')' : ''}: ${subject} ${answers.ticket}`;
                }

                let subject = answers.subject.trim();

                // Enforce 72 characters max - trim description otherwise
                const headLength = getHead(subject).length;
                if (headLength > maxLineWidth) {
                    subject = subject.slice(0, -(headLength - maxLineWidth));
                }

                const head = getHead(subject);

                const wrapOptions = {
                    trim: true,
                    newline: '\n',
                    indent: '',
                    width: maxLineWidth,
                };

                // Wrap these lines at 72 characters
                const body = wrap(
                    answers.isBreaking ? `BREAKING CHANGE: ${answers.body}` : answers.body,
                    wrapOptions
                );

                commit(head + '\n' + body);
            });
        },
    };
};
