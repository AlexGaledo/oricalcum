import { describe, expect, it } from "vitest";
import { detectCodeLanguage, escapeCodeHtml, looksLikeMarkdown, tryPrettyPrintJson } from "./markdown";

describe("detectCodeLanguage", () => {
  it("returns json for a valid JSON object", () => {
    expect(detectCodeLanguage('{"key": "value"}')).toBe("json");
  });

  it("returns json for a valid JSON array", () => {
    expect(detectCodeLanguage('[{"a": 1}, {"b": 2}]')).toBe("json");
  });

  it("returns json for the example dictionary entry array", () => {
    const sample = `[{"entry_id":"00047c3c-5866-52d8-89b5-95a2b19930e3","word":"sanga"}]`;
    expect(detectCodeLanguage(sample)).toBe("json");
  });

  it("returns null for plain text", () => {
    expect(detectCodeLanguage("just some notes")).toBeNull();
  });

  it("returns null for markdown", () => {
    expect(detectCodeLanguage("# Heading\n\nSome paragraph")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(detectCodeLanguage('{"unclosed": ')).toBeNull();
  });
});

describe("tryPrettyPrintJson", () => {
  it("pretty-prints compact JSON", () => {
    expect(tryPrettyPrintJson('{"a":1,"b":2}')).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it("returns original text when not valid JSON", () => {
    expect(tryPrettyPrintJson("not json")).toBe("not json");
  });
});

describe("escapeCodeHtml", () => {
  it("leaves quotes alone so code stays readable", () => {
    expect(escapeCodeHtml('{"related_forms": []}')).toBe('{"related_forms": []}');
  });

  it("escapes angle brackets and ampersands", () => {
    expect(escapeCodeHtml("if (x < 0 && y > 1)")).toBe("if (x &lt; 0 &amp;&amp; y &gt; 1)");
  });
});

describe("looksLikeMarkdown", () => {
  it("detects triple-backtick code fences", () => {
    expect(looksLikeMarkdown("```json\n{}\n```")).toBe(true);
  });

  it("does not treat plain JSON as markdown", () => {
    expect(looksLikeMarkdown('{"a": 1}')).toBe(false);
  });
});
