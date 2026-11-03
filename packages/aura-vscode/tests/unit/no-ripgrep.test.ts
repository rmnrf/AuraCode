import { expect, test } from "bun:test"
import { isRipgrepExecutable, isRipgrepInvocation } from "../../../opencode/src/auracode/tool/avoid-ripgrep"

test("reject direct ripgrep programs with Windows and Unix paths", () => {
  for (const value of ["rg", "rg.exe", "ripgrep", "RiPgReP.ExE", "C:\\\\Tools\\\\rg.exe", "/usr/local/bin/rg", "'rg'"]) {
    expect(isRipgrepExecutable(value)).toBe(true)
  }
  for (const value of ["grep", "git", "org", "rg.txt", "my-rg", "echo"]) expect(isRipgrepExecutable(value)).toBe(false)
})

test("reject direct shell calls but allow text and unrelated search commands", () => {
  for (const tokens of [["rg", "foo"], ["ripgrep.exe", "bar"], ["&", "rg.exe", "foo"], ["sudo", "rg", "foo"]])
    expect(isRipgrepInvocation(tokens)).toBe(true)
  for (const tokens of [["echo", "rg"], ["git", "grep", "foo"], ["grep", "foo"], ["Get-ChildItem", "."], ["python", "-c", "print('rg')"]])
    expect(isRipgrepInvocation(tokens)).toBe(false)
})
