const Node = require("../models/node");
const RuleParser = require("../utils/parser");

class RuleEngine {
  constructor() {
    this.operators = {
      AND: (left, right) => left && right,
      OR: (left, right) => left || right,
      ">": (left, right) => Number(left) > Number(right),
      "<": (left, right) => Number(left) < Number(right),
      "=": (left, right) => String(left) === String(right),
    };
  }

  async createRule(ruleString) {
    try {
      const tokens = RuleParser.tokenize(ruleString);
      return await this._buildASTFromTokens(tokens);
    } catch (error) {
      throw new Error(`Error creating rule: ${error.message}`);
    }
  }

  async _buildASTFromTokens(tokens) {
    const output = [];
    const operators = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === "(") {
        operators.push(token);
      } else if (token === ")") {
        while (
          operators.length > 0 &&
          operators[operators.length - 1] !== "("
        ) {
          const operator = operators.pop();
          const right = output.pop();
          const left = output.pop();
          const node = await this._createOperatorNode(operator, left, right);
          output.push(node);
        }
        operators.pop();
      } else if (RuleParser.isOperator(token)) {
        while (
          operators.length > 0 &&
          operators[operators.length - 1] !== "(" &&
          RuleParser.getPrecedence(operators[operators.length - 1]) >=
            RuleParser.getPrecedence(token)
        ) {
          const operator = operators.pop();
          const right = output.pop();
          const left = output.pop();
          const node = await this._createOperatorNode(operator, left, right);
          output.push(node);
        }
        operators.push(token);
      } else {
        if (i + 2 < tokens.length && RuleParser.isOperator(tokens[i + 1])) {
          const left = await Node.create({ type: "operand", value: token });
          const operator = tokens[i + 1];
          const right = await Node.create({
            type: "operand",
            value: tokens[i + 2],
          });
          const node = await this._createOperatorNode(operator, left, right);
          output.push(node);
          i += 2;
        } else {
          const node = await Node.create({ type: "operand", value: token });
          output.push(node);
        }
      }
    }

    while (operators.length > 0) {
      const operator = operators.pop();
      const right = output.pop();
      const left = output.pop();
      const node = await this._createOperatorNode(operator, left, right);
      output.push(node);
    }

    return output[0];
  }

  async _createOperatorNode(operator, left, right) {
    return await Node.create({
      type: "operator",
      value: operator,
      left: left._id,
      right: right._id,
    });
  }

  async combineRules(rules) {
    try {
      const astNodes = await Promise.all(
        rules.map((rule) => this.createRule(rule))
      );

      let combinedAST = astNodes[0];
      for (let i = 1; i < astNodes.length; i++) {
        combinedAST = await this._combineAndOptimizeASTs(
          combinedAST,
          astNodes[i]
        );
      }

      return combinedAST;
    } catch (error) {
      throw new Error(`Error combining rules: ${error.message}`);
    }
  }

  async _combineAndOptimizeASTs(ast1, ast2) {
    const optimizedAST = await this._applyOptimizationRules(ast1, ast2);
    if (optimizedAST) {
      return optimizedAST;
    }

    return await Node.create({
      type: "operator",
      value: "AND",
      left: ast1._id,
      right: ast2._id,
    });
  }

  async _applyOptimizationRules(ast1, ast2) {
    if (
      ast1.type === "operand" &&
      ast2.type === "operand" &&
      ast1.value === ast2.value
    ) {
      return ast1;
    }

    if (
      ast1.type === "operator" &&
      ast1.value === "AND" &&
      ast2.type === "operator" &&
      ast2.value === "AND"
    ) {
      const left1 = await Node.findById(ast1.left)
        .populate("left")
        .populate("right");
      const left2 = await Node.findById(ast2.left)
        .populate("left")
        .populate("right");

      if (
        left1.type === "operand" &&
        left2.type === "operand" &&
        left1.value === left2.value
      ) {
        return left1;
      }
    }

    if (ast1.type === "operator" && ast1.value === "AND") {
      if (ast2.type === "operand" && ast2.value === true) {
        return ast1;
      }
      if (ast2.type === "operand" && ast2.value === false) {
        return ast2;
      }
    }

    if (ast1.type === "operator" && ast1.value === "OR") {
      if (ast2.type === "operand" && ast2.value === false) {
        return ast1;
      }
      if (ast2.type === "operand" && ast2.value === true) {
        return ast2;
      }
    }

    const operands = new Set();
    const checkForRedundantOperands = async (node) => {
      if (node.type === "operand") {
        if (operands.has(node.value)) {
          return true;
        }
        operands.add(node.value);
      } else if (node.type === "operator") {
        const left = await Node.findById(node.left)
          .populate("left")
          .populate("right");
        const right = await Node.findById(node.right)
          .populate("left")
          .populate("right");
        return (
          (await checkForRedundantOperands(left)) ||
          (await checkForRedundantOperands(right))
        );
      }
      return false;
    };

    if (
      (await checkForRedundantOperands(ast1)) ||
      (await checkForRedundantOperands(ast2))
    ) {
      return await Node.create({
        type: "operator",
        value: "AND",
        left: ast1._id,
        right: ast2._id,
      });
    }

    return null;
  }

  _normalizeForComparison(value) {
    if (typeof value === "string") {
      return value.replace(/['"]/g, "").toLowerCase();
    }
    return value;
  }

  evaluateRule(ast, userData) {
    try {
      if (!ast) {
        throw new Error("Invalid AST: AST is null or undefined");
      }

      if (!userData || typeof userData !== "object") {
        throw new Error("Invalid user data: must be an object");
      }

      return this._evaluateNode(ast, userData);
    } catch (error) {
      throw new Error(`Error evaluating rule: ${error.message}`);
    }
  }

  _evaluateNode(node, userData) {
    if (node.type === "operator") {
      const operator = this.operators[node.value];
      if (!operator) {
        throw new Error(`Unknown operator: ${node.value}`);
      }

      const leftResult = this._evaluateNode(node.left, userData);
      const rightResult = this._evaluateNode(node.right, userData);

      return operator(leftResult, rightResult);
    }

    if (node.type === "operand") {
      const field = node.value;
      if (!(field in userData)) {
        throw new Error(`Field "${field}" not found in user data`);
      }
      return userData[field];
    }

    if (node.type === "literal") {
      return node.value;
    }

    throw new Error(`Unknown node type: ${node.type}`);
  }
}

module.exports = RuleEngine;
