'use babel';
/* Functions that format lines in a common python docstring style */

/**
 * The keyword arguments passed to all line-styling functions
 * @typedef StyleOptions
 * @property  {String}  [name='']  name of the parameter
 * @property  {String}  [tabs=' '] the tab character
 * @property  {Number}  [tab_length=4] number of tab characters to use
 * @property  {Boolean} [use_defaults=true]
 * @property  {String}  [default_value=''] what default value to describe
 * @property  {Boolean} [default_desc_text=true] whether to use the default text
 * @property  {Boolean} [use_types=true] whether to include detected type hints
 * @property  {String}  [arg_type=''] the detected type hints
 * @property  {String}  [type=''] pretty much the same as arg_type
 */

/**
 * [numpy description]
 * @param  {StyleOptions} styleOpts
 * @return {[type]}                           [description]
 */
export function numpy({
  arg_type = '',
  default_desc_text = true,
  default_value = '',
  name = '',
  tab_length = 4,
  tabs = ' ',
  type = '',
  use_defaults = true,
  use_types = true,
}) {
  let diagnostics = JSON.stringify({tabs, tab_length});
  tabs = (tabs || ' ').repeat(tab_length || 2);
  return [
    diagnostics,
    `${tabs}${name} :`, (use_types) ? ` ${arg_type}` : '', '\n',
    `${tabs}    `,
    (default_desc_text) ? `Description of ${type} \`${name}\`` : '',
    (use_defaults && default_value) ? ` (the default is ${default_value})` : '',
    '.',
  ].join('');
}

/**
 * [google description]
 * @param {StyleOptions} styleOpts
 * @return {[type]}                   [description]
 */
export function google({
  arg_type = '',
  default_desc_text = true,
  default_value = '',
  name = '',
  tab_length = 4,
  tabs = ' ',
  type = '',
  use_defaults = true,
  use_types = true,
}) {
  return [
    `${tabs}    ${name}`,
    (use_types) ? ` (${arg_type}): ` : ': ',
    (default_desc_text) ? `Description of parameter \`${name}\`` : '',
    (use_defaults && default_value) ? `. Defaults to ${default_value}` : '',
    '.',
  ].join('');
}

/**
 * [sphinx description]
 * @param {StyleOptions} styleOpts
 * @return {[type]}                   [description]
 */
export function sphinx({
  arg_type = '',
  default_desc_text = true,
  default_value = '',
  name = '',
  tab_length = 4,
  tabs = ' ',
  type = '',
  use_defaults = true,
  use_types = true,
}) {
  if (separate_types && use_types) {
    return [
      `${tabs}`,
      (type == 'parameter') ? ':param' : ':attr',
      ` ${name}: `,
      (default_desc_text) ? `Description of parameter \`${name}\`` : '',
      (use_defaults && default_value) ? `. Defaults to ${default_value}` : '',
      '.\n',
      `${tabs}:type ${name}: ${arg_type}`,
    ].join('');
  } else {
    return [
      `${tabs}`,
      (type == 'parameter') ? ':param' : ':attr',
      (use_types) ? ` ${arg_type} ` : ' ',
      `${name}:`,
      (default_desc_text) ? ` Description of parameter \`${name}\`` : ' ',
      (use_defaults && default_value) ? `. Defaults to ${default_value}` : '',
      '.',
    ].join('');
  };
}

/**
 * [epytext description]
 * @param {StyleOptions} styleOpts
 * @return {[type]}                   [description]
 */
export function epytext({
  arg_type = '',
  default_desc_text = true,
  default_value = '',
  name = '',
  tab_length = 4,
  tabs = ' ',
  type = '',
  use_defaults = true,
  use_types = true,
}) {
  return [
    `${tabs}@param    ${name}: `,
    (default_desc_text) ? `Description of parameter \`${name}\`` : '',
    (use_defaults && default_value) ? `. Defaults to ${default_value}` : '',
    '.\n',
    `${tabs}@type:    ${arg_type}\n`,
  ].join('');
}

const styles = new Proxy(
  {numpy, google, epytext, sphinx},
  {
    get(target, style, receiver) {
      if (prop in target) return Reflect.get(target, style, receiver);
      throw new ValueError(`no style ${style} found`);
    },
  }
);

export default styles;
