'use babel';
/* eslint-disable no-invalid-this*/
/* eslint-disable require-jsdoc */

import {CompositeDisposable} from 'atom';
import {
  main,
  generate_docblock,
} from './utils';
import {
  formatLint,
} from './linter-docblock-python.js';

export default {
  ...main,
  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a
    // CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'docblock-python:generate_docblock': () => generate_docblock(),
      //   'docblock-python:add_section_notes': () => this.add_section_notes(),
    }));
  },
  deactivate() {
    this.subscriptions.dispose();
  },
  serialize() {
    return {};
  }
}

function provideLinter() {
  return {
    name: 'docblock-python',
    scope: 'file', // or 'project'
    lintsOnChange: true, // or true
    grammarScopes: ['source.python'],
    lint(textEditor) {
      const editorPath = textEditor.getPath();
      return new Promise(function(resolve) {
        resolve(lint_docblocks()
          .map((missing) => {
            return formatLint(
              missing.pos,
              missing.par,
              missing.type,
              editorPath
            );
          })
        );
      });
    },
  };
}


function extract_parameters(query) {
  let args = /\((.|\r|\n)*\)/.exec(query);
  if (args === null) {
    return {parameters: []};
  };
  args = args[0];
  args = args.slice(1, args.length - 1);
  let defaults = [];
  let args_list = scanArgs(args)
    .filter((x) => {
      return x.trim() !== 'self' &&
        x.trim() !== '*' &&
        x.trim().length > 0;
    })
    .map((x) => {
      let resp = x.split('=')[0].trim();
      let default_ = x.split('=')[1];
      default_ = default_ ? default_.trim() : null;
      defaults.push(default_);
      return resp;
    });
  let params = [];
  let types = [];
  args_list.map((x) => {
    let parts;
    if (x.indexOf(':') > 0) { // Normal typing
      parts = x.split(':');
      params.push(parts[0].trim());
      types.push(parts[1].trim());
    } else if (x.indexOf(' ') > 0) { // Cython typing
      parts = x.split(' ');
      params.push(parts[1].trim());
      types.push(parts[0].trim());
    } else { // No typing
      params.push(x.trim());
      types.push(null);
    }
  });

  let return_type = getFunctionReturnType(query);

  let ans = {
    parameters: params,
    types: types,
    defaults: defaults,
    label: query.replace(/\n/g, '').replace(/\s+/g, ' '),
    return_type: return_type,
  };
  return ans;
}

export function get_all_docblocks() {
  let editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    let allText = editor.getText();
    let dbRegex = new RegExp('"""([^])*?"""', 'g');
    let match = dbRegex.exec(allText);
    let allBlocks = [];
    let last_end = -1;
    while (match) {
      let start = editor.buffer.positionForCharacterIndex(match.index);
      if (atom.config.get('docblock-python.indent')) {
        start.column = start.column - this.options.tab_length;
      };
      let def = get_def({row: start.row, column: start.column}, 'up');
      if (Object.keys(def).length && last_end < def.pos.row) {
        let block = {
          docblock: match[0],
          pos_start_char: match.index,
          pos_start: start,
          pos_end_char: dbRegex.lastIndex,
          pos_end: editor.buffer.positionForCharacterIndex(dbRegex.lastIndex
            + 1),
          def: def.def[0],
          def_lines: def.def[1],
          def_pos: def.pos,
        };
        last_end = block.pos_end.row;
        allBlocks.push(block);
      };
      match = dbRegex.exec(allText);
    }
    return allBlocks;
  };
}


// export default {
//   ...main,
//   format_lines,
//   formatReturn,
//   process_dataclass,
//   get_decorators,
//   find_init,
//   find_init2,
//   get_init,
//   get_def,
//   get_all_docblocks,
//   lint_docblocks,
//   lint_def,
//   get_class_init,
//   get_missing_attr,
//   provideLinter,
//   formatLint,
//   getStyledParam,
//   process_list,
//   extract_parameters,
//   process_def,
//   get_class_vars,
//   process_class,
//   get_header,
//   scan_up,
//   scan_down,
//   get_docblock,
//   add_section_notes,
//   generate_docblock,
//   getFunctionReturnType,
//   serialize, activate, deactivate,
// };
