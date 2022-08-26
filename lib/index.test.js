"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const common_tags_1 = require("common-tags");
describe('ember-template-recast', function () {
    test('basic parse + print (no modification)', function () {
        let template = common_tags_1.stripIndent `
      {{foo-bar
        baz="stuff"
      }}`;
        let ast = index_1.parse(template);
        expect(index_1.print(ast)).toEqual(template);
    });
    test('basic parse + print (no modification): void elements', function () {
        let template = `<br><p>Hi!</p>`;
        let ast = index_1.parse(template);
        expect(index_1.print(ast)).toEqual(template);
    });
    test('basic parse + print (no modification) preserves blank lines', function () {
        let template = common_tags_1.stripIndent `
      {{foo-bar
        baz="stuff"
      }}


`;
        let ast = index_1.parse(template);
        expect(index_1.print(ast)).toEqual(template);
    });
    test('basic parse -> mutation -> print', function () {
        let template = common_tags_1.stripIndent `
      {{foo-bar
        baz="stuff"
        other='single quote'
      }}`;
        let ast = index_1.parse(template);
        let mustache = ast.body[0];
        mustache.hash.pairs[0].key = 'derp';
        expect(index_1.print(ast)).toEqual(common_tags_1.stripIndent `
      {{foo-bar
        derp="stuff"
        other='single quote'
      }}`);
    });
    test('basic parse -> mutation: attributes order is preserved -> print', function () {
        let template = common_tags_1.stripIndent `
      <div class="foo" ...attributes></div>
      <div ...attributes class="foo"></div>
    `;
        let ast = index_1.parse(template);
        let b = index_1.builders;
        let { body } = ast;
        function mutateAttributes(attributes) {
            let classAttribute = attributes.find(({ name }) => name === 'class');
            if (classAttribute === undefined) {
                throw new Error('bug: could not find class attribute');
            }
            let index = attributes.indexOf(classAttribute);
            attributes[index] = b.attr('class', b.text('bar'));
        }
        mutateAttributes(body[0].attributes);
        mutateAttributes(body[2].attributes);
        expect(index_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <div class="bar" ...attributes></div>
      <div ...attributes class="bar"></div>
    `);
    });
    test('basic parse -> mutation -> print: preserves HTML entities', function () {
        let template = common_tags_1.stripIndent `<div>&nbsp;</div>`;
        let ast = index_1.parse(template);
        let element = ast.body[0];
        element.children.push(index_1.builders.text('derp&nbsp;'));
        expect(index_1.print(ast)).toEqual(common_tags_1.stripIndent `<div>&nbsp;derp&nbsp;</div>`);
    });
    describe('transform', () => {
        describe('legacy arguments', () => {
            test('basic traversal', function () {
                let template = '{{foo-bar bar=foo}}';
                let paths = [];
                index_1.transform(template, function () {
                    return {
                        PathExpression(node) {
                            paths.push(node.original);
                        },
                    };
                });
                expect(paths).toEqual(['foo-bar', 'foo']);
            });
            test('can handle comment append before html node case', function () {
                let template = '<table></table>';
                let seen = new Set();
                const result = index_1.transform(template, function ({ syntax }) {
                    const b = syntax.builders;
                    return {
                        ElementNode(node) {
                            if (node.tag === 'table' && !seen.has(node)) {
                                seen.add(node);
                                return [
                                    b.mustacheComment(' template-lint-disable no-table-tag '),
                                    b.text('\n'),
                                    node,
                                ];
                            }
                            return node;
                        },
                    };
                });
                expect(result.code).toEqual(['{{!-- template-lint-disable no-table-tag --}}', '<table></table>'].join('\n'));
            });
            test('can handle comment append between html + newline', function () {
                let template = ['\n', '<table>', '<tbody></tbody>', '</table>'].join('\n');
                let seen = new Set();
                const result = index_1.transform(template, function ({ syntax }) {
                    const b = syntax.builders;
                    return {
                        ElementNode(node) {
                            if (node.tag === 'table' && !seen.has(node)) {
                                seen.add(node);
                                return [
                                    b.mustacheComment(' template-lint-disable no-table-tag '),
                                    b.text('\n'),
                                    node,
                                ];
                            }
                            return node;
                        },
                    };
                });
                expect(result.code).toEqual([
                    '\n',
                    '{{!-- template-lint-disable no-table-tag --}}',
                    '<table>',
                    '<tbody></tbody>',
                    '</table>',
                ].join('\n'));
            });
            test('can accept an AST', function () {
                let template = '{{foo-bar bar=foo}}';
                let paths = [];
                let ast = index_1.parse(template);
                index_1.transform(ast, function () {
                    return {
                        PathExpression(node) {
                            paths.push(node.original);
                        },
                    };
                });
                expect(paths).toEqual(['foo-bar', 'foo']);
            });
            test('returns code and ast', function () {
                let template = '{{foo-bar}}';
                let paths = [];
                let { ast, code } = index_1.transform(template, function () {
                    return {
                        PathExpression(node) {
                            paths.push(node.original);
                        },
                    };
                });
                expect(ast).toBeTruthy();
                expect(code).toBeTruthy();
            });
            test('replacement', function () {
                let template = '{{foo-bar bar=foo}}';
                let { code } = index_1.transform(template, (env) => {
                    let { builders: b } = env.syntax;
                    return {
                        MustacheStatement() {
                            return b.mustache(b.path('wat-wat'));
                        },
                    };
                });
                expect(code).toEqual('{{wat-wat}}');
            });
            test('removing the only hash pair on MustacheStatement', function () {
                let template = '{{foo-bar hello="world"}}';
                let { code } = index_1.transform(template, () => {
                    return {
                        MustacheStatement(ast) {
                            ast.hash.pairs.pop();
                        },
                    };
                });
                expect(code).toEqual('{{foo-bar}}');
            });
            test('pushing new item on to empty hash pair on MustacheStatement works', function () {
                let template = '{{foo-bar}}{{#baz}}Hello!{{/baz}}';
                let { code } = index_1.transform(template, (env) => {
                    let { builders: b } = env.syntax;
                    return {
                        MustacheStatement(ast) {
                            ast.hash.pairs.push(b.pair('hello', b.string('world')));
                        },
                    };
                });
                expect(code).toEqual('{{foo-bar hello="world"}}{{#baz}}Hello!{{/baz}}');
            });
        });
        test('basic traversal', function () {
            let template = '{{foo-bar bar=foo}}';
            let paths = [];
            index_1.transform({
                template,
                plugin() {
                    return {
                        PathExpression(node) {
                            paths.push(node.original);
                        },
                    };
                },
            });
            expect(paths).toEqual(['foo-bar', 'foo']);
        });
        test('can handle comment append before html node case', function () {
            let template = '<table></table>';
            let seen = new Set();
            const result = index_1.transform({
                template,
                plugin({ syntax }) {
                    const b = syntax.builders;
                    return {
                        ElementNode(node) {
                            if (node.tag === 'table' && !seen.has(node)) {
                                seen.add(node);
                                return [
                                    b.mustacheComment(' template-lint-disable no-table-tag '),
                                    b.text('\n'),
                                    node,
                                ];
                            }
                            return node;
                        },
                    };
                },
            });
            expect(result.code).toEqual(['{{!-- template-lint-disable no-table-tag --}}', '<table></table>'].join('\n'));
        });
        test('can handle comment append between html + newline', function () {
            let template = ['\n', '<table>', '<tbody></tbody>', '</table>'].join('\n');
            let seen = new Set();
            const result = index_1.transform({
                template,
                plugin({ syntax }) {
                    const b = syntax.builders;
                    return {
                        ElementNode(node) {
                            if (node.tag === 'table' && !seen.has(node)) {
                                seen.add(node);
                                return [
                                    b.mustacheComment(' template-lint-disable no-table-tag '),
                                    b.text('\n'),
                                    node,
                                ];
                            }
                            return node;
                        },
                    };
                },
            });
            expect(result.code).toEqual([
                '\n',
                '{{!-- template-lint-disable no-table-tag --}}',
                '<table>',
                '<tbody></tbody>',
                '</table>',
            ].join('\n'));
        });
        test('can accept an AST', function () {
            let template = '{{foo-bar bar=foo}}';
            let paths = [];
            let ast = index_1.parse(template);
            index_1.transform({
                template: ast,
                plugin() {
                    return {
                        PathExpression(node) {
                            paths.push(node.original);
                        },
                    };
                },
            });
            expect(paths).toEqual(['foo-bar', 'foo']);
        });
        test('returns code and ast', function () {
            let template = '{{foo-bar}}';
            let paths = [];
            let { ast, code } = index_1.transform({
                template,
                plugin() {
                    return {
                        PathExpression(node) {
                            paths.push(node.original);
                        },
                    };
                },
            });
            expect(ast).toBeTruthy();
            expect(code).toBeTruthy();
        });
        test('replacement', function () {
            let template = '{{foo-bar bar=foo}}';
            let { code } = index_1.transform({
                template,
                plugin(env) {
                    let { builders: b } = env.syntax;
                    return {
                        MustacheStatement() {
                            return b.mustache(b.path('wat-wat'));
                        },
                    };
                },
            });
            expect(code).toEqual('{{wat-wat}}');
        });
        test('removing the only hash pair on MustacheStatement', function () {
            let template = '{{foo-bar hello="world"}}';
            let { code } = index_1.transform({
                template,
                plugin() {
                    return {
                        MustacheStatement(ast) {
                            ast.hash.pairs.pop();
                        },
                    };
                },
            });
            expect(code).toEqual('{{foo-bar}}');
        });
        test('pushing new item on to empty hash pair on MustacheStatement works', function () {
            let template = '{{foo-bar}}{{#baz}}Hello!{{/baz}}';
            let { code } = index_1.transform({
                template,
                plugin(env) {
                    let { builders: b } = env.syntax;
                    return {
                        MustacheStatement(ast) {
                            ast.hash.pairs.push(b.pair('hello', b.string('world')));
                        },
                    };
                },
            });
            expect(code).toEqual('{{foo-bar hello="world"}}{{#baz}}Hello!{{/baz}}');
        });
    });
    test('Build string from escaped string', function () {
        let template = '{{foo-bar placeholder="Choose a \\"thing\\"..."}}';
        let { code } = index_1.transform({
            template,
            plugin(env) {
                return {
                    MustacheStatement(node) {
                        let { builders: b } = env.syntax;
                        let value = node.hash.pairs[0].value;
                        let pair = b.pair('p1', b.string(value.original));
                        node.hash.pairs.push(pair);
                    },
                };
            },
        });
        expect(code).toEqual('{{foo-bar placeholder="Choose a \\"thing\\"..." p1="Choose a \\"thing\\"..."}}');
    });
});
//# sourceMappingURL=index.test.js.map