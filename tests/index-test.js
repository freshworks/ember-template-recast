const { parse, print } = require('..');
const { builders } = require('@glimmer/syntax');
const { stripIndent } = require('common-tags');

QUnit.module('ember-template-recast', function() {
  QUnit.test('basic parse + print (no modification)', function(assert) {
    let template = stripIndent`
      {{foo-bar
        baz="stuff"
      }}`;
    let ast = parse(template);

    assert.equal(print(ast), template);
  });

  QUnit.test('basic parse -> mutation -> print', function(assert) {
    let template = stripIndent`
      {{foo-bar
        baz="stuff"
        other='single quote'
      }}`;
    let ast = parse(template);
    ast.body[0].hash.pairs[0].key = 'derp';

    assert.equal(
      print(ast),
      stripIndent`
        {{foo-bar
          derp="stuff"
          other='single quote'
        }}`
    );
  });

  QUnit.test('rename non-block component', function(assert) {
    let template = stripIndent`
      {{foo-bar
        baz="stuff"
        other='single quote'
      }}`;

    let ast = parse(template);
    ast.body[0].path = builders.path('baz-derp');

    assert.equal(
      print(ast),
      stripIndent`
        {{baz-derp
          baz="stuff"
          other='single quote'
        }}`
    );
  });

  QUnit.test('rename block component', function(assert) {
    let template = stripIndent`
      {{#foo-bar
        baz="stuff"
      }}
        <div data-foo='single quoted'>
          </div>
      {{/foo-bar}}`;

    let ast = parse(template);
    ast.body[0].path = builders.path('baz-derp');

    assert.equal(
      print(ast),
      stripIndent`
        {{#baz-derp
          baz="stuff"
        }}
          <div data-foo='single quoted'>
            </div>
        {{/baz-derp}}`
    );
  });

  QUnit.test('rename element tagname', function(assert) {
    let template = stripIndent`
      <div data-foo='single quoted'>
        </div>`;

    let ast = parse(template);
    ast.body[0].tag = 'a';

    assert.equal(
      print(ast),
      stripIndent`
        <a data-foo='single quoted'>
          </a>`
    );
  });

  QUnit.test('rename inline helper', function(assert) {
    let template = stripIndent`
      {{foo-bar
        baz=(stuff
          goes='here')
      }}`;

    let ast = parse(template);
    ast.body[0].hash.pairs[0].value.path = builders.path('zomg');

    assert.equal(
      print(ast),
      stripIndent`
        {{foo-bar
          baz=(zomg
            goes='here')
        }}`
    );
  });
});
