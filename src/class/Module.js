'use strict';

const _ = require('underscore');
const AbstractSyntaxTree = require('@buxlabs/ast');

class Module extends AbstractSyntaxTree {

    convert () {
        var pairs = this.getDependencyPairs();
        if (pairs.length > 0) {
            this.remove({ type: 'ImportDeclaration' });
            this.prepend({
                type: 'ExpressionStatement',
                expression: {
                    type: 'Literal',
                    value: 'use strict'
                }
            });
            this.convertExportDefaultToReturn();
            this.normalizeIdentifiers(pairs);
            this.wrapWithDefineWithPairs(_.unique(pairs, item => item.element + item.param));
        } else if (this.has('ExportDefaultDeclaration')) {
            this.convertExportDefaultToDefine();
        }
    }

    getDependencyPairs () {
        return _.flatten(this.ast.body.map(function (node) {
            if (node.type === 'ImportDeclaration') {
                if (node.source &&
                    node.source.type === 'Literal' &&
                    node.specifiers.length === 0) {
                    return {
                        element: node.source.value
                    };
                }
                return node.specifiers.map(function (specifier) {
                    if (specifier.type === 'ImportSpecifier') {
                        return {
                            element: node.source.value,
                            // TODO assign any free identifier
                            param: 'a',
                            name: specifier.local.name
                        };
                    }
                    return {
                        element: node.source.value,
                        param: specifier.local.name
                    };
                });
            }
            return null;
        }).filter(node => !!node));
    }

    convertExportDefaultToReturn () {
        this.ast.body = this.ast.body.map(function (node) {
            if (node.type === 'ExportDefaultDeclaration') {
                return {
                    type: 'ReturnStatement',
                    argument: node.declaration
                };
            }
            return node;
        });
    }

    convertExportDefaultToDefine () {
        this.ast.body = this.ast.body.map(function (node) {
            if (node.type === 'ExportDefaultDeclaration') {
                return {
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: { type: 'Identifier', name: 'define' },
                        arguments: [
                            node.declaration
                        ]
                    }
                };
            }
            return node;
        });
    }

    normalizeIdentifiers (pairs) {
        let nodes = pairs.filter(pair => !!pair.name);
        let names = nodes.map(node => node.name);
        this.replace({
            leave: function (current, parent) {
                if (current.type === 'Identifier') {
                    let index = names.indexOf(current.name);
                    if (index !== -1) {
                        let pair = nodes[index];
                        return {
                            type: 'MemberExpression',
                            object: {
                                type: 'Identifier',
                                name: pair.param
                            },
                            property: {
                                type: 'Identifier',
                                name: pair.name
                            }
                        };
                    }
                }
                return current;
            }
        });
    }

    wrapWithDefineWithPairs (pairs) {
        var body = this.ast.body;
        var elements = pairs.map(pair => pair.element)
        .map(function (element) {
            return { type: 'Literal', value: element };
        });
        var params = pairs.filter(pair => pair.param).map(pair => pair.param)
        .map(function(param) {
            return { type: 'Identifier', name: param };
        });
        this.ast.body = [{
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'define' },
                arguments: [
                    {
                        type: 'ArrayExpression',
                        elements: elements
                    },
                    {
                        type: 'FunctionExpression',
                        params: params,
                        body: {
                            type: 'BlockStatement',
                            body: body
                        }
                    }
                ]
            }
        }];
    }

}

module.exports = Module;
