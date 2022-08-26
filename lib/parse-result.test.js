"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const common_tags_1 = require("common-tags");
describe('ember-template-recast', function () {
    describe('ElementNode', function () {
        test('creating void element', function () {
            let template = ``;
            let ast = _1.parse(template);
            ast.body.push(_1.builders.element('img'));
            expect(_1.print(ast)).toEqual(`<img>`);
        });
        test('updating attributes on a non-self-closing void element', function () {
            let template = `<img src="{{something}}">`;
            let ast = _1.parse(template);
            let element = ast.body[0];
            let attribute = element.attributes[0];
            let concat = attribute.value;
            concat.parts[0].path = _1.builders.path('this.something');
            expect(_1.print(ast)).toEqual(`<img src="{{this.something}}">`);
        });
        test('changing an element to a void element does not print closing tag', function () {
            let template = `<div data-foo="{{something}}"></div>`;
            let ast = _1.parse(template);
            let element = ast.body[0];
            element.tag = 'img';
            expect(_1.print(ast)).toEqual(`<img data-foo="{{something}}">`);
        });
        test('updating attributes on a self-closing void element', function () {
            let template = `<img src="{{something}}" />`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.parts[0].path = _1.builders.path('this.something');
            expect(_1.print(ast)).toEqual(`<img src="{{this.something}}" />`);
        });
        test('changing an attribute value from mustache to text node (GH#111)', function () {
            let template = `<FooBar @thing={{1234}} @baz={{derp}} />`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value = _1.builders.text('static thing 1');
            ast.body[0].attributes[1].value = _1.builders.text('static thing 2');
            expect(_1.print(ast)).toEqual(`<FooBar @thing="static thing 1" @baz="static thing 2" />`);
        });
        test('changing an attribute value from text node to mustache (GH #139)', function () {
            let template = `<FooBar @foo="Hi, I'm a string!" />`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value = _1.builders.mustache('my-awesome-helper', [
                _1.builders.string('hello'),
                _1.builders.string('world'),
            ]);
            expect(_1.print(ast)).toEqual(`<FooBar @foo={{my-awesome-helper "hello" "world"}} />`);
        });
        test('changing an attribute value from text node to concat statement (GH #139)', function () {
            let template = `<FooBar @foo="Hi, I'm a string!" />`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value = _1.builders.concat([
                _1.builders.text('Hello '),
                _1.builders.mustache('my-awesome-helper', [
                    _1.builders.string('hello'),
                    _1.builders.string('world'),
                ]),
                _1.builders.text(' world'),
            ]);
            expect(_1.print(ast)).toEqual(`<FooBar @foo="Hello {{my-awesome-helper "hello" "world"}} world" />`);
        });
        test('changing an attribute value from mustache to mustache', function () {
            let template = `<FooBar @foo={{12345}} />`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value = _1.builders.mustache('my-awesome-helper', [
                _1.builders.string('hello'),
                _1.builders.string('world'),
            ]);
            expect(_1.print(ast)).toEqual(`<FooBar @foo={{my-awesome-helper "hello" "world"}} />`);
        });
        test('rename element tagname', function () {
            let template = common_tags_1.stripIndent `
      <div data-foo='single quoted'>
        </div>`;
            let ast = _1.parse(template);
            ast.body[0].tag = 'a';
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <a data-foo='single quoted'>
        </a>`);
        });
        test('rename element tagname without children', function () {
            let template = common_tags_1.stripIndent `
      <div></div>`;
            let ast = _1.parse(template);
            ast.body[0].tag = 'a';
            expect(_1.print(ast)).toEqual(`<a></a>`);
        });
        test('rename self-closing element tagname', function () {
            let ast = _1.parse('<Foo bar="baz"/>');
            ast.body[0].tag = 'Qux';
            expect(_1.print(ast)).toEqual('<Qux bar="baz"/>');
        });
        test('rename self-closing element tagname with trailing whitespace', function () {
            let ast = _1.parse('<Foo />');
            ast.body[0].tag = 'Qux';
            expect(_1.print(ast)).toEqual('<Qux />');
        });
        test('Rename tag and convert from self-closing with attributes to block element', function () {
            let ast = _1.parse('<Foo bar="baz" />');
            ast.body[0].tag = 'Qux';
            ast.body[0].children = [_1.builders.text('bay')];
            expect(_1.print(ast)).toEqual('<Qux bar="baz">bay</Qux>');
        });
        test('convert from self-closing with attributes to block element', function () {
            let ast = _1.parse('<Foo bar="baz" />');
            ast.body[0].children = [_1.builders.text('bay')];
            expect(_1.print(ast)).toEqual('<Foo bar="baz">bay</Foo>');
        });
        test('convert from self-closing with specially spaced attributes to block element', function () {
            let ast = _1.parse('<Foo\n  bar="baz"\n />');
            ast.body[0].children = [_1.builders.text('bay')];
            expect(_1.print(ast)).toEqual('<Foo\n  bar="baz"\n >bay</Foo>');
        });
        test('Convert self-closing element with modifiers block element', function () {
            let ast = _1.parse('<Foo {{on "click" this.doSomething}} />');
            ast.body[0].children = [_1.builders.text('bay')];
            expect(_1.print(ast)).toEqual('<Foo {{on "click" this.doSomething}}>bay</Foo>');
        });
        test('adding attribute when none originally existed', function () {
            let template = common_tags_1.stripIndent `
      <div></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes.push(_1.builders.attr('data-test', _1.builders.text('wheee')));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <div data-test="wheee"></div>`);
        });
        test('adding attribute to ElementNode with block params', function () {
            let template = `<Foo as |bar|></Foo>`;
            let ast = _1.parse(template);
            ast.body[0].attributes.push(_1.builders.attr('data-test', _1.builders.text('wheee')));
            expect(_1.print(ast)).toEqual(`<Foo data-test="wheee" as |bar|></Foo>`);
        });
        test('adding attribute to ElementNode with block params (extra whitespace)', function () {
            let template = `<Foo as |\nbar\n  |></Foo>`;
            let ast = _1.parse(template);
            ast.body[0].attributes.push(_1.builders.attr('data-test', _1.builders.text('wheee')));
            expect(_1.print(ast)).toEqual(`<Foo data-test="wheee" as |\nbar\n  |></Foo>`);
        });
        test('adding boolean attribute to ElementNode', function () {
            let template = common_tags_1.stripIndent `<button></button>`;
            let ast = _1.parse(template);
            ast.body[0].attributes.push(_1.builders.attr('disabled', _1.builders.mustache(_1.builders.boolean(true))));
            expect(_1.print(ast)).toEqual('<button disabled={{true}}></button>');
        });
        test('adding an attribute to existing list', function () {
            let template = common_tags_1.stripIndent `
      <div
        data-foo='lol'
        data-bar=hahaha
      ></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes.push(_1.builders.attr('data-test', _1.builders.text('wheee')));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <div
        data-foo='lol'
        data-bar=hahaha data-test="wheee"
      ></div>`);
        });
        test('creating an element with complex attributes', function () {
            let template = '';
            let ast = _1.parse(template);
            ast.body.push(_1.builders.element({ name: 'FooBar', selfClosing: true }, {
                attrs: [
                    _1.builders.attr('@thing', _1.builders.mustache(_1.builders.path('hash'), [], _1.builders.hash([_1.builders.pair('something', _1.builders.path('bar'))]))),
                ],
            }));
            expect(_1.print(ast)).toEqual(`<FooBar @thing={{hash something=bar}} />`);
        });
        test('modifying an attribute name (GH#112)', function () {
            let template = common_tags_1.stripIndent `
        <div
          data-foo='some thing here'
          data-bar=hahaha
        ></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].name = 'data-test';
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        <div
          data-test='some thing here'
          data-bar=hahaha
        ></div>`);
        });
        test('modifying attribute after valueless attribute', function () {
            let template = '<Foo data-foo data-derp={{hmmm}} />';
            let ast = _1.parse(template);
            ast.body[0].attributes[1].value.path = _1.builders.path('this.hmmm');
            expect(_1.print(ast)).toEqual('<Foo data-foo data-derp={{this.hmmm}} />');
        });
        test('modifying attribute after valueless attribute with special whitespace', function () {
            let template = common_tags_1.stripIndent `
        <Foo
          data-foo
          data-derp={{hmmm}}
        />`;
            let ast = _1.parse(template);
            ast.body[0].attributes[1].value.path = _1.builders.path('this.hmmm');
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        <Foo
          data-foo
          data-derp={{this.hmmm}}
        />`);
        });
        test('adding attribute after valueless attribute', function () {
            let template = '<Foo data-foo />';
            let ast = _1.parse(template);
            ast.body[0].attributes.push(_1.builders.attr('data-bar', _1.builders.text('foo')));
            expect(_1.print(ast)).toEqual('<Foo data-foo data-bar="foo" />');
        });
        test('adding valueless attribute when no open parts existed', function () {
            let template = '<Foo />';
            let ast = _1.parse(template);
            ast.body[0].attributes.push(_1.builders.attr('data-bar', _1.builders.text('')));
            expect(_1.print(ast)).toEqual('<Foo data-bar />');
        });
        test('adding modifier when no open parts originally existed', function () {
            let template = common_tags_1.stripIndent `
      <div></div>`;
            let ast = _1.parse(template);
            ast.body[0].modifiers.push(_1.builders.elementModifier('on', [_1.builders.string('click'), _1.builders.path('this.foo')]));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <div {{on "click" this.foo}}></div>`);
        });
        test('adding modifier with existing attributes', function () {
            let template = common_tags_1.stripIndent `
      <div class="foo"></div>`;
            let ast = _1.parse(template);
            ast.body[0].modifiers.push(_1.builders.elementModifier('on', [_1.builders.string('click'), _1.builders.path('this.foo')]));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <div class="foo" {{on "click" this.foo}}></div>`);
        });
        // This is specifically testing the issue described in https://github.com/glimmerjs/glimmer-vm/pull/953
        test('adding modifier when ...attributes is present', function () {
            let template = common_tags_1.stripIndent `<div data-foo="asdf" data-foo data-other="asdf"></div>`;
            let ast = _1.parse(template);
            ast.body[0].modifiers.push(_1.builders.elementModifier('on', [_1.builders.string('click'), _1.builders.path('this.foo')]));
            expect(_1.print(ast)).toEqual(`<div data-foo="asdf" data-foo data-other="asdf" {{on "click" this.foo}}></div>`);
        });
        test('removing a modifier with other attributes', function () {
            let template = common_tags_1.stripIndent `
      <div class="foo" {{on "click" this.blah}}></div>`;
            let ast = _1.parse(template);
            ast.body[0].modifiers.shift();
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <div class="foo"></div>`);
        });
        test('removing a modifier with no other attributes/comments/modifiers', function () {
            let template = common_tags_1.stripIndent `
      <div {{on "click" this.blah}}></div>`;
            let ast = _1.parse(template);
            ast.body[0].modifiers.shift();
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <div></div>`);
        });
        test('adding comment when no open parts originally existed', function () {
            let template = common_tags_1.stripIndent `
      <div></div>`;
            let ast = _1.parse(template);
            ast.body[0].comments.push(_1.builders.mustacheComment(' template-lint-disable '));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <div {{!-- template-lint-disable --}}></div>`);
        });
        test('adding comment with existing attributes', function () {
            let template = common_tags_1.stripIndent `
      <div class="foo"></div>`;
            let ast = _1.parse(template);
            ast.body[0].comments.push(_1.builders.mustacheComment(' template-lint-disable '));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <div class="foo" {{!-- template-lint-disable --}}></div>`);
        });
        test('adding block param', function () {
            let template = `<MyFoo class="foo"></MyFoo>`;
            let ast = _1.parse(template);
            ast.body[0].blockParams.push('blah');
            expect(_1.print(ast)).toEqual(`<MyFoo class="foo" as |blah|></MyFoo>`);
        });
        test('removing a block param', function () {
            let template = `<MyFoo class="foo" as |bar|></MyFoo>`;
            let ast = _1.parse(template);
            ast.body[0].blockParams.pop();
            expect(_1.print(ast)).toEqual(`<MyFoo class="foo"></MyFoo>`);
        });
        test('removing a block param preserves formatting of "open element closing"', function () {
            let template = common_tags_1.stripIndent `
        <MyFoo
          class="foo"
          as |bar|
        ></MyFoo>`;
            let ast = _1.parse(template);
            ast.body[0].blockParams.pop();
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      <MyFoo
        class="foo"
      ></MyFoo>`);
        });
        test('interleaved attributes and modifiers are not modified when unchanged', function () {
            let template = `<div data-test="foo" {{on "click" this.bar}} data-blah="derp"></div>`;
            let ast = _1.parse(template);
            ast.body[0].comments.push(_1.builders.mustacheComment(' template-lint-disable '));
            expect(_1.print(ast)).toEqual(`<div data-test="foo" {{on "click" this.bar}} data-blah="derp" {{!-- template-lint-disable --}}></div>`);
        });
        test('adding children to element with children', function () {
            let template = common_tags_1.stripIndent `
        <ul>
          <li></li>
        </ul>
      `;
            let ast = _1.parse(template);
            ast.body[0].children.splice(2, 0, _1.builders.text('\n  '), _1.builders.element('li', { attrs: [_1.builders.attr('data-foo', _1.builders.text('bar'))] }));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        <ul>
          <li></li>
          <li data-foo="bar"></li>
        </ul>
      `);
        });
        test('adding children to an empty element', function () {
            let template = `<div></div>`;
            let ast = _1.parse(template);
            ast.body[0].children.push(_1.builders.text('some text'));
            expect(_1.print(ast)).toEqual('<div>some text</div>');
        });
        test('adding children to a self closing element', function () {
            let template = `<Foo />`;
            let ast = _1.parse(template);
            ast.body[0].children.push(_1.builders.text('some text'));
            expect(_1.print(ast)).toEqual('<Foo>some text</Foo>');
        });
        test('moving a child to another ElementNode', function () {
            let template = common_tags_1.stripIndent `
        <Foo>{{
          special-formatting-here
        }}</Foo>
      `;
            let ast = _1.parse(template);
            let child = ast.body[0].children.pop();
            ast.body.unshift(_1.builders.text('\n'));
            ast.body.unshift(child);
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        {{
          special-formatting-here
        }}
        <Foo></Foo>
      `);
        });
        test('adding a new attribute to an ElementNode while preserving the existing whitespaces', function () {
            let template = common_tags_1.stripIndent `
        <div data-foo
         data-bar="lol"
              some-other-thing={{haha}}>
        </div>
      `;
            let ast = _1.parse(template);
            let element = ast.body[0];
            element.attributes.push(_1.builders.attr('foo-foo', _1.builders.text('wheee')));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        <div data-foo
         data-bar="lol"
              some-other-thing={{haha}} foo-foo="wheee">
        </div>
      `);
        });
    });
    describe('MustacheStatement', function () {
        test('path mutations retain custom whitespace formatting', function () {
            let template = `{{ foo }}`;
            let ast = _1.parse(template);
            ast.body[0].path.original = 'bar';
            expect(_1.print(ast)).toEqual('{{ bar }}');
        });
        test('updating from this.foo to @foo via path.original mutation', function () {
            let template = `{{this.foo}}`;
            let ast = _1.parse(template);
            ast.body[0].path.original = '@foo';
            expect(_1.print(ast)).toEqual('{{@foo}}');
        });
        test('updating from this.foo to @foo via path replacement', function () {
            let template = `{{this.foo}}`;
            let ast = _1.parse(template);
            ast.body[0].path = _1.builders.path('@foo');
            expect(_1.print(ast)).toEqual('{{@foo}}');
        });
        test('updating path via path replacement retains custom whitespace', function () {
            let template = `{{\n@foo\n}}`;
            let ast = _1.parse(template);
            ast.body[0].path = _1.builders.path('this.foo');
            expect(_1.print(ast)).toEqual('{{\nthis.foo\n}}');
        });
        test('rename non-block component', function () {
            let template = common_tags_1.stripIndent `
      {{foo-bar
        baz="stuff"
        other='single quote'
      }}`;
            let ast = _1.parse(template);
            ast.body[0].path = _1.builders.path('baz-derp');
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      {{baz-derp
        baz="stuff"
        other='single quote'
      }}`);
        });
        test('MustacheStatements retain whitespace when multiline replacements occur', function () {
            let template = common_tags_1.stripIndent `
        <p></p>
        {{ other-stuff }}
      `;
            let { code } = _1.transform(template, (env) => {
                let { builders: b } = env.syntax;
                return {
                    ElementNode() {
                        return [b.text('x'), b.text('y')];
                    },
                };
            });
            expect(code).toEqual('xy\n{{ other-stuff }}');
        });
        test('can add param', function () {
            let template = common_tags_1.stripIndent `
        {{foo-bar
          baz=(stuff
            goes='here')
        }}`;
            let ast = _1.parse(template);
            ast.body[0].params.push(_1.builders.path('zomg'));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        {{foo-bar
          zomg
          baz=(stuff
            goes='here')
        }}`);
        });
        test('can remove param', function () {
            let template = common_tags_1.stripIndent `
        {{foo-bar
          hhaahahaha
          baz=(stuff
            goes='here')
        }}`;
            let ast = _1.parse(template);
            ast.body[0].params.pop();
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        {{foo-bar
          baz=(stuff
            goes='here')
        }}`);
        });
        test('replacing empty hash pair on MustacheStatement works', function () {
            let template = '{{foo-bar}}';
            let ast = _1.parse(template);
            ast.body[0].hash = _1.builders.hash([_1.builders.pair('hello', _1.builders.string('world'))]);
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `{{foo-bar hello="world"}}`);
        });
        test('infers indentation of hash when multiple HashPairs existed', function () {
            let template = common_tags_1.stripIndent `
        {{foo-bar
          baz="stuff"
          other='single quote'
        }}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs.push(_1.builders.pair('some', _1.builders.string('other-thing')));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        {{foo-bar
          baz="stuff"
          other='single quote'
          some="other-thing"
        }}`);
        });
        test('infers indentation of hash when no existing hash existed but params do', function () {
            let template = common_tags_1.stripIndent `
        {{foo-bar
          someParam
        }}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs.push(_1.builders.pair('some', _1.builders.string('other-thing')));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        {{foo-bar
          someParam
          some="other-thing"
        }}`);
        });
        test('infers indentation of new HashPairs when existing hash with single entry (but no params)', function () {
            let template = common_tags_1.stripIndent `
        {{foo-bar
          stuff=here
        }}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs.push(_1.builders.pair('some', _1.builders.string('other-thing')));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        {{foo-bar
          stuff=here
          some="other-thing"
        }}`);
        });
        test('can add literal hash pair values', function () {
            let template = common_tags_1.stripIndent `
        {{foo-bar
          first=thing
        }}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs.push(_1.builders.pair('some', _1.builders.null()));
            ast.body[0].hash.pairs.push(_1.builders.pair('other', _1.builders.undefined()));
            ast.body[0].hash.pairs.push(_1.builders.pair('things', _1.builders.boolean(true)));
            ast.body[0].hash.pairs.push(_1.builders.pair('go', _1.builders.number(42)));
            ast.body[0].hash.pairs.push(_1.builders.pair('here', _1.builders.boolean(false)));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        {{foo-bar
          first=thing
          some=null
          other=undefined
          things=true
          go=42
          here=false
        }}`);
        });
        test('creating new MustacheStatement with single param has correct whitespace', function () {
            let ast = _1.parse('');
            ast.body.push(_1.builders.mustache('foo', [_1.builders.string('hi')]));
            expect(_1.print(ast)).toEqual(`{{foo "hi"}}`);
        });
        test('copying params and hash from a sub expression into a new MustacheStatement has correct whitespace', function () {
            let ast = _1.parse('{{some-helper (foo "hi")}}');
            let mustache = ast.body[0];
            let sexpr = mustache.params[0];
            ast.body.push(_1.builders.mustache(sexpr.path, sexpr.params, sexpr.hash));
            expect(_1.print(ast)).toEqual(`{{some-helper (foo "hi")}}{{foo "hi"}}`);
        });
    });
    describe('SubExpression', function () {
        test('rename path', function () {
            let template = common_tags_1.stripIndent `
        {{foo-bar
          baz=(stuff
            goes='here')
        }}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].value.path = _1.builders.path('zomg');
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        {{foo-bar
          baz=(zomg
            goes='here')
        }}`);
        });
        test('can add param', function () {
            let template = common_tags_1.stripIndent `
        {{foo-bar
          baz=(stuff
            goes='here')
        }}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].value.params.push(_1.builders.path('zomg'));
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        {{foo-bar
          baz=(stuff
            zomg
            goes='here')
        }}`);
        });
        test('can remove param', function () {
            let template = common_tags_1.stripIndent `
        {{foo-bar
          baz=(stuff
            hhaahahaha
            goes='here')
        }}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].value.params.pop();
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        {{foo-bar
          baz=(stuff
            goes='here')
        }}`);
        });
        test('replacing empty hash pair', function () {
            let template = common_tags_1.stripIndent `
        {{foo-bar
          baz=(stuff)
        }}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].value.hash = _1.builders.hash([
                _1.builders.pair('hello', _1.builders.string('world')),
            ]);
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `{{foo-bar\n  baz=(stuff hello="world")\n}}`);
        });
    });
    describe('BlockStatement', function () {
        test('rename block component', function () {
            let template = common_tags_1.stripIndent `
      {{#foo-bar
        baz="stuff"
      }}
        <div data-foo='single quoted'>
          </div>
      {{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].path = _1.builders.path('baz-derp');
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      {{#baz-derp
        baz="stuff"
      }}
        <div data-foo='single quoted'>
          </div>
      {{/baz-derp}}`);
        });
        test('rename block component from longer to shorter name', function () {
            let template = common_tags_1.stripIndent `
      {{#this-is-a-long-name
        hello="world"
      }}
        <div data-foo='single quoted'>
          </div>
      {{/this-is-a-long-name}}{{someInlineComponent hello="world"}}`;
            let ast = _1.parse(template);
            ast.body[0].path = _1.builders.path('baz-derp');
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      {{#baz-derp
        hello="world"
      }}
        <div data-foo='single quoted'>
          </div>
      {{/baz-derp}}{{someInlineComponent hello="world"}}`);
        });
        test('replacing a previously empty hash', function () {
            let template = `{{#foo-bar}}Hi there!{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].hash = _1.builders.hash([_1.builders.pair('hello', _1.builders.string('world'))]);
            expect(_1.print(ast)).toEqual('{{#foo-bar hello="world"}}Hi there!{{/foo-bar}}');
        });
        test('adding multiple HashPair to previously empty hash', function () {
            let template = '{{#foo-bar}}Hi there!{{/foo-bar}}{{baz}}';
            let ast = _1.parse(template);
            ast.body[0].hash.pairs.push(_1.builders.pair('hello', _1.builders.string('world')));
            ast.body[0].hash.pairs.push(_1.builders.pair('foo', _1.builders.string('bar')));
            expect(_1.print(ast)).toEqual('{{#foo-bar hello="world" foo="bar"}}Hi there!{{/foo-bar}}{{baz}}');
        });
        test('replacing empty hash w/ block params works', function () {
            let template = `{{#foo-bar as |a b c|}}Hi there!{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].hash = _1.builders.hash([_1.builders.pair('hello', _1.builders.string('world'))]);
            expect(_1.print(ast)).toEqual('{{#foo-bar hello="world" as |a b c|}}Hi there!{{/foo-bar}}');
        });
        test('adding new HashPair to an empty hash w/ block params works', function () {
            let template = `{{#foo-bar as |a b c|}}Hi there!{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs.push(_1.builders.pair('hello', _1.builders.string('world')));
            expect(_1.print(ast)).toEqual('{{#foo-bar hello="world" as |a b c|}}Hi there!{{/foo-bar}}');
        });
        test('changing a HashPair key with a StringLiteral value (GH#112)', function () {
            let template = `{{#foo-bar foo="some thing with a space"}}Hi there!{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].key = 'bar';
            expect(_1.print(ast)).toEqual('{{#foo-bar bar="some thing with a space"}}Hi there!{{/foo-bar}}');
        });
        test('changing a HashPair key with a SubExpression value (GH#112)', function () {
            let template = `{{#foo-bar foo=(helper-here this.arg1 this.arg2)}}Hi there!{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].key = 'bar';
            expect(_1.print(ast)).toEqual('{{#foo-bar bar=(helper-here this.arg1 this.arg2)}}Hi there!{{/foo-bar}}');
        });
        test('changing a HashPair value from StringLiteral to SubExpression', function () {
            let template = `{{#foo-bar foo="bar!"}}Hi there!{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].value = _1.builders.sexpr('concat', [
                _1.builders.string('hello'),
                _1.builders.string('world'),
            ]);
            expect(_1.print(ast)).toEqual('{{#foo-bar foo=(concat "hello" "world")}}Hi there!{{/foo-bar}}');
        });
        test('changing a HashPair value from SubExpression to StringLiteral', function () {
            let template = `{{#foo-bar foo=(concat "hello" "world")}}Hi there!{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].value = _1.builders.string('hello world!');
            expect(_1.print(ast)).toEqual('{{#foo-bar foo="hello world!"}}Hi there!{{/foo-bar}}');
        });
        test('adding param with no params or hash', function () {
            let template = `{{#foo-bar}}Hi there!{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].params.push(_1.builders.path('this.foo'));
            expect(_1.print(ast)).toEqual('{{#foo-bar this.foo}}Hi there!{{/foo-bar}}');
        });
        test('adding param with empty program', function () {
            let template = `{{#foo-bar}}{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].params.push(_1.builders.path('this.foo'));
            expect(_1.print(ast)).toEqual('{{#foo-bar this.foo}}{{/foo-bar}}');
        });
        test('adding param with existing params', function () {
            let template = `{{#foo-bar this.first}}Hi there!{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].params.push(_1.builders.path('this.foo'));
            expect(_1.print(ast)).toEqual('{{#foo-bar this.first this.foo}}Hi there!{{/foo-bar}}');
        });
        test('adding param with existing params infers indentation from existing params', function () {
            let template = `{{#foo-bar \n   \nthis.first}}Hi there!{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].params.push(_1.builders.path('this.foo'));
            expect(_1.print(ast)).toEqual('{{#foo-bar \n   \nthis.first \n   \nthis.foo}}Hi there!{{/foo-bar}}');
        });
        test('adding child to end of program', function () {
            let template = `{{#foo-bar}}Hello{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].program.body.push(_1.builders.text(' world!'));
            expect(_1.print(ast)).toEqual('{{#foo-bar}}Hello world!{{/foo-bar}}');
        });
        test('adding child to beginning of program', function () {
            let template = `{{#foo-bar}}Hello{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].program.body.unshift(_1.builders.text('ZOMG! '));
            expect(_1.print(ast)).toEqual('{{#foo-bar}}ZOMG! Hello{{/foo-bar}}');
        });
        test('adding child to end of inverse', function () {
            let template = `{{#foo-bar}}{{else}}Hello{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].inverse.body.push(_1.builders.text(' world!'));
            expect(_1.print(ast)).toEqual('{{#foo-bar}}{{else}}Hello world!{{/foo-bar}}');
        });
        test('adding child to beginning of inverse', function () {
            let template = `{{#foo-bar}}{{else}}Hello{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].inverse.body.unshift(_1.builders.text('ZOMG! '));
            expect(_1.print(ast)).toEqual('{{#foo-bar}}{{else}}ZOMG! Hello{{/foo-bar}}');
        });
        test('adding child to end of inverse preserves whitespace and whitespace control when program is also present', function () {
            let template = `{{#foo-bar}}Goodbye\n  {{~ else ~}} Hello{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].inverse.body.push(_1.builders.text(' world!'));
            expect(_1.print(ast)).toEqual('{{#foo-bar}}Goodbye\n  {{~ else ~}} Hello world!{{/foo-bar}}');
        });
        test('adding child to end of inverse preserves whitespace and whitespace control', function () {
            let template = `{{#foo-bar}}{{~ else ~}}Hello{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].inverse.body.push(_1.builders.text(' world!'));
            expect(_1.print(ast)).toEqual('{{#foo-bar}}{{~ else ~}}Hello world!{{/foo-bar}}');
        });
        test('add child in an {{else if foo}} chain', function () {
            let template = `{{#if foo}}{{else if baz}}Hello{{/if}}`;
            let ast = _1.parse(template);
            ast.body[0].inverse.body[0].program.body.push(_1.builders.text(' world!'));
            expect(_1.print(ast)).toEqual('{{#if foo}}{{else if baz}}Hello world!{{/if}}');
        });
        test('adding an inverse', function () {
            let template = `{{#foo-bar}}{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].inverse = _1.builders.blockItself([_1.builders.text('ZOMG!')]);
            expect(_1.print(ast)).toEqual('{{#foo-bar}}{{else}}ZOMG!{{/foo-bar}}');
        });
        test('removing an inverse', function () {
            let template = `{{#foo-bar}}Goodbye{{else}}Hello{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].inverse = null;
            expect(_1.print(ast)).toEqual('{{#foo-bar}}Goodbye{{/foo-bar}}');
        });
        test('annotating an "else if" node', function () {
            let template = '{{#if foo}}{{else if bar}}{{else}}{{/if}}';
            let ast = _1.parse(template);
            ast.body[0].inverse.body[0]._isElseIfBlock = true;
            expect(_1.print(ast)).toEqual('{{#if foo}}{{else if bar}}{{else}}{{/if}}');
        });
        test('add block param (when none existed)', function () {
            let template = `{{#foo-bar}}{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].program.blockParams.push('foo');
            expect(_1.print(ast)).toEqual('{{#foo-bar as |foo|}}{{/foo-bar}}');
        });
        test('remove only block param', function () {
            let template = `{{#foo-bar as |a|}}{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].program.blockParams.pop();
            expect(_1.print(ast)).toEqual('{{#foo-bar}}{{/foo-bar}}');
        });
        test('remove one block param of many', function () {
            let template = `{{#foo-bar as |a b|}}{{/foo-bar}}`;
            let ast = _1.parse(template);
            ast.body[0].program.blockParams.pop();
            expect(_1.print(ast)).toEqual('{{#foo-bar as |a|}}{{/foo-bar}}');
        });
        test('remove one block param of many preserves custom whitespace', function () {
            let template = common_tags_1.stripIndent `
        {{#foo-bar
          as |a b|
        }}
        {{/foo-bar}}
      `;
            let ast = _1.parse(template);
            ast.body[0].program.blockParams.pop();
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      {{#foo-bar
        as |a|
      }}
      {{/foo-bar}}
      `);
        });
        test('remove only block param preserves custom whitespace', function () {
            let template = common_tags_1.stripIndent `
        {{#foo-bar
          some=thing
          as |a|
        }}
        {{/foo-bar}}
      `;
            let ast = _1.parse(template);
            ast.body[0].program.blockParams.pop();
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
      {{#foo-bar
        some=thing
      }}
      {{/foo-bar}}
      `);
        });
    });
    describe('AttrNode', function () {
        test('updating value', function () {
            let template = '<Foo bar={{foo}} />';
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.path.original = 'bar';
            expect(_1.print(ast)).toEqual('<Foo bar={{bar}} />');
        });
        test('updating concat statement value', function () {
            let template = '<Foo class="{{foo}} static {{bar}}" />';
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.parts.push(_1.builders.text(' other-static'));
            expect(_1.print(ast)).toEqual('<Foo class="{{foo}} static {{bar}} other-static" />');
        });
        test('updating value from non-quotable to TextNode (GH#111)', function () {
            let template = '<Foo bar={{foo}} />';
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value = _1.builders.text('hello!');
            expect(_1.print(ast)).toEqual('<Foo bar="hello!" />');
        });
        test('updating value from non-quotable to ConcatStatement (GH#111)', function () {
            let template = '<Foo bar={{foo}} />';
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value = _1.builders.concat([
                _1.builders.mustache('foo'),
                _1.builders.text(' static '),
                _1.builders.mustache('bar'),
            ]);
            expect(_1.print(ast)).toEqual('<Foo bar="{{foo}} static {{bar}}" />');
        });
        test('can determine if an AttrNode was valueless (required by ember-template-lint)', function () {
            expect(_1.parse(`<Foo bar={{foo}} />`).body[0].attributes[0].isValueless).toBe(false);
            expect(_1.parse(`<Foo bar="foo {{bar}}" />`).body[0].attributes[0].isValueless).toBe(false);
            expect(_1.parse(`<Foo bar='foo {{bar}}' />`).body[0].attributes[0].isValueless).toBe(false);
            expect(_1.parse(`<Foo bar="foo" />`).body[0].attributes[0].isValueless).toBe(false);
            expect(_1.parse(`<Foo bar='foo' />`).body[0].attributes[0].isValueless).toBe(false);
            expect(_1.parse(`<Foo bar=foo />`).body[0].attributes[0].isValueless).toBe(false);
            expect(_1.parse(`<Foo bar />`).body[0].attributes[0].isValueless).toBe(true);
        });
        test('can determine type of quotes used from AST (required by ember-template-lint)', function () {
            expect(_1.parse(`<Foo bar={{foo}} />`).body[0].attributes[0].quoteType).toBe(null);
            expect(_1.parse(`<Foo bar="foo {{bar}}" />`).body[0].attributes[0].quoteType).toBe(`"`);
            expect(_1.parse(`<Foo bar='foo {{bar}}' />`).body[0].attributes[0].quoteType).toBe(`'`);
            expect(_1.parse(`<Foo bar="foo" />`).body[0].attributes[0].quoteType).toBe(`"`);
            expect(_1.parse(`<Foo bar='foo' />`).body[0].attributes[0].quoteType).toBe(`'`);
            expect(_1.parse(`<Foo bar=foo />`).body[0].attributes[0].quoteType).toBe(null);
            expect(_1.parse(`<Foo bar />`).body[0].attributes[0].quoteType).toBe(null);
        });
        test('renaming valueless attribute', function () {
            let template = '<Foo data-bar />';
            let ast = _1.parse(template);
            ast.body[0].attributes[0].name = 'data-foo';
            expect(_1.print(ast)).toEqual('<Foo data-foo />');
        });
        test('mutations retain custom whitespace formatting', function () {
            let template = common_tags_1.stripIndent `
        <Foo 
          bar = {{ foo }} />
      `;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.path.original = 'bar';
            expect(_1.print(ast)).toEqual('<Foo \n  bar = {{ bar }} />');
        });
        test('mutations retain textarea whitespace formatting', function () {
            let template = common_tags_1.stripIndent `
        <textarea name="foo">
        </textarea>
      `;
            let ast = _1.parse(template);
            let element = ast.body[0];
            let attrNode = element.attributes[0];
            let attrValue = attrNode.value;
            attrValue.chars = 'bar';
            expect(_1.print(ast)).toEqual(common_tags_1.stripIndent `
        <textarea name="bar">
        </textarea>
      `);
        });
        test('quotes are preserved when updated a TextNode value (double quote)', function () {
            let template = `<div class="lol"></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.chars = 'hahah';
            expect(_1.print(ast)).toEqual('<div class="hahah"></div>');
        });
        test('quotes are preserved when updated a TextNode value (single quote)', function () {
            let template = `<div class='lol'></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.chars = 'hahah';
            expect(_1.print(ast)).toEqual(`<div class='hahah'></div>`);
        });
        test('can update a quoteless attribute value', function () {
            let template = `<div class=wat></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.chars = 'zomgyasss';
            expect(_1.print(ast)).toEqual('<div class=zomgyasss></div>');
        });
        test('quotes are preserved when updating a ConcatStatement value', function () {
            let template = `<div class="lol {{foo}}"></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.parts[0].chars = 'hahah ';
            expect(_1.print(ast)).toEqual('<div class="hahah {{foo}}"></div>');
        });
        test('quotes are preserved when updating an AttrNode name - issue #319', function () {
            let template = '<div @class="{{if foo "bar"}} baz" />';
            let ast = _1.parse(template);
            ast.body[0].attributes[0].name = 'class';
            expect(_1.print(ast)).toEqual('<div class="{{if foo "bar"}} baz" />');
        });
    });
    describe('HashPair', function () {
        test('mutations', function () {
            let template = '{{foo-bar bar=foo}}';
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].value.original = 'bar';
            expect(_1.print(ast)).toEqual('{{foo-bar bar=bar}}');
        });
        test('mutations retain formatting', function () {
            let template = '{{foo-bar   bar= foo}}';
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].value.original = 'bar';
            expect(_1.print(ast)).toEqual('{{foo-bar   bar= bar}}');
        });
    });
    test('can remove during traversal by returning `null`', function () {
        let template = common_tags_1.stripIndent `
    <p>here is some multiline string</p>
    {{ other-stuff }}
    `;
        let { code } = _1.transform(template, () => {
            return {
                ElementNode() {
                    return null;
                },
            };
        });
        expect(code).toEqual('\n{{ other-stuff }}');
    });
    test('can replace with many items during traversal by returning an array', function () {
        let template = common_tags_1.stripIndent `
    <p>here is some multiline string</p>
    {{other-stuff}}
    `;
        let { code } = _1.transform(template, (env) => {
            let { builders: b } = env.syntax;
            return {
                ElementNode() {
                    return [b.text('hello '), b.text('world')];
                },
            };
        });
        expect(code).toEqual('hello world\n{{other-stuff}}');
    });
    describe('MustacheCommentStatement', function () {
        test('can be updated', function () {
            let template = `<div {{!-- something here --}}></div>`;
            let ast = _1.parse(template);
            ast.body[0].comments[0].value = ' otherthing ';
            expect(_1.print(ast)).toEqual(`<div {{!-- otherthing --}}></div>`);
        });
        test('comments without `--` are preserved', function () {
            let template = `<div {{! something here }}></div>`;
            let ast = _1.parse(template);
            ast.body[0].comments[0].value = ' otherthing ';
            expect(_1.print(ast)).toEqual(`<div {{! otherthing }}></div>`);
        });
    });
    describe('ElementModifierStatement', function () {
        test('can be updated', function () {
            let template = `<div {{thing 'foo'}}></div>`;
            let ast = _1.parse(template);
            ast.body[0].modifiers[0].path.original = 'other';
            expect(_1.print(ast)).toEqual(`<div {{other 'foo'}}></div>`);
        });
    });
    describe('CommentStatement', function () {
        test('can be updated', function () {
            let template = `<!-- something -->`;
            let ast = _1.parse(template);
            ast.body[0].value = ' otherthing ';
            expect(_1.print(ast)).toEqual(`<!-- otherthing -->`);
        });
    });
    describe('ConcatStatement', function () {
        test('can add parts', function () {
            let template = `<div class="foo {{bar}}"></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.parts.push(_1.builders.text(' baz'));
            expect(_1.print(ast)).toEqual(`<div class="foo {{bar}} baz"></div>`);
        });
        test('preserves quote style', function () {
            let template = `<div class='foo {{bar}}'></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.parts.push(_1.builders.text(' baz'));
            expect(_1.print(ast)).toEqual(`<div class='foo {{bar}} baz'></div>`);
        });
        test('updating parts preserves custom whitespace', function () {
            let template = `<div class="foo {{\nbar\n}}"></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.parts.push(_1.builders.text(' baz'));
            expect(_1.print(ast)).toEqual(`<div class="foo {{\nbar\n}} baz"></div>`);
        });
    });
    describe('StringLiteral', function () {
        test('can be updated', function () {
            let template = `{{foo "blah"}}`;
            let ast = _1.parse(template);
            ast.body[0].params[0].value = 'derp';
            expect(_1.print(ast)).toEqual(`{{foo "derp"}}`);
        });
    });
    describe('NumberLiteral', function () {
        test('can be updated', function () {
            let template = `{{foo 42}}`;
            let ast = _1.parse(template);
            ast.body[0].params[0].value = 0;
            expect(_1.print(ast)).toEqual(`{{foo 0}}`);
        });
    });
    describe('BooleanLiteral', function () {
        test('can be updated in MustacheStatement .path position', function () {
            let template = `{{true}}`;
            let ast = _1.parse(template);
            ast.body[0].path.value = false;
            expect(_1.print(ast)).toEqual(`{{false}}`);
        });
        test('can be updated in MustacheStatement .hash position', function () {
            let template = `{{foo thing=true}}`;
            let ast = _1.parse(template);
            ast.body[0].hash.pairs[0].value.value = false;
            expect(_1.print(ast)).toEqual(`{{foo thing=false}}`);
        });
    });
    describe('TextNode', function () {
        test('can be updated', function () {
            let template = `Foo`;
            let ast = _1.parse(template);
            ast.body[0].chars = 'Bar';
            expect(_1.print(ast)).toEqual('Bar');
        });
        test('can be updated as value of AttrNode', function () {
            let template = `<div class="lol"></div>`;
            let ast = _1.parse(template);
            ast.body[0].attributes[0].value.chars = 'hahah';
            expect(_1.print(ast)).toEqual('<div class="hahah"></div>');
        });
        test('an AttrNode values quotes are removed when inserted in alternate positions (e.g. content)', function () {
            let template = `<div class="lol"></div>`;
            let ast = _1.parse(template);
            let text = ast.body[0].attributes[0].value;
            ast.body[0].children.push(text);
            expect(_1.print(ast)).toEqual('<div class="lol">lol</div>');
        });
    });
});
//# sourceMappingURL=parse-result.test.js.map