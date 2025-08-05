import { PluginResult } from "../types";

export class MathPlugin {
  async execute(expression: string): Promise<PluginResult> {
    try {
      // Extract mathematical expression
      const mathMatch = expression.match(/([0-9+\-*/()\s.]+)/);
      if (!mathMatch) {
        throw new Error("No valid mathematical expression found");
      }

      const mathExpression = mathMatch[1].trim();

      // Simple and safe math evaluation
      const result = this.evaluateExpression(mathExpression);

      return {
        plugin_name: "math",
        result: {
          expression: mathExpression,
          answer: result,
        },
      };
    } catch (error) {
      return {
        plugin_name: "math",
        result: null,
        error: `Math evaluation failed: ${error}`,
      };
    }
  }

  private evaluateExpression(expr: string): number {
    // Remove spaces
    expr = expr.replace(/\s/g, "");

    // Validate that expression only contains safe characters
    if (!/^[0-9+\-*/.()]+$/.test(expr)) {
      throw new Error("Invalid characters in expression");
    }

    // Simple recursive descent parser for basic math
    return this.parseExpression(expr, 0).value;
  }

  private parseExpression(
    expr: string,
    pos: number
  ): { value: number; pos: number } {
    let result = this.parseTerm(expr, pos);

    while (result.pos < expr.length) {
      const op = expr[result.pos];
      if (op !== "+" && op !== "-") break;

      const right = this.parseTerm(expr, result.pos + 1);
      result.value =
        op === "+" ? result.value + right.value : result.value - right.value;
      result.pos = right.pos;
    }

    return result;
  }

  private parseTerm(expr: string, pos: number): { value: number; pos: number } {
    let result = this.parseFactor(expr, pos);

    while (result.pos < expr.length) {
      const op = expr[result.pos];
      if (op !== "*" && op !== "/") break;

      const right = this.parseFactor(expr, result.pos + 1);
      result.value =
        op === "*" ? result.value * right.value : result.value / right.value;
      result.pos = right.pos;
    }

    return result;
  }

  private parseFactor(
    expr: string,
    pos: number
  ): { value: number; pos: number } {
    if (expr[pos] === "(") {
      const result = this.parseExpression(expr, pos + 1);
      return { value: result.value, pos: result.pos + 1 }; // Skip closing parenthesis
    }

    let numStr = "";
    while (pos < expr.length && /[0-9.]/.test(expr[pos])) {
      numStr += expr[pos++];
    }

    return { value: parseFloat(numStr), pos };
  }
}
