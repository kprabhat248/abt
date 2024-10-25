class RuleParser {
  static tokenize(ruleString) {
    // Normalize spaces and quotes
    ruleString = ruleString.replace(/\s+/g, " ").trim();

    // Add spaces around operators and parentheses for easier splitting
    ruleString = ruleString
      .replace(/([()])/g, " $1 ")
      .replace(/(AND|OR|[<>=])/g, " $1 ")
      .replace(/\s+/g, " ")
      .trim();

    // Split into tokens
    const tokens = ruleString.split(" ").filter((token) => token.length > 0);

    // Process string literals
    const processedTokens = [];
    let inString = false;
    let currentString = "";

    tokens.forEach((token) => {
      if (token.startsWith("'") && token.endsWith("'")) {
        processedTokens.push(token);
      } else if (token.startsWith("'")) {
        inString = true;
        currentString = token;
      } else if (token.endsWith("'")) {
        inString = false;
        currentString += " " + token;
        processedTokens.push(currentString);
        currentString = "";
      } else if (inString) {
        currentString += " " + token;
      } else {
        processedTokens.push(token);
      }
    });

    return processedTokens;
  }

  static isOperator(token) {
    return ["AND", "OR", ">", "<", "="].includes(token);
  }

  static getPrecedence(operator) {
    switch (operator) {
      case "AND":
        return 2;
      case "OR":
        return 1;
      case ">":
      case "<":
      case "=":
        return 3;
      default:
        return 0;
    }
  }
}

module.exports = RuleParser;
