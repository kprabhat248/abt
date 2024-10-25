const RuleEngine = require("../services/ruleEngine");
const Node = require("../models/node");

const ruleEngine = new RuleEngine();

exports.createRule = async (req, res) => {
  try {
    const { ruleString } = req.body;
    const rule = await ruleEngine.createRule(ruleString);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.combineRules = async (req, res) => {
  try {
    const { rules } = req.body;
    const combinedRule = await ruleEngine.combineRules(rules);
    res.status(200).json({ success: true, data: combinedRule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.evaluateRule = async (req, res) => {
  try {
    const { ast, data } = req.body;
    console.log(ast)
    console.log(data)
    const result = await ruleEngine.evaluateRule(ast, data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getRuleByBFS = async (req, res) => {
  try {
    const { operatorId } = req.params; // The root node ID (operatorId)

    // Find the root node (rule) by its ID
    const rootNode = await Node.findById(operatorId);

    if (!rootNode) {
      return res.status(404).json({ success: false, error: "Rule not found" });
    }

    // BFS implementation using a queue
    let queue = [rootNode]; // Initialize queue with root node
    let combinedRule = ""; // To hold the final rule string

    const constructRuleString = async (node) => {
      // If the node is an operator, recursively build its left and right
      if (node.type === "operator") {
        const leftNode = await Node.findById(node.left);
        const rightNode = await Node.findById(node.right);

        // Recursively combine the left and right nodes with the current operator
        const leftRule = await constructRuleString(leftNode);
        const rightRule = await constructRuleString(rightNode);

        // Combine the left and right rules using the current operator
        return `(${leftRule} ${node.value} ${rightRule})`;
      } else {
        // If the node is an operand, just return its value
        return node.value;
      }
    };

    // Start building the rule string from the root node
    combinedRule = await constructRuleString(rootNode);

    // Return the combined rule expression
    res.status(200).json({ success: true, ruleString: combinedRule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
