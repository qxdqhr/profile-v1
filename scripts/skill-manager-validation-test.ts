import assert from 'node:assert/strict';
import { parseSkillFrontmatter, validateSkillFrontmatter, validateSkillMarkdownContent } from '../src/modules/skillManager/services/skillMarkdown';

function run() {
  const sample = `---
name: skill-demo
description: demo description
tags: alpha,beta
---

# Title
body`;

  const parsed = parseSkillFrontmatter(sample);
  assert.equal(parsed.hasFrontmatter, true);
  assert.equal(parsed.data.name, 'skill-demo');
  assert.equal(parsed.data.description, 'demo description');
  assert.equal(parsed.data.tags, 'alpha,beta');
  assert.equal(parsed.body.includes('body'), true);

  assert.equal(validateSkillFrontmatter({ name: 'abc-123', description: 'ok', tags: '' }), null);
  assert.equal(validateSkillFrontmatter({ name: 'INVALID_NAME', description: 'ok', tags: '' }), 'frontmatter.name 需符合 ^[a-z0-9-]{1,64}$');
  assert.equal(validateSkillFrontmatter({ name: 'abc', description: '', tags: '' }), 'frontmatter.description 不能为空');

  assert.equal(validateSkillMarkdownContent(sample), null);
  assert.equal(validateSkillMarkdownContent('no frontmatter'), 'SKILL.md 必须包含合法的 frontmatter（--- 包裹）');

  const longDesc = `---
name: skill-demo
description: ${'x'.repeat(1025)}
---
body`;
  assert.equal(validateSkillMarkdownContent(longDesc), 'frontmatter.description 长度不能超过 1024');

  console.log('skill-manager validation tests passed');
}

run();

