"use babel";

export default templates = {
  numpy: {
    summary: ["", '"""Short summary.\n'],
    parameters: ["\n", "Parameters\n", "----------\n"],
    attributes: ["\n", "Attributes\n", "----------\n"],
    returns: [
      "\n",
      "Returns\n",
      "-------\n",
      "type\n",
      "${tab_type}Description of returned object.\n"
    ],
    raises: [
      "\n",
      "Raises\n",
      "-------\n",
      "ExceptionName\n",
      "${tab_type}Why the exception is raised.\n"
    ],
    examples: [
      "\n",
      "Examples\n",
      "-------\n",
      "Examples should be written in doctest format, and\n",
      "should illustrate how to use the function/class.\n",
      ">>>\n"
    ],
    end: ["\n", '"""\n']
  },

  google: {
    summary: ["", '"""Short summary.\n'],
    parameters: ["\n", "Args:\n"],
    attributes: ["\n", "Attributes:\n"],
    returns: [
      "\n",
      "Returns:\n",
      "${tab_type}type: Description of returned object.\n"
    ],
    raises: [
      "\n",
      "Raises:\n",
      "${tab_type}ExceptionName: Why the exception is raised.\n"
    ],
    examples: [
      "\n",
      "Examples\n",
      "${tab_type}Examples should be written in doctest format, and\n",
      "${tab_type}should illustrate how to use the function/class.\n",
      "${tab_type}>>>\n"
    ],
    end: ["\n", '"""\n']
  },

  sphinx: {
    summary: ["", '"""Short summary.\n\n'],
    parameters: [],
    attributes: [],
    returns: [
      "",
      ":return: Description of returned object.\n",
      ":rtype: type\n"
    ],
    raises: ["", ":raises ExceptionName: Why the exception is raised.\n"],
    examples: [],
    end: ["\n", '"""\n']
  },

  epytext: {
    summary: [
      "",
      '"""\n',
      "@summary: Short summary.\n",
      "@author:  Author\n\n"
    ],
    parameters: [],
    attributes: [],
    returns: [
      "",
      "@return:  Description of returned object.\n",
      "@rtype:   type\n\n"
    ],
    raises: ["", "@raises   ExceptionName: Why the exception is raised."],
    examples: [],
    end: ["\n", '"""\n']
  }
};
