/* eslint-disable require-jsdoc, no-invalid-this*/

import {
  get_all_docblocks,
  find_init2,
  get_init,
  get_def,
  extract_parameters
} from "./docblock-python";

function formatLint(msg_pos, par_name, par_type, editorPath) {
  let type_text;
  if (par_type === "attr") {
    type_text = "attribute";
  } else {
    type_text = "parameter";
  }
  return {
    severity: "warning",
    location: {
      file: editorPath,
      position: msg_pos
    },
    excerpt: `Missing documentation for ${type_text} ${par_name}`,
    icon: "book"
  };
}

function getStyledParam(par) {
  let style = atom.config.get("docblock-python.style");
  let to_match;
  switch (style) {
    case "numpy":
      to_match = `${par} :`;
      break;
    case "google":
      to_match = `    ${par}`;
      break;
    case "sphinx":
      to_match = `${par}:`;
      break;
    case "epytext":
      to_match = `@param    ${par}:`;
      break;
  }
  return to_match;
}

function lint_def(block) {
  let params = extract_parameters(block.def);
  let missing = [];
  let to_match;
  params.parameters.map(par => {
    to_match = getStyledParam(par).replace("*", "\\*");
    let match = block.docblock.match(to_match);
    if (match) {
    } else {
      let regex_pattern = `${par}(?=(,|:|=|\\)))`;
      regex_pattern = regex_pattern.replace("*", "\\*");
      let par_regex = new RegExp(regex_pattern);
      let par_pos = JSON.parse(JSON.stringify(block.def_pos));
      let par_row_offset = 0;
      let par_indent = block.def_pos.column;
      let par_col = block.def.match(par_regex).index + par_indent;
      if (block.def_lines > 0) {
        let def_chunks = block.def.split("\n");
        let in_line = def_chunks
          .map(x => x.match(par_regex) !== null)
          .indexOf(true);
        par_row_offset = in_line;
        par_col = def_chunks[in_line].match(par_regex).index;
      }
      par_pos.row = par_pos.row + par_row_offset;
      par_pos.column = par_col;
      let par_pos_end = JSON.parse(JSON.stringify(par_pos));
      par_pos_end.column = par_pos_end.column + par.length;
      let data = { pos: [par_pos, par_pos_end], par: par, type: "par" };
      missing.push(data);
    }
  });
  return missing;
}

function get_class_init(block) {
  let editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    let init_pos = find_init2(block.pos_end);
    let attributes = get_init(init_pos);
    attributes = attributes.match(/self.\w+/g);
    if (!attributes) {
      attributes = [];
    }
    attributes = attributes.map(x => x.replace("self.", ""));
    let init_def = get_def(init_pos, 0);
    if (Object.keys(init_def).length === 0) {
      return {};
    }
    let data = {
      docblock: block.docblock,
      def: init_def.def[0],
      def_pos: init_def.pos
    };
    return data;
  }
}

function get_missing_attr(block) {
  let editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    let init_pos = find_init2(block.pos_end);
    init_pos.row = init_pos.row + 1;
    let attributes = get_init(init_pos);
    attributes = attributes.match(/self.\w+/g);
    if (!attributes) {
      attributes = [];
    }
    attributes = attributes.map(x => x.replace("self.", ""));

    let missing = [];
    let to_match;
    attributes.map(par => {
      to_match = getStyledParam(par);
      let match = block.docblock.match(to_match);
      if (match) {
      } else {
        let attr_regex = new RegExp(`self.${par}`);

        let init_pos = find_init2(block.pos_end);
        init_pos.row = init_pos.row + 1;
        let finding_line = true;
        let i = 0;
        let last_match;
        while (finding_line) {
          let line_text = editor.lineTextForBufferRow(init_pos.row + i);
          last_match = line_text.match(attr_regex);
          if (last_match) {
            finding_line = false;
          } else {
            i = i + 1;
          }
        }
        let par_pos = {
          row: init_pos.row + i,
          column: last_match.index + 5
        };
        let par_pos_end = {
          row: init_pos.row + i,
          column: last_match.index + 5 + par.length
        };
        let data = { pos: [par_pos, par_pos_end], par: par, type: "attr" };
        missing.push(data);
      }
    });
    return missing;
  }
}

function lint_docblocks() {
  let lint_enabled = atom.config.get("docblock-python.lint");
  if (!lint_enabled) {
    return [];
  }
  let editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    let allBlocks = get_all_docblocks();
    let missing_par = [];
    if (allBlocks.length > 0) {
      let that = this;
      allBlocks.map(x => {
        if (x.def.match("class")) {
          let class_init = get_class_init(x);
          if (Object.keys(class_init || {}).length === 0) {
            return;
          }
          let data = that.lint_def(class_init);
          missing_par.push(data);
          data = get_missing_attr(x);
          missing_par.push(data);
        } else {
          let data = that.lint_def(x);
          missing_par.push(data);
        }
      });
    }
    return [].concat(...missing_par);
  }
}

export {
  formatLint,
  lint_def,
  get_class_init,
  get_missing_attr,
  lint_docblocks,
  getStyledParam
};
