# OpenSpec 默认中文与通用架构指导优化方案

## 背景

OpenSpec 当前已经能通过 `openspec/config.yaml` 注入项目上下文，也支持通过 schema 控制 `proposal -> specs -> design -> tasks` 的产物顺序。但默认提示词和模板仍以英文为主，且架构约束主要停留在 `design.md` 的一般性提醒上。

这会带来一个典型风险：AI 在局部 feature/spec 上表现很好，却可能在多个 change 之间重复实现相同基础能力、绕过已有模块边界、引入不必要的新依赖或新抽象。该问题不是某个技术场景独有，而是 AI + SDD 在复杂项目中常见的局部最优化问题。

本方案目标是把“通用架构思考”变成 OpenSpec 默认工作流的一部分，但不引入过重的新流程。

## 调研结论

行业内 SDD 与架构治理的成熟做法大致有四类：

1. **原则先行**
   GitHub Spec Kit 使用 `constitution.md` 承载项目治理原则，让后续 specification、plan、tasks、implementation 都受同一组原则约束。核心价值不是多一个文档，而是让架构原则成为每次规划时的默认上下文。

2. **WHAT/WHY 与 HOW 分离**
   SDD 中 specification 负责需求、边界和验收，technical plan/design 负责技术路线、架构决策和实现策略。这样可以避免在需求阶段过早锁死技术方案，也避免在实现阶段失去架构约束。

3. **架构决策轻量记录**
   ADR 的共识是：重要架构决策应记录 context、decision、consequence，并尽量保持短小、可追踪。它适合记录“为什么这样设计”，不适合替代每次 change 的具体 design。

4. **用 gate 和测试守住架构**
   架构原则不应只停留在提示词。设计阶段应显式检查复用、边界、复杂度、质量属性和风险；任务阶段应把关键架构约束转成可验证任务，例如 contract test、integration test、lint/static check、迁移验证、回滚验证。

参考来源：

- GitHub Spec Kit: https://github.com/github/spec-kit
- Spec-driven development notes: https://github.com/github/spec-kit/blob/main/spec-driven.md
- ADR overview: https://github.com/architecture-decision-record/architecture-decision-record
- Martin Fowler ADR: https://martinfowler.com/bliki/ArchitectureDecisionRecord.html
- arc42 architecture template: https://arc42.org/overview

## 设计目标

1. **默认中文**
   OpenSpec 生成的默认提示词、schema instructions、artifact 模板和面向用户的 workflow 指引默认使用简体中文。

2. **技术标识保持英文**
   命令、路径、schema id、artifact id、API 名称、代码标识符、JSON/YAML key、配置字段保持英文，避免影响工具解析和跨语言协作。

3. **架构指导通用化**
   架构指导不绑定任何特定技术案例。它应适用于前端、后端、CLI、服务端、数据层、基础设施、插件系统、工作流、跨仓库 workspace 等不同变更。

4. **复用优先**
   每次设计方案必须先评估现有 specs、已有 design、现有代码结构、共享模块、配置机制、错误处理、测试模式和部署约束，再决定是否新增抽象或基础设施。

5. **轻量嵌入现有 OpenSpec**
   不新增强制性的三层 spec 体系，不引入 `architecture.md` 作为默认硬依赖。优先复用现有 `proposal / specs / design / tasks` 和 skill references。

6. **可验证**
   架构约束最终要能落到任务和测试中。提示词负责提醒，design 负责记录决策，tasks 负责把关键约束变成检查项。

## 非目标

1. 不为某个单一场景设计专用架构规则。
2. 不默认强制所有项目维护大型全局架构文档。
3. 不默认依赖 Cursor、Claude Code、Codex 等某个工具的私有规则文件。
4. 不把所有小改动都升级为重型架构评审。
5. 不改变 OpenSpec 的核心 artifact 流程和 archive 模型。

## 通用架构指导思想

计划在 OpenSpec skill 的 `references/architecture-guidance.md` 中沉淀以下通用规则。

### 1. 先理解现状

在提出设计方案前，默认完成以下检查：

- 阅读相关 `openspec/specs/` 中的现有能力定义。
- 阅读当前 change 的 `proposal.md` 和已存在的依赖 artifact。
- 查找相关模块、公共工具、适配器、服务、配置、测试和文档。
- 确认是否已有类似能力、相似接口、共享基础设施或既定模式。
- 如果是 workspace planning，先识别受影响 area/repo，避免在未确认编辑边界前设计 repo-local 实现。

### 2. 优先复用和延展已有设计

默认优先级：

1. 复用已有能力或接口。
2. 在已有模块边界内扩展。
3. 提取小而清晰的共享能力。
4. 新增跨模块基础设施。
5. 引入新依赖、新服务、新存储或新协议。

越靠后的选择，越需要在 `design.md` 中说明理由、替代方案、风险、验证方式和回滚方式。

### 3. 明确边界和所有权

设计方案必须回答：

- 这个变更属于哪个 capability、module、service、package 或 workspace area？
- 哪些能力是业务层职责，哪些能力是基础设施职责？
- 哪些 API/contract 会被其他模块依赖？
- 新增状态、缓存、连接、队列、任务、文件、配置或数据模型由谁拥有？
- 失败、重试、取消、超时、权限、并发和资源释放由哪一层负责？

### 4. 控制复杂度

新增抽象前必须说明：

- 它解决的是当前真实复杂度，还是 speculative future-proofing？
- 是否可以用现有框架能力或现有 helper 直接完成？
- 是否引入了额外生命周期、状态同步、并发、迁移或部署风险？
- 如果新增公共能力，是否有最小 API 面和清晰的扩展点？

### 5. 评估质量属性

重要设计默认评估以下质量属性：

- 安全：鉴权、授权、数据暴露、敏感配置、输入校验。
- 可靠性：失败模式、重试、幂等、降级、恢复。
- 性能：关键路径、资源占用、缓存、批处理、并发。
- 可维护性：模块边界、命名、重复、抽象层级、可读性。
- 可观测性：日志、指标、trace、错误定位、审计。
- 可测试性：contract、integration、e2e、fixture、mock 边界。
- 可部署性：配置、迁移、兼容性、灰度、回滚。

不是每个 change 都要写长篇分析，但如果某项质量属性明显相关，必须在 design 或 tasks 中体现。

### 6. 记录关键决策

当存在多个可行方案时，`design.md` 应记录：

- 选择的方案。
- 未选择的替代方案。
- 决策理由。
- 代价和风险。
- 后续如果要改变，应如何 supersede 或迁移。

对于长期有效、跨多个 change 的决策，可以在项目自己的 docs 或 ADR 目录中沉淀；OpenSpec 默认只提示，不强制固定目录。

### 7. 把架构约束转成验证任务

`tasks.md` 中应包含必要的架构验证项，例如：

- 增加或更新 contract/integration tests。
- 验证多个调用方共享同一公共能力，而不是重复实现。
- 增加 lint/static check，防止绕过公共入口。
- 验证迁移兼容性和回滚路径。
- 验证关键错误路径、权限路径、并发路径或资源释放路径。

## OpenSpec 落点设计

### 1. 默认中文配置

`openspec init` 新建项目时，默认生成：

```yaml
schema: spec-driven

context: |
  语言：中文（简体）
  OpenSpec 产出物默认使用简体中文撰写。
  命令、路径、代码标识符、API 名称、JSON/YAML key 保持英文。
```

已有 `openspec/config.yaml` 或 `openspec/config.yml` 不覆盖。

### 2. 内置 schema 中文化

调整内置 schema：

- `schemas/spec-driven/schema.yaml`
- `schemas/spec-driven/templates/*.md`
- `schemas/workspace-planning/schema.yaml`
- `schemas/workspace-planning/templates/*.md`

原则：

- artifact instructions 改为中文。
- 模板标题可中文化，但需要确认是否影响现有测试和文档示例。
- 规范关键字如 `ADDED Requirements`、`MODIFIED Requirements`、`REMOVED Requirements`、`RENAMED Requirements`、`Requirement`、`Scenario` 需要保持现有格式，避免 archive/validate 解析受影响。
- 技术示例中的文件路径、命令、字段名保持英文。

### 3. `proposal` 增加架构影响初筛

`proposal.md` 仍然聚焦 WHY/WHAT，不进入具体实现细节，但新增一个轻量章节或 instruction 要求：

- 识别受影响的现有 capability/spec。
- 识别候选复用点。
- 标记可能新增或修改的共享能力。
- 标记可能涉及的跨模块、跨服务、数据模型、安全、性能、迁移或部署影响。

建议模板：

```markdown
## 架构影响初筛

<!-- 说明需要复用或影响的现有模块、接口、能力、数据模型、配置、部署或测试模式。不要在这里展开具体实现，详细设计放入 design.md。 -->
```

### 4. `design` 增加强制架构评估

`design.md` 增加 `## 架构评估`，作为每次设计方案的核心检查点。

建议模板：

```markdown
## 架构评估

### 现有设计复用

<!-- 已检查并计划复用的 specs、模块、接口、服务、配置、测试模式。若无法复用，说明原因。 -->

### 边界与职责

<!-- 说明能力归属、模块边界、调用关系、数据/状态所有权。 -->

### 方案选择

<!-- 记录选择方案、替代方案、取舍和理由。 -->

### 质量属性

<!-- 按需覆盖安全、可靠性、性能、可维护性、可观测性、可测试性、可部署性。 -->

### 复杂度与例外

<!-- 如新增抽象、依赖、服务、存储、协议或跨模块基础设施，说明必要性和控制方式。 -->
```

### 5. `tasks` 关联架构验证

`tasks.md` instruction 增加：

- 从 `design.md` 的架构评估派生任务。
- 对架构显著约束添加验证任务。
- 不允许只有实现任务而没有必要的验证任务。

示例任务形态：

```markdown
- [ ] 2.3 Add contract/integration coverage for the shared boundary introduced in design.md
- [ ] 2.4 Add a regression check that prevents direct bypass of the shared infrastructure
- [ ] 2.5 Verify rollback or compatibility behavior for the changed interface
```

### 6. Skill references

扩展 skill 生成能力，让每个相关 OpenSpec Skill 可以携带 references。

建议新增共享 reference：

```text
references/architecture-guidance.md
```

推荐挂载到以下 skill：

- `openspec-propose`
- `openspec-new-change`
- `openspec-continue-change`
- `openspec-ff-change`
- `openspec-apply-change`
- `openspec-verify-change`

其中：

- propose/new/continue/ff 用于创建规划 artifact 前阅读。
- apply 用于实现时检查是否遵守 design 中的架构约束。
- verify 用于复核实现是否绕过既定架构决策。

### 7. Command prompts 的兼容策略

并非所有 slash command 都能读取 skill references。因此 command templates 中需要内嵌精简版架构检查清单：

- 生成 proposal/design/tasks 时，先检查现有 specs 和代码模式。
- 设计方案优先复用已有能力。
- 新增抽象、依赖或公共基础设施必须说明理由。
- 架构约束应转成验证任务。

### 8. Workspace planning 适配

`workspace-planning` schema 的架构指导应强调：

- linked repos/folders 在 planning 阶段默认作为只读探索上下文。
- design 关注跨 area 边界、handoff、共享约束和实施入口条件。
- 不在 workspace planning 阶段指示 agent 直接编辑 linked repo。
- 对跨 repo 共享能力，先明确 owner 和后续 repo-local OpenSpec change 的落点。

## 实施步骤

### 阶段 1：规划 artifact

创建 OpenSpec change：

```bash
openspec new change default-chinese-architecture-guidance
```

生成并 Review：

- `proposal.md`
- `specs/**/*.md`
- `design.md`
- `tasks.md`

### 阶段 2：默认中文

修改：

- `src/core/init.ts`
- `docs/multi-language.md`
- 相关 init 测试

目标：

- 新项目默认中文 context。
- 文档说明如何覆盖默认语言。
- 已有项目不被强行改写。

### 阶段 3：schema 与模板

修改：

- `schemas/spec-driven/schema.yaml`
- `schemas/spec-driven/templates/proposal.md`
- `schemas/spec-driven/templates/design.md`
- `schemas/spec-driven/templates/tasks.md`
- `schemas/workspace-planning/schema.yaml`
- `schemas/workspace-planning/templates/*.md`

目标：

- 默认中文提示。
- 保持 delta spec 解析格式不变。
- proposal/design/tasks 增加通用架构指导。

### 阶段 4：Skill references 生成机制

修改：

- `src/core/templates/types.ts`
- `src/core/shared/skill-generation.ts`
- `src/core/init.ts`
- `src/core/update.ts`
- `src/core/workspace/skills.ts`
- 相关 tests

目标：

- `SkillTemplate` 支持 references。
- 生成 `SKILL.md` 时同步生成 reference 文件。
- update/workspace update 可以刷新 managed references。
- 不删除用户自定义非 managed 文件。

### 阶段 5：Workflow skill/command 中文化与架构接入

修改：

- `src/core/templates/workflows/propose.ts`
- `src/core/templates/workflows/new-change.ts`
- `src/core/templates/workflows/continue-change.ts`
- `src/core/templates/workflows/ff-change.ts`
- `src/core/templates/workflows/apply-change.ts`
- `src/core/templates/workflows/verify-change.ts`

目标：

- skill instructions 默认中文。
- 创建规划 artifact 前读取 architecture guidance。
- command prompt 内嵌精简架构检查清单。
- apply/verify 检查 implementation 是否遵守 design 约束。

### 阶段 6：文档更新

更新：

- `docs/customization.md`
- `docs/multi-language.md`
- `docs/workflows.md`
- `docs/commands.md`
- 视情况更新 `docs/concepts.md`

目标：

- 说明默认中文行为。
- 说明架构指导如何进入 proposal/design/tasks。
- 说明如何用 project config/rules 覆盖或加强团队自己的架构原则。

## 测试计划

### 单元测试

- init 默认生成 config 包含中文 context。
- 已有 config 不被覆盖。
- schema instructions 和 templates 仍能被解析。
- delta spec 格式不被中文化破坏。
- skill generation 生成 `SKILL.md` 和 references。
- update/workspace update 刷新 managed references。
- command templates 保持正确路径和 frontmatter。

### 集成测试

- 新建临时项目，运行 `openspec init`。
- 生成 skill，检查中文 instructions 和 reference 文件。
- 创建 change，运行 `openspec instructions proposal/design/tasks`，检查架构指导出现在 instruction/context/rules 中。
- 运行 `openspec validate`，确认中文模板不影响校验。

### 回归测试

优先运行：

```bash
npm test -- init
npm test -- artifact-workflow
npm test -- update
npm test -- workspace
npm test -- project-config
```

最后运行完整测试：

```bash
npm test
```

## 风险与取舍

1. **默认中文可能影响国际用户**
   这是产品方向选择。可以通过 `openspec/config.yaml` 或未来语言配置切回英文。

2. **中文化不能破坏解析器**
   delta spec 关键结构必须保持英文和既有 Markdown 层级。

3. **架构指导可能让小变更变重**
   解决方式：指导中明确“按架构显著性调整深度”，小改只需简短确认复用和影响范围。

4. **references 生成会扩大 managed surface**
   需要清晰区分 OpenSpec managed reference 与用户自定义文件，避免 update 删除用户内容。

5. **commands 与 skills 能力不一致**
   references 主要服务 skills；commands 使用内嵌精简检查清单保持基本一致性。

## 待 Review 问题

1. 默认中文是否只影响 artifact 输出，还是 CLI 人类输出也要逐步中文化？
2. `proposal.md` 是否新增独立的 `## 架构影响初筛` 章节，还是只在 instruction 中要求但不改变模板？
3. `design.md` 的 `## 架构评估` 是否作为必填章节，还是仅在架构显著变更时填写？
4. Skill reference 是否挂到所有 workflow skills，还是只挂到 propose/continue/ff/apply/verify？
5. 是否需要新增可配置项，例如 `language: zh-CN`，而不是只通过 `context` 表达默认语言？
6. 是否允许项目自定义覆盖内置 `architecture-guidance.md`，覆盖路径应该放在 `openspec/` 还是 agent skill 目录？

